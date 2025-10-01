import React from "react";
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
  Award,
  School,
  GraduationCap,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { useStats } from "@/contexts/StatsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ImprovedMainMenuProps {
  onSelectMode: (mode: "normal" | "speed") => void;
  onStartMultiplayer: () => void;
  onOpenSettings: () => void;
  onViewStats: () => void;
  onViewAdvancedStats: () => void;
  onOpenFriends: () => void;
  onViewAchievements: () => void;
  onViewCharacters: () => void;
  onViewTeacherClassrooms: () => void;
  onViewStudentClassrooms: () => void;
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
  onViewTeacherClassrooms,
  onViewStudentClassrooms,
}: ImprovedMainMenuProps) => {
  const { stats, loading } = useStats();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate("/auth", { replace: true });
    }
  };

  // Estatísticas rápidas removidas

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
                <Avatar
                  className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white shadow-lg cursor-pointer hover:border-purple-300 transition-all duration-200 hover:scale-105"
                  onClick={onOpenSettings}
                >
                  <AvatarImage
                    src={profile?.avatar_url || "/placeholder.svg"}
                    alt={profile?.display_name || "Avatar do usuário"}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </AvatarFallback>
                </Avatar>
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
                  {profile?.display_name ||
                    user?.user_metadata?.display_name ||
                    "Jogador"}
                </CardTitle>
                <p className="text-white/80 text-xs sm:text-sm">
                  Nível {stats ? Math.floor(stats.totalScore / 1000) + 1 : 1}
                </p>
              </div>
              {/** Botão de estatísticas rápidas removido **/}
            </div>
          </CardHeader>
        </Card>

        {/** Estatísticas rápidas removidas **/}

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
            stats?.pendingInvites && stats.pendingInvites > 0
              ? `${stats.pendingInvites}`
              : undefined
          }
          badgeVariant={stats?.pendingInvites ? "destructive" : "default"}
          onClick={onStartMultiplayer}
          className="w-full h-auto py-6 animate-in fade-in-0 slide-in-from-bottom-2"
          animation="scaleIn"
        />

        {/* Salas Educacionais */}
        <Card className="backdrop-blur-lg bg-white/20 border-white/30 shadow-2xl animate-in fade-in-0 slide-in-from-bottom-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <School className="h-5 w-5" />
              Salas Educacionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <StatButton
                icon={<GraduationCap className="h-5 w-5" />}
                label="Sou Professor"
                onClick={onViewTeacherClassrooms}
                className="h-auto py-5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30"
                showStat={false}
                animation="scaleIn"
              />
              <StatButton
                icon={<School className="h-5 w-5" />}
                label="Sou Aluno"
                onClick={onViewStudentClassrooms}
                className="h-auto py-5 bg-gradient-to-r from-blue-500/20 to-green-500/20 hover:from-blue-500/30 hover:to-green-500/30"
                showStat={false}
                animation="scaleIn"
              />
            </div>
          </CardContent>
        </Card>

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
              stats?.pendingFriendRequests && stats.pendingFriendRequests > 0
                ? `${stats.pendingFriendRequests}`
                : undefined
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

        {/* Configurações e Sair */}
        <div className="flex justify-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="group relative overflow-hidden transition-all glass-button text-white hover:bg-white/30 shadow-lg hover:shadow-xl hover:shadow-primary/20 border border-white/20 hover:border-white/40 rounded-full"
          >
            <div className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
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
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="group relative overflow-hidden transition-all glass-button text-white hover:bg-white/30 shadow-lg hover:shadow-xl hover:shadow-primary/20 border border-white/20 hover:border-white/40 rounded-full"
          >
            <div className="p-1 rounded-md bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out pointer-events-none" />
          </Button>
        </div>
      </ResponsiveContainer>
    </div>
  );
};
