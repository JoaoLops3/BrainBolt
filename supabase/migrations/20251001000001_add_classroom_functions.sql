-- Adicionar apenas as funções que faltam (sem recriar tabelas)

-- Create function to generate unique classroom code
CREATE OR REPLACE FUNCTION public.generate_classroom_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    new_code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.classrooms WHERE class_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create function to get classroom rankings
CREATE OR REPLACE FUNCTION public.get_classroom_rankings(p_classroom_id UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  total_score BIGINT,
  games_played BIGINT,
  correct_answers BIGINT,
  accuracy_percentage NUMERIC,
  best_streak INTEGER,
  rank INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH classroom_stats AS (
    SELECT 
      cs.student_id,
      p.display_name as student_name,
      COALESCE(SUM(gs.final_score), 0) as total_score,
      COUNT(gs.id) as games_played,
      COALESCE(SUM(gs.correct_answers), 0) as correct_answers,
      CASE 
        WHEN SUM(gs.total_questions) > 0 
        THEN ROUND((SUM(gs.correct_answers)::numeric / SUM(gs.total_questions) * 100), 2)
        ELSE 0 
      END as accuracy_percentage,
      COALESCE(MAX(gs.max_streak), 0) as best_streak
    FROM public.classroom_students cs
    LEFT JOIN public.profiles p ON p.user_id = cs.student_id
    LEFT JOIN public.classroom_game_sessions cgs ON cgs.student_id = cs.student_id AND cgs.classroom_id = cs.classroom_id
    LEFT JOIN public.game_sessions gs ON gs.id = cgs.game_session_id
    WHERE cs.classroom_id = p_classroom_id
    AND cs.status = 'active'
    GROUP BY cs.student_id, p.display_name
  )
  SELECT 
    cs.*,
    ROW_NUMBER() OVER (ORDER BY cs.total_score DESC, cs.accuracy_percentage DESC) as rank
  FROM classroom_stats cs
  ORDER BY rank;
END;
$$;

-- Create function to get classroom statistics
CREATE OR REPLACE FUNCTION public.get_classroom_statistics(p_classroom_id UUID)
RETURNS TABLE (
  total_students BIGINT,
  active_students BIGINT,
  total_games_played BIGINT,
  average_score NUMERIC,
  average_accuracy NUMERIC,
  most_active_student_id UUID,
  most_active_student_name TEXT,
  top_scorer_id UUID,
  top_scorer_name TEXT,
  top_score BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH classroom_data AS (
    SELECT 
      COUNT(DISTINCT cs.student_id) as total_students,
      COUNT(DISTINCT CASE WHEN cs.status = 'active' THEN cs.student_id END) as active_students,
      COUNT(DISTINCT cgs.game_session_id) as total_games_played,
      COALESCE(AVG(gs.final_score), 0) as average_score,
      CASE 
        WHEN SUM(gs.total_questions) > 0 
        THEN ROUND((SUM(gs.correct_answers)::numeric / SUM(gs.total_questions) * 100), 2)
        ELSE 0 
      END as average_accuracy
    FROM public.classroom_students cs
    LEFT JOIN public.classroom_game_sessions cgs ON cgs.student_id = cs.student_id AND cgs.classroom_id = cs.classroom_id
    LEFT JOIN public.game_sessions gs ON gs.id = cgs.game_session_id
    WHERE cs.classroom_id = p_classroom_id
  ),
  most_active AS (
    SELECT 
      cs.student_id,
      p.display_name,
      COUNT(cgs.id) as game_count
    FROM public.classroom_students cs
    LEFT JOIN public.profiles p ON p.user_id = cs.student_id
    LEFT JOIN public.classroom_game_sessions cgs ON cgs.student_id = cs.student_id AND cgs.classroom_id = cs.classroom_id
    WHERE cs.classroom_id = p_classroom_id
    GROUP BY cs.student_id, p.display_name
    ORDER BY game_count DESC
    LIMIT 1
  ),
  top_scorer AS (
    SELECT 
      cs.student_id,
      p.display_name,
      SUM(gs.final_score) as total_score
    FROM public.classroom_students cs
    LEFT JOIN public.profiles p ON p.user_id = cs.student_id
    LEFT JOIN public.classroom_game_sessions cgs ON cgs.student_id = cs.student_id AND cgs.classroom_id = cs.classroom_id
    LEFT JOIN public.game_sessions gs ON gs.id = cgs.game_session_id
    WHERE cs.classroom_id = p_classroom_id
    GROUP BY cs.student_id, p.display_name
    ORDER BY total_score DESC
    LIMIT 1
  )
  SELECT 
    cd.total_students,
    cd.active_students,
    cd.total_games_played,
    cd.average_score,
    cd.average_accuracy,
    ma.student_id as most_active_student_id,
    ma.display_name as most_active_student_name,
    ts.student_id as top_scorer_id,
    ts.display_name as top_scorer_name,
    ts.total_score as top_score
  FROM classroom_data cd
  LEFT JOIN most_active ma ON true
  LEFT JOIN top_scorer ts ON true;
END;
$$;

