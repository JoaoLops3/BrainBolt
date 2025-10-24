-- Migração: Remover papel de 'leader' do sistema
-- Data: 2025-01-24
-- Descrição: Atualizar sistema para ter apenas 'teacher' e 'student'

-- Passo 1: Atualizar usuários existentes que são 'leader' para 'student'
UPDATE public.profiles
SET user_role = 'student'
WHERE user_role = 'leader';

-- Passo 2: Atualizar constraint da coluna user_role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_role_check 
CHECK (user_role IN ('teacher', 'student'));

-- Passo 3: Atualizar comentário da coluna
COMMENT ON COLUMN public.profiles.user_role IS 
'Papel do usuário no sistema: teacher (professor), student (aluno)';

-- Passo 4: Adicionar comentário explicativo
COMMENT ON TABLE public.profiles IS 
'Sistema simplificado: apenas professores podem criar salas, alunos participam das salas';
