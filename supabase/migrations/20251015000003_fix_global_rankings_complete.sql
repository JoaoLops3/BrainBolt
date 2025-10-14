-- Correção completa para o erro 406 em global_rankings
-- Esta migração garante acesso total à view de rankings

-- Passo 1: Remover view antiga para recriar do zero
DROP VIEW IF EXISTS public.global_rankings CASCADE;

-- Passo 2: Verificar e ajustar políticas RLS na tabela profiles
-- Precisamos garantir que todos possam VER os perfis para o ranking funcionar

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Qualquer um pode visualizar rankings globais" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view global rankings" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Criar política PERMISSIVA para leitura de perfis (necessário para rankings públicos)
CREATE POLICY "Perfis públicos visíveis para todos"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (true);  -- Permite visualizar todos os perfis

-- Passo 3: Recriar a view global_rankings com todas as colunas necessárias
CREATE OR REPLACE VIEW public.global_rankings 
WITH (security_invoker = false)  -- Importante: desabilita security invoker
AS
SELECT 
  p.id,
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.total_score,
  p.games_played,
  p.games_won,
  p.games_lost,
  p.multiplayer_wins,
  p.multiplayer_losses,
  p.speed_games_played,
  p.normal_games_played,
  p.win_percentage,
  p.average_score,
  p.best_streak,
  p.created_at,
  p.updated_at,
  RANK() OVER (ORDER BY p.total_score DESC, p.games_won DESC) as global_rank,
  RANK() OVER (ORDER BY p.win_percentage DESC, p.total_score DESC) as win_rate_rank,
  RANK() OVER (ORDER BY p.best_streak DESC, p.total_score DESC) as streak_rank
FROM public.profiles p
WHERE p.games_played > 0
ORDER BY p.total_score DESC;

-- Passo 4: Conceder permissões explícitas na view
GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.global_rankings TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Passo 5: Adicionar comentário
COMMENT ON VIEW public.global_rankings IS 'Placar público mostrando rankings de jogadores. Acessível para todos os usuários.';

-- Passo 6: Verificar se a view foi criada corretamente
-- Se este SELECT funcionar, a view está OK
DO $$
BEGIN
  RAISE NOTICE 'View global_rankings criada com sucesso!';
  RAISE NOTICE 'Total de jogadores no ranking: %', (SELECT COUNT(*) FROM public.global_rankings);
END $$;

