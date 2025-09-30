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
import { MultiplayerMenu } from "./MultiplayerMenu";
import { MultiplayerGame } from "./MultiplayerGame";
import { ImprovedFriendsModal } from "../friends/ImprovedFriendsModal";
import { AchievementsModal } from "@/components/achievements/AchievementsModal";
import { CharactersModal } from "@/components/achievements/CharactersModal";
import { AchievementNotification } from "@/components/achievements/AchievementNotification";
import { useAchievements } from "@/hooks/useAchievements";
import { useRetentionNotifications } from "@/hooks/useRetentionNotifications";
import { useNativeNotifications } from "@/hooks/useNativeNotifications";
import { useDailyNotifications } from "@/hooks/useDailyNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
];

export const BrainBoltGame = () => {
  const { toast } = useToast();
  const { user } = useAuth();
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

  // Auto-solicitar permissão apenas se não passou pelo onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "brainbolt-onboarding-completed"
    );

    if (
      user &&
      isSupported &&
      permission === "default" &&
      !hasCompletedOnboarding
    ) {
      const timer = setTimeout(() => {
        requestPermission();
      }, 60000); // 1 minuto para usuários que não passaram pelo onboarding

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, requestPermission]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectQuestions = useCallback(() => {
    // Select 4 questions per category (24 total)
    const selectedQuestions: Question[] = [];
    const categoriesOrder: CategoryType[] = [
      "sports",
      "entertainment",
      "art",
      "science",
      "geography",
      "history",
    ];

    categoriesOrder.forEach((category) => {
      const categoryQuestions = questions.filter(
        (q) => q.category === category
      );
      const shuffledCategoryQuestions = shuffleArray(categoryQuestions);
      selectedQuestions.push(...shuffledCategoryQuestions.slice(0, 4));
    });

    return shuffleArray(selectedQuestions);
  }, []);

  const startGame = useCallback(
    (mode: GameMode) => {
      const selectedQuestions = selectQuestions();
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
    [selectQuestions, toast]
  );

  const handleAnswerSelect = useCallback(
    (answerIndex: number) => {
      if (gameState.selectedAnswer !== null) return;

      setGameState((prev) => ({
        ...prev,
        selectedAnswer: answerIndex,
        showAnswer: true,
      }));

      const currentQuestion = gameQuestions[gameState.currentQuestionIndex];
      const isCorrect = answerIndex === currentQuestion.correctAnswer;

      setTimeout(() => {
        setGameState((prev) => {
          const newScore = isCorrect ? prev.score + 100 : prev.score;
          const newStreak = isCorrect ? prev.currentStreak + 1 : 0;
          const questionsAnswered = prev.questionsAnswered + 1;

          // Check if category should be collected (2+ correct answers in that category)
          const categoryAnswers = gameQuestions
            .slice(0, questionsAnswered)
            .filter(
              (q) =>
                q.category === currentQuestion.category &&
                gameQuestions.indexOf(q) <= gameState.currentQuestionIndex &&
                // Check if this question was answered correctly
                (gameQuestions.indexOf(q) < gameState.currentQuestionIndex
                  ? true
                  : isCorrect)
            );

          const correctCategoryAnswers = categoryAnswers.filter((_, index) =>
            index < gameState.currentQuestionIndex ? true : isCorrect
          ).length;

          const updatedCategories = prev.categories.map((cat) =>
            cat.id === currentQuestion.category && correctCategoryAnswers >= 2
              ? { ...cat, collected: true }
              : cat
          );

          if (questionsAnswered >= gameQuestions.length) {
            // Game finished - save to database and calculate final stats
            const correctAnswers =
              gameQuestions.filter((q, index) => {
                if (index < gameState.currentQuestionIndex) return true; // Assume previous were handled
                if (index === gameState.currentQuestionIndex) return isCorrect;
                return false;
              }).length +
              gameState.score / 100; // Add previous correct answers

            const finalStats = {
              totalQuestions: gameQuestions.length,
              correctAnswers: correctAnswers,
              categoriesCompleted: updatedCategories
                .filter((cat) => cat.collected)
                .map((cat) => cat.id),
              finalScore: newScore,
              gameMode: prev.gameMode,
              maxStreak: Math.max(prev.currentStreak, newStreak),
              timeSpent: Math.floor((Date.now() - gameStartTime) / 1000),
            };

            setStats(finalStats);

            // Save game session to database if user is logged in
            if (user) {
              saveGameSession(finalStats).catch(console.error);
            }

            // Atualizar última sessão e enviar notificação de retenção
            updateLastSession();
            sendSessionEndNotification();

            return {
              ...prev,
              score: newScore,
              questionsAnswered,
              categories: updatedCategories,
              gamePhase: "results" as const,
              currentStreak: newStreak,
            };
          }

          // Move to next question
          const nextTimeLeft = prev.gameMode === "speed" ? prev.totalTime : 0;

          return {
            ...prev,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
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
    },
    [
      gameState.selectedAnswer,
      gameState.currentQuestionIndex,
      gameQuestions,
      gameState.score,
      gameState.currentStreak,
      gameState.questionsAnswered,
      toast,
      user,
      gameStartTime,
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

      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_mode: finalStats.gameMode,
        final_score: finalStats.finalScore,
        questions_answered: finalStats.totalQuestions,
        correct_answers: finalStats.correctAnswers,
        categories_completed: finalStats.categoriesCompleted,
        max_streak: finalStats.maxStreak,
        time_spent: finalStats.timeSpent,
        game_result: gameResult,
      });
    } catch (error) {
      console.error("Error saving game session:", error);
    }
  };

  // Handle timer events
  const handleTimeUp = useCallback(() => {
    if (gameState.selectedAnswer === null) {
      handleAnswerSelect(-1); // Invalid answer index for timeout
    }
  }, [gameState.selectedAnswer, handleAnswerSelect]);

  const handleTimerTick = useCallback((newTime: number) => {
    setGameState((prev) => ({ ...prev, timeLeft: newTime }));
  }, []);

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

  if (gameState.gamePhase === "menu") {
    return (
      <>
        <ImprovedMainMenu
          onSelectMode={startGame}
          onStartMultiplayer={startMultiplayer}
          onOpenSettings={() => setSettingsOpen(true)}
          onViewStats={() => setStatsOpen(true)}
          onViewAdvancedStats={() => setAdvancedStatsOpen(true)}
          onOpenFriends={() => setFriendsOpen(true)}
          onViewAchievements={() => setAchievementsOpen(true)}
          onViewCharacters={() => setCharactersOpen(true)}
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

  if (gameState.gamePhase === "multiplayer") {
    if (multiplayerPhase === "menu") {
      return (
        <MultiplayerMenu
          onStartMultiplayer={handleMultiplayerStart}
          onBackToMenu={backToMenu}
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
        className="absolute top-4 left-4 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30"
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

      <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 no-scroll w-full">
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
