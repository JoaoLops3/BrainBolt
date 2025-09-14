import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Zap,
  Clock,
  Medal,
  Users,
  TrendingUp,
  Crown,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FriendComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendId: string | null;
}

interface ProfileStats {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string;
  games_played: number;
  total_score: number;
  games_won: number;
  games_lost: number;
  multiplayer_wins: number;
  multiplayer_losses: number;
  win_percentage: number;
  average_score: number;
  best_streak: number;
  global_rank?: number;
  win_rate_rank?: number;
  streak_rank?: number;
}

interface CategoryStats {
  category: string;
  accuracy_percentage: number;
  questions_answered: number;
  correct_answers: number;
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

export const FriendComparisonModal = ({
  open,
  onOpenChange,
  friendId,
}: FriendComparisonModalProps) => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<ProfileStats | null>(null);
  const [friendStats, setFriendStats] = useState<ProfileStats | null>(null);
  const [userCategories, setUserCategories] = useState<CategoryStats[]>([]);
  const [friendCategories, setFriendCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComparisonData = async () => {
    if (!user || !friendId) return;

    setLoading(true);
    try {
      // Fetch user profile with ranking
      const { data: userData } = await supabase
        .from("global_rankings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      // Fetch friend profile with ranking
      const { data: friendData } = await supabase
        .from("global_rankings")
        .select("*")
        .eq("user_id", friendId)
        .single();

      // Fetch user category performance
      const { data: userCategoryData } = await supabase
        .from("category_performance")
        .select("*")
        .eq("user_id", user.id);

      // Fetch friend category performance
      const { data: friendCategoryData } = await supabase
        .from("category_performance")
        .select("*")
        .eq("user_id", friendId);

      setUserStats(userData);
      setFriendStats(friendData);
      setUserCategories(userCategoryData || []);
      setFriendCategories(friendCategoryData || []);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && friendId) {
      fetchComparisonData();
    }
  }, [open, friendId, user]);

  const getComparisonResult = (userValue: number, friendValue: number) => {
    if (userValue > friendValue) return "better";
    if (userValue < friendValue) return "worse";
    return "equal";
  };

  const getComparisonIcon = (result: string) => {
    switch (result) {
      case "better":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "worse":
        return <TrendingUp className="h-4 w-4 text-red-500 transform rotate-180" />;
      default:
        return <Medal className="h-4 w-4 text-yellow-500" />;
    }
  };

  const StatComparison = ({
    label,
    userValue,
    friendValue,
    format = "number",
    icon: Icon,
  }: {
    label: string;
    userValue: number;
    friendValue: number;
    format?: "number" | "percentage" | "rank";
    icon: React.ElementType;
  }) => {
    const result = getComparisonResult(userValue, friendValue);
    const formatValue = (value: number) => {
      switch (format) {
        case "percentage":
          return `${value.toFixed(1)}%`;
        case "rank":
          return `#${value}`;
        default:
          return value.toString();
      }
    };

    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </div>
            {getComparisonIcon(result)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Você</span>
              <span className="font-bold">{formatValue(userValue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Amigo</span>
              <span className="font-bold">{formatValue(friendValue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading || !userStats || !friendStats) {
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
            <Users className="h-5 w-5" />
            Comparação de Estatísticas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player headers */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userStats.avatar_url} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">
                      {userStats.display_name || "Você"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ranking Global: #{userStats.global_rank || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={friendStats.avatar_url} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">
                      {friendStats.display_name || "Amigo"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ranking Global: #{friendStats.global_rank || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall comparison */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatComparison
              label="Pontuação Total"
              userValue={userStats.total_score}
              friendValue={friendStats.total_score}
              icon={Trophy}
            />

            <StatComparison
              label="Taxa de Vitória"
              userValue={userStats.win_percentage}
              friendValue={friendStats.win_percentage}
              format="percentage"
              icon={Target}
            />

            <StatComparison
              label="Melhor Streak"
              userValue={userStats.best_streak}
              friendValue={friendStats.best_streak}
              icon={Zap}
            />

            <StatComparison
              label="Jogos Jogados"
              userValue={userStats.games_played}
              friendValue={friendStats.games_played}
              icon={Clock}
            />
          </div>

          {/* Ranking comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Comparação de Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatComparison
                  label="Ranking Geral"
                  userValue={userStats.global_rank || 999}
                  friendValue={friendStats.global_rank || 999}
                  format="rank"
                  icon={Trophy}
                />

                <StatComparison
                  label="Ranking Vitórias"
                  userValue={userStats.win_rate_rank || 999}
                  friendValue={friendStats.win_rate_rank || 999}
                  format="rank"
                  icon={Target}
                />

                <StatComparison
                  label="Ranking Streak"
                  userValue={userStats.streak_rank || 999}
                  friendValue={friendStats.streak_rank || 999}
                  format="rank"
                  icon={Zap}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(categoryNames).map(([categoryKey, categoryName]) => {
                  const userCategory = userCategories.find(c => c.category === categoryKey);
                  const friendCategory = friendCategories.find(c => c.category === categoryKey);

                  if (!userCategory && !friendCategory) return null;

                  const userAccuracy = userCategory?.accuracy_percentage || 0;
                  const friendAccuracy = friendCategory?.accuracy_percentage || 0;

                  return (
                    <div key={categoryKey} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{categoryName}</h4>
                        <Badge variant="outline">
                          {(userCategory?.questions_answered || 0) + (friendCategory?.questions_answered || 0)} perguntas total
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Você</span>
                            <span>{userAccuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={userAccuracy} />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Amigo</span>
                            <span>{friendAccuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={friendAccuracy} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Multiplayer head-to-head */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5" />
                Duelos Multiplayer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {userStats.multiplayer_wins}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Suas vitórias
                  </div>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {friendStats.multiplayer_wins}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Vitórias do amigo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};