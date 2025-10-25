import { useState, useEffect, useCallback } from "react";
import { Question, CategoryType } from "@/types/game";
import { questions as defaultQuestions } from "@/data/questions";
import { supabase } from "@/integrations/supabase/client";
import { useQuestionTracker } from "./useQuestionTracker";

interface UseGameQuestionsOptions {
  classroomId?: string | null;
  includeCustomQuestions?: boolean;
}

export const useGameQuestions = ({
  classroomId,
  includeCustomQuestions = true,
}: UseGameQuestionsOptions = {}) => {
  const [allQuestions, setAllQuestions] =
    useState<Question[]>(defaultQuestions);
  const [isLoading, setIsLoading] = useState(false);

  // Usar o sistema de controle de repetições
  const questionTracker = useQuestionTracker({
    maxRecentQuestions: 50,
    avoidRecentCount: 20,
  });

  const loadCustomQuestions = useCallback(async () => {
    if (!classroomId || !includeCustomQuestions) {
      setAllQuestions(defaultQuestions);
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("custom_questions")
        .select("*")
        .eq("classroom_id", classroomId)
        .eq("is_active", true);

      if (error) throw error;

      // Convert custom questions to Question format
      const customQuestions: Question[] = (data || []).map((cq: any) => ({
        id: `custom-${cq.id}`,
        category: cq.category as CategoryType,
        question: cq.question,
        options: cq.options,
        correctAnswer: cq.correct_answer,
        difficulty: cq.difficulty as "easy" | "medium" | "hard",
        explanation: cq.explanation,
        isCustom: true,
        customQuestionId: cq.id,
      }));

      // Combine default and custom questions
      const combined = [...defaultQuestions, ...customQuestions];
      setAllQuestions(combined);
    } catch (error) {
      console.error("Error loading custom questions:", error);
      // Fallback to default questions
      setAllQuestions(defaultQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, includeCustomQuestions]);

  useEffect(() => {
    loadCustomQuestions();
  }, [loadCustomQuestions]);

  const selectQuestions = useCallback(
    (questionsPerCategory: number = 4) => {
      const selectedQuestions: Question[] = [];
      const categoriesOrder: CategoryType[] = [
        "sports",
        "entertainment",
        "art",
        "science",
        "geography",
        "history",
        "mathematics",
        "portuguese",
      ];

      categoriesOrder.forEach((category) => {
        const categoryQuestions = allQuestions.filter(
          (q) => q.category === category
        );

        // Usar o sistema de controle de repetições
        const availableQuestions =
          questionTracker.getAvailableQuestions(categoryQuestions);

        // Se não há perguntas suficientes disponíveis, usar todas da categoria
        const questionsToUse =
          availableQuestions.length >= questionsPerCategory
            ? availableQuestions
            : categoryQuestions;

        // Shuffle category questions
        const shuffled = [...questionsToUse].sort(() => Math.random() - 0.5);

        // Take requested number of questions
        const selected = shuffled.slice(0, questionsPerCategory);
        selectedQuestions.push(...selected);

        // Marcar perguntas como usadas
        selected.forEach((q) => questionTracker.addQuestion(q.id));
      });

      // Final shuffle of all selected questions
      return selectedQuestions.sort(() => Math.random() - 0.5);
    },
    [allQuestions, questionTracker]
  );

  return {
    allQuestions,
    selectQuestions,
    isLoading,
    reload: loadCustomQuestions,
    questionTracker,
  };
};
