-- Corrigir políticas RLS da view global_rankings
-- O erro 406 ocorre porque a view não tem políticas RLS adequadas

-- Primeiro, conceder acesso à view
GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.global_rankings TO anon;

-- Criar políticas RLS para a view global_rankings
-- Nota: Views herdam RLS das tabelas subjacentes, mas precisamos garantir
-- que a própria view seja acessível

-- Permitir que usuários visualizem todos os rankings (placar público)
DROP POLICY IF EXISTS "Qualquer um pode visualizar rankings globais" ON public.profiles;

CREATE POLICY "Qualquer um pode visualizar rankings globais" 
ON public.profiles
FOR SELECT 
USING (games_played > 0);

-- Atualizar a view para garantir que seja devidamente acessível
DROP VIEW IF EXISTS public.global_rankings CASCADE;

CREATE OR REPLACE VIEW public.global_rankings AS
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
  RANK() OVER (ORDER BY total_score DESC, games_won DESC) as global_rank,
  RANK() OVER (ORDER BY win_percentage DESC, total_score DESC) as win_rate_rank,
  RANK() OVER (ORDER BY best_streak DESC, total_score DESC) as streak_rank
FROM public.profiles p
WHERE p.games_played > 0;

-- Conceder permissões na nova view
GRANT SELECT ON public.global_rankings TO authenticated;
GRANT SELECT ON public.global_rankings TO anon;

-- Comentário explicando a view
COMMENT ON VIEW public.global_rankings IS 'Placar público mostrando rankings de jogadores. Acessível para todos os usuários autenticados e anônimos.';

