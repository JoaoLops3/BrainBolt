DO $$
BEGIN
  -- Coluna: question
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'question'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN question TEXT NOT NULL DEFAULT '';
  END IF;

  -- Coluna: options (array de texto)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'options'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN options TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
    -- Adicionar constraint de 4 opções
    ALTER TABLE public.custom_questions ADD CONSTRAINT check_options_length CHECK (array_length(options, 1) = 4);
  END IF;

  -- Coluna: correct_answer
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'correct_answer'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN correct_answer INTEGER NOT NULL DEFAULT 0;
    -- Adicionar constraint de 0-3
    ALTER TABLE public.custom_questions ADD CONSTRAINT check_correct_answer_range CHECK (correct_answer >= 0 AND correct_answer <= 3);
  END IF;

  -- Coluna: category
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN category TEXT NOT NULL DEFAULT 'sports';
    -- Adicionar constraint de categorias válidas
    ALTER TABLE public.custom_questions ADD CONSTRAINT check_category_values CHECK (category IN ('sports', 'entertainment', 'art', 'science', 'geography', 'history'));
  END IF;

  -- Coluna: difficulty
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'difficulty'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'medium';
    -- Adicionar constraint de dificuldades válidas
    ALTER TABLE public.custom_questions ADD CONSTRAINT check_difficulty_values CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;

  -- Coluna: teacher_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'teacher_id'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Preencher teacher_id com base no classroom
    UPDATE public.custom_questions cq 
    SET teacher_id = c.teacher_id
    FROM public.classrooms c 
    WHERE cq.classroom_id = c.id AND cq.teacher_id IS NULL;
  END IF;

  -- Coluna: explanation
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'explanation'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN explanation TEXT;
  END IF;

  -- Coluna: is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- Coluna: usage_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'usage_count'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN usage_count INTEGER DEFAULT 0;
  END IF;

  -- Coluna: correct_count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'correct_count'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN correct_count INTEGER DEFAULT 0;
  END IF;

  -- Coluna: created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;

  -- Coluna: updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'custom_questions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.custom_questions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
  END IF;

END $$;

-- Verificar resultado
SELECT 
  '✅ Colunas adicionadas!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'custom_questions'
ORDER BY ordinal_position;
