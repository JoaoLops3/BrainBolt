-- Migração: Atualizar trigger de criação de perfil para incluir user_role
-- Data: 2025-10-15
-- Descrição: Capturar user_role do metadata de cadastro e salvar no perfil

-- Recriar a função de criação de perfil para incluir user_role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    user_role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Jogador'),
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'student')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log erro mas não falha o signup
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentário
COMMENT ON FUNCTION public.handle_new_user() IS 
'Função trigger para criar perfil automaticamente quando um novo usuário se registra, incluindo o role selecionado';

