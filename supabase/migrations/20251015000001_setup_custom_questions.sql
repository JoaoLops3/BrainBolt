-- 1. Adicionar coluna teacher_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    UPDATE public.custom_questions cq SET teacher_id = c.teacher_id
    FROM public.classrooms c WHERE cq.classroom_id = c.id AND cq.teacher_id IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'explanation') THEN
    ALTER TABLE public.custom_questions ADD COLUMN explanation TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'is_active') THEN
    ALTER TABLE public.custom_questions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'usage_count') THEN
    ALTER TABLE public.custom_questions ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'correct_count') THEN
    ALTER TABLE public.custom_questions ADD COLUMN correct_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'updated_at') THEN
    ALTER TABLE public.custom_questions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;
END $$;

-- 2. RLS e Políticas
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers can create questions for their classrooms" ON public.custom_questions;
DROP POLICY IF EXISTS "Teachers can view questions from their classrooms" ON public.custom_questions;
DROP POLICY IF EXISTS "Students can view active questions from their classrooms" ON public.custom_questions;
DROP POLICY IF EXISTS "Teachers can update their own questions" ON public.custom_questions;
DROP POLICY IF EXISTS "Teachers can delete their own questions" ON public.custom_questions;

CREATE POLICY "Teachers can create questions for their classrooms" ON public.custom_questions FOR INSERT WITH CHECK (auth.uid() = teacher_id AND EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));
CREATE POLICY "Teachers can view questions from their classrooms" ON public.custom_questions FOR SELECT USING (EXISTS (SELECT 1 FROM public.classrooms WHERE id = classroom_id AND teacher_id = auth.uid()));
CREATE POLICY "Students can view active questions from their classrooms" ON public.custom_questions FOR SELECT USING (is_active = true AND EXISTS (SELECT 1 FROM public.classroom_students WHERE classroom_id = custom_questions.classroom_id AND student_id = auth.uid() AND status = 'active'));
CREATE POLICY "Teachers can update their own questions" ON public.custom_questions FOR UPDATE USING (auth.uid() = teacher_id) WITH CHECK (auth.uid() = teacher_id);
CREATE POLICY "Teachers can delete their own questions" ON public.custom_questions FOR DELETE USING (auth.uid() = teacher_id);

-- 3. Funções
CREATE OR REPLACE FUNCTION public.increment_question_usage(p_question_id UUID, p_is_correct BOOLEAN)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.custom_questions SET usage_count = usage_count + 1, correct_count = CASE WHEN p_is_correct THEN correct_count + 1 ELSE correct_count END, updated_at = now() WHERE id = p_question_id;
END; $$;

CREATE OR REPLACE FUNCTION public.get_classroom_questions(p_classroom_id UUID, p_category TEXT DEFAULT NULL, p_difficulty TEXT DEFAULT NULL, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (id UUID, question TEXT, options TEXT[], correct_answer INTEGER, category TEXT, difficulty TEXT, explanation TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY SELECT cq.id, cq.question, cq.options, cq.correct_answer, cq.category, cq.difficulty, cq.explanation FROM public.custom_questions cq
  WHERE cq.classroom_id = p_classroom_id AND cq.is_active = true AND (p_category IS NULL OR cq.category = p_category) AND (p_difficulty IS NULL OR cq.difficulty = p_difficulty) ORDER BY RANDOM() LIMIT p_limit;
END; $$;

CREATE OR REPLACE FUNCTION public.get_question_statistics(p_classroom_id UUID)
RETURNS TABLE (total_questions BIGINT, questions_by_category JSONB, questions_by_difficulty JSONB, total_usage BIGINT, average_accuracy NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY SELECT COUNT(*)::BIGINT as total_questions,
    jsonb_object_agg(category, count) FILTER (WHERE category IS NOT NULL) as questions_by_category,
    jsonb_object_agg(difficulty, count) FILTER (WHERE difficulty IS NOT NULL) as questions_by_difficulty,
    COALESCE(SUM(usage_count), 0)::BIGINT as total_usage,
    CASE WHEN SUM(usage_count) > 0 THEN ROUND((SUM(correct_count)::numeric / SUM(usage_count) * 100), 2) ELSE 0 END as average_accuracy
  FROM (SELECT category, difficulty, COUNT(*) as count, usage_count, correct_count FROM public.custom_questions WHERE classroom_id = p_classroom_id AND is_active = true GROUP BY category, difficulty, usage_count, correct_count) stats;
END; $$;

-- 4. Trigger e Índices
DROP TRIGGER IF EXISTS update_custom_questions_updated_at ON public.custom_questions;
CREATE TRIGGER update_custom_questions_updated_at BEFORE UPDATE ON public.custom_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_custom_questions_classroom_id ON public.custom_questions(classroom_id);
CREATE INDEX IF NOT EXISTS idx_custom_questions_teacher_id ON public.custom_questions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_custom_questions_category ON public.custom_questions(category);
CREATE INDEX IF NOT EXISTS idx_custom_questions_difficulty ON public.custom_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_custom_questions_is_active ON public.custom_questions(is_active);

-- 5. Realtime
ALTER TABLE public.custom_questions REPLICA IDENTITY FULL;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.custom_questions; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Verificar
SELECT '✅ Setup completo!' as status, COUNT(*) as perguntas FROM public.custom_questions;
