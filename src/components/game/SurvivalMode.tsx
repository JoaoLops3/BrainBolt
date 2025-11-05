import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Skull,
  Heart,
  Flame,
  Trophy,
  ArrowLeft,
  Zap,
  Target,
  Crown,
} from "lucide-react";
import { Question } from "@/types/game";
import { useGameQuestions } from "@/hooks/useGameQuestions";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SurvivalModeProps {
  onBack: () => void;
}

export const SurvivalMode = ({ onBack }: SurvivalModeProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { allQuestions, questionTracker } = useGameQuestions();

  const [gameState, setGameState] = useState<"ready" | "playing" | "gameOver">(
    "ready"
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [personalBest, setPersonalBest] = useState(0);

  // Carregar recorde pessoal ao iniciar
  useEffect(() => {
    loadPersonalBest();
    loadLeaderboard();
  }, []);

  const loadPersonalBest = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("final_score")
        .eq("user_id", user.id)
        .eq("game_mode", "survival")
        .order("final_score", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setPersonalBest(data.final_score);
      }
    } catch (error) {
      console.error("Erro ao carregar recorde pessoal:", error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select(
          `
          final_score,
          user_id,
          profiles!inner(display_name, avatar_url)
        `
        )
        .eq("game_mode", "survival")
        .order("final_score", { ascending: false })
        .limit(10);

      if (data && !error) {
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Erro ao carregar leaderboard:", error);
    }
  };

  const getNextDifficulty = () => {
    if (streak < 5) return "easy";
    if (streak < 10) return "medium";
    return "hard";
  };

  const getNextQuestion = () => {
    const nextDiff = getNextDifficulty();
    setDifficulty(nextDiff);

    const availableQuestions = allQuestions.filter(
      (q) => q.difficulty === nextDiff && !usedQuestions.has(q.id)
    );

    if (availableQuestions.length === 0) {
      // Se não há mais perguntas dessa dificuldade, reinicia o pool
      setUsedQuestions(new Set());
      const resetQuestions = allQuestions.filter(
        (q) => q.difficulty === nextDiff
      );
      const random =
        resetQuestions[Math.floor(Math.random() * resetQuestions.length)];
      setCurrentQuestion(random);
      setUsedQuestions(new Set([random.id]));
      questionTracker.addQuestion(random.id);
      return;
    }

    const randomQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setUsedQuestions((prev) => new Set([...prev, randomQuestion.id]));
    questionTracker.addQuestion(randomQuestion.id);
  };

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setStreak(0);
    setQuestionsAnswered(0);
    setLives(3);
    setUsedQuestions(new Set());
    setDifficulty("easy");
    getNextQuestion();
  };

  const handleAnswer = (answerIndex: number) => {
    if (showAnswer || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setShowAnswer(true);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      // Pontuação aumenta com a dificuldade e streak
      let points = 100;
      if (difficulty === "medium") points = 150;
      if (difficulty === "hard") points = 200;

      const streakBonus = Math.floor(streak / 5) * 50;
      const totalPoints = points + streakBonus;

      setScore((prev) => prev + totalPoints);
      setStreak((prev) => prev + 1);
      setQuestionsAnswered((prev) => prev + 1);

      toast({
        title: "✅ Correto!",
        description: `+${totalPoints} pontos! ${
          streakBonus > 0 ? `Bônus de streak: +${streakBonus}` : ""
        }`,
      });

      setTimeout(() => {
        setSelectedAnswer(null);
        setShowAnswer(false);
        getNextQuestion();
      }, 1500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);

      if (newLives <= 0) {
        setTimeout(() => {
          endGame();
        }, 1500);
      } else {
        toast({
          title: "❌ Errado!",
          description: `Você perdeu uma vida! ${newLives} ${
            newLives === 1 ? "vida" : "vidas"
          } restante${newLives === 1 ? "" : "s"}.`,
          variant: "destructive",
        });

        setTimeout(() => {
          setSelectedAnswer(null);
          setShowAnswer(false);
          getNextQuestion();
        }, 1500);
      }
    }
  };

  const endGame = async () => {
    setGameState("gameOver");

    if (!user) return;

    // Salvar sessão no banco
    try {
      const { error } = await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_mode: "survival",
        final_score: score,
        correct_answers: questionsAnswered,
        max_streak: streak,
        time_spent: 0,
      });

      if (error) throw error;

      // Atualizar leaderboard
      await loadLeaderboard();
      await loadPersonalBest();

      if (score > personalBest) {
        toast({
          title: "🏆 Novo Recorde Pessoal!",
          description: `Você superou seu recorde anterior de ${personalBest} pontos!`,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar sessão:", error);
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500";
      case "medium":
        return "bg-orange-500";
      case "hard":
        return "bg-red-500";
    }
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Médio";
      case "hard":
        return "Difícil";
    }
  };

  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-gradient-primary p-3 sm:p-4 md:p-6 overflow-y-auto safe-top safe-bottom relative">
        {/* Botão X para sair */}
        <button
          onClick={onBack}
          className="fixed top-5 sm:top-8 left-4 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
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

        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 pt-20 sm:pt-24">
          {/* Card Principal */}
          <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Skull className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center">
                  Modo Sobrevivência
                </CardTitle>
                <Flame className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white animate-pulse" />
              </div>
              <p className="text-center text-white/80 text-sm sm:text-base md:text-lg px-2">
                Responda até errar! A dificuldade aumenta a cada 5 acertos.
              </p>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Regras */}
              <div className="bg-white/5 p-4 sm:p-6 rounded-lg border-2 border-white/20">
                <h3 className="font-bold text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2 text-white">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  Como Jogar
                </h3>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-white/90">
                  <li className="flex items-start gap-2">
                    <Heart className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>
                      Você começa com <strong>3 vidas</strong>. Cada erro remove
                      uma vida.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>
                      A dificuldade aumenta progressivamente:{" "}
                      <strong>Fácil (0-4)</strong> →{" "}
                      <strong>Médio (5-9)</strong> →{" "}
                      <strong>Difícil (10+)</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>
                      Ganhe mais pontos em perguntas difíceis e com streaks
                      longos!
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <span>
                      Compete pelo <strong>ranking global</strong> e supere seu
                      recorde pessoal!
                    </span>
                  </li>
                </ul>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="bg-white/5 border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-center">
                      <Trophy className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-white" />
                      <p className="text-xs sm:text-sm text-white/70">
                        Seu Recorde
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                        {personalBest}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/20">
                  <CardContent className="p-3 sm:p-4">
                    <div className="text-center">
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 text-white" />
                      <p className="text-xs sm:text-sm text-white/70">
                        Recorde Global
                      </p>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                        {leaderboard[0]?.final_score || 0}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top 5 Leaderboard */}
              {leaderboard.length > 0 && (
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3 flex items-center gap-2 text-white">
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    Top 5 Jogadores
                  </h3>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${
                          index === 0
                            ? "bg-white/30 border-2 border-white/40"
                            : "bg-white/5 border border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-lg sm:text-2xl font-bold w-6 sm:w-8 text-center flex-shrink-0">
                            {index === 0
                              ? "🥇"
                              : index === 1
                              ? "🥈"
                              : index === 2
                              ? "🥉"
                              : `#${index + 1}`}
                          </span>
                          <span className="font-medium text-white text-sm sm:text-base truncate">
                            {entry.profiles?.display_name || "Anônimo"}
                          </span>
                        </div>
                        <Badge
                          variant={index === 0 ? "default" : "secondary"}
                          className="text-xs sm:text-sm md:text-base px-2 sm:px-3 py-1 bg-white/20 text-white border-white/30 flex-shrink-0"
                        >
                          {entry.final_score} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão Iniciar */}
              <Button
                onClick={startGame}
                size="lg"
                className="w-full bg-white/20 hover:bg-white/30 border-2 border-white/30 text-white text-base sm:text-lg md:text-xl py-4 sm:py-5 md:py-6 shadow-lg hover:shadow-xl transition-all min-h-[56px]"
              >
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Iniciar Sobrevivência
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameState === "gameOver") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black p-4 sm:p-6 flex items-center justify-center overflow-y-auto safe-top safe-bottom">
        <Card className="max-w-2xl w-full backdrop-blur-lg bg-white/95 border-2 border-white shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Skull className="h-16 w-16 text-red-500" />
              <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-red-600 to-gray-600 bg-clip-text text-transparent">
                Game Over!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Estatísticas Finais */}
            <div className="bg-gradient-to-r from-red-50 to-gray-50 dark:from-red-950/20 dark:to-gray-950/20 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
              <h3 className="font-bold text-2xl mb-4 text-center">
                Suas Estatísticas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">
                    Pontuação Final
                  </p>
                  <p className="text-4xl font-bold text-red-600">{score}</p>
                </div>
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">
                    Perguntas Corretas
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    {questionsAnswered}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparação com recorde */}
            {score > personalBest && (
              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-950/30 dark:to-amber-950/30 p-4 rounded-lg border-2 border-yellow-400 text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <p className="font-bold text-xl text-yellow-700 dark:text-yellow-400">
                  🎉 Novo Recorde Pessoal! 🎉
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  Você superou seu recorde anterior de {personalBest} pontos!
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                onClick={startGame}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
              >
                <Flame className="h-5 w-5 mr-2" />
                Jogar Novamente
              </Button>
              <Button onClick={onBack} variant="outline" className="flex-1">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado "playing"
  return (
    <div className="min-h-screen bg-gradient-primary p-3 sm:p-4 md:p-6 overflow-y-auto safe-top safe-bottom relative">
      {/* Botão X para sair */}
      <button
        onClick={onBack}
        className="fixed top-5 sm:top-8 left-4 z-50 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
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

      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 pt-20 sm:pt-24">
        {/* Header com estatísticas */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl">
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 text-center">
              <div>
                <p className="text-xs sm:text-sm text-white/70 mb-0.5 sm:mb-1">
                  Vidas
                </p>
                <div className="flex justify-center gap-0.5 sm:gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        i < lives ? "fill-white text-white" : "text-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/70 mb-0.5 sm:mb-1">
                  Pontuação
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {score}
                </p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-white/70 mb-0.5 sm:mb-1">
                  Sequência
                </p>
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    {streak}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dificuldade atual */}
        <div className="flex justify-center">
          <Badge className="bg-white/20 border-white/30 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base">
            {getDifficultyLabel()}
          </Badge>
        </div>

        {/* Pergunta */}
        {currentQuestion && (
          <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl md:text-2xl text-center text-white leading-tight">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrect = showAnswer && isCorrect;
                const showWrong = showAnswer && isSelected && !isCorrect;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showAnswer}
                    className={`w-full h-auto min-h-[52px] sm:min-h-[60px] text-left justify-start p-3 sm:p-4 transition-all ${
                      showCorrect
                        ? "bg-green-500 hover:bg-green-500 text-white border-2 border-green-600"
                        : showWrong
                        ? "bg-red-500 hover:bg-red-500 text-white border-2 border-red-600"
                        : isSelected
                        ? "bg-white/30 border-2 border-white/50 text-white"
                        : "bg-white/5 border-white/20 hover:bg-white/20 text-white active:bg-white/30"
                    }`}
                    variant={showCorrect || showWrong ? "default" : "outline"}
                  >
                    <span className="font-semibold mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-sm sm:text-base leading-tight">
                      {option}
                    </span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
