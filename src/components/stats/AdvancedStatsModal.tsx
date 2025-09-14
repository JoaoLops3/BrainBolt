import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        .single();

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
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.questions_answered, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const bestStreak = Math.max(...sessions.map((s) => s.max_streak));
    const averageTime = sessions.reduce((sum, s) => sum + s.time_spent, 0) / totalGames;

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] allow-scroll">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] allow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas Avançadas
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="categories">Por Categoria</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Precisão
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-primary">
                    {overallStats?.accuracy || 0}%
                  </div>
                  <Progress value={overallStats?.accuracy || 0} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Melhor Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-yellow-500">
                    {overallStats?.bestStreak || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Tempo Médio
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-blue-500">
                    {overallStats?.averageTime || 0}s
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    Pontuação Média
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-2xl font-bold text-green-500">
                    {overallStats?.averageScore || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance por modo de jogo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance por Modo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["normal", "speed", "multiplayer"].map((mode) => {
                    const modeSessions = sessions.filter((s) => s.game_mode === mode);
                    const modeAccuracy = modeSessions.length > 0
                      ? Math.round(
                          (modeSessions.reduce((sum, s) => sum + s.correct_answers, 0) /
                            modeSessions.reduce((sum, s) => sum + s.questions_answered, 0)) * 100
                        )
                      : 0;

                    return (
                      <div key={mode} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {mode === "multiplayer" ? "Multiplayer" : 
                             mode === "speed" ? "Velocidade" : "Normal"}
                          </span>
                          <Badge variant="secondary">{modeSessions.length} jogos</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
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
                <Card key={category.category}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{categoryNames[category.category as keyof typeof categoryNames]}</span>
                      <Badge variant="outline">
                        {category.questions_answered} perguntas
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Precisão</span>
                          <span>{category.accuracy_percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={category.accuracy_percentage} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-bold text-green-600">
                            {category.correct_answers}
                          </div>
                          <div className="text-xs text-muted-foreground">Acertos</div>
                        </div>
                        <div className="text-center p-2 bg-muted rounded">
                          <div className="font-bold text-yellow-600">
                            {category.best_streak}
                          </div>
                          <div className="text-xs text-muted-foreground">Melhor Streak</div>
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
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          session.game_mode === "speed" ? "bg-orange-500/20" :
                          session.game_mode === "multiplayer" ? "bg-purple-500/20" :
                          "bg-blue-500/20"
                        }`}>
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
                            <span className="font-bold">{session.final_score} pontos</span>
                            <Badge variant={
                              session.game_result === "win" ? "default" :
                              session.game_result === "loss" ? "destructive" : "secondary"
                            }>
                              {session.game_result === "win" ? "Vitória" :
                               session.game_result === "loss" ? "Derrota" :
                               session.game_result === "draw" ? "Empate" : "Completo"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {session.correct_answers}/{session.questions_answered} corretas
                            • {session.accuracy_percentage?.toFixed(1) || 0}% precisão
                            • {session.max_streak} streak
                            • {Math.round(session.time_spent / session.questions_answered)}s/pergunta
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.completed_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Ranking Geral
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      #{ranking.global_rank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ranking.total_score} pontos totais
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2">
                      <Target className="h-5 w-5 text-green-500" />
                      Taxa de Vitória
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">
                      #{ranking.win_rate_rank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ranking.win_percentage.toFixed(1)}% vitórias
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg flex items-center justify-center gap-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                      Melhor Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-orange-500 mb-1">
                      #{ranking.streak_rank}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ranking.best_streak} sequência máxima
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progresso Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de progresso em desenvolvimento</p>
                  <p className="text-sm">Acompanhe sua evolução ao longo do tempo</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};