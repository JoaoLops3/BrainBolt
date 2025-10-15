-- ============================================
-- BRAIN BOLT - Sistema de Perguntas Customizadas
-- Permite professores criarem suas próprias perguntas
-- ============================================

-- Tabela de perguntas customizadas
CREATE TABLE IF NOT EXISTS custom_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  
  -- Conteúdo da pergunta
  question_text TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  
  -- Metadados
  category TEXT NOT NULL CHECK (category IN ('sports', 'entertainment', 'art', 'science', 'geography', 'history')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  explanation TEXT, -- Explicação da resposta correta
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Se outros professores podem usar
  usage_count INTEGER DEFAULT 0,
  correct_rate DECIMAL DEFAULT 0.0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_custom_questions_created_by ON custom_questions(created_by);
CREATE INDEX idx_custom_questions_classroom ON custom_questions(classroom_id);
CREATE INDEX idx_custom_questions_category ON custom_questions(category);
CREATE INDEX idx_custom_questions_public ON custom_questions(is_public) WHERE is_public = true;
CREATE INDEX idx_custom_questions_active ON custom_questions(is_active) WHERE is_active = true;

-- Tabela de uso de perguntas customizadas
CREATE TABLE IF NOT EXISTS custom_question_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES custom_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  
  -- Resultado
  was_correct BOOLEAN NOT NULL,
  time_spent INTEGER, -- Em segundos
  
  -- Timestamp
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_custom_question_usage_question ON custom_question_usage(question_id);
CREATE INDEX idx_custom_question_usage_user ON custom_question_usage(user_id);

-- Atualizar estatísticas das perguntas automaticamente
CREATE OR REPLACE FUNCTION update_custom_question_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE custom_questions
  SET
    usage_count = usage_count + 1,
    correct_rate = (
      SELECT COALESCE(AVG(CASE WHEN was_correct THEN 1.0 ELSE 0.0 END), 0.0)
      FROM custom_question_usage
      WHERE question_id = NEW.question_id
    ),
    updated_at = NOW()
  WHERE id = NEW.question_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_custom_question_stats
  AFTER INSERT ON custom_question_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_question_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_question_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para custom_questions
CREATE POLICY "Usuários podem ver suas próprias perguntas"
  ON custom_questions FOR SELECT
  USING (created_by = auth.uid() OR is_public = true);

CREATE POLICY "Professores podem criar perguntas"
  ON custom_questions FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Professores podem atualizar suas perguntas"
  ON custom_questions FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Professores podem deletar suas perguntas"
  ON custom_questions FOR DELETE
  USING (created_by = auth.uid());

-- Políticas para custom_question_usage
CREATE POLICY "Usuários podem ver seu próprio histórico"
  ON custom_question_usage FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Professores podem ver uso de suas perguntas"
  ON custom_question_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM custom_questions
      WHERE custom_questions.id = custom_question_usage.question_id
      AND custom_questions.created_by = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir respostas"
  ON custom_question_usage FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para buscar perguntas customizadas para um jogo
CREATE OR REPLACE FUNCTION get_custom_questions_for_game(
  p_category TEXT DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_classroom_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_include_public BOOLEAN DEFAULT true
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  correct_answer INTEGER,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  category TEXT,
  difficulty TEXT,
  explanation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cq.id,
    cq.question_text,
    cq.correct_answer,
    cq.option_a,
    cq.option_b,
    cq.option_c,
    cq.option_d,
    cq.category,
    cq.difficulty,
    cq.explanation
  FROM custom_questions cq
  WHERE
    cq.is_active = true
    AND (p_category IS NULL OR cq.category = p_category)
    AND (p_difficulty IS NULL OR cq.difficulty = p_difficulty)
    AND (
      cq.created_by = auth.uid() 
      OR (p_include_public = true AND cq.is_public = true)
      OR (p_classroom_id IS NOT NULL AND cq.classroom_id = p_classroom_id)
    )
  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de perguntas do professor
CREATE OR REPLACE FUNCTION get_teacher_question_stats(p_teacher_id UUID)
RETURNS TABLE (
  total_questions BIGINT,
  total_usage BIGINT,
  avg_correct_rate DECIMAL,
  questions_by_category JSONB,
  top_questions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT cq.id) as total_questions,
    SUM(cq.usage_count) as total_usage,
    AVG(cq.correct_rate) as avg_correct_rate,
    (
      SELECT jsonb_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM custom_questions
        WHERE created_by = p_teacher_id
        GROUP BY category
      ) cat_counts
    ) as questions_by_category,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', id,
          'question', question_text,
          'category', category,
          'usage_count', usage_count,
          'correct_rate', correct_rate
        )
      )
      FROM (
        SELECT id, question_text, category, usage_count, correct_rate
        FROM custom_questions
        WHERE created_by = p_teacher_id
        ORDER BY usage_count DESC
        LIMIT 5
      ) top
    ) as top_questions
  FROM custom_questions cq
  WHERE cq.created_by = p_teacher_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para listar perguntas públicas populares
CREATE OR REPLACE VIEW popular_custom_questions AS
SELECT
  cq.*,
  p.display_name as author_name,
  COUNT(DISTINCT cqu.user_id) as unique_users
FROM custom_questions cq
LEFT JOIN profiles p ON cq.created_by = p.user_id
LEFT JOIN custom_question_usage cqu ON cq.id = cqu.question_id
WHERE cq.is_public = true AND cq.is_active = true
GROUP BY cq.id, p.display_name
HAVING COUNT(cqu.id) > 0
ORDER BY cq.usage_count DESC, cq.correct_rate DESC;

-- Comentários e índices finais
COMMENT ON TABLE custom_questions IS 'Perguntas customizadas criadas por professores';
COMMENT ON TABLE custom_question_usage IS 'Histórico de uso e respostas de perguntas customizadas';
COMMENT ON COLUMN custom_questions.is_public IS 'Se verdadeiro, outros professores podem usar esta pergunta';
COMMENT ON COLUMN custom_questions.explanation IS 'Explicação educacional sobre a resposta correta';

