-- Create classrooms table
CREATE TABLE public.classrooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT,
  grade_level TEXT, -- 'elementary', 'middle', 'high', 'college', 'other'
  subject TEXT, -- 'general', 'science', 'history', 'geography', etc.
  class_code TEXT NOT NULL UNIQUE, -- código único para alunos entrarem
  competition_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  competition_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_students INTEGER DEFAULT 50,
  settings JSONB DEFAULT '{}'::jsonb, -- configurações customizadas
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_competition_dates CHECK (competition_end_date > competition_start_date)
);

-- Create classroom_students table (many-to-many relationship)
CREATE TABLE public.classroom_students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'removed'
  nickname TEXT, -- apelido opcional para o aluno na sala
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- Create classroom_invitations table
CREATE TABLE public.classroom_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_email)
);

-- Create classroom_game_sessions table (track games within classrooms)
CREATE TABLE public.classroom_game_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  rank_in_classroom INTEGER, -- posição no ranking da sala naquele momento
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_session_id) -- cada sessão de jogo pertence a no máximo uma sala
);

-- Create classroom_announcements table
CREATE TABLE public.classroom_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_announcements ENABLE ROW LEVEL SECURITY;

-- Policies for classrooms
CREATE POLICY "Teachers can create classrooms" 
ON public.classrooms 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can view their own classrooms" 
ON public.classrooms 
FOR SELECT 
USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view classrooms they belong to" 
ON public.classrooms 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = id 
    AND student_id = auth.uid() 
    AND status = 'active'
  )
);

CREATE POLICY "Teachers can update their own classrooms" 
ON public.classrooms 
FOR UPDATE 
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classrooms" 
ON public.classrooms 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- Policies for classroom_students
CREATE POLICY "Teachers can manage students in their classrooms" 
ON public.classroom_students 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE id = classroom_id 
    AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their classroom memberships" 
ON public.classroom_students 
FOR SELECT 
USING (student_id = auth.uid());

CREATE POLICY "Students can join classrooms" 
ON public.classroom_students 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Policies for classroom_invitations
CREATE POLICY "Teachers can manage invitations for their classrooms" 
ON public.classroom_invitations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE id = classroom_id 
    AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own invitations" 
ON public.classroom_invitations 
FOR SELECT 
USING (
  student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

CREATE POLICY "Students can update their own invitations" 
ON public.classroom_invitations 
FOR UPDATE 
USING (
  student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  student_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policies for classroom_game_sessions
CREATE POLICY "Anyone in classroom can view game sessions" 
ON public.classroom_game_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms c
    LEFT JOIN public.classroom_students cs ON c.id = cs.classroom_id
    WHERE c.id = classroom_id 
    AND (c.teacher_id = auth.uid() OR (cs.student_id = auth.uid() AND cs.status = 'active'))
  )
);

CREATE POLICY "Students can insert their own game sessions" 
ON public.classroom_game_sessions 
FOR INSERT 
WITH CHECK (student_id = auth.uid());

-- Policies for classroom_announcements
CREATE POLICY "Teachers can manage announcements in their classrooms" 
ON public.classroom_announcements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.classrooms 
    WHERE id = classroom_id 
    AND teacher_id = auth.uid()
  )
);

CREATE POLICY "Students can view announcements in their classrooms" 
ON public.classroom_announcements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.classroom_students 
    WHERE classroom_id = classroom_announcements.classroom_id 
    AND student_id = auth.uid() 
    AND status = 'active'
  )
);

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

-- Create updated_at triggers
CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classroom_announcements_updated_at
  BEFORE UPDATE ON public.classroom_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_classrooms_teacher_id ON public.classrooms(teacher_id);
CREATE INDEX idx_classrooms_class_code ON public.classrooms(class_code);
CREATE INDEX idx_classrooms_active ON public.classrooms(is_active);
CREATE INDEX idx_classroom_students_classroom_id ON public.classroom_students(classroom_id);
CREATE INDEX idx_classroom_students_student_id ON public.classroom_students(student_id);
CREATE INDEX idx_classroom_students_status ON public.classroom_students(status);
CREATE INDEX idx_classroom_invitations_classroom_id ON public.classroom_invitations(classroom_id);
CREATE INDEX idx_classroom_invitations_student_email ON public.classroom_invitations(student_email);
CREATE INDEX idx_classroom_invitations_status ON public.classroom_invitations(status);
CREATE INDEX idx_classroom_game_sessions_classroom_id ON public.classroom_game_sessions(classroom_id);
CREATE INDEX idx_classroom_game_sessions_student_id ON public.classroom_game_sessions(student_id);
CREATE INDEX idx_classroom_announcements_classroom_id ON public.classroom_announcements(classroom_id);

-- Enable realtime for classrooms
ALTER TABLE public.classrooms REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_students REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.classroom_announcements REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.classrooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classroom_announcements;

