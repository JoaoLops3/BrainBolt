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
      .maybeSingle();

    if (error) {
      console.error("Error fetching room:", error);
      return;
    }

    if (!data) {
      console.error("Room not found:", roomId);
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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Conectando...
            </h2>
            <p className="text-gray-600">Carregando informações da sala</p>
          </CardContent>
        </Card>
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
        <Card className="w-full max-w-md text-center backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="mb-6">
              <Users className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                Aguardando Jogador
              </h2>
              <p className="text-gray-600 mb-4">
                {!room.guest_id
                  ? "Esperando outro jogador entrar na sala"
                  : "Preparando o jogo..."}
              </p>
            </div>

            {/* Informações da sala */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Código da Sala:</span>
                <span className="font-mono font-bold text-lg text-primary">
                  {room.room_code}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jogadores:</span>
                <span className="text-sm font-medium">
                  {room.guest_id ? "2/2" : "1/2"}
                </span>
              </div>
            </div>

            {/* Botão de sair */}
            <button
              onClick={onBackToMenu}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors duration-200 font-medium"
            >
              Sair da Sala
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center backdrop-blur-lg bg-white/95 border-white/30 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Carregando...
            </h2>
            <p className="text-gray-600">Preparando próxima pergunta</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userAnswer =
    user?.id === room.host_id ? room.host_answer : room.guest_answer;
  const opponentAnswer =
    user?.id === room.host_id ? room.guest_answer : room.host_answer;

  return (
    <div className="min-h-screen bg-gradient-primary relative">
      {/* Header com informações da sala */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/20">
        <div className="flex items-center justify-between p-3 sm:p-4">
          {/* Botão de sair */}
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
          >
            <svg
              className="w-4 h-4"
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
            <span className="hidden sm:inline text-sm font-medium">Sair</span>
          </button>

          {/* Status da conexão */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-white text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Sala: {room?.room_code}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-white text-sm">
              <Users className="w-4 h-4" />
              <span>{room?.guest_id ? 2 : 1}/2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Placar e Timer */}
      <div className="fixed top-24 sm:top-28 left-0 right-0 z-40 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Seu placar */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-600 hidden sm:block">
                      Você
                    </div>
                    <div className="font-bold text-lg text-blue-600">
                      {user?.id === room.host_id
                        ? room.host_score
                        : room.guest_score}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer central */}
            <div className="flex justify-center">
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
            </div>

            {/* Placar do oponente */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-600 hidden sm:block">
                      Oponente
                    </div>
                    <div className="font-bold text-lg text-purple-600">
                      {user?.id === room.host_id
                        ? room.guest_score
                        : room.host_score}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="pt-40 sm:pt-44 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
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
      </div>
    </div>
  );
};
