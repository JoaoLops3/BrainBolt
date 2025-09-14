-- Create achievements/badges table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- 'category', 'streak', 'score', 'game_mode', 'special'
  requirement_type TEXT NOT NULL, -- 'questions_correct', 'streak_count', 'total_score', 'games_played', 'category_mastery'
  requirement_value INTEGER NOT NULL,
  requirement_category TEXT, -- specific category if needed
  badge_color TEXT NOT NULL DEFAULT 'gold',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create characters table
CREATE TABLE public.characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'sports', 'science', 'geography', etc.
  image_url TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  unlock_requirement INTEGER NOT NULL DEFAULT 2, -- questions correct in category
  special_ability TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user characters table
CREATE TABLE public.user_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  character_id UUID NOT NULL REFERENCES public.characters(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, character_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_characters ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read, admin write)
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Characters policies (public read)
CREATE POLICY "Characters are viewable by everyone" 
ON public.characters 
FOR SELECT 
USING (true);

-- User characters policies
CREATE POLICY "Users can view their own characters" 
ON public.user_characters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own characters" 
ON public.user_characters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters" 
ON public.user_characters 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, badge_color) VALUES
('Primeiro Passo', 'Complete seu primeiro jogo', 'trophy', 'game_mode', 'games_played', 1, 'bronze'),
('Velocista', 'Complete 5 jogos no modo veloz', 'zap', 'game_mode', 'speed_games', 5, 'gold'),
('Mestre dos Esportes', 'Acerte 10 perguntas de esportes', 'target', 'category', 'questions_correct', 10, 'green'),
('Gênio da Ciência', 'Acerte 10 perguntas de ciência', 'brain', 'category', 'questions_correct', 10, 'blue'),
('Explorador', 'Acerte 10 perguntas de geografia', 'map', 'category', 'questions_correct', 10, 'orange'),
('Artista', 'Acerte 10 perguntas de arte', 'palette', 'category', 'questions_correct', 10, 'purple'),
('Historiador', 'Acerte 10 perguntas de história', 'scroll', 'category', 'questions_correct', 10, 'amber'),
('Entertainer', 'Acerte 10 perguntas de entretenimento', 'star', 'category', 'questions_correct', 10, 'pink'),
('Sequência Perfeita', 'Faça uma sequência de 5 acertos', 'flame', 'streak', 'streak_count', 5, 'red'),
('Sequência Lendária', 'Faça uma sequência de 10 acertos', 'crown', 'streak', 'streak_count', 10, 'gold'),
('Pontuador', 'Alcance 1000 pontos totais', 'award', 'score', 'total_score', 1000, 'silver'),
('Campeão', 'Alcance 5000 pontos totais', 'trophy', 'score', 'total_score', 5000, 'gold');

-- Insert default characters for each category
INSERT INTO public.characters (name, description, category, image_url, rarity, unlock_requirement, special_ability) VALUES
-- Sports characters
('Atleta', 'Um atleta dedicado aos esportes', 'sports', '/characters/athlete.png', 'common', 2, '+10% pontos em perguntas de esportes'),
('Campeão Olímpico', 'Medalhista de ouro olímpico', 'sports', '/characters/olympic-champion.png', 'legendary', 20, '+25% pontos em perguntas de esportes'),

-- Science characters
('Cientista', 'Pesquisador apaixonado pela ciência', 'science', '/characters/scientist.png', 'common', 2, '+10% pontos em perguntas de ciência'),
('Gênio da Física', 'Especialista em física quântica', 'science', '/characters/physics-genius.png', 'legendary', 20, '+25% pontos em perguntas de ciência'),

-- Geography characters
('Explorador', 'Aventureiro que conhece o mundo', 'geography', '/characters/explorer.png', 'common', 2, '+10% pontos em perguntas de geografia'),
('Navegador Lendário', 'Mestre dos mares e continentes', 'geography', '/characters/legendary-navigator.png', 'legendary', 20, '+25% pontos em perguntas de geografia'),

-- Art characters
('Artista', 'Criador de obras magníficas', 'art', '/characters/artist.png', 'common', 2, '+10% pontos em perguntas de arte'),
('Mestre Renascentista', 'Gênio artístico renascentista', 'art', '/characters/renaissance-master.png', 'legendary', 20, '+25% pontos em perguntas de arte'),

-- History characters
('Historiador', 'Guardião das memórias do passado', 'history', '/characters/historian.png', 'common', 2, '+10% pontos em perguntas de história'),
('Sábio Ancestral', 'Conhecedor de todos os tempos', 'history', '/characters/ancient-sage.png', 'legendary', 20, '+25% pontos em perguntas de história'),

-- Entertainment characters
('Entertainer', 'Estrela do entretenimento', 'entertainment', '/characters/entertainer.png', 'common', 2, '+10% pontos em perguntas de entretenimento'),
('Ícone Pop', 'Lenda do entretenimento mundial', 'entertainment', '/characters/pop-icon.png', 'legendary', 20, '+25% pontos em perguntas de entretenimento');

-- Function to check and unlock achievements
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
        IF achievement_record.category = 'category' THEN
          -- Get category from achievement name or use a mapping
          DECLARE
            target_category TEXT;
          BEGIN
            target_category := CASE achievement_record.name
              WHEN 'Mestre dos Esportes' THEN 'sports'
              WHEN 'Gênio da Ciência' THEN 'science'
              WHEN 'Explorador' THEN 'geography'
              WHEN 'Artista' THEN 'art'
              WHEN 'Historiador' THEN 'history'
              WHEN 'Entertainer' THEN 'entertainment'
              ELSE NULL
            END;
            
            IF target_category IS NOT NULL THEN
              SELECT * INTO category_performance 
              FROM public.category_performance 
              WHERE user_id = p_user_id AND category = target_category;
              
              IF category_performance IS NOT NULL AND 
                 category_performance.correct_answers >= achievement_record.requirement_value THEN
                INSERT INTO public.user_achievements (user_id, achievement_id, is_completed, progress)
                VALUES (p_user_id, achievement_record.id, true, achievement_record.requirement_value)
                ON CONFLICT (user_id, achievement_id) DO UPDATE SET 
                  is_completed = true, progress = achievement_record.requirement_value;
              END IF;
            END IF;
          END;
        END IF;
    END CASE;
  END LOOP;
END;
$$;

-- Function to check and unlock characters
CREATE OR REPLACE FUNCTION public.check_character_unlocks(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  character_record RECORD;
  category_performance RECORD;
BEGIN
  -- Check each character
  FOR character_record IN SELECT * FROM public.characters LOOP
    -- Skip if user already has this character
    IF EXISTS (
      SELECT 1 FROM public.user_characters 
      WHERE user_id = p_user_id AND character_id = character_record.id
    ) THEN
      CONTINUE;
    END IF;
    
    -- Check if user has enough correct answers in the character's category
    SELECT * INTO category_performance 
    FROM public.category_performance 
    WHERE user_id = p_user_id AND category = character_record.category;
    
    IF category_performance IS NOT NULL AND 
       category_performance.correct_answers >= character_record.unlock_requirement THEN
      INSERT INTO public.user_characters (user_id, character_id)
      VALUES (p_user_id, character_record.id)
      ON CONFLICT (user_id, character_id) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Update the existing trigger function to include achievement and character checks
CREATE OR REPLACE FUNCTION public.update_category_performance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  category_name TEXT;
BEGIN
  -- Update category performance for each category in the session
  IF NEW.categories_completed IS NOT NULL AND array_length(NEW.categories_completed, 1) > 0 THEN
    FOREACH category_name IN ARRAY NEW.categories_completed LOOP
      INSERT INTO public.category_performance (user_id, category, questions_answered, correct_answers)
      VALUES (NEW.user_id, category_name, 1, CASE WHEN NEW.game_result = 'win' THEN 1 ELSE 0 END)
      ON CONFLICT (user_id, category) 
      DO UPDATE SET 
        questions_answered = category_performance.questions_answered + 1,
        correct_answers = category_performance.correct_answers + CASE WHEN NEW.game_result = 'win' THEN 1 ELSE 0 END,
        accuracy_percentage = (category_performance.correct_answers::numeric / category_performance.questions_answered * 100),
        updated_at = NOW();
    END LOOP;
  END IF;
  
  -- Check for new achievements and character unlocks
  PERFORM public.check_achievements(NEW.user_id);
  PERFORM public.check_character_unlocks(NEW.user_id);
  
  RETURN NEW;
END;
$$;

-- Create updated_at triggers
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_user_characters_user_id ON public.user_characters(user_id);
CREATE INDEX idx_user_characters_character_id ON public.user_characters(character_id);
CREATE INDEX idx_characters_category ON public.characters(category);
CREATE INDEX idx_achievements_category ON public.achievements(category);