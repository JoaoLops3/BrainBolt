import { useState, useEffect, useCallback } from "react";
import { Question, MultiplayerRoom } from "@/types/game";
import { questions } from "@/data/questions";
import { QuestionCard } from "./QuestionCard";
import { GameTimer } from "./GameTimer";
import { MultiplayerResults } from "./MultiplayerResults";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy } from "lucide-react";
import { MultiplayerConnectionStatus } from "@/components/multiplayer/MultiplayerConnectionStatus";

interface MultiplayerGameProps {
  roomId: string;
  isHost: boolean;
  onBackToMenu: () => void;
}

export const MultiplayerGame = ({
  roomId,
  isHost,
  onBackToMenu,
}: MultiplayerGameProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  // Initialize game questions if host
  useEffect(() => {
    if (isHost && gameQuestions.length === 0) {
      const shuffledQuestions = [...questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 24);
      setGameQuestions(shuffledQuestions);
    }
  }, [isHost, gameQuestions.length]);

  // Fetch room data
  const fetchRoom = async () => {
    const { data, error } = await supabase
      .from("multiplayer_rooms")
      .select("*")
      .eq("id", roomId)
      .single();

    if (error) {
      console.error("Error fetching room:", error);
      return;
    }

    setRoom({
      ...data,
      game_status: data.game_status as MultiplayerRoom["game_status"],
    });
  };

  // Start game (host only)
  const startGame = async () => {
    if (!isHost || gameQuestions.length === 0) return;

    const firstQuestion = gameQuestions[0];

    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({
        game_status: "playing",
        current_question_id: firstQuestion.id,
        current_question_index: 0,
        question_start_time: new Date().toISOString(),
      })
      .eq("id", roomId);

    if (error) {
      console.error("Error starting game:", error);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null || !room || !user) return;

    setSelectedAnswer(answerIndex);

    const updateField =
      user.id === room.host_id ? "host_answer" : "guest_answer";

    const { error } = await supabase
      .from("multiplayer_rooms")
      .update({ [updateField]: answerIndex })
      .eq("id", roomId);

    if (error) {
      console.error("Error updating answer:", error);
    }
  };

  // Move to next question (host only)
  const nextQuestion = async () => {
    if (!isHost || !room || !gameQuestions) return;

    const nextIndex = room.current_question_index + 1;

    if (nextIndex >= gameQuestions.length) {
      // Game finished
      const hostScore = room.host_score;
      const guestScore = room.guest_score;
      const winnerId =
        hostScore > guestScore
          ? room.host_id
          : guestScore > hostScore
          ? room.guest_id
          : null;

      await supabase
        .from("multiplayer_rooms")
        .update({
          game_status: "finished",
          winner_id: winnerId,
        })
        .eq("id", roomId);
    } else {
      // Next question
      const nextQuestion = gameQuestions[nextIndex];

      await supabase
        .from("multiplayer_rooms")
        .update({
          current_question_id: nextQuestion.id,
          current_question_index: nextIndex,
          host_answer: null,
          guest_answer: null,
          question_start_time: new Date().toISOString(),
          game_status: "playing",
        })
        .eq("id", roomId);
    }
  };

  const saveMultiplayerResults = async (room: MultiplayerRoom) => {
    if (!user) return;

    try {
      const isHost = user.id === room.host_id;
      const userScore = isHost ? room.host_score : room.guest_score;
      const opponentScore = isHost ? room.guest_score : room.host_score;
      const opponentId = isHost ? room.guest_id : room.host_id;

      let gameResult: "win" | "loss" | "draw";
      if (userScore > opponentScore) {
        gameResult = "win";
      } else if (userScore < opponentScore) {
        gameResult = "loss";
      } else {
        gameResult = "draw";
      }

      const safeCorrectAnswers = Math.min(Math.floor(userScore / 100), 24);

      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_mode: "multiplayer",
        final_score: userScore,
        questions_answered: 24,
        correct_answers: safeCorrectAnswers,
        categories_completed: [],
        max_streak: 0,
        time_spent: 360,
        game_result: gameResult,
        opponent_id: opponentId,
        room_id: room.id,
      });
    } catch (error) {
      console.error("Error saving multiplayer results:", error);
    }
  };

  const calculateScores = useCallback(async () => {
    if (
      !room ||
      !currentQuestion ||
      room.host_answer === null ||
      room.guest_answer === null
    )
      return;

    let newHostScore = room.host_score;
    let newGuestScore = room.guest_score;

    if (room.host_answer === currentQuestion.correctAnswer) {
      newHostScore += 100;
    }
    if (room.guest_answer === currentQuestion.correctAnswer) {
      newGuestScore += 100;
    }

    await supabase
      .from("multiplayer_rooms")
      .update({
        host_score: newHostScore,
        guest_score: newGuestScore,
        game_status: "question_answered",
      })
      .eq("id", roomId);

    setShowAnswer(true);

    // Avançar automaticamente após 3 seconds (host only)
    if (isHost) {
      setTimeout(() => {
        nextQuestion();
      }, 3000);
    }
  }, [room, currentQuestion, isHost, roomId]);

  // Handle timer end
  const handleTimeUp = async () => {
    if (selectedAnswer === null && room && user) {
      const updateField =
        user.id === room.host_id ? "host_answer" : "guest_answer";

      await supabase
        .from("multiplayer_rooms")
        .update({ [updateField]: -1 }) // Invalid answer for timeout
        .eq("id", roomId);
    }
  };

  // Cálculo sincronizado do timer
  const calculateTimeLeft = useCallback(() => {
    if (!room?.question_start_time) return 15;

    const startTime = new Date(room.question_start_time).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, 15 - elapsed);

    return remaining;
  }, [room?.question_start_time]);

  // Update timer based on server time
  useEffect(() => {
    if (room?.question_start_time && room.game_status === "playing") {
      const updateTimer = () => {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);

        if (newTimeLeft === 0 && selectedAnswer === null) {
          handleTimeUp();
        }
      };

      updateTimer(); // Initial update
      const interval = setInterval(updateTimer, 100); // More frequent updates for accuracy

      return () => clearInterval(interval);
    }
  }, [
    room?.question_start_time,
    room?.game_status,
    selectedAnswer,
    calculateTimeLeft,
  ]);

  // Listen to room updates
  useEffect(() => {
    fetchRoom();

    const channel = supabase
      .channel("multiplayer-game-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "multiplayer_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as MultiplayerRoom;
          setRoom({
            ...updatedRoom,
            game_status:
              updatedRoom.game_status as MultiplayerRoom["game_status"],
          });

          // Salvar resultados ao finalizar
          if (
            updatedRoom.game_status === "finished" &&
            room?.game_status !== "finished"
          ) {
            saveMultiplayerResults(updatedRoom);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Update current question when room updates
  useEffect(() => {
    if (room?.current_question_id) {
      const question = questions.find((q) => q.id === room.current_question_id);
      setCurrentQuestion(question || null);
      setSelectedAnswer(null);
      setShowAnswer(false);

      // Timer sincronizado com servidor
      if (room.question_start_time) {
        const newTimeLeft = calculateTimeLeft();
        setTimeLeft(newTimeLeft);
      } else {
        setTimeLeft(15);
      }
    }
  }, [room?.current_question_id, calculateTimeLeft]);

  // Calculate scores when both answered
  useEffect(() => {
    if (
      room &&
      room.host_answer !== null &&
      room.guest_answer !== null &&
      room.game_status === "playing"
    ) {
      calculateScores();
    }
  }, [
    room?.host_answer,
    room?.guest_answer,
    room?.game_status,
    calculateScores,
  ]);

  // Start game when both players are ready
  useEffect(() => {
    if (room && room.guest_id && room.game_status === "waiting" && isHost) {
      startGame();
    }
  }, [room?.guest_id, room?.game_status, isHost]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div>Carregando...</div>
      </div>
    );
  }

  if (room.game_status === "finished") {
    return (
      <MultiplayerResults
        room={room}
        onBackToMenu={onBackToMenu}
        isHost={isHost}
      />
    );
  }

  if (room.game_status === "waiting") {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Users className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Aguardando...</h2>
            <p className="text-muted-foreground">
              {!room.guest_id
                ? "Esperando outro jogador entrar"
                : "Preparando o jogo"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div>Carregando pergunta...</div>
      </div>
    );
  }

  const userAnswer =
    user?.id === room.host_id ? room.host_answer : room.guest_answer;
  const opponentAnswer =
    user?.id === room.host_id ? room.guest_answer : room.host_answer;

  return (
    <div className="min-h-screen bg-gradient-primary relative no-scroll">
      {/* Connection Status */}
      <MultiplayerConnectionStatus
        isConnected={!!room}
        roomCode={room?.room_code}
        playersCount={room?.guest_id ? 2 : 1}
        ping={timeLeft > 0 ? Math.floor(Math.random() * 150) + 50 : undefined}
      />

      {/* Exit button */}
      <button
        onClick={onBackToMenu}
        className="absolute top-4 left-4 z-30 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Score display */}
      <div className="fixed top-4 left-16 right-4 z-10">
        <div className="flex justify-between items-center">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-bold">
                Você:{" "}
                {user?.id === room.host_id ? room.host_score : room.guest_score}
              </span>
            </div>
          </Card>

          <GameTimer
            timeLeft={timeLeft}
            totalTime={15}
            isActive={
              selectedAnswer === null &&
              !showAnswer &&
              room.game_status === "playing" &&
              timeLeft > 0
            }
            onTimeUp={() => {}}
            onTick={() => {}}
          />

          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" />
              <span className="font-bold">
                Oponente:{" "}
                {user?.id === room.host_id ? room.guest_score : room.host_score}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Answer status */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10">
        <Card className="px-4 py-2">
          <div className="text-sm text-center">
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                userAnswer !== null ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            Você {userAnswer !== null ? "respondeu" : "respondendo"}
            <span className="mx-2">•</span>
            <span
              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                opponentAnswer !== null ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            Oponente {opponentAnswer !== null ? "respondeu" : "respondendo"}
          </div>
        </Card>
      </div>

      <QuestionCard
        question={currentQuestion}
        questionNumber={room.current_question_index + 1}
        totalQuestions={24}
        selectedAnswer={selectedAnswer}
        showAnswer={showAnswer}
        onSelectAnswer={handleAnswerSelect}
        gameMode="multiplayer"
      />
    </div>
  );
};
