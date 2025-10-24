import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Brain,
  Calendar,
  BarChart3,
  Medal,
  Crown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdvancedStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GameSession {
  id: string;
  game_mode: string;
  final_score: number;
  questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
  max_streak: number;
  time_spent: number;
  completed_at: string;
  game_result: string | null;
}

interface CategoryPerformance {
  category: string;
  questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
  best_streak: number;
}

interface GlobalRanking {
  global_rank: number;
  win_rate_rank: number;
  streak_rank: number;
  total_score: number;
  games_played: number;
  win_percentage: number;
  best_streak: number;
}

const categoryNames = {
  sports: "Esportes",
  entertainment: "Entretenimento",
  art: "Arte",
  science: "Ciência",
  geography: "Geografia",
  history: "História",
};

export const AdvancedStatsModal = ({
  open,
  onOpenChange,
}: AdvancedStatsModalProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryPerformance[]>([]);
  const [ranking, setRanking] = useState<GlobalRanking | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdvancedStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch recent sessions
      const { data: sessionsData } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(10);

      // Fetch category performance
      const { data: categoryData } = await supabase
        .from("category_performance")
        .select("*")
        .eq("user_id", user.id);

      // Fetch global ranking
      const { data: rankingData } = await supabase
        .from("global_rankings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setSessions(sessionsData || []);
      setCategoryStats(categoryData || []);
      setRanking(rankingData);
    } catch (error) {
      console.error("Error fetching advanced stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      fetchAdvancedStats();
    }
  }, [open, user]);

  const calculateOverallStats = () => {
    if (!sessions.length) return null;

    const totalGames = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + s.final_score, 0);
    const averageScore = Math.round(totalScore / totalGames);
    const bestScore = Math.max(...sessions.map((s) => s.final_score));
    const totalCorrect = sessions.reduce(
      (sum, s) => sum + s.correct_answers,
      0
    );
    const totalQuestions = sessions.reduce(
      (sum, s) => sum + s.questions_answered,
      0
    );
    const accuracy =
      totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;
    const bestStreak = Math.max(...sessions.map((s) => s.max_streak));
    const averageTime =
      sessions.reduce((sum, s) => sum + s.time_spent, 0) / totalGames;

    return {
      totalGames,
      averageScore,
      bestScore,
      accuracy,
      bestStreak,
      averageTime: Math.round(averageTime),
    };
  };

  const overallStats = calculateOverallStats();

  if (loading) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        maxWidth="4xl"
        maxHeight="screen"
      >
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="4xl"
      maxHeight="screen"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl text-white">
          <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
          Estatísticas Avançadas
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 gap-1 bg-white/5 backdrop-blur-sm border-white/20">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Por Categoria</span>
              <span className="sm:hidden">Categoria</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              Histórico
            </TabsTrigger>
            <TabsTrigger
              value="rankings"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              Rankings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card className="transition-transform duration-200 hover:scale-[1.02] backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-1 text-white">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    Precisão
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {overallStats?.accuracy || 0}%
                  </div>
                  <Progress
                    value={overallStats?.accuracy || 0}
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.02] backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-1 text-white">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    Melhor Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {overallStats?.bestStreak || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.02] backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-1 text-white">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    Tempo Médio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {overallStats?.averageTime || 0}s
                  </div>
                </CardContent>
              </Card>

              <Card className="transition-transform duration-200 hover:scale-[1.02] backdrop-blur-sm bg-white/5 border-white/20">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm flex items-center gap-1 text-white">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    Pontuação Média
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-white">
                    {overallStats?.averageScore || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance por modo de jogo */}
            <Card className="backdrop-blur-sm bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="text-lg text-white">
                  Performance por Modo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["normal", "speed", "multiplayer"].map((mode) => {
                    const modeSessions = sessions.filter(
                      (s) => s.game_mode === mode
                    );
                    const modeAccuracy =
                      modeSessions.length > 0
                        ? Math.round(
                            (modeSessions.reduce(
                              (sum, s) => sum + s.correct_answers,
                              0
                            ) /
                              modeSessions.reduce(
                                (sum, s) => sum + s.questions_answered,
                                0
                              )) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={mode}
                        className="p-4 rounded-lg border backdrop-blur-sm bg-white/5 border-white/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize text-white">
                            {mode === "multiplayer"
                              ? "Multiplayer"
                              : mode === "speed"
                              ? "Velocidade"
                              : "Normal"}
                          </span>
                          <Badge
                            variant="secondary"
                            className="bg-white/20 text-white border-white/20"
                          >
                            {modeSessions.length} jogos
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-white/80">
                            <span>Precisão:</span>
                            <span>{modeAccuracy}%</span>
                          </div>
                          <Progress value={modeAccuracy} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryStats.map((category) => (
                <Card
                  key={category.category}
                  className="backdrop-blur-sm bg-white/5 border-white/20"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between text-white">
                      <span>
                        {
                          categoryNames[
                            category.category as keyof typeof categoryNames
                          ]
                        }
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-white/20 text-white/80 border-white/20"
                      >
                        {category.questions_answered} perguntas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-white/80">
                          <span>Precisão</span>
                          <span>
                            {Math.min(
                              category.accuracy_percentage,
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <Progress
                          value={Math.min(category.accuracy_percentage, 100)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-white/5 rounded backdrop-blur-sm">
                          <div className="font-bold text-green-300">
                            {category.correct_answers}
                          </div>
                          <div className="text-xs text-white/80">Acertos</div>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded backdrop-blur-sm">
                          <div className="font-bold text-yellow-300">
                            {category.best_streak}
                          </div>
                          <div className="text-xs text-white/80">
                            Melhor Streak
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className="backdrop-blur-sm bg-white/5 border-white/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            session.game_mode === "speed"
                              ? "bg-orange-500/20"
                              : session.game_mode === "multiplayer"
                              ? "bg-purple-500/20"
                              : "bg-blue-500/20"
                          }`}
                        >
                          {session.game_mode === "speed" ? (
                            <Zap className="h-4 w-4 text-orange-400" />
                          ) : session.game_mode === "multiplayer" ? (
                            <Trophy className="h-4 w-4 text-purple-400" />
                          ) : (
                            <Brain className="h-4 w-4 text-blue-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white">
                              {session.final_score} pontos
                            </span>
                            <Badge
                              variant={
                                session.game_result === "win"
                                  ? "default"
                                  : session.game_result === "loss"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="bg-white/20 text-white border-white/20"
                            >
                              {session.game_result === "win"
                                ? "Vitória"
                                : session.game_result === "loss"
                                ? "Derrota"
                                : session.game_result === "draw"
                                ? "Empate"
                                : "Completo"}
                            </Badge>
                          </div>

                          <div className="text-sm text-white/80">
                            {Math.min(
                              session.correct_answers,
                              session.questions_answered
                            )}
                            /{session.questions_answered} corretas •{" "}
                            {Math.min(
                              session.accuracy_percentage || 0,
                              100
                            ).toFixed(1)}
                            % precisão • {session.max_streak} streak •{" "}
                            {Math.round(
                              session.time_spent / session.questions_answered
                            )}
                            s/pergunta
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-white/80">
                        {new Date(session.completed_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rankings" className="space-y-6">
            {ranking && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2 text-white">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Ranking Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      #{ranking.global_rank}
                    </div>
                    <div className="text-sm text-white/80">
                      {ranking.total_score} pontos totais
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2 text-white">
                      <Target className="h-5 w-5 text-green-500" />
                      Taxa de Vitória
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      #{ranking.win_rate_rank}
                    </div>
                    <div className="text-sm text-white/80">
                      {Math.min(ranking.win_percentage, 100).toFixed(1)}%
                      vitórias
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-sm bg-white/5 border-white/20">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2 text-white">
                      <Zap className="h-5 w-5 text-orange-500" />
                      Melhor Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-1">
                      #{ranking.streak_rank}
                    </div>
                    <div className="text-sm text-white/80">
                      {ranking.best_streak} sequência máxima
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card className="backdrop-blur-sm bg-white/5 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5" />
                  Progresso Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-white/80 py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de progresso em desenvolvimento</p>
                  <p className="text-sm">
                    Acompanhe sua evolução ao longo do tempo
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDialog>
  );
};
