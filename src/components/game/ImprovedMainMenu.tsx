import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/StatCard";
import { StatButton } from "@/components/ui/StatButton";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer } from "@/components/ui/ResponsiveContainer";
import { AnimatedWrapper } from "@/components/ui/AnimatedWrapper";
import {
  Trophy,
  Users,
  Zap,
  Clock,
  Target,
  Star,
  User,
  Gamepad2,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { useStats } from "@/contexts/StatsContext";
import { useAuth } from "@/contexts/AuthContext";

interface ImprovedMainMenuProps {
  onSelectMode: (mode: "normal" | "speed") => void;
  onStartMultiplayer: () => void;
  onOpenSettings: () => void;
  onViewStats: () => void;
  onViewAdvancedStats: () => void;
  onOpenFriends: () => void;
  onViewAchievements: () => void;
  onViewCharacters: () => void;
}

export const ImprovedMainMenu = ({
  onSelectMode,
  onStartMultiplayer,
  onOpenSettings,
  onViewStats,
  onViewAdvancedStats,
  onOpenFriends,
  onViewAchievements,
  onViewCharacters,
}: ImprovedMainMenuProps) => {
  const { stats, loading } = useStats();
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);

  // Auto-hide stats after 3 seconds
  useEffect(() => {
    if (showStats) {
      const timer = setTimeout(() => setShowStats(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStats]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary overflow-y-auto safe-top safe-bottom">
      <ResponsiveContainer
        maxWidth="4xl"
        padding="md"
        spacing="md"
        className="pt-4 sm:pt-6"
      >
        {/* Header com avatar e nome */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl animate-in fade-in-0 slide-in-from-top-4">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                {stats && (
                  <Badge
                    className="absolute -top-1 -right-1 bg-green-500 hover:bg-green-600 text-xs transition-all duration-200"
                    variant="default"
                  >
                    {stats.bestStreak}
                  </Badge>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-white text-lg sm:text-xl truncate">
                  {user?.user_metadata?.display_name || "Jogador"}
                </CardTitle>
                <p className="text-white/80 text-xs sm:text-sm">
                  Nível {stats ? Math.floor(stats.totalScore / 1000) + 1 : 1}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStats(!showStats)}
                className="text-white hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
              >
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Estatísticas rápidas (aparecem ao clicar no ícone) */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in-0 slide-in-from-top-2">
            <StatCard
              icon={<Trophy className="h-5 w-5 text-yellow-400" />}
              label="Pontuação"
              value={stats?.totalScore || 0}
              subtitle="Total"
              animation="scale"
              delay={0}
            />
            <StatCard
              icon={<Target className="h-5 w-5 text-green-400" />}
              label="Precisão"
              value={`${Math.round(stats?.winPercentage || 0)}%`}
              subtitle="Taxa de acerto"
              animation="scale"
              delay={100}
            />
            <StatCard
              icon={<Gamepad2 className="h-5 w-5 text-blue-400" />}
              label="Jogos"
              value={stats?.gamesPlayed || 0}
              subtitle="Total jogados"
              animation="scale"
              delay={200}
            />
            <StatCard
              icon={<Crown className="h-5 w-5 text-purple-400" />}
              label="Sequência"
              value={stats?.bestStreak || 0}
              subtitle="Melhor streak"
              animation="scale"
              delay={300}
            />
          </div>
        )}

        {/* Modos de jogo */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Gamepad2 className="h-6 w-6" />
              Modos de Jogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatButton
                icon={<Clock className="h-5 w-5" />}
                label="Modo Normal"
                statValue={stats?.normalGamesPlayed || 0}
                statLabel="jogos"
                onClick={() => onSelectMode("normal")}
                className="h-auto py-6"
                animation="scaleIn"
              />
              <StatButton
                icon={<Zap className="h-5 w-5" />}
                label="Modo Veloz"
                statValue={stats?.speedGamesPlayed || 0}
                statLabel="jogos"
                badge={stats?.speedGamesPlayed > 10 ? "Expert" : undefined}
                badgeVariant="secondary"
                onClick={() => onSelectMode("speed")}
                className="h-auto py-6"
                animation="scaleIn"
              />
            </div>
          </CardContent>
        </Card>

        {/* Multiplayer */}
        <StatButton
          icon={<Users className="h-5 w-5" />}
          label="Multiplayer"
          statValue={stats?.multiplayerWins || 0}
          statLabel="vitórias"
          badge={
            stats?.pendingInvites
              ? `${stats.pendingInvites} convites`
              : undefined
          }
          badgeVariant={stats?.pendingInvites ? "destructive" : "default"}
          onClick={onStartMultiplayer}
          className="w-full h-auto py-6 animate-in fade-in-0 slide-in-from-bottom-2"
          animation="scaleIn"
        />

        {/* Menu secundário */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatButton
            icon={<Trophy className="h-4 w-4" />}
            label="Conquistas"
            statValue={`${stats?.achievementsUnlocked || 0}/${
              stats?.totalAchievements || 0
            }`}
            onClick={onViewAchievements}
            className="h-auto py-4"
            animation="fadeIn"
          />
          <StatButton
            icon={<Sparkles className="h-4 w-4" />}
            label="Personagens"
            statValue={`${stats?.charactersUnlocked || 0}/${
              stats?.totalCharacters || 0
            }`}
            onClick={onViewCharacters}
            className="h-auto py-4"
            animation="fadeIn"
          />
          <StatButton
            icon={<User className="h-4 w-4" />}
            label="Amigos"
            statValue={stats?.friendsCount || 0}
            badge={
              stats?.pendingInvites ? `${stats.pendingInvites}` : undefined
            }
            badgeVariant="destructive"
            onClick={onOpenFriends}
            className="h-auto py-4"
            animation="fadeIn"
          />
          <StatButton
            icon={<Award className="h-4 w-4" />}
            label="Estatísticas"
            onClick={onViewStats}
            className="h-auto py-4"
            showStat={false}
            animation="fadeIn"
          />
        </div>

        {/* Configurações */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Button>
        </div>
      </ResponsiveContainer>
    </div>
  );
};
