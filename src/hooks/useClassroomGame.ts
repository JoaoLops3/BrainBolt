import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface GameResult {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  timePlayed: number;
  difficulty: string;
}

export const useClassroomGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(
    null
  );

  // Verificar se há uma sala ativa
  useEffect(() => {
    const classroomId = localStorage.getItem("currentClassroomId");
    if (classroomId) {
      setCurrentClassroomId(classroomId);
    }
  }, []);

  // Salvar resultado do jogo na sala
  const saveGameResult = async (result: GameResult) => {
    if (!user || !currentClassroomId) {
      console.log("No classroom active, skipping save");
      return false;
    }

    try {
      const { error } = await supabase.from("classroom_game_sessions").insert({
        classroom_id: currentClassroomId,
        student_id: user.id,
        score: result.score,
        correct_answers: result.correctAnswers,
        wrong_answers: result.wrongAnswers,
        total_questions: result.totalQuestions,
        time_played: result.timePlayed,
        difficulty: result.difficulty,
        played_at: new Date().toISOString(),
      });

      if (error) throw error;

      const classroomName =
        localStorage.getItem("currentClassroomName") || "sala";

      toast({
        title: "✅ Pontuação salva!",
        description: `${result.score} pontos salvos em ${classroomName}`,
      });

      return true;
    } catch (error) {
      console.error("Error saving game result:", error);
      toast({
        title: "⚠️ Erro ao salvar",
        description: "Não foi possível salvar sua pontuação na sala",
        variant: "destructive",
      });
      return false;
    }
  };

  // Limpar sala atual
  const clearCurrentClassroom = () => {
    localStorage.removeItem("currentClassroomId");
    localStorage.removeItem("currentClassroomName");
    setCurrentClassroomId(null);
  };

  return {
    currentClassroomId,
    saveGameResult,
    clearCurrentClassroom,
  };
};

