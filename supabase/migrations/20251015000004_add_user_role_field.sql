-- Adicionar coluna user_role à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_role TEXT CHECK (user_role IN ('teacher', 'leader', 'student')) DEFAULT 'student';

-- Criar índice para otimizar buscas por role
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON public.profiles(user_role);

-- Atualizar usuários existentes que são professores (têm salas criadas)
UPDATE public.profiles
SET user_role = 'teacher'
WHERE user_id IN (
  SELECT DISTINCT teacher_id 
  FROM public.classrooms
)
AND user_role = 'student';

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.user_role IS 
'Papel do usuário no sistema: teacher (professor), leader (líder de grupo), student (aluno)';

