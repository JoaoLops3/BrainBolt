import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Play, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StudentGamePanelProps {
  classroomId: string;
  classroomName: string;
  onStartGame: () => void;
}

export const StudentGamePanel = ({
  classroomId,
  classroomName,
  onStartGame,
}: StudentGamePanelProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Buscar estatísticas do aluno nesta sala
  const loadMyStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .rpc("get_classroom_rankings", {
          p_classroom_id: classroomId,
        })
        .eq("student_id", user.id)
        .single();

      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    // Salvar o ID da sala no localStorage para usar depois
    // Os componentes de jogo já salvam automaticamente quando essa key existe
    localStorage.setItem("currentClassroomId", classroomId);
    localStorage.setItem("currentClassroomName", classroomName);
    onStartGame();
  };

  return (
    <div className="space-y-4">
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Gamepad2 className="h-5 w-5" />
            Jogar em {classroomName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
            <h3 className="text-xl font-bold text-white mb-2">
              Pronto para jogar?
            </h3>
            <p className="text-white/80 mb-6">
              Seus pontos serão salvos automaticamente no ranking da sala!
            </p>

            {stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-xs text-white/70 mb-1">Posição</p>
                  <p className="text-2xl font-bold text-white">{stats.rank}º</p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-xs text-white/70 mb-1">Pontos</p>
                  <p className="text-2xl font-bold text-yellow-300">
                    {stats.total_score}
                  </p>
                </div>
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-xs text-white/70 mb-1">Precisão</p>
                  <p className="text-2xl font-bold text-green-300">
                    {stats.accuracy_rate?.toFixed(1)}%
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartGame}
              disabled={loading}
              className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/50"
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Iniciar Jogo
            </Button>

            <Button
              onClick={loadMyStats}
              disabled={loading}
              variant="outline"
              className="w-full mt-3 bg-white/5 hover:bg-white/10 text-white border-white/20"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Ver Minhas Estatísticas
            </Button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-300" />
              Como funciona?
            </h4>
            <ul className="text-white/80 text-sm space-y-2">
              <li>✓ Jogue normalmente como sempre</li>
              <li>✓ Seus pontos são salvos automaticamente</li>
              <li>✓ Apareça no ranking da sala</li>
              <li>✓ Compete com seus colegas!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
