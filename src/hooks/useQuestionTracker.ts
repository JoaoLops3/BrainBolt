import { useState, useCallback, useRef } from "react";
import { Question } from "@/types/game";

interface QuestionTrackerOptions {
  maxRecentQuestions?: number;
  avoidRecentCount?: number;
}

export const useQuestionTracker = (options: QuestionTrackerOptions = {}) => {
  const { maxRecentQuestions = 50, avoidRecentCount = 20 } = options;

  const [recentQuestions, setRecentQuestions] = useState<Set<string>>(
    new Set()
  );
  const sessionQuestions = useRef<Set<string>>(new Set());

  const addQuestion = useCallback(
    (questionId: string) => {
      setRecentQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.add(questionId);

        // Manter apenas as perguntas mais recentes
        if (newSet.size > maxRecentQuestions) {
          const questionsArray = Array.from(newSet);
          const toRemove = questionsArray.slice(
            0,
            questionsArray.length - maxRecentQuestions
          );
          toRemove.forEach((id) => newSet.delete(id));
        }

        return newSet;
      });

      sessionQuestions.current.add(questionId);
    },
    [maxRecentQuestions]
  );

  const getAvailableQuestions = useCallback(
    (questions: Question[]): Question[] => {
      return questions.filter((question) => {
        // Evitar perguntas muito recentes
        if (recentQuestions.has(question.id)) {
          return false;
        }

        // Evitar perguntas da sessão atual se já foram muitas
        if (
          sessionQuestions.current.size > avoidRecentCount &&
          sessionQuestions.current.has(question.id)
        ) {
          return false;
        }

        return true;
      });
    },
    [recentQuestions, avoidRecentCount]
  );

  const selectQuestions = useCallback(
    (
      questions: Question[],
      count: number,
      categories?: string[]
    ): Question[] => {
      let availableQuestions = getAvailableQuestions(questions);

      // Se não há perguntas suficientes disponíveis, usar todas
      if (availableQuestions.length < count) {
        availableQuestions = questions;
      }

      // Filtrar por categorias se especificado
      if (categories && categories.length > 0) {
        availableQuestions = availableQuestions.filter((q) =>
          categories.includes(q.category)
        );
      }

      // Embaralhar e selecionar
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
    [getAvailableQuestions]
  );

  const resetSession = useCallback(() => {
    sessionQuestions.current.clear();
  }, []);

  const resetAll = useCallback(() => {
    setRecentQuestions(new Set());
    sessionQuestions.current.clear();
  }, []);

  return {
    recentQuestions: Array.from(recentQuestions),
    sessionQuestions: Array.from(sessionQuestions.current),
    addQuestion,
    getAvailableQuestions,
    selectQuestions,
    resetSession,
    resetAll,
  };
};
