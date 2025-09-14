import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { GameMode } from "@/types/game";
import {
  Zap,
  Brain,
  Settings,
  Trophy,
  Clock,
  Star,
  LogOut,
  User,
  Users,
  UserPlus,
  BarChart3,
} from "lucide-react";

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void;
  onStartMultiplayer: () => void;
  onOpenSettings: () => void;
  onViewStats: () => void;
  onViewAdvancedStats: () => void;
  onOpenFriends: () => void;
  onViewAchievements: () => void;
  onViewCharacters: () => void;
}

export const MainMenu = ({
  onSelectMode,
  onStartMultiplayer,
  onOpenSettings,
  onViewStats,
  onViewAdvancedStats,
  onOpenFriends,
  onViewAchievements,
  onViewCharacters,
}: MainMenuProps) => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-4 no-scroll w-full">
      <div className="w-full max-w-md space-y-6 mx-auto">
        {/* Header with user info */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2 animate-bounce">
            Perguntados
          </h1>
          <p className="text-white/80 mb-6">Teste seus conhecimentos!</p>

          {profile && (
            <Card className="bg-white/20 border-white/30 backdrop-blur-lg mb-6 shadow-xl w-full">
              <CardContent className="p-4 w-full">
                <div className="flex items-center space-x-4 w-full">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary text-white">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">
                      {profile.display_name || "Jogador"}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-white/70">
                      <span className="flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        {profile.total_score}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {profile.best_streak}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-white hover:bg-white/10"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Game Mode Selection */}
        <div className="space-y-4 w-full">
          <Card
            className="bg-white/20 border-white/30 backdrop-blur-lg hover:bg-white/30 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl w-full"
            onClick={() => onSelectMode("normal")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Modo Normal
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Responda no seu próprio ritmo
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 border-blue-400/30"
                >
                  Clássico
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="bg-white/20 border-white/30 backdrop-blur-lg hover:bg-white/30 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl w-full"
            onClick={() => onSelectMode("speed")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Modo Veloz
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      <Clock className="inline h-3 w-3 mr-1" />
                      15 segundos por pergunta
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-orange-300 border-orange-400/30"
                >
                  Desafio
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card
            className="bg-white/20 border-white/30 backdrop-blur-lg hover:bg-white/30 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-2xl w-full"
            onClick={onStartMultiplayer}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-lg">
                      Modo Multiplayer
                    </CardTitle>
                    <CardDescription className="text-white/60">
                      Jogue com um amigo online
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 border-purple-400/30"
                >
                  Novo
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 w-full">
          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onViewStats}
          >
            <Trophy className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onViewAdvancedStats}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onViewAchievements}
          >
            <Trophy className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onViewCharacters}
          >
            <Users className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onOpenFriends}
          >
            <UserPlus className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-200 shadow-lg w-full"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
