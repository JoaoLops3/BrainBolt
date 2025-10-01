import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomStatistics as ClassroomStats } from "@/types/classroom";
import { useClassrooms } from "@/hooks/useClassrooms";
import {
  Users,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Não foi possível carregar as estatísticas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: "Total de Alunos",
      value: stats.total_students,
      subValue: `${stats.active_students} ativos`,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: Gamepad2,
      label: "Jogos Realizados",
      value: stats.total_games_played,
      subValue: "Total de partidas",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: Trophy,
      label: "Pontuação Média",
      value: Math.round(stats.average_score),
      subValue: "pontos por partida",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      icon: Target,
      label: "Precisão Média",
      value: `${stats.average_accuracy.toFixed(1)}%`,
      subValue: "taxa de acertos",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Estatísticas da Sala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground truncate">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Destaques da Sala
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.top_scorer_name && (
                <Card className="border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-yellow-500">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          🏆 Maior Pontuador
                        </p>
                        <p className="font-bold text-lg truncate">
                          {stats.top_scorer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stats.top_score?.toLocaleString()} pontos
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {stats.most_active_student_name && (
                <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-purple-500">
                        <Gamepad2 className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          🎮 Mais Ativo
                        </p>
                        <p className="font-bold text-lg truncate">
                          {stats.most_active_student_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
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

