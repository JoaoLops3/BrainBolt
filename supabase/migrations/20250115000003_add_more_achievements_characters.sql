-- Adicionar novas conquistas e personagens
-- Migração para expandir o sistema de conquistas e personagens

-- Primeiro, vamos adicionar os novos tipos de conquistas que não existiam antes
-- Remover constraint existente se houver
ALTER TABLE public.achievements 
DROP CONSTRAINT IF EXISTS achievements_requirement_type_check;

-- Adicionar novos tipos de requirement_type
ALTER TABLE public.achievements 
ADD CONSTRAINT achievements_requirement_type_check 
CHECK (requirement_type IN (
  'questions_correct', 
  'streak_count', 
  'total_score', 
  'games_played', 
  'category_mastery',
  'speed_games',
  'multiplayer_games', 
  'survival_games',
  'perfect_game',
  'characters_unlocked',
  'achievements_unlocked'
));

-- Atualizar a função de verificação de conquistas para incluir os novos tipos
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  achievement_record RECORD;
  user_profile RECORD;
  category_performance RECORD;
  characters_count INTEGER;
  achievements_count INTEGER;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;
  
  -- Check each achievement
  FOR achievement_record IN SELECT * FROM public.achievements LOOP
    -- Skip if user already has this achievement
    IF EXISTS (
      SELECT 1 FROM public.user_achievements 
      WHERE user_id = p_user_id AND achievement_id = achievement_record.id AND is_completed = true
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check achievement requirements
    CASE achievement_record.requirement_type
      WHEN 'games_played' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'speed_games' THEN
        IF user_profile.speed_games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'multiplayer_games' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'survival_games' THEN
        IF user_profile.games_played >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'streak_count' THEN
        IF user_profile.best_streak >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'total_score' THEN
        IF user_profile.total_score >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'questions_correct' THEN
        -- Check category-specific achievements
        IF achievement_record.category = 'category' AND achievement_record.requirement_category IS NOT NULL THEN
          SELECT * INTO category_performance 
          FROM public.category_performance 
          WHERE user_id = p_user_id AND category = achievement_record.requirement_category;
          
          IF category_performance IS NOT NULL AND 
             category_performance.correct_answers >= achievement_record.requirement_value THEN
            INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
            VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
            ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
              is_completed = true, progress = achievement_record.requirement_value;
          END IF;
        END IF;
        
      WHEN 'characters_unlocked' THEN
        SELECT COUNT(*) INTO characters_count
        FROM public.user_characters 
        WHERE user_id = p_user_id;
        
        IF characters_count >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'achievements_unlocked' THEN
        SELECT COUNT(*) INTO achievements_count
        FROM public.user_achievements 
        WHERE user_id = p_user_id AND is_completed = true;
        
        IF achievements_count >= achievement_record.requirement_value THEN
          INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
          ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
            is_completed = true, progress = achievement_record.requirement_value;
        END IF;
        
      WHEN 'perfect_game' THEN
        -- This would need to be tracked in game sessions
        -- For now, we'll skip this type
        NULL;
        
    END CASE;
  END LOOP;
END;
$$;

-- Atualizar a função de verificação de personagens para incluir os novos tipos
CREATE OR REPLACE FUNCTION public.check_character_unlocks(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  character_record RECORD;
  category_performance RECORD;
  user_profile RECORD;
  total_correct_answers INTEGER;
  total_games_played INTEGER;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile FROM public.profiles WHERE user_id = p_user_id;
  
  IF user_profile IS NULL THEN
    RETURN;
  END IF;
  
  -- Check each character
  FOR character_record IN SELECT * FROM public.characters LOOP
    -- Skip if user already has this character
    IF EXISTS (
      SELECT 1 FROM public.user_characters 
      WHERE user_id = p_user_id AND character_id = character_record.id
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check character unlock requirements based on category
    CASE character_record.category
      WHEN 'sports', 'entertainment', 'art', 'science', 'geography', 'history', 'mathematics', 'portuguese' THEN
        -- Category-specific characters
        SELECT * INTO category_performance 
        FROM public.category_performance 
        WHERE user_id = p_user_id AND category = character_record.category;
        
        IF category_performance IS NOT NULL AND 
           category_performance.correct_answers >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'special' THEN
        -- Special characters based on total performance
        SELECT SUM(correct_answers) INTO total_correct_answers
        FROM public.category_performance 
        WHERE user_id = p_user_id;
        
        IF total_correct_answers >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'speed' THEN
        -- Speed mode characters
        IF user_profile.speed_games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'survival' THEN
        -- Survival mode characters
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'multiplayer' THEN
        -- Multiplayer characters
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
      WHEN 'champion', 'legend', 'idol' THEN
        -- Legendary characters based on total games played
        IF user_profile.games_played >= character_record.unlock_requirement THEN
          INSERT INTO public.user_characters (user_id, character_id)
          VALUES (p_user_id, character_record.id)
          ON CONFLICT (user_id, character_id) DO NOTHING;
        END IF;
        
    END CASE;
  END LOOP;
END;
$$;

-- Adicionar novas conquistas para Matemática e Português
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, requirement_category, badge_color) VALUES
-- Conquistas de Matemática
('Matemático Iniciante', 'Acerte 5 perguntas de matemática', 'calculator', 'category', 'questions_correct', 5, 'mathematics', 'blue'),
('Matemático Avançado', 'Acerte 15 perguntas de matemática', 'calculator', 'category', 'questions_correct', 15, 'mathematics', 'purple'),
('Mestre da Matemática', 'Acerte 25 perguntas de matemática', 'calculator', 'category', 'questions_correct', 25, 'mathematics', 'gold'),

-- Conquistas de Português
('Linguista Iniciante', 'Acerte 5 perguntas de português', 'book', 'category', 'questions_correct', 5, 'portuguese', 'green'),
('Linguista Avançado', 'Acerte 15 perguntas de português', 'book', 'category', 'questions_correct', 15, 'portuguese', 'purple'),
('Mestre da Língua', 'Acerte 25 perguntas de português', 'book', 'category', 'questions_correct', 25, 'portuguese', 'gold'),

-- Conquistas especiais de sequência
('Sequência Matemática', 'Faça uma sequência de 3 acertos em matemática', 'calculator', 'streak', 'streak_count', 3, 'mathematics', 'blue'),
('Sequência Linguística', 'Faça uma sequência de 3 acertos em português', 'book', 'streak', 'streak_count', 3, 'portuguese', 'green'),

-- Conquistas de pontuação avançadas
('Pontuador Avançado', 'Alcance 10.000 pontos totais', 'award', 'score', 'total_score', 10000, null, 'gold'),
('Pontuador Épico', 'Alcance 25.000 pontos totais', 'trophy', 'score', 'total_score', 25000, null, 'diamond'),
('Pontuador Lendário', 'Alcance 50.000 pontos totais', 'crown', 'score', 'total_score', 50000, null, 'rainbow'),

-- Conquistas de jogos
('Jogador Dedicado', 'Complete 50 jogos', 'gamepad', 'game_mode', 'games_played', 50, null, 'silver'),
('Jogador Experiente', 'Complete 100 jogos', 'gamepad', 'game_mode', 'games_played', 100, null, 'gold'),
('Jogador Veterano', 'Complete 250 jogos', 'gamepad', 'game_mode', 'games_played', 250, null, 'diamond'),

-- Conquistas de modo velocidade
('Velocista Experiente', 'Complete 25 jogos no modo velocidade', 'zap', 'game_mode', 'speed_games', 25, null, 'gold'),
('Velocista Mestre', 'Complete 50 jogos no modo velocidade', 'zap', 'game_mode', 'speed_games', 50, null, 'diamond'),

-- Conquistas de multiplayer
('Multiplayer Iniciante', 'Complete 5 jogos multiplayer', 'users', 'game_mode', 'multiplayer_games', 5, null, 'bronze'),
('Multiplayer Experiente', 'Complete 15 jogos multiplayer', 'users', 'game_mode', 'multiplayer_games', 15, null, 'silver'),
('Multiplayer Mestre', 'Complete 30 jogos multiplayer', 'users', 'game_mode', 'multiplayer_games', 30, null, 'gold'),

-- Conquistas de sobrevivência
('Sobrevivente', 'Complete 5 jogos no modo sobrevivência', 'shield', 'game_mode', 'survival_games', 5, null, 'bronze'),
('Sobrevivente Experiente', 'Complete 15 jogos no modo sobrevivência', 'shield', 'game_mode', 'survival_games', 15, null, 'silver'),
('Sobrevivente Mestre', 'Complete 30 jogos no modo sobrevivência', 'shield', 'game_mode', 'survival_games', 30, null, 'gold'),

-- Conquistas especiais
('Perfeccionista', 'Complete um jogo com 100% de acertos', 'star', 'special', 'perfect_game', 1, null, 'rainbow'),
('Colecionador', 'Desbloqueie 10 personagens', 'collection', 'special', 'characters_unlocked', 10, null, 'purple'),
('Colecionador Mestre', 'Desbloqueie 20 personagens', 'collection', 'special', 'characters_unlocked', 20, null, 'diamond'),
('Conquistador', 'Desbloqueie 15 conquistas', 'medal', 'special', 'achievements_unlocked', 15, null, 'gold'),
('Conquistador Mestre', 'Desbloqueie 30 conquistas', 'medal', 'special', 'achievements_unlocked', 30, null, 'diamond');

-- Adicionar novos personagens para Matemática e Português
INSERT INTO public.characters (name, description, category, image_url, rarity, unlock_requirement, special_ability) VALUES
-- Personagens de Matemática
('Calculadora Humana', 'Especialista em cálculos mentais', 'mathematics', '/characters/human-calculator.png', 'common', 3, '+15% pontos em perguntas de matemática'),
('Gênio dos Números', 'Mestre em álgebra e geometria', 'mathematics', '/characters/numbers-genius.png', 'rare', 8, '+20% pontos em perguntas de matemática'),
('Professor Pitágoras', 'Lendário matemático da antiguidade', 'mathematics', '/characters/pythagoras.png', 'epic', 15, '+25% pontos em perguntas de matemática'),
('Einstein Matemático', 'Gênio da física matemática', 'mathematics', '/characters/einstein-math.png', 'legendary', 25, '+30% pontos em perguntas de matemática e ciência'),

-- Personagens de Português
('Escritor Iniciante', 'Apaixonado pela língua portuguesa', 'portuguese', '/characters/beginner-writer.png', 'common', 3, '+15% pontos em perguntas de português'),
('Poeta Romântico', 'Mestre da literatura brasileira', 'portuguese', '/characters/romantic-poet.png', 'rare', 8, '+20% pontos em perguntas de português'),
('Machado de Assis', 'Maior escritor da literatura brasileira', 'portuguese', '/characters/machado-assis.png', 'epic', 15, '+25% pontos em perguntas de português'),
('Língua Portuguesa', 'Personificação da língua portuguesa', 'portuguese', '/characters/portuguese-language.png', 'legendary', 25, '+30% pontos em perguntas de português e história'),

-- Personagens especiais multidisciplinares
('Estudante Universal', 'Interessado em todas as áreas do conhecimento', 'special', '/characters/universal-student.png', 'rare', 20, '+10% pontos em todas as categorias'),
('Professor Sábio', 'Mestre em todas as disciplinas', 'special', '/characters/wise-teacher.png', 'epic', 40, '+15% pontos em todas as categorias'),
('Gênio Universal', 'O mais sábio de todos os tempos', 'special', '/characters/universal-genius.png', 'legendary', 60, '+20% pontos em todas as categorias'),

-- Personagens de modos especiais
('Velocista Nato', 'Especialista em jogos de velocidade', 'speed', '/characters/natural-speedster.png', 'rare', 10, '+25% pontos em modo velocidade'),
('Sobrevivente Experiente', 'Mestre em jogos de sobrevivência', 'survival', '/characters/experienced-survivor.png', 'rare', 10, '+25% pontos em modo sobrevivência'),
('Multiplayer Pro', 'Especialista em jogos multiplayer', 'multiplayer', '/characters/multiplayer-pro.png', 'rare', 10, '+25% pontos em jogos multiplayer'),

-- Personagens lendários especiais
('Campeão Absoluto', 'O maior campeão de todos os tempos', 'champion', '/characters/absolute-champion.png', 'legendary', 50, '+35% pontos em todas as categorias e modos'),
('Lenda Viva', 'Uma lenda entre os jogadores', 'legend', '/characters/living-legend.png', 'legendary', 75, '+40% pontos em todas as categorias e modos'),
('Ídolo Supremo', 'O ídolo supremo do Brain Bolt', 'idol', '/characters/supreme-idol.png', 'legendary', 100, '+50% pontos em todas as categorias e modos');
