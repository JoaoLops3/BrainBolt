import { supabase } from "@/integrations/supabase/client";

/**
 * @param questionId
 * @param isCorrect
 */
export const trackCustomQuestionUsage = async (
  questionId: string,
  isCorrect: boolean
) => {
  try {
    const { error } = await supabase.rpc("increment_question_usage", {
      p_question_id: questionId,
      p_is_correct: isCorrect,
    });

    if (error) {
      console.error("Error tracking question usage:", error);
    }
  } catch (error) {
    console.error("Error in trackCustomQuestionUsage:", error);
  }
};

/**
 * Get custom questions for a classroom
 * @param classroomId - The classroom ID
 * @param category - Optional category filter
 * @param difficulty - Optional difficulty filter
 * @param limit - Maximum number of questions to return
 */
export const getClassroomQuestions = async (
  classroomId: string,
  category?: string,
  difficulty?: string,
  limit: number = 10
) => {
  try {
    const { data, error } = await supabase.rpc("get_classroom_questions", {
      p_classroom_id: classroomId,
      p_category: category || null,
      p_difficulty: difficulty || null,
      p_limit: limit,
    });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Error getting classroom questions:", error);
    return [];
  }
};
