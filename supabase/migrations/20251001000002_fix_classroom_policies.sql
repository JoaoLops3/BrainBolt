-- Fix e verificar políticas RLS para classrooms

-- Desabilitar RLS temporariamente para debug (APENAS PARA TESTES)
-- NÃO USE EM PRODUÇÃO!
ALTER TABLE public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements DISABLE ROW LEVEL SECURITY;

-- Dropar todas as políticas antigas se existirem
DROP POLICY IF EXISTS "Teachers can create classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can view their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Students can view classrooms they belong to" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can update their own classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can delete their own classrooms" ON public.classrooms;

DROP POLICY IF EXISTS "Teachers can manage students in their classrooms" ON public.classroom_students;
DROP POLICY IF EXISTS "Students can view their classroom memberships" ON public.classroom_students;
DROP POLICY IF EXISTS "Students can join classrooms" ON public.classroom_students;

DROP POLICY IF EXISTS "Teachers can manage invitations for their classrooms" ON public.classroom_invitations;
DROP POLICY IF EXISTS "Students can view their own invitations" ON public.classroom_invitations;
DROP POLICY IF EXISTS "Students can update their own invitations" ON public.classroom_invitations;

DROP POLICY IF EXISTS "Anyone in classroom can view game sessions" ON public.classroom_game_sessions;
DROP POLICY IF EXISTS "Students can insert their own game sessions" ON public.classroom_game_sessions;

DROP POLICY IF EXISTS "Teachers can manage announcements in their classrooms" ON public.classroom_announcements;
DROP POLICY IF EXISTS "Students can view announcements in their classrooms" ON public.classroom_announcements;

-- Reabilitar RLS
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais permissivas (para teste)
-- Classrooms: permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can view all classrooms" 
ON public.classrooms 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Teachers can insert classrooms" 
ON public.classrooms 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their classrooms" 
ON public.classrooms 
FOR UPDATE 
TO authenticated
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their classrooms" 
ON public.classrooms 
FOR DELETE 
TO authenticated
USING (auth.uid() = teacher_id);

-- Classroom Students: permitir leitura para usuários autenticados
CREATE POLICY "Authenticated users can view classroom students" 
ON public.classroom_students 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Students can insert themselves" 
ON public.classroom_students 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Authenticated users can update classroom students" 
ON public.classroom_students 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Classroom Invitations
CREATE POLICY "Authenticated users can view invitations" 
ON public.classroom_invitations 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage invitations" 
ON public.classroom_invitations 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Classroom Game Sessions
CREATE POLICY "Authenticated users can view game sessions" 
ON public.classroom_game_sessions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert game sessions" 
ON public.classroom_game_sessions 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Classroom Announcements
CREATE POLICY "Authenticated users can view announcements" 
ON public.classroom_announcements 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage announcements" 
ON public.classroom_announcements 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

