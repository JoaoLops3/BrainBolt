import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNativeNotifications } from "@/hooks/useNativeNotifications";
import {
  User,
  Save,
  Image,
  Bell,
  BellOff,
  Trophy,
  Users,
  Gift,
} from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const avatarOptions = [
  "/placeholder.svg",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=1",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=2",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=3",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=4",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=5",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=6",
];

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const {
    permission,
    settings: notificationSettings,
    isLoading: notificationLoading,
    requestPermission,
    updateSettings: updateNotificationSettings,
    testNotifications,
  } = useNativeNotifications();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.avatar_url || "/placeholder.svg"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar estado com o profile quando ele mudar ou modal abrir
  useEffect(() => {
    if (profile && open) {
      setDisplayName(profile.display_name || "");
      setSelectedAvatar(profile.avatar_url || "/placeholder.svg");
    }
  }, [profile, open]);

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);

    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: selectedAvatar,
      });

      toast({
        title: "✅ Perfil atualizado!",
        description: "Configurações salvas.",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      maxHeight="screen"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl">
          <User className="h-5 w-5 sm:h-6 sm:w-6" />
          Configurações do Perfil
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">
          Personalize seu perfil e avatar no jogo.
        </p>

        <div className="space-y-6 py-4">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-xs sm:text-sm font-medium flex items-center space-x-2">
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Avatar</span>
            </Label>

            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback className="bg-primary text-white">
                  <User className="h-6 w-6 sm:h-8 sm:w-8" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative p-1 rounded-lg transition-all ${
                    selectedAvatar === avatar
                      ? "ring-2 ring-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-xs sm:text-sm">
              Nome de exibição
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={30}
              className="text-sm sm:text-base"
            />
          </div>

          <Separator className="my-4" />

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label className="text-sm font-medium">Notificações</Label>
            </div>

            {permission === "denied" && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Notificações desativadas
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestPermission}
                  disabled={notificationLoading}
                  className="w-full"
                >
                  {notificationLoading
                    ? "Solicitando..."
                    : "Ativar Notificações"}
                </Button>
              </div>
            )}

            {permission === "granted" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Lembretes diários</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-6">
                      7h, 12h e 19h todos os dias
                    </span>
                  </div>
                  <Switch
                    checked={notificationSettings.dailyReminders}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ dailyReminders: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Conquistas</span>
                  </div>
                  <Switch
                    checked={notificationSettings.achievements}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ achievements: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Atividade de amigos</span>
                  </div>
                  <Switch
                    checked={notificationSettings.friendsActivity}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ friendsActivity: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Atualizações do jogo</span>
                  </div>
                  <Switch
                    checked={notificationSettings.gameUpdates}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings({ gameUpdates: checked })
                    }
                  />
                </div>

                {/* Botão de teste */}
                <div className="pt-2 border-t border-muted/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testNotifications}
                    className="w-full text-xs"
                  >
                    🧪 Testar Notificações
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Verá 3 notificações de exemplo (manhã, tarde, noite)
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem("brainbolt-onboarding-completed");
                      localStorage.setItem("brainbolt-first-time", "true");
                      toast({
                        title: "Onboarding resetado",
                        description:
                          "Feche e abra o app para ver o tour novamente",
                      });
                    }}
                    className="w-full text-xs"
                  >
                    🔄 Ver Tour Novamente
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    Resetar e ver a apresentação inicial
                  </p>
                </div>
              </div>
            )}

            {permission === "default" && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700">
                    Receba lembretes para jogar!
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={requestPermission}
                  disabled={notificationLoading}
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  {notificationLoading
                    ? "Solicitando..."
                    : "Permitir Notificações"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs sm:text-sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="text-xs sm:text-sm"
          >
            <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
