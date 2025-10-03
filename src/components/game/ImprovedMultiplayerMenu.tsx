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
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Copy,
  ArrowLeft,
  Gamepad2,
  Plus,
  Search,
  Sparkles,
  Clock,
  Trophy,
  Share2,
  QrCode,
  RefreshCw,
  CheckCircle2,
  UserPlus,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MultiplayerRoom } from "@/types/game";
import { cn } from "@/lib/utils";

// Props do componente de menu multiplayer melhorado
interface ImprovedMultiplayerMenuProps {
  onStartMultiplayer: (roomId: string, isHost: boolean) => void; // Função para iniciar o jogo multiplayer
  onBackToMenu: () => void; // Função para voltar ao menu principal
}

export const ImprovedMultiplayerMenu = ({
  onStartMultiplayer,
  onBackToMenu,
}: ImprovedMultiplayerMenuProps) => {
  // Hooks principais
  const { user } = useAuth(); // Usuário logado
  const { toast } = useToast(); // Sistema de notificações toast

  // Estados locais da interface
  const [roomCode, setRoomCode] = useState(""); // Código da sala para entrar
  const [loading, setLoading] = useState(false); // Carregamento de operações
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null); // Sala atual
  const [copied, setCopied] = useState(false); // Estado de cópia do código
  const [playerCount, setPlayerCount] = useState(1); // Contador de jogadores na sala

  // Gera um código único de 6 caracteres para a sala
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Caracteres permitidos
    let result = "";
    for (let i = 0; i < 6; i++) {
      // 6 caracteres de tamanho
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Função para criar uma nova sala multiplayer
  const createRoom = async () => {
    if (!user) return; // Verifica se há um usuário logado

    setLoading(true); // Ativa estado de carregamento
    try {
      const newRoomCode = generateRoomCode(); // Gera código único

      // Insere nova sala no banco de dados
      const { data, error } = await supabase
        .from("multiplayer_rooms")
        .insert({
          room_code: newRoomCode,
          host_id: user.id, // Define usuário atual como host
        })
        .select()
        .single();

      if (error) throw error;

      // Define sala atual com dados retornados
      setCurrentRoom({
        ...data,
        game_status: data.game_status as MultiplayerRoom["game_status"],
      });

      // Mostra notificação de sucesso
      toast({
        title: "🎉 Sala criada!",
        description: "Compartilhe o código com seus amigos",
      });
    } catch (error) {
      console.error("Erro ao criar sala:", error);
      // Mostra notificação de erro
      toast({
        title: "Erro",
        description: "Não foi possível criar a sala",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // Desativa carregamento
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

      toast({
        title: "✅ Entrou na sala!",
        description: "Aguardando o host iniciar o jogo",
      });
    } catch (error) {
      console.error("Erro ao entrar na sala:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para copiar o código da sala para a área de transferência
  const copyRoomCode = async () => {
    if (currentRoom) {
      try {
        await navigator.clipboard.writeText(currentRoom.room_code); // Copia código
        setCopied(true); // Ativa estado visual de copiado
        toast({
          title: "Código copiado!",
          description: "Cole no chat ou compartilhe com seus amigos",
        });
        setTimeout(() => setCopied(false), 2000); // Reseta estado após 2 segundos
      } catch {
        toast({
          title: "Erro",
          description: "Não foi possível copiar o código",
          variant: "destructive",
        });
      }
    }
  };

  const shareRoom = async () => {
    if (!currentRoom) return;

    const shareData = {
      title: "Jogue Brain Bolt comigo!",
      text: `Entre na minha sala de Brain Bolt! Código: ${currentRoom.room_code}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "Link copiado!",
          description: "Compartilhe com seus amigos",
        });
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    }
  };

  const regenerateRoomCode = () => {
    if (currentRoom) {
      setCurrentRoom({
        ...currentRoom,
        room_code: generateRoomCode(),
      });
    }
  };

  const startGame = () => {
    if (currentRoom) {
      onStartMultiplayer(currentRoom.id, true);
    }
  };

  // Hook para escutar mudanças na sala em tempo real
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

          // Atualiza contador de jogadores (1 ou 2)
          setPlayerCount(updatedRoom.guest_id ? 2 : 1);

          // Se o jogo começou, redireciona ambos jogadores
          if (
            updatedRoom.game_status === "playing" &&
            currentRoom.game_status !== "playing"
          ) {
            const isHost = user?.id === updatedRoom.host_id; // Verifica se é host
            onStartMultiplayer(updatedRoom.id, isHost);
          }
        }
      )
      .subscribe();

    // Cleanup do canal quando componente desmonta
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom, toast, user?.id, onStartMultiplayer]);

  // Animação do contador de jogadores quando aumenta
  useEffect(() => {
    const counter = document.getElementById("player-counter");
    if (counter && playerCount > 1) {
      counter.classList.add("animate-bounce"); // Adiciona animação bounce
      setTimeout(() => counter.classList.remove("animate-bounce"), 1000); // Remove após 1s
    }
  }, [playerCount]);

  // Renderização da sala ativa (quando há uma sala criada/entrada)
  if (currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-primary p-4 safe-top safe-bottom overflow-hidden relative">
        {/* Elementos de background animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-40 left-20 w-40 h-40 bg-green-500/20 rounded-full blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto">
          {/* Cabeçalho com botão voltar e status da sala */}
          <div className="flex items-center justify-between mb-8">
            {/* Botão para voltar ao menu principal */}
            <Button
              variant="ghost"
              onClick={onBackToMenu}
              className="text-white hover:bg-white/20 backdrop-blur-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>

            {/* Badge indicando sala ativa */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg rounded-full border border-white/30">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-medium">Sala Ativa</span>
            </div>
          </div>

          {/* Card principal da sala */}
          <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl mb-8">
            <CardHeader className="text-center pb-4">
              {/* Ícone decorativo da sala */}
              <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl w-fit">
                <Users className="h-12 w-12 text-white" />
              </div>
              {/* Título e descrição da sala */}
              <CardTitle className="text-2xl font-bold text-white">
                Sala Multiplayer
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Compartilhe o código com seus amigos
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Exibição do código da sala */}
              <div className="text-center">
                <div className="relative mb-6">
                  {/* Card destacado com o código da sala */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-center gap-4">
                      <QrCode className="h-8 w-8 text-white/60" />
                      {/* Código da sala em fonte monospace */}
                      <div className="text-4xl font-black text-white tracking-wider font-mono">
                        {currentRoom.room_code}
                      </div>
                      <div
                        id="player-counter"
                        className="flex items-center gap-2"
                      >
                        <Users className="h-6 w-6 text-white/80" />
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white"
                        >
                          {playerCount}/2
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={copyRoomCode}
                    size="lg"
                    className={cn(
                      "gap-3 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700",
                      copied && "from-emerald-600 to-teal-600"
                    )}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                    {copied ? "Copiado!" : "Copiar Código"}
                  </Button>

                  <Button
                    onClick={shareRoom}
                    variant="outline"
                    size="lg"
                    className="gap-3 px-6 text-white border-white/30 hover:bg-white/20"
                  >
                    <Share2 className="h-5 w-5" />
                    Compartilhar
                  </Button>

                  <Button
                    onClick={regenerateRoomCode}
                    variant="outline"
                    size="lg"
                    className="gap-2 px-4 text-white border-white/30 hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Status Display */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div
                    className={cn(
                      "px-4 py-2 rounded-full transition-all duration-300",
                      currentRoom.guest_id
                        ? "bg-green-500/20 text-green-300 border border-green-400/30"
                        : "bg-orange-500/20 text-orange-300 border border-orange-400/30 animate-pulse"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          currentRoom.guest_id
                            ? "bg-green-400"
                            : "bg-orange-400 animate-ping"
                        )}
                      />
                      {currentRoom.guest_id
                        ? "✅ Jogador encontrado! Pronto para começar"
                        : "⏳ Aguardando outro jogador..."}
                    </div>
                  </div>
                </div>

                {/* Start Game Button */}
                {currentRoom.guest_id && user?.id === currentRoom.host_id && (
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Gamepad2 className="h-6 w-6" />
                      <span>🚀 Iniciar Jogo</span>
                      <Zap className="h-5 w-5" />
                    </div>
                  </Button>
                )}

                {/* Guest Status */}
                {currentRoom.guest_id && user?.id === currentRoom.guest_id && (
                  <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                    <div className="flex items-center gap-3 text-blue-300">
                      <Clock className="h-5 w-5 animate-spin" />
                      <span className="font-medium">
                        Aguardando o host iniciar o jogo...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-400/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-yellow-300 font-medium">💡 Dica:</h4>
                  <p className="text-yellow-100/80 text-sm">
                    Compartilhe o código através de WhatsApp, Discord ou
                    qualquer app de mensagem. Seus amigos só precisam colar o
                    código aqui!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderização do menu principal (quando não há sala ativa)
  return (
    <div className="min-h-screen bg-gradient-primary p-4 safe-top safe-bottom overflow-hidden relative">
      {/* Elementos de background animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-60 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-center max-w-md mx-auto">
        {/* Cabeçalho principal do menu */}
        <div className="text-center mb-12">
          {/* Ícone principal do multiplayer */}
          <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl w-fit backdrop-blur-xl">
            <Users className="h-16 w-16 text-white" />
          </div>
          {/* Título principal */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Modo Multiplayer
          </h1>
          {/* Descrição do modo */}
          <p className="text-white/80 text-lg max-w-sm mx-auto">
            Jogue com seus amigos em tempo real em dispositivos diferentes
          </p>
        </div>

        {/* Main Options */}
        <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl mb-8">
          <CardContent className="p-8 space-y-8">
            {/* Create Room */}
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Criar Nova Sala
                </h3>
                <p className="text-white/70 text-sm">
                  Gere um código único para seus amigos
                </p>
              </div>

              <Button
                onClick={createRoom}
                disabled={loading}
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-bold transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <Plus className="h-6 w-6" />
                  <span>🎮 Criar Sala</span>
                  <Sparkles className="h-5 w-5" />
                </div>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-gradient-primary px-4 text-white/60 text-sm font-medium">
                  OU
                </span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Entrar em Sala
                </h3>
                <p className="text-white/70 text-sm">
                  Digite o código enviado pelo seu amigo
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <Input
                    placeholder="Código da sala (ex: ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="pl-12 text-center text-xl font-bold h-14 bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:bg-white/20"
                    maxLength={6}
                  />
                </div>

                <Button
                  onClick={joinRoom}
                  disabled={loading || !roomCode.trim()}
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-white border-white/30 hover:bg-white/20 text-lg font-bold transform hover:scale-105 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5" />
                    <span>🚪 Entrar na Sala</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-400/30 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-400" />
                </div>
                <h4 className="text-green-300 font-medium text-sm">
                  Tempo Real
                </h4>
                <p className="text-green-100/80 text-xs">
                  Sincronização instantânea
                </p>
              </div>

              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-blue-300 font-medium text-sm">
                  Competição
                </h4>
                <p className="text-blue-100/80 text-xs">Vitória por pontos</p>
              </div>

              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h4 className="text-purple-300 font-medium text-sm">Social</h4>
                <p className="text-purple-100/80 text-xs">Jogue com amigos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBackToMenu}
          className="w-full text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Menu Principal
        </Button>
      </div>
    </div>
  );
};
