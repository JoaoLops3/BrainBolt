-- Migração: Prevenir conflito professor/aluno
-- Data: 2025-10-15
-- Descrição: Impedir que professores entrem na própria sala como alunos

-- Função para verificar se o usuário é professor da sala
CREATE OR REPLACE FUNCTION is_classroom_teacher(classroom_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM classrooms 
    WHERE id = classroom_id_param 
    AND teacher_id = user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política RLS para classroom_students: impedir professor de ser aluno na própria sala
DROP POLICY IF EXISTS "prevent_teacher_student_conflict" ON classroom_students;

CREATE POLICY "prevent_teacher_student_conflict" ON classroom_students
FOR INSERT
WITH CHECK (
  NOT is_classroom_teacher(classroom_id, student_id)
);

-- Política RLS para classroom_students: permitir apenas operações em salas onde não é professor
DROP POLICY IF EXISTS "users_can_manage_own_classroom_student_records" ON classroom_students;

CREATE POLICY "users_can_manage_own_classroom_student_records" ON classroom_students
FOR ALL
USING (
  -- Usuário pode ver/editar seus próprios registros de aluno
  (student_id = auth.uid()) 
  OR 
  -- Professor pode ver/editar registros de alunos da sua sala (mas não pode inserir a si mesmo)
  (
    EXISTS (
      SELECT 1 FROM classrooms 
      WHERE id = classroom_id 
      AND teacher_id = auth.uid()
    )
    AND student_id != auth.uid() -- Professor não pode ser aluno da própria sala
  )
);

-- Comentário explicativo
COMMENT ON POLICY "prevent_teacher_student_conflict" ON classroom_students IS 
'Impede que professores entrem na própria sala como alunos';

COMMENT ON POLICY "users_can_manage_own_classroom_student_records" ON classroom_students IS 
'Permite que usuários gerenciem seus registros de aluno, exceto quando são professores da sala';
