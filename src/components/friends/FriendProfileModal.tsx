import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Zap,
  Clock,
  Users,
  Star,
  TrendingUp,
  User,
  Award,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string;
  total_score: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  multiplayer_wins: number;
  multiplayer_losses: number;
  speed_games_played: number;
  normal_games_played: number;
  win_percentage: number;
  average_score: number;
  best_streak: number;
}

interface FriendProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
}

export const FriendProfileModal = ({
  open,
  onOpenChange,
  profile,
}: FriendProfileModalProps) => {
  if (!profile) return null;

  const getRankByWinRate = (winRate: number) => {
    if (winRate >= 90)
      return { rank: "Lendário", color: "bg-yellow-500", icon: "👑" };
    if (winRate >= 80)
      return { rank: "Mestre", color: "bg-purple-500", icon: "💎" };
    if (winRate >= 70)
      return { rank: "Diamante", color: "bg-blue-500", icon: "💠" };
    if (winRate >= 60)
      return { rank: "Ouro", color: "bg-yellow-600", icon: "🏆" };
    if (winRate >= 50)
      return { rank: "Prata", color: "bg-gray-400", icon: "🥈" };
    return { rank: "Bronze", color: "bg-orange-600", icon: "🥉" };
  };

  const rank = getRankByWinRate(profile.win_percentage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] allow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Jogador
          </DialogTitle>
          <DialogDescription>
            Visualize estatísticas detalhadas e conquistas do jogador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with avatar and basic info */}
          <div className="text-center space-y-4">
            <Avatar className="h-20 w-20 mx-auto">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-2xl font-bold">
                {profile.display_name || "Jogador"}
              </h2>
              <Badge className={`${rank.color} text-white mt-2`}>
                {rank.icon} {rank.rank}
              </Badge>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="flex flex-col items-center">
                  <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {Math.min(profile.win_percentage, 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Taxa de Vitória
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-4">
                <div className="flex flex-col items-center">
                  <Target className="h-6 w-6 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-primary">
                    {profile.games_played}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Jogos Totais
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Estatísticas Detalhadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vitórias</span>
                  <span className="text-sm text-green-600 font-bold">
                    {profile.games_won}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Derrotas</span>
                  <span className="text-sm text-red-600 font-bold">
                    {profile.games_lost}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Melhor Sequência
                  </span>
                  <span className="text-sm font-bold">
                    {profile.best_streak}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Pontuação Média
                  </span>
                  <span className="text-sm font-bold">
                    {profile.average_score.toFixed(0)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">
                  Progresso de Vitórias
                </h4>
                <Progress value={profile.win_percentage} className="mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Mode Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5" />
                Por Modo de Jogo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-5 w-5 text-blue-500 mb-1" />
                    <div className="text-lg font-bold">
                      {profile.normal_games_played}
                    </div>
                    <div className="text-xs text-muted-foreground">Normal</div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col items-center">
                    <Zap className="h-5 w-5 text-orange-500 mb-1" />
                    <div className="text-lg font-bold">
                      {profile.speed_games_played}
                    </div>
                    <div className="text-xs text-muted-foreground">Veloz</div>
                  </div>
                </div>

                <div>
                  <div className="flex flex-col items-center">
                    <Users className="h-5 w-5 text-purple-500 mb-1" />
                    <div className="text-lg font-bold">
                      {profile.multiplayer_wins + profile.multiplayer_losses}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Multiplayer
                    </div>
                  </div>
                </div>
              </div>

              {profile.multiplayer_wins + profile.multiplayer_losses > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Multiplayer</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">
                      {profile.multiplayer_wins} vitórias
                    </span>
                    <span className="text-red-600">
                      {profile.multiplayer_losses} derrotas
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
