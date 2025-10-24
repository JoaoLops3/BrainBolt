import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBadgeClassesFromLabel } from "@/lib/badge-colors";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Star,
  Crown,
  Target,
  Zap,
  Award,
  Brain,
  Map,
  Palette,
  Scroll,
  Flame,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  badge_color: string;
  is_hidden: boolean;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  unlocked_at: string;
  achievement: Achievement;
}

interface AchievementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getIconComponent = (iconName: string) => {
  const iconMap = {
    trophy: Trophy,
    zap: Zap,
    target: Target,
    brain: Brain,
    map: Map,
    palette: Palette,
    scroll: Scroll,
    star: Star,
    flame: Flame,
    crown: Crown,
    award: Award,
  };
  return iconMap[iconName as keyof typeof iconMap] || Trophy;
};

const getBadgeVariant = (
  color: string
): "default" | "destructive" | "outline" | "secondary" => {
  const colorMap: Record<
    string,
    "default" | "destructive" | "outline" | "secondary"
  > = {
    gold: "default",
    silver: "secondary",
    bronze: "outline",
    blue: "default",
    green: "default",
    red: "destructive",
    purple: "default",
    orange: "default",
    amber: "default",
    pink: "default",
  };
  return colorMap[color] || "default";
};

export const AchievementsModal = ({
  open,
  onOpenChange,
}: AchievementsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>(
    []
  );
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAchievements = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at");

      if (achievementsError) throw achievementsError;

      setAllAchievements(achievements || []);

      // Fetch user achievements
      const { data: userAchievementsData, error: userAchievementsError } =
        await supabase
          .from("user_achievements")
          .select(
            `
          *,
          achievement:achievements(*)
        `
          )
          .eq("user_id", user.id);

      if (userAchievementsError) throw userAchievementsError;

      setUserAchievements(userAchievementsData || []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conquistas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAchievements();
    }
  }, [open, user]);

  const unlockedAchievements = userAchievements.filter((ua) => ua.is_completed);
  const inProgressAchievements = userAchievements.filter(
    (ua) => !ua.is_completed && ua.progress > 0
  );
  const lockedAchievements = allAchievements.filter(
    (a) =>
      !userAchievements.some((ua) => ua.achievement_id === a.id) && !a.is_hidden
  );

  const completionRate =
    allAchievements.length > 0
      ? Math.round((unlockedAchievements.length / allAchievements.length) * 100)
      : 0;

  const renderAchievementCard = (
    achievement: Achievement,
    userAchievement?: UserAchievement,
    isLocked = false
  ) => {
    const IconComponent = getIconComponent(achievement.icon);
    const progress = userAchievement?.progress || 0;
    const progressPercentage = (progress / achievement.requirement_value) * 100;

    return (
      <Card
        key={achievement.id}
        className={`transition-all hover:scale-105 backdrop-blur-sm bg-white/5 border-white/20 ${
          isLocked ? "opacity-60" : ""
        }`}
      >
        <CardHeader className="pb-2 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  isLocked ? "bg-white/5" : "bg-white/20"
                }`}
              >
                {isLocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <IconComponent
                    className={`h-4 w-4 text-${achievement.badge_color}-600`}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-semibold text-white">
                  {achievement.name}
                </CardTitle>
                {userAchievement?.unlocked_at && (
                  <p className="text-xs text-white/70">
                    Desbloqueado em{" "}
                    {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <Badge
              className={`text-xs ${getBadgeClassesFromLabel(
                achievement.badge_color
              )}`}
            >
              {achievement.badge_color}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <p className="text-sm text-white/80 mb-3">
            {achievement.description}
          </p>

          {userAchievement && !userAchievement.is_completed && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/80">
                <span>Progresso</span>
                <span>
                  {progress}/{achievement.requirement_value}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}

          {userAchievement?.is_completed && (
            <div className="flex items-center gap-1 text-green-300">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-medium">Concluída!</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="4xl"
      maxHeight="screen"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl text-white">
          <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
          Conquistas
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-white/80">
          <span className="whitespace-nowrap">
            {unlockedAchievements.length}/{allAchievements.length} desbloqueadas
          </span>
          <div className="flex items-center gap-2">
            <Progress value={completionRate} className="w-16 sm:w-20 h-2" />
            <span className="text-xs sm:text-sm">{completionRate}%</span>
          </div>
        </div>

        <Tabs defaultValue="unlocked" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1 bg-white/5 backdrop-blur-sm border-white/20">
            <TabsTrigger
              value="unlocked"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Desbloqueadas</span>
              <span className="sm:hidden">Desbl.</span>
              <span className="ml-1">({unlockedAchievements.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Em Progresso</span>
              <span className="sm:hidden">Progresso</span>
              <span className="ml-1">({inProgressAchievements.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="locked"
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <span className="hidden sm:inline">Bloqueadas</span>
              <span className="sm:hidden">Bloq.</span>
              <span className="ml-1">({lockedAchievements.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unlocked" className="mt-4">
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8 text-white/80">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  Nenhuma conquista desbloqueada ainda
                </p>
                <p className="text-xs sm:text-sm">
                  Continue jogando para desbloquear conquistas!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {unlockedAchievements.map((ua) =>
                  renderAchievementCard(ua.achievement, ua)
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            {inProgressAchievements.length === 0 ? (
              <div className="text-center py-8 text-white/80">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  Nenhuma conquista em progresso
                </p>
                <p className="text-xs sm:text-sm">
                  Continue jogando para começar a desbloquear conquistas!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {inProgressAchievements.map((ua) =>
                  renderAchievementCard(ua.achievement, ua)
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="locked" className="mt-4">
            {lockedAchievements.length === 0 ? (
              <div className="text-center py-8 text-white/80">
                <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base">
                  Todas as conquistas foram desbloqueadas!
                </p>
                <p className="text-xs sm:text-sm">
                  Você é um verdadeiro mestre!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {lockedAchievements.map((achievement) =>
                  renderAchievementCard(achievement, undefined, true)
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDialog>
  );
};
