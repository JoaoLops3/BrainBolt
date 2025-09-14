-- Add search functionality and improved rankings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_time_played INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS categories_mastered INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_category TEXT;

-- Create global rankings view
CREATE OR REPLACE VIEW public.global_rankings AS
SELECT 
  p.*,
  RANK() OVER (ORDER BY total_score DESC, games_won DESC) as global_rank,
  RANK() OVER (ORDER BY win_percentage DESC, total_score DESC) as win_rate_rank,
  RANK() OVER (ORDER BY best_streak DESC, total_score DESC) as streak_rank
FROM public.profiles p
WHERE p.games_played > 0;

-- Create category performance table
CREATE TABLE IF NOT EXISTS public.category_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percentage NUMERIC DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_time NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

ALTER TABLE public.category_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for category_performance
CREATE POLICY "Users can view their own category performance" 
ON public.category_performance 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own category performance" 
ON public.category_performance 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category performance" 
ON public.category_performance 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create game sessions history improvements
ALTER TABLE public.game_sessions 
ADD COLUMN IF NOT EXISTS accuracy_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_response_time NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_breakdown JSONB DEFAULT '{}';

-- Update category performance trigger
CREATE OR REPLACE FUNCTION public.update_category_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category performance for each category in the session
  IF NEW.categories_completed IS NOT NULL AND array_length(NEW.categories_completed, 1) > 0 THEN
    FOREACH category IN ARRAY NEW.categories_completed LOOP
      INSERT INTO public.category_performance (user_id, category, questions_answered, correct_answers)
      VALUES (NEW.user_id, category, 1, CASE WHEN NEW.game_result = 'win' THEN 1 ELSE 0 END)
      ON CONFLICT (user_id, category) 
      DO UPDATE SET 
        questions_answered = category_performance.questions_answered + 1,
        correct_answers = category_performance.correct_answers + CASE WHEN NEW.game_result = 'win' THEN 1 ELSE 0 END,
        accuracy_percentage = (category_performance.correct_answers::numeric / category_performance.questions_answered * 100),
        updated_at = NOW();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for category performance
DROP TRIGGER IF EXISTS update_category_performance_trigger ON public.game_sessions;
CREATE TRIGGER update_category_performance_trigger
  AFTER INSERT ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_category_performance();

-- Add updated_at trigger for category_performance
CREATE TRIGGER update_category_performance_updated_at
  BEFORE UPDATE ON public.category_performance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create friend search function
CREATE OR REPLACE FUNCTION public.search_users(search_term TEXT)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  games_played INTEGER,
  total_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.username,
    p.email,
    p.avatar_url,
    p.games_played,
    p.total_score
  FROM public.profiles p
  WHERE 
    p.user_id != auth.uid() AND
    (
      LOWER(p.display_name) ILIKE '%' || LOWER(search_term) || '%' OR
      LOWER(p.username) ILIKE '%' || LOWER(search_term) || '%' OR
      LOWER(p.email) ILIKE '%' || LOWER(search_term) || '%'
    )
  ORDER BY p.total_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;