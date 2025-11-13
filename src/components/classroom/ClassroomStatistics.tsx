import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomStatistics as ClassroomStats } from "@/types/classroom";
import { useClassrooms } from "@/hooks/useClassrooms";
import {
  Trophy,
  Target,
  Gamepad2,
  TrendingUp,
  Crown,
  Loader2,
} from "lucide-react";

interface ClassroomStatisticsProps {
  classroomId: string;
}

export const ClassroomStatistics = ({
  classroomId,
}: ClassroomStatisticsProps) => {
  const { getClassroomStatistics } = useClassrooms();
  const [stats, setStats] = useState<ClassroomStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getClassroomStatistics(classroomId);
      setStats(data);
      setLoading(false);
    };

    fetchStats();
  }, [classroomId, getClassroomStatistics]);

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-white/80 py-8">
            Não foi possível carregar as estatísticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      icon: Gamepad2,
      label: "Jogos Realizados",
      value: stats.total_games_played,
      subValue: "Total de partidas",
      color: "text-purple-300",
      bgColor: "bg-purple-500/20",
    },
    {
      icon: Trophy,
      label: "Pontuação Média",
      value: Math.round(stats.average_score),
      subValue: "pontos por partida",
      color: "text-yellow-300",
      bgColor: "bg-yellow-500/20",
    },
    {
      icon: Target,
      label: "Precisão Média",
      value: `${stats.average_accuracy.toFixed(1)}%`,
      subValue: "taxa de acertos",
      color: "text-green-300",
      bgColor: "bg-green-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="border-2 backdrop-blur-sm bg-white/5 border-white/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-white/80 truncate">
                        {stat.subValue}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {(stats.top_scorer_name || stats.most_active_student_name) && (
        <Card className="backdrop-blur-sm bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-yellow-300" />
              Destaques da Sala
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.top_scorer_name && (
                <Card className="border-2 border-yellow-500/50 bg-yellow-500/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-yellow-500/30 backdrop-blur-sm">
                        <Trophy className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 mb-1">
                          🏆 Maior Pontuador
                        </p>
                        <p className="font-bold text-lg truncate text-white">
                          {stats.top_scorer_name}
                        </p>
                        <p className="text-sm text-white/80">
                          {stats.top_score?.toLocaleString()} pontos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.most_active_student_name && (
                <Card className="border-2 border-purple-500/50 bg-purple-500/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-purple-500/30 backdrop-blur-sm">
                        <Gamepad2 className="h-6 w-6 text-purple-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/80 mb-1">
                          🎮 Mais Ativo
                        </p>
                        <p className="font-bold text-lg truncate text-white">
                          {stats.most_active_student_name}
                        </p>
                        <p className="text-sm text-white/80">
                          Maior participação
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
