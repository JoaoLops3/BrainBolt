import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Zap, Brain, Clock, Target, TrendingUp } from "lucide-react";

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GameSession {
  id: string;
  game_mode: string;
  final_score: number;
  questions_answered: number;
  correct_answers: number;
  max_streak: number;
  time_spent: number;
  completed_at: string;
}

export const StatsModal = ({ open, onOpenChange }: StatsModalProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      fetchGameSessions();
    }
  }, [open, user]);

  const fetchGameSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching game sessions:", error);
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error("Error fetching game sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!sessions.length) {
      return {
        totalGames: 0,
        averageScore: 0,
        bestScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        accuracy: 0,
        bestStreak: 0,
      };
    }

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
        ? Math.min(Math.round((totalCorrect / totalQuestions) * 100), 100)
        : 0;
    const bestStreak = Math.max(...sessions.map((s) => s.max_streak));

    return {
      totalGames,
      averageScore,
      bestScore,
      totalCorrect,
      totalQuestions,
      accuracy,
      bestStreak,
    };
  };

  const stats = calculateStats();

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      maxHeight="screen"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          Suas Estatísticas
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Acompanhe seu desempenho e progresso no jogo.
        </p>

        <div className="space-y-6 py-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card className="transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm flex items-center space-x-1">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Jogos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  {stats.totalGames}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm flex items-center space-x-1">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Melhor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  {stats.bestScore}
                </div>
              </CardContent>
            </Card>

            <Card className="transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Precisão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  {stats.accuracy}%
                </div>
              </CardContent>
            </Card>

            <Card className="transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm flex items-center space-x-1">
                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sequência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 p-3 sm:p-4 pt-0">
                <div className="text-lg sm:text-2xl font-bold">
                  {stats.bestStreak}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Jogos Recentes</span>
            </h3>

            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                Carregando estatísticas...
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="p-3 sm:p-4 transition-transform duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            session.game_mode === "speed"
                              ? "bg-orange-500/20"
                              : "bg-blue-500/20"
                          }`}
                        >
                          {session.game_mode === "speed" ? (
                            <Zap className="h-4 w-4 text-orange-400" />
                          ) : (
                            <Brain className="h-4 w-4 text-blue-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-medium text-sm sm:text-base">
                              {session.final_score} pontos
                            </span>
                            <Badge
                              variant={
                                session.game_mode === "speed"
                                  ? "destructive"
                                  : "default"
                              }
                              className="text-xs w-fit"
                            >
                              {session.game_mode === "speed"
                                ? "Veloz"
                                : "Normal"}
                            </Badge>
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {Math.min(
                              session.correct_answers,
                              session.questions_answered
                            )}
                            /{session.questions_answered} corretas
                            {session.max_streak > 0 &&
                              ` • Sequência: ${session.max_streak}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(session.completed_at).toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm sm:text-base">
                  Nenhum jogo jogado ainda. Que tal começar agora?
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
