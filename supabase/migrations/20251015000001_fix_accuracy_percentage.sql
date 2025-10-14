-- 1. Adicionar colunas que podem não existir em profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS accuracy_percentage DECIMAL(5,2) DEFAULT 0.0;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS average_score DECIMAL(10,2) DEFAULT 0.0;

-- 2. Corrigir dados existentes na tabela profiles
UPDATE profiles
SET win_percentage = LEAST(COALESCE(win_percentage, 0), 100.0)
WHERE win_percentage > 100.0 OR win_percentage IS NULL;

UPDATE profiles
SET accuracy_percentage = LEAST(COALESCE(accuracy_percentage, 0), 100.0)
WHERE accuracy_percentage > 100.0 OR accuracy_percentage IS NULL;

-- 3. Corrigir game_sessions onde correct_answers > questions_answered
UPDATE game_sessions
SET correct_answers = LEAST(correct_answers, questions_answered)
WHERE correct_answers > questions_answered;

-- 4. Corrigir accuracy_percentage em game_sessions (se existir)
UPDATE game_sessions
SET accuracy_percentage = LEAST(COALESCE(accuracy_percentage, 0), 100.0)
WHERE accuracy_percentage > 100.0 OR accuracy_percentage IS NULL;

-- 5. Adicionar constraints
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS check_correct_answers_valid;

ALTER TABLE game_sessions
ADD CONSTRAINT check_correct_answers_valid
CHECK (correct_answers >= 0 AND correct_answers <= questions_answered);

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS check_accuracy_range;

ALTER TABLE profiles 
ADD CONSTRAINT check_accuracy_range 
CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100);

ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS check_win_percentage_range;

ALTER TABLE profiles 
ADD CONSTRAINT check_win_percentage_range 
CHECK (win_percentage >= 0 AND win_percentage <= 100);

-- 6. Função auxiliar para limitar percentuais
CREATE OR REPLACE FUNCTION clamp_percentage(value NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  IF value IS NULL THEN
    RETURN 0;
  END IF;
  RETURN LEAST(GREATEST(value, 0), 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Função melhorada de atualização de estatísticas do perfil
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_games INTEGER;
  total_wins INTEGER;
  total_correct INTEGER;
  total_questions INTEGER;
  calc_accuracy NUMERIC;
  calc_win_pct NUMERIC;
  calc_avg_score NUMERIC;
  calc_best_streak INTEGER;
BEGIN
  -- Buscar todas as estatísticas de uma vez
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE game_result = 'win'),
    COALESCE(SUM(correct_answers), 0),
    COALESCE(SUM(questions_answered), 0),
    COALESCE(AVG(final_score), 0),
    COALESCE(MAX(max_streak), 0)
  INTO 
    total_games,
    total_wins,
    total_correct,
    total_questions,
    calc_avg_score,
    calc_best_streak
  FROM game_sessions
  WHERE user_id = NEW.user_id;

  -- Calcular precisão (0-100%)
  IF total_questions > 0 THEN
    calc_accuracy = clamp_percentage(
      ROUND((total_correct::numeric / total_questions * 100), 2)
    );
  ELSE
    calc_accuracy = 0.0;
  END IF;

  -- Calcular taxa de vitória (0-100%)
  IF total_games > 0 THEN
    calc_win_pct = clamp_percentage(
      ROUND((total_wins::numeric / total_games * 100), 2)
    );
  ELSE
    calc_win_pct = 0.0;
  END IF;

  -- Atualizar perfil
  UPDATE profiles SET
    games_played = total_games,
    total_score = COALESCE(
      (SELECT SUM(final_score) FROM game_sessions WHERE user_id = NEW.user_id),
      0
    ),
    win_percentage = calc_win_pct,
    accuracy_percentage = calc_accuracy,
    average_score = calc_avg_score,
    best_streak = calc_best_streak,
    games_won = total_wins,
    speed_games_played = COALESCE(
      (SELECT COUNT(*) FROM game_sessions WHERE user_id = NEW.user_id AND game_mode = 'speed'),
      0
    ),
    normal_games_played = COALESCE(
      (SELECT COUNT(*) FROM game_sessions WHERE user_id = NEW.user_id AND game_mode = 'normal'),
      0
    ),
    multiplayer_wins = COALESCE(
      (SELECT COUNT(*) FROM game_sessions WHERE user_id = NEW.user_id AND game_mode = 'multiplayer' AND game_result = 'win'),
      0
    ),
    multiplayer_losses = COALESCE(
      (SELECT COUNT(*) FROM game_sessions WHERE user_id = NEW.user_id AND game_mode = 'multiplayer' AND game_result = 'loss'),
      0
    ),
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recriar trigger
DROP TRIGGER IF EXISTS update_user_stats_after_game ON game_sessions;
CREATE TRIGGER update_user_stats_after_game
  AFTER INSERT ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- 9. Corrigir category_performance se existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category_performance') THEN
    UPDATE category_performance
    SET accuracy_percentage = clamp_percentage(accuracy_percentage)
    WHERE accuracy_percentage > 100.0 OR accuracy_percentage IS NULL;

    ALTER TABLE category_performance 
    DROP CONSTRAINT IF EXISTS check_category_accuracy_range;

    ALTER TABLE category_performance 
    ADD CONSTRAINT check_category_accuracy_range 
    CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100);
  END IF;
END $$;

-- 10. Atualizar todos os perfis existentes
UPDATE profiles
SET 
  accuracy_percentage = clamp_percentage(COALESCE(accuracy_percentage, 0)),
  win_percentage = clamp_percentage(COALESCE(win_percentage, 0))
WHERE accuracy_percentage IS NULL 
   OR win_percentage IS NULL
   OR accuracy_percentage > 100 
   OR win_percentage > 100;

-- Comentários
COMMENT ON FUNCTION clamp_percentage IS 'Limita valores percentuais entre 0 e 100';
COMMENT ON CONSTRAINT check_accuracy_range ON profiles IS 'Precisão entre 0-100%';
COMMENT ON CONSTRAINT check_win_percentage_range ON profiles IS 'Taxa de vitória entre 0-100%';
COMMENT ON CONSTRAINT check_correct_answers_valid ON game_sessions IS 'Corretas deve ser <= Total de perguntas';

-- Log final
DO $$
DECLARE
  affected_sessions INTEGER;
  affected_profiles INTEGER;
BEGIN
  -- Contar correções
  SELECT COUNT(*) INTO affected_sessions
  FROM game_sessions
  WHERE correct_answers > questions_answered;
  
  SELECT COUNT(*) INTO affected_profiles
  FROM profiles
  WHERE accuracy_percentage > 100 OR win_percentage > 100;
  
  RAISE NOTICE '✅ Correção de precisão aplicada com sucesso!';
  RAISE NOTICE '✅ Sessões corrigidas: %', COALESCE(affected_sessions, 0);
  RAISE NOTICE '✅ Perfis corrigidos: %', COALESCE(affected_profiles, 0);
  RAISE NOTICE '✅ Todas as precisões agora estão entre 0%% e 100%%';
  RAISE NOTICE '✅ correct_answers sempre <= questions_answered';
END $$;
