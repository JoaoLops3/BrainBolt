import { useState, useCallback, useEffect } from "react";
import {
  GameState,
  Question,
  CategoryInfo,
  CategoryType,
  GameStats,
  GameMode,
} from "@/types/game";
import { questions } from "@/data/questions";
import { ImprovedMainMenu } from "./ImprovedMainMenu";
import { QuestionCard } from "./QuestionCard";
import { GameResults } from "./GameResults";
import { GameTimer } from "./GameTimer";
import { SettingsModal } from "./SettingsModal";
import { StatsModal } from "./StatsModal";
import { AdvancedStatsModal } from "@/components/stats/AdvancedStatsModal";
import { ImprovedMultiplayerMenu } from "./ImprovedMultiplayerMenu";
import { MultiplayerGame } from "./MultiplayerGame";
import { ImprovedFriendsModal } from "../friends/ImprovedFriendsModal";
import { AchievementsModal } from "@/components/achievements/AchievementsModal";
import { CharactersModal } from "@/components/achievements/CharactersModal";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { TeacherDashboard } from "@/components/classroom/TeacherDashboard";
import { StudentDashboard } from "@/components/classroom/StudentDashboard";
import { SurvivalMode } from "./SurvivalMode";
import { PhysicalModeSimple } from "./PhysicalModeSimple";
import { PhysicalModeGame } from "./PhysicalModeGame";
import { useAchievements } from "@/hooks/useAchievements";
import { useRetentionNotifications } from "@/hooks/useRetentionNotifications";
import { useNativeNotifications } from "@/hooks/useNativeNotifications";
import { useDailyNotifications } from "@/hooks/useDailyNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGameQuestions } from "@/hooks/useGameQuestions";
import { useToast } from "@/hooks/use-toast";
import { useArduinoSerial } from "@/hooks/useArduinoSerial";

const initialCategories: CategoryInfo[] = [
  {
    id: "sports",
    name: "Esportes",
    color: "sports",
    icon: "sports-icon",
    collected: false,
  },
  {
    id: "entertainment",
    name: "Entretenimento",
    color: "entertainment",
    icon: "entertainment-icon",
    collected: false,
  },
  { id: "art", name: "Arte", color: "art", icon: "art-icon", collected: false },
  {
    id: "science",
    name: "Ciências",
    color: "science",
    icon: "science-icon",
    collected: false,
  },
  {
    id: "geography",
    name: "Geografia",
    color: "geography",
    icon: "geography-icon",
    collected: false,
  },
  {
    id: "history",
    name: "História",
    color: "history",
    icon: "history-icon",
    collected: false,
  },
  {
    id: "mathematics",
    name: "Matemática",
    color: "mathematics",
    icon: "mathematics-icon",
    collected: false,
  },
  {
    id: "portuguese",
    name: "Português",
    color: "portuguese",
    icon: "portuguese-icon",
    collected: false,
  },
];

export const BrainBoltGame = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectQuestions } = useGameQuestions();
  const [gameState, setGameState] = useState<GameState>({
    currentQuestionIndex: 0,
    score: 0,
    questionsAnswered: 0,
    categories: initialCategories,
    gamePhase: "menu",
    selectedAnswer: null,
    showAnswer: false,
    currentStreak: 0,
    gameMode: "normal",
    timeLeft: 0,
    totalTime: 0,
  });

  const [multiplayerPhase, setMultiplayerPhase] = useState<"menu" | "game">(
    "menu"
  );
  const [multiplayerRoomId, setMultiplayerRoomId] = useState<string>("");
  const [isMultiplayerHost, setIsMultiplayerHost] = useState(false);
  const [physicalModeActive, setPhysicalModeActive] = useState(false);
  const [physicalModeGameActive, setPhysicalModeGameActive] = useState(false);

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<GameStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    categoriesCompleted: [],
    finalScore: 0,
    gameMode: "normal",
    maxStreak: 0,
    timeSpent: 0,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [advancedStatsOpen, setAdvancedStatsOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [charactersOpen, setCharactersOpen] = useState(false);
  const { notification, clearNotification } = useAchievements();
  const { updateLastSession, sendSessionEndNotification } =
    useRetentionNotifications();
  const { requestPermission, permission, isSupported } =
    useNativeNotifications();
  useDailyNotifications(); // Ativar notificações diárias automáticas

  const [gameStartTime, setGameStartTime] = useState<number>(0);
  // Integração com Arduino para respostas no modo físico
  const { onMessage } = useArduinoSerial();

  // Efeito de integração Arduino (posicionado após handleAnswerSelect)

  // Notificações serão gerenciadas nas configurações

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectQuestionsCallback = useCallback(() => {
    // Usar o sistema melhorado de seleção de perguntas
    return selectQuestions(4);
  }, [selectQuestions]);

  const startGame = useCallback(
    (mode: GameMode) => {
      const selectedQuestions = selectQuestionsCallback();
      setGameQuestions(selectedQuestions);
      const timePerQuestion = mode === "speed" ? 15 : 0;

      setGameState({
        currentQuestionIndex: 0,
        score: 0,
        questionsAnswered: 0,
        categories: initialCategories,
        gamePhase: "playing",
        selectedAnswer: null,
        showAnswer: false,
        currentStreak: 0,
        gameMode: mode,
        timeLeft: timePerQuestion,
        totalTime: timePerQuestion,
      });

      setGameStartTime(Date.now());
    },
    [selectQuestionsCallback, toast]
  );

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      // Proteção dupla: verificar estado ANTES e dentro do setState
      setGameState((prev) => {
        // Se já tem resposta selecionada ou está mostrando resposta, ignorar
        if (prev.selectedAnswer !== null || prev.showAnswer) {
          return prev;
        }

        // Usar valores do estado atual (prev) em vez de capturados
        const currentQuestion = gameQuestions[prev.currentQuestionIndex];
        if (!currentQuestion) {
          return prev; // Proteção caso não tenha pergunta
        }

        const isCorrect = answerIndex === currentQuestion.correctAnswer;

        // Capturar o índice atual para verificação no setTimeout
        const currentQuestionIndexAtAnswer = prev.currentQuestionIndex;

        // Marcar resposta como selecionada IMEDIATAMENTE
        // Isso previne múltiplos disparos antes do setTimeout
        setTimeout(() => {
          setGameState((prevState) => {
            // Verificar novamente se ainda está na mesma pergunta
            if (
              prevState.currentQuestionIndex !== currentQuestionIndexAtAnswer
            ) {
              // Se mudou de pergunta, não processar (já foi processado)
              return prevState;
            }

            const newScore = isCorrect
              ? prevState.score + 100
              : prevState.score;
            const newStreak = isCorrect ? prevState.currentStreak + 1 : 0;
            const questionsAnswered = prevState.questionsAnswered + 1;

            // Check if category should be collected (2+ correct answers in that category)
            const categoryAnswers = gameQuestions
              .slice(0, questionsAnswered)
              .filter(
                (q) =>
                  q.category === currentQuestion.category &&
                  gameQuestions.indexOf(q) <= currentQuestionIndexAtAnswer &&
                  (gameQuestions.indexOf(q) < currentQuestionIndexAtAnswer
                    ? true
                    : isCorrect)
              );

            const correctCategoryAnswers = categoryAnswers.filter((_, index) =>
              index < currentQuestionIndexAtAnswer ? true : isCorrect
            ).length;

            const updatedCategories = prevState.categories.map((cat) =>
              cat.id === currentQuestion.category && correctCategoryAnswers >= 2
                ? { ...cat, collected: true }
                : cat
            );

            if (questionsAnswered >= gameQuestions.length) {
              // Game finished - save to database and calculate final stats
              const correctAnswers = Math.min(
                Math.floor(newScore / 100),
                gameQuestions.length
              );

              const finalStats = {
                totalQuestions: gameQuestions.length,
                correctAnswers: correctAnswers,
                categoriesCompleted: updatedCategories
                  .filter((cat) => cat.collected)
                  .map((cat) => cat.id),
                finalScore: newScore,
                gameMode: prevState.gameMode,
                maxStreak: Math.max(prevState.currentStreak, newStreak),
                timeSpent: Math.floor((Date.now() - gameStartTime) / 1000),
              };

              setStats(finalStats);

              if (user) {
                saveGameSession(finalStats).catch(console.error);
              }

              updateLastSession();
              sendSessionEndNotification();

              return {
                ...prevState,
                score: newScore,
                questionsAnswered,
                categories: updatedCategories,
                gamePhase: "results" as const,
                currentStreak: newStreak,
              };
            }

            // Move to next question - apenas incrementar uma vez
            const nextTimeLeft =
              prevState.gameMode === "speed" ? prevState.totalTime : 0;

            return {
              ...prevState,
              currentQuestionIndex: prevState.currentQuestionIndex + 1, // Incrementar apenas 1
              score: newScore,
              questionsAnswered,
              categories: updatedCategories,
              selectedAnswer: null,
              showAnswer: false,
              currentStreak: newStreak,
              timeLeft: nextTimeLeft,
            };
          });
        }, 2000);

        return {
          ...prev,
          selectedAnswer: answerIndex,
          showAnswer: true,
        };
      });
    },
    [
      gameQuestions,
      gameStartTime,
      user,
      updateLastSession,
      sendSessionEndNotification,
    ]
  );

  // Save game session to database
  const saveGameSession = async (finalStats: GameStats) => {
    if (!user) return;

    try {
      const gameResult =
        finalStats.correctAnswers > finalStats.totalQuestions / 2
          ? "win"
          : "loss";

      // Garantir que correct_answers nunca seja maior que questions_answered
      const safeCorrectAnswers = Math.min(
        finalStats.correctAnswers,
        finalStats.totalQuestions
      );

      // Mapear game_mode "physical" para "normal" no banco (mesma mecânica de jogo)
      const dbGameMode: "normal" | "speed" | "multiplayer" | "survival" =
        finalStats.gameMode === "physical" ? "normal" : finalStats.gameMode;

      const { data: sessionData, error } = await supabase
        .from("game_sessions")
        .insert({
          user_id: user.id,
          game_mode: dbGameMode,
          final_score: finalStats.finalScore,
          questions_answered: finalStats.totalQuestions,
          correct_answers: safeCorrectAnswers,
          categories_completed: finalStats.categoriesCompleted,
          max_streak: finalStats.maxStreak,
          time_spent: finalStats.timeSpent,
          game_result: gameResult,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar sessão:", error);
        throw error;
      }

      // Se estiver jogando dentro de uma sala, vincular a sessão
      const classroomId = localStorage.getItem("currentClassroomId");
      if (classroomId && sessionData) {
        await supabase.from("classroom_game_sessions").insert({
          classroom_id: classroomId,
          student_id: user.id,
          game_session_id: sessionData.id,
        });
        // Limpar o classroomId do localStorage
        localStorage.removeItem("currentClassroomId");
      }
    } catch (error) {
      console.error("Error saving game session:", error);
    }
  };

  // Manipular eventos do cronômetro
  const handleTimeUp = useCallback(() => {
    if (gameState.selectedAnswer === null) {
      handleAnswerSelect(-1); // Invalid answer index for timeout
    }
  }, [gameState.selectedAnswer, handleAnswerSelect]);

  const handleTimerTick = useCallback((newTime: number) => {
    setGameState((prev) => ({ ...prev, timeLeft: newTime }));
  }, []);

  // Integração Arduino: ouvir "button_press" e responder
  useEffect(() => {
    if (
      gameState.gamePhase !== "playing" ||
      gameState.gameMode !== "physical"
    ) {
      return;
    }

    let lastButtonPressTime = 0;
    let isProcessing = false;
    const DEBOUNCE_MS = 800; // Evitar múltiplos disparos em 800ms

    const messageHandler = (data: string) => {
      // Debounce: ignorar cliques muito rápidos ou se já está processando
      const now = Date.now();
      if (isProcessing || now - lastButtonPressTime < DEBOUNCE_MS) {
        return;
      }

      // Verificar estado antes de processar
      if (gameState.selectedAnswer !== null || gameState.showAnswer) {
        return;
      }

      try {
        const msg = JSON.parse(data);
        if (msg?.type === "button_press" && typeof msg.button === "string") {
          const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          const idx = map[msg.button.toUpperCase()];
          if (idx !== undefined && !isProcessing) {
            isProcessing = true;
            lastButtonPressTime = now;
            handleAnswerSelect(idx);
            setTimeout(() => {
              isProcessing = false;
            }, DEBOUNCE_MS);
          }
        }
      } catch {
        // Suportar saída textual/fragmentada do Arduino
        const text = (data || "").toString();
        const jsonBtn = text.match(/"button"\s*:\s*"([ABCD])"/i);
        const plainBtn = text.match(/\b([ABCD])\b/i);
        const letter = (jsonBtn?.[1] || plainBtn?.[1] || "").toUpperCase();
        if (
          (letter === "A" ||
            letter === "B" ||
            letter === "C" ||
            letter === "D") &&
          !isProcessing
        ) {
          const map: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
          const idx = map[letter];
          isProcessing = true;
          lastButtonPressTime = now;
          handleAnswerSelect(idx);
          setTimeout(() => {
            isProcessing = false;
          }, DEBOUNCE_MS);
        }
      }
    };

    const cleanup = onMessage(messageHandler);

    // Cleanup quando o componente desmontar ou as dependências mudarem
    return cleanup;
  }, [
    onMessage,
    gameState.gamePhase,
    gameState.gameMode,
    gameState.selectedAnswer,
    gameState.showAnswer,
    handleAnswerSelect,
  ]);

  const backToMenu = useCallback(() => {
    setGameState((prev) => ({ ...prev, gamePhase: "menu" }));
    setMultiplayerPhase("menu");
    setMultiplayerRoomId("");
    setIsMultiplayerHost(false);
  }, []);

  const startMultiplayer = () => {
    setGameState((prev) => ({ ...prev, gamePhase: "multiplayer" }));
    setMultiplayerPhase("menu");
  };

  const handleMultiplayerStart = (roomId: string, isHost: boolean) => {
    setMultiplayerRoomId(roomId);
    setIsMultiplayerHost(isHost);
    setMultiplayerPhase("game");
  };

  const viewTeacherClassrooms = () => {
    setGameState((prev) => ({ ...prev, gamePhase: "teacherClassrooms" }));
  };

  const viewStudentClassrooms = () => {
    setGameState((prev) => ({ ...prev, gamePhase: "studentClassrooms" }));
  };

  const startSurvivalMode = () => {
    setGameState((prev) => ({
      ...prev,
      gamePhase: "survival",
      gameMode: "survival",
    }));
  };

  const startPhysicalMode = () => {
    setPhysicalModeActive(true);
  };

  if (gameState.gamePhase === "survival") {
    return <SurvivalMode onBack={backToMenu} />;
  }

  if (physicalModeGameActive) {
    return (
      <PhysicalModeGame
        onBackToMenu={() => {
          setPhysicalModeGameActive(false);
          setPhysicalModeActive(false);
        }}
      />
    );
  }

  if (physicalModeActive) {
    return (
      <PhysicalModeSimple
        onBackToMenu={() => setPhysicalModeActive(false)}
        onStartGame={(mode) => {
          setPhysicalModeGameActive(true);
        }}
      />
    );
  }
  if (gameState.gamePhase === "menu") {
    return (
      <>
        <ImprovedMainMenu
          onSelectMode={startGame}
          onStartMultiplayer={startMultiplayer}
          onStartPhysicalMode={startPhysicalMode}
          onOpenSettings={() => setSettingsOpen(true)}
          onViewStats={() => setStatsOpen(true)}
          onViewAdvancedStats={() => setAdvancedStatsOpen(true)}
          onOpenFriends={() => setFriendsOpen(true)}
          onViewAchievements={() => setAchievementsOpen(true)}
          onViewCharacters={() => setCharactersOpen(true)}
          onViewTeacherClassrooms={viewTeacherClassrooms}
          onViewStudentClassrooms={viewStudentClassrooms}
          onStartSurvival={startSurvivalMode}
        />

        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

        <StatsModal open={statsOpen} onOpenChange={setStatsOpen} />

        <AdvancedStatsModal
          open={advancedStatsOpen}
          onOpenChange={setAdvancedStatsOpen}
        />

        <AchievementsModal
          open={achievementsOpen}
          onOpenChange={setAchievementsOpen}
        />

        <CharactersModal
          open={charactersOpen}
          onOpenChange={setCharactersOpen}
        />

        <ImprovedFriendsModal
          open={friendsOpen}
          onOpenChange={setFriendsOpen}
        />

        <AchievementNotification
          notification={notification}
          onClose={clearNotification}
        />
      </>
    );
  }

  if (gameState.gamePhase === "teacherClassrooms") {
    return <TeacherDashboard onBack={backToMenu} />;
  }

  if (gameState.gamePhase === "studentClassrooms") {
    return <StudentDashboard onBack={backToMenu} />;
  }

  if (gameState.gamePhase === "multiplayer") {
    if (multiplayerPhase === "menu") {
      return (
        <ImprovedMultiplayerMenu
          onStartMultiplayer={handleMultiplayerStart}
          onBackToMenu={backToMenu}
          onStartPhysicalMode={startPhysicalMode}
        />
      );
    }

    if (multiplayerPhase === "game") {
      return (
        <MultiplayerGame
          roomId={multiplayerRoomId}
          isHost={isMultiplayerHost}
          onBackToMenu={backToMenu}
        />
      );
    }
  }

  if (gameState.gamePhase === "results") {
    return (
      <GameResults
        stats={stats}
        categories={gameState.categories}
        onPlayAgain={() => startGame(gameState.gameMode)}
        onBackToMenu={backToMenu}
      />
    );
  }

  const currentQuestion = gameQuestions[gameState.currentQuestionIndex];

  if (!currentQuestion) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-primary relative no-scroll">
      {/* Exit button */}
      <button
        onClick={backToMenu}
        className="fixed top-12 sm:top-8 left-4 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
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

      <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 pt-16 sm:pt-4 no-scroll w-full">
        <div className="w-full max-w-2xl space-y-4">
          {/* Timer for speed mode - positioned above progress */}
          {gameState.gameMode === "speed" && (
            <div className="flex justify-center">
              <GameTimer
                timeLeft={gameState.timeLeft}
                totalTime={gameState.totalTime}
                isActive={
                  gameState.selectedAnswer === null && !gameState.showAnswer
                }
                onTimeUp={handleTimeUp}
                onTick={handleTimerTick}
              />
            </div>
          )}

          <QuestionCard
            question={currentQuestion}
            questionNumber={gameState.currentQuestionIndex + 1}
            totalQuestions={gameQuestions.length}
            selectedAnswer={gameState.selectedAnswer}
            showAnswer={gameState.showAnswer}
            onSelectAnswer={handleAnswerSelect}
            gameMode={gameState.gameMode}
          />
        </div>
      </div>
    </div>
  );
};
