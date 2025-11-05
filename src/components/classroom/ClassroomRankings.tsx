import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassroomRanking } from "@/types/classroom";
import { useClassrooms } from "@/hooks/useClassrooms";
import { Trophy, Medal, Award, Target, Flame, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClassroomRankingsProps {
  classroomId: string;
}

export const ClassroomRankings = ({ classroomId }: ClassroomRankingsProps) => {
  const { getClassroomRankings } = useClassrooms();
  const [rankings, setRankings] = useState<ClassroomRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      const data = await getClassroomRankings(classroomId);
      setRankings(data);
      setLoading(false);
    };

    fetchRankings();
  }, [classroomId, getClassroomRankings]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return (
          <div className="h-6 w-6 flex items-center justify-center font-bold text-muted-foreground">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case 2:
        return "bg-gray-400 text-white hover:bg-gray-500";
      case 3:
        return "bg-amber-700 text-white hover:bg-amber-800";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            Rankings da Sala
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5" />
            Rankings da Sala
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/80">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum jogo registrado ainda.</p>
            <p className="text-sm">
              Os rankings aparecerão quando os alunos começarem a jogar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-white/5 border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5" />
          Rankings da Sala
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-3">
            {rankings.map((student) => (
              <Card
                key={student.student_id}
                className={`backdrop-blur-sm bg-white/5 border-white/20 ${
                  student.rank <= 3 ? "border-2" : ""
                } ${
                  student.rank === 1
                    ? "border-yellow-500/50 bg-yellow-500/20"
                    : student.rank === 2
                    ? "border-gray-400/50 bg-gray-500/20"
                    : student.rank === 3
                    ? "border-amber-700/50 bg-amber-500/20"
                    : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank Icon */}
                    <div className="flex-shrink-0">
                      {getRankIcon(student.rank)}
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate text-white">
                          {student.student_name || "Sem nome"}
                        </h4>
                        {student.rank <= 3 && (
                          <Badge
                            className={`${getRankBadgeColor(
                              student.rank
                            )} border-white/20`}
                          >
                            {student.rank === 1
                              ? "🥇 Campeão"
                              : student.rank === 2
                              ? "🥈 Vice"
                              : "🥉 3º Lugar"}
                          </Badge>
                        )}
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3 text-yellow-300" />
                          <span className="font-bold text-white">
                            {student.total_score.toLocaleString()}
                          </span>
                          <span className="text-white/80">pts</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-green-300" />
                          <span className="font-bold text-white">
                            {Math.min(student.accuracy_percentage, 100).toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-300" />
                          <span className="font-bold text-white">
                            {student.best_streak}
                          </span>
                          <span className="text-white/80">streak</span>
                        </div>

                        <div className="flex items-center gap-1 text-white/80">
                          <span>{student.games_played}</span>
                          <span>
                            jogo{student.games_played !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
