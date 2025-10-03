import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GameTimer } from "./GameTimer";
import { QuestionCard } from "./QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Trophy, Timer } from "lucide-react";

// Import optimized hooks and stores
import { useServerTimer } from "@/hooks/useServerTimer";
import { useMultiplayerHeartbeat } from "@/hooks/useMultiplayerHeartbeat";
import { useOfflineMultiplayer } from "@/hooks/useOfflineMultiplayer";
import { useDebouncedUpdate } from "@/hooks/useDebouncedUpdate";
import { useMultiplayerStore, multiplayerSelectors } from "@/stores/multiplayerStore";
import { ConnectionStatus } from "@/components/ui/ConnectionStatus";
import { multiplayerQueries } from "@/utils/supabaseOptimized";
import { withRetry } from "@/utils/retryWrapper";
import { questions } from "@/data/questions";

interface OptimizedMultiplayerGameProps {
  roomId: string;
  isHost: boolean;
  onBackToMenu: () => void;
}

export const OptimizedMultiplayerGame = ({
  roomId,
  isHost,
  onBackToMenu,
}: OptimizedMultiplayerGameProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Zustand store for state management
  const {
    room,
    currentQuestion,
    gamePhase,
    timeLeft,
    selectedAnswer,
    showAnswer,
    isConnected,
    updateRoomFromServer,
    setCurrentQuestion,
    setGamePhase,
    setTimeLeft,
    setSelectedAnswer,
    setShowAnswer,
    setIsConnected,
  } = useMultiplayerStore();

  // Offline multiplayer handling
  const { queueAction, isSyncing } = useOfflineMultiplayer(roomId);

  // Heartbeat for connection monitoring
  const { 
    isConnected: heartbeatConnected, 
    lastActivity,
    reconnectAttempts,
    maxReconnectAttempts 
  } = useMultiplayerHeartbeat(roomId, {
    onDisconnect: () => setIsConnected(false),
    onReconnect: () => setIsConnected(true),
  });

  // Server-synchronized timer
  const { timeLeft: serverTimeLeft, isActive: timerActive } = useServerTimer(
    room?.question_start_time || null,
    {
      initialDuration: 15,
      onTimeUp: handleTimeUp,
    }
  );

  // Debounced score update to prevent spam
  const debouncedScoreUpdate = useDebouncedUpdate(
    async (scoreData: { userId: string; isCorrect: boolean; questionId: string }) => {
      await multiplayerQueries.submitAnswer({
        room_id: roomId,
        user_id: scoreData.userId,
        question_id: scoreData.questionId,
        answer_index: selectedAnswer || -1,
        is_correct: scoreData.isCorrect,
        time_spent: 15 - timeLeft,
      });
    },
    { delay: 500, maxWait: 2000 }
  );

  // Fetch room data with optimized query
  const fetchRoomData = async () => {
    try {
      const { data, error } = await multiplayerQueries.getRoomById(roomId);
      
      if (error) throw error;
      if (!data) throw new Error("Room not found");

      updateRoomFromServer(data as any);
    } catch (error) {
      console.error("Failed to fetch room data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar dados da sala",
        variant: "destructive",
      });
    }
  };

  // Start game (host only)
  const startGame = async () => {
    if (!isHost || !room || !user) return;

    try {
      // Shuffle questions for host
      const shuffledQuestions = [...questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 24);

      const firstQuestion = shuffledQuestions[0];

      await withRetry(async () => {
        const { data, error } = await multiplayerQueries.startGame(
          roomId,
          firstQuestion.id,
          0
        );
        
        if (error) throw error;
        return data;
      });

      setCurrentQuestion(firstQuestion);
      setGamePhase("playing");
      
      toast({
        title: "Jogo iniciado!",
        description: "A partida começou",
      });
    } catch (error) {
      console.error("Failed to start game:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o jogo",
        variant: "destructive",
      });
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion || !user) return;

    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    const isCorrect = currentQuestion.correct_answer === answerIndex;
    
    // Queue answer for offline playback and immediate database update
    queueAction("answer", {
      userId: user.id,
      questionId: currentQuestion.id,
      answerIndex,
      isCorrect,
      timeSpent: 15 - timeLeft,
    });

    // Debounced update to prevent spam
    debouncedScoreUpdate.update({
      userId: user.id,
      isCorrect,
      questionId: currentQuestion.id,
    });

    // Auto-advance after 2 seconds
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Handle time up
  const handleTimeUp = async () => {
    if (selectedAnswer !== null || !currentQuestion || !user) return;

    setSelectedAnswer(-1);
    setShowAnswer(true);

    // Queue timeout answer
    queueAction("answer", {
      userId: user.id,
      questionId: currentQuestion.id,
      answerIndex: -1,
      isCorrect: false,
      timeSpent: 15,
    });

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  // Next question
  const nextQuestion = async () => {
    if (!room || !isHost) return;

    const currentIndex = (room.current_question_index || 0) + 1;
    
    // End game if last question
    if (currentIndex >= 24) {
      await endGame();
      return;
    }

    // Get next question
    const shuffledIndex = currentIndex % questions.length;
    const nextQuestionData = questions[shuffledIndex];

    try {
      await withRetry(async () => {
        const { data, error } = await multiplayerQueries.nextQuestion(
          roomId,
          nextQuestionData.id,
          currentIndex
        );
        
        if (error) throw error;
        return data;
      });

      setCurrentQuestion(nextQuestionData);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } catch (error) {
      console.error("Failed to advance question:", error);
      toast({
        title: "Erro",
        description: "Não foi possível avançar para próxima pergunta",
        variant: "destructive",
      });
    }
  };

  // End game
  const endGame = async () => {
    if (!room || !user) return;

    const winnerId = determineWinner();
    
    try {
      await withRetry(async () => {
        const { data, error } = await multiplayerQueries.finishGame(roomId, winnerId);
        
        if (error) throw error;
        return data;
      });

      setGamePhase("finished");
      
      toast({
        title: winnerId === user.id ? "Você venceu!" : "Jogo finalizado",
        description: winnerId === user.id 
          ? "Parabéns pela vitória!" 
          : "Boa partida!",
      });
    } catch (error) {
      console.error("Failed to end game:", error);
    }
  };

  // Determine game winner
  const determineWinner = () => {
    if (!room) return null;
    
    const hostScore = room.host_score || 0;
    const guestScore = room.guest_score || 0;
    
    if (hostScore > guestScore) return room.host_id;
    if (guestScore > hostScore) return room.guest_id;
    return null; // Draw
  };

  // Real-time room updates
  useEffect(() => {
    if (!roomId) return;

    fetchRoomData();

    const channel = supabase
      .channel(`multiplayer-updates-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "multiplayer_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          const updatedRoom = payload.new as any;
          updateRoomFromServer(updatedRoom);

          // Update current question if changed
          if (updatedRoom.current_question_id && updatedRoom.current_question_id !== currentQuestion?.id) {
            const question = questions.find(q => q.id === updatedRoom.current_question_id);
            if (question) {
              setCurrentQuestion(question);
              setSelectedAnswer(null);
              setShowAnswer(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentQuestion?.id]);

  // Update timer from server
  useEffect(() => {
    setTimeLeft(serverTimeLeft);
  }, [serverTimeLeft]);

  // Update connection status
  useEffect(() => {
    setIsConnected(heartbeatConnected);
  }, [heartbeatConnected, setIsConnected]);

  // Get current question
  useEffect(() => {
    if (!room?.current_question_id || currentQuestion?.id === room.current_question_id) return;

    const question = questions.find(q => q.id === room.current_question_id);
    if (question) {
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  }, [room?.current_question_id, currentQuestion?.id]);

  const userScore = isHost ? (room?.host_score || 0) : (room?.guest_score || 0);
  const opponentScore = isHost ? (room?.guest_score || 0) : (room?.host_score || 0);

  return (
    <div className="min-h-screen bg-gradient-primary p-4 safe-top safe-bottom">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBackToMenu}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <ConnectionStatus
            isConnected={isConnected}
            isSyncing={isSyncing}
            lastActivity={lastActivity}
            reconnectAttempts={reconnectAttempts}
            maxReconnectAttempts={maxReconnectAttempts}
            showDetails={true}
          />
        </div>

        {/* Score Display */}
        <Card className="bg-white/20 border-white/30 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">{isHost ? "Host" : "Guest"}</Badge>
                <div className="text-2xl font-bold text-white">{userScore}</div>
              </div>
              
              <div className="text-center">
                <Trophy className="h-6 w-6 text-yellow-400 mx-auto" />
                <div className="text-sm text-white/80 mt-1">vs</div>
              </div>
              
              <div className="text-center">
                <Badge variant="outline" className="mb-2">Oponente</Badge>
                <div className="text-2xl font-bold text-white">{opponentScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Area */}
      <div className="max-w-2xl mx-auto">
        {gamePhase === "waiting" && isHost && (
          <Card className="bg-white/20 border-white/30 backdrop-blur-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Aguardando oponente...
              </h3>
              <p className="text-white/80 mb-4">
                Compartilhe o código da sala: <strong>{room?.room_code}</strong>
              </p>
              <Button
                onClick={startGame}
                disabled={!room?.guest_id}
                className="bg-primary hover:bg-primary/90"
              >
                Iniciar Jogo
              </Button>
            </CardContent>
          </Card>
        )}

        {gamePhase === "waiting" && !isHost && (
          <Card className="bg-white/20 border-white/30 backdrop-blur-lg">
            <CardContent modalOverlay-blur-lg">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Aguardando o host iniciar...
              </h3>
              <p className="text-white/80">
                O host iniciará a partida quando estiver pronto
              </p>
            </CardContent>
          </Card>
        )}

        {gamePhase === "playing" && currentQuestion && (
          <div className="space-y-4">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={selectedAnswer}
              showAnswer={showAnswer}
              onAnswerSelect={handleAnswerSelect}
              disabled={selectedAnswer !== null || !timerActive}
            />
            
            <GameTimer
              timeLeft={timeLeft}
              totalTime={15}
              isActive={timerActive}
              onTimeUp={handleTimeUp}
              onTick={() => {}}
            />
          </div>
        )}

        {gamePhase === "finished" && (
          <Card className="bg-white/20 border-white/30 backdrop-blur-lg">
            <CardContent className="p-6 text-center">
              <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                {determineWinner() === user?.id ? "🎉 Você Venceu!" : "Jogo Finalizado"}
              </h3>
              <p className="text-white/80 mb-4">
                Seu placar: {userScore} • Oponente: {opponentScore}
              </p>
              <Button
                onClick={onBackToMenu}
                className="bg-primary hover:bg-primary/90">
                Voltar ao Menu
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
