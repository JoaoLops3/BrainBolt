-- ============================================
-- BRAIN BOLT - Adicionar novas categorias
-- Adiciona Matemática e Português às categorias existentes
-- ============================================

-- Atualizar a constraint da tabela custom_questions para incluir as novas categorias
ALTER TABLE custom_questions 
DROP CONSTRAINT IF EXISTS custom_questions_category_check;

ALTER TABLE custom_questions 
ADD CONSTRAINT custom_questions_category_check 
CHECK (category IN ('sports', 'entertainment', 'art', 'science', 'geography', 'history', 'mathematics', 'portuguese'));

-- Comentário para documentar a mudança
COMMENT ON COLUMN custom_questions.category IS 'Categoria da pergunta: sports, entertainment, art, science, geography, history, mathematics, portuguese';
