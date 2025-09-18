import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Save, Image } from "lucide-react";

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
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(
    profile?.avatar_url || "/placeholder.svg"
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);

    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: selectedAvatar,
      });

      onOpenChange(false);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/95 backdrop-blur-lg border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Configurações do Perfil</span>
          </DialogTitle>
          <DialogDescription>
            Personalize seu perfil e avatar no jogo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Image className="h-4 w-4" />
              <span>Avatar</span>
            </Label>

            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedAvatar} />
                <AvatarFallback className="bg-primary text-white">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-4 gap-2">
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
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de exibição</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={30}
            />
          </div>

          {/* Stats Display */}
          {profile && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <h4 className="font-medium text-sm">Suas Estatísticas</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Pontuação Total:
                  </span>
                  <div className="font-semibold">{profile.total_score}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Jogos:</span>
                  <div className="font-semibold">{profile.games_played}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Melhor Sequência:
                  </span>
                  <div className="font-semibold">{profile.best_streak}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
