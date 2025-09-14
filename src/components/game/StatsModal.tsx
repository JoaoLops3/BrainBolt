import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
        ? Math.round((totalCorrect / totalQuestions) * 100)
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-lg border-border max-w-2xl max-h-[80vh] allow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Suas Estatísticas</span>
          </DialogTitle>
          <DialogDescription>
            Acompanhe seu desempenho e progresso no jogo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Jogos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-2xl font-bold">{stats.totalGames}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>Melhor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-2xl font-bold">{stats.bestScore}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Precisão</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-2xl font-bold">{stats.accuracy}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>Sequência</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-2xl font-bold">{stats.bestStreak}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Games */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Jogos Recentes</span>
            </h3>

            {loading ? (
              <div className="text-center text-muted-foreground py-8">
                Carregando estatísticas...
              </div>
            ) : sessions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sessions.map((session) => (
                  <Card key={session.id} className="p-3">
                    <div className="flex items-center justify-between">
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

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {session.final_score} pontos
                            </span>
                            <Badge
                              variant={
                                session.game_mode === "speed"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {session.game_mode === "speed"
                                ? "Veloz"
                                : "Normal"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {session.correct_answers}/
                            {session.questions_answered} corretas
                            {session.max_streak > 0 &&
                              ` • Sequência: ${session.max_streak}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
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
                Nenhum jogo jogado ainda. Que tal começar agora?
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
