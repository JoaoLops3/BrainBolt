import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Copy, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MultiplayerRoom } from "@/types/game";

interface MultiplayerMenuProps {
  onStartMultiplayer: (roomId: string, isHost: boolean) => void;
  onBackToMenu: () => void;
}

export const MultiplayerMenu = ({
  onStartMultiplayer,
  onBackToMenu,
}: MultiplayerMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);

  const generateRoomCode = () => {
    // Generate a more unique room code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createRoom = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const newRoomCode = generateRoomCode();

      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          room_code: newRoomCode,
          host_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRoom({
        ...data,
        game_status: data.game_status as MultiplayerRoom["game_status"],
      });
    } catch (error) {
      console.error("Erro ao criar sala:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user || !roomCode.trim()) return;

    setLoading(true);
    try {
      // First, check if room exists and is available
      const { data: rooms, error: fetchError } = await supabase
        .from("multiplayer_rooms")
        .select("*")
        .eq("room_code", roomCode.trim())
        .eq("game_status", "waiting")
        .is("guest_id", null)
        .limit(1);

      const room = rooms && Array.isArray(rooms) ? rooms[0] : null;

      if (fetchError || !room) {
        toast({
          title: "Sala indisponível",
          description: "Código inválido, sala cheia ou já iniciada",
          variant: "destructive",
        });
        return;
      }

      // Join the room
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .update({ guest_id: user.id })
        .eq("id", room.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentRoom({
        ...data,
        game_status: data.game_status as MultiplayerRoom["game_status"],
      });
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.room_code);
    }
  };

  const startGame = () => {
    if (currentRoom) {
      onStartMultiplayer(currentRoom.id, true);
    }
  };

  // Listen for guest joining
  useEffect(() => {
    if (!currentRoom) return;

    const channel = supabase
      .channel("multiplayer-room-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "multiplayer_rooms",
          filter: `id=eq.${currentRoom.id}`,
        },
        (payload) => {
          const updatedRoom = payload.new as MultiplayerRoom;
          setCurrentRoom({
            ...updatedRoom,
            game_status:
              updatedRoom.game_status as MultiplayerRoom["game_status"],
          });

          if (updatedRoom.guest_id && !currentRoom.guest_id) {
          }

          // If game started, redirect both players to game
          if (
            updatedRoom.game_status === "playing" &&
            currentRoom.game_status !== "playing"
          ) {
            const isHost = user?.id === updatedRoom.host_id;
            onStartMultiplayer(updatedRoom.id, isHost);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom, toast, user?.id, onStartMultiplayer]);

  if (currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 no-scroll">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="h-6 w-6" />
              Sala Multiplayer
            </CardTitle>
            <CardDescription>
              Compartilhe o código com seu amigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {currentRoom.room_code}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyRoomCode}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar Código
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {currentRoom.guest_id
                  ? "✅ Jogador encontrado! Pronto para começar"
                  : "⏳ Aguardando outro jogador..."}
              </p>

              {currentRoom.guest_id && user?.id === currentRoom.host_id && (
                <Button onClick={startGame} className="w-full mb-2">
                  Iniciar Jogo
                </Button>
              )}

              {currentRoom.guest_id && user?.id === currentRoom.guest_id && (
                <div className="text-center mb-2">
                  <p className="text-sm text-muted-foreground">
                    Aguardando o host iniciar o jogo...
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={onBackToMenu}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 no-scroll">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            Modo Multiplayer
          </CardTitle>
          <CardDescription>
            Jogue com um amigo em dispositivos diferentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button
              onClick={createRoom}
              disabled={loading}
              className="w-full h-12"
            >
              Criar Sala
            </Button>

            <div className="text-center text-sm text-muted-foreground">ou</div>

            <div className="space-y-2">
              <Input
                placeholder="Digite o código da sala"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="text-center text-lg font-mono"
                maxLength={6}
              />
              <Button
                onClick={joinRoom}
                disabled={loading || !roomCode.trim()}
                variant="outline"
                className="w-full"
              >
                Entrar na Sala
              </Button>
            </div>
          </div>

          <Button variant="ghost" onClick={onBackToMenu} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
