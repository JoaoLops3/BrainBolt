import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Trophy,
  Target,
  User,
  Mail,
  AtSign,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
}

interface SearchResult {
  user_id: string;
  display_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string;
  games_played: number;
  total_score: number;
}

export const UserSearchModal = ({
  open,
  onOpenChange,
  onUserAdded,
}: UserSearchModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [friendshipStatus, setFriendshipStatus] = useState<
    Record<string, "accepted" | "pending" | "none">
  >({});
  const [pendingDirection, setPendingDirection] = useState<
    Record<string, "sent" | "received" | null>
  >({});

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Buscar direto da tabela profiles para garantir user_id
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, display_name, username, email, avatar_url, games_played, total_score"
        )
        .or(
          `display_name.ilike.%${query.trim()}%,username.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%`
        )
        .neq("user_id", user?.id || "")
        .limit(20);

      if (error) throw error;
      const results = (data || []) as SearchResult[];
      setSearchResults(results);

      // Após obter resultados, buscar status de amizade para cada usuário listado
      if (results.length > 0 && user) {
        const ids = results.map((r: SearchResult) => r.user_id);
        try {
          const inList = ids.join(",");
          const { data: rels, error: relsError } = await supabase
            .from("friendships")
            .select("user_id, friend_id, status")
            .or(
              `and(user_id.eq.${user.id},friend_id.in.(${inList})),and(user_id.in.(${inList}),friend_id.eq.${user.id})`
            );

          if (relsError) throw relsError;

          const statusMap: Record<string, "accepted" | "pending" | "none"> = {};
          const directionMap: Record<string, "sent" | "received" | null> = {};
          ids.forEach((id) => (statusMap[id] = "none"));
          ids.forEach((id) => (directionMap[id] = null));

          (rels || []).forEach((rel) => {
            const otherId =
              rel.user_id === user.id ? rel.friend_id : rel.user_id;
            // Priorizar accepted sobre pending
            if (rel.status === "accepted") {
              statusMap[otherId] = "accepted";
              directionMap[otherId] = null;
            } else if (
              rel.status === "pending" &&
              statusMap[otherId] !== "accepted"
            ) {
              statusMap[otherId] = "pending";
              directionMap[otherId] =
                rel.user_id === user.id ? "sent" : "received";
            }
          });

          // Incluir os recém enviados nesta sessão
          sentRequests.forEach((id) => {
            if (statusMap[id] !== "accepted") statusMap[id] = "pending";
            directionMap[id] = "sent";
          });

          setFriendshipStatus(statusMap);
          setPendingDirection(directionMap);
        } catch (e) {
          console.error("Error fetching friendship status:", e);
        }
      } else {
        setFriendshipStatus({});
        setPendingDirection({});
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;

    try {
      // Check if already friends or request exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from("friendships")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
        )
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingFriendship) {
        if (existingFriendship.status === "accepted") {
          toast({
            title: "Já são amigos",
            description: "Vocês já são amigos",
            variant: "destructive",
          });
          return;
        } else if (existingFriendship.status === "pending") {
          toast({
            title: "Pedido já enviado",
            description: "Já existe um pedido de amizade pendente",
            variant: "destructive",
          });
          return;
        }
      }

      // Send friend request
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: targetUserId,
      });

      if (error) throw error;

      setSentRequests((prev) => new Set(prev).add(targetUserId));
      setFriendshipStatus((prev) => ({ ...prev, [targetUserId]: "pending" }));
      setPendingDirection((prev) => ({ ...prev, [targetUserId]: "sent" }));

      toast({
        title: "Sucesso!",
        description: "Pedido de amizade enviado",
      });

      onUserAdded();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido",
        variant: "destructive",
      });
    }
  };

  const cancelFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("user_id", user.id)
        .eq("friend_id", targetUserId)
        .eq("status", "pending");

      if (error) throw error;

      setSentRequests((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
      setFriendshipStatus((prev) => ({ ...prev, [targetUserId]: "none" }));
      setPendingDirection((prev) => ({ ...prev, [targetUserId]: null }));

      toast({
        title: "Pedido cancelado",
        description: "Seu pedido de amizade foi cancelado",
      });
    } catch (error) {
      console.error("Error canceling friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o pedido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] allow-scroll backdrop-blur-lg bg-gradient-to-br from-[hsl(262,83%,58%)]/95 via-[hsl(330,81%,60%)]/95 to-[hsl(45,93%,58%)]/95 border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Search className="h-5 w-5" />
            Buscar Usuários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/80" />
            <Input
              placeholder="Busque por nome, username ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/10 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          {/* Search results */}
          {loading && (
            <div className="text-center py-8 text-white/80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              Buscando usuários...
            </div>
          )}

          {!loading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="text-center py-8 text-white/80">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              <p className="text-sm">
                Tente buscar por nome, username ou email
              </p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-white/80">
                {searchResults.length} usuário(s) encontrado(s)
              </p>

              {searchResults.map((result) => (
                <Card
                  key={result.user_id}
                  className="p-4 bg-white/20 border-white/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={result.avatar_url} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {result.display_name || "Jogador Anônimo"}
                          </h4>
                          {result.username && (
                            <Badge className="text-xs bg-white/10 text-white border-white/30">
                              <AtSign className="h-3 w-3 mr-1" />
                              {result.username}
                            </Badge>
                          )}
                          {friendshipStatus[result.user_id] === "accepted" && (
                            <Badge className="text-xs bg-green-500/30 text-white border-green-400/50">
                              Amigo
                            </Badge>
                          )}
                          {friendshipStatus[result.user_id] === "pending" && (
                            <Badge className="text-xs bg-yellow-500/30 text-white border-yellow-400/50">
                              Pendente
                            </Badge>
                          )}
                        </div>

                        {result.email && (
                          <div className="flex items-center gap-1 text-xs text-white/80">
                            <Mail className="h-3 w-3" />
                            {result.email}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-white/80">
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {result.total_score} pts
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {result.games_played} jogos
                          </span>
                        </div>
                      </div>
                    </div>

                    {friendshipStatus[result.user_id] === "accepted" ? (
                      <Button
                        size="sm"
                        className="gap-2 bg-white/10 text-white"
                        disabled
                      >
                        Amigo
                      </Button>
                    ) : friendshipStatus[result.user_id] === "pending" &&
                      pendingDirection[result.user_id] === "sent" ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="gap-2 bg-white/10 text-white"
                          disabled
                        >
                          Já enviado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelFriendRequest(result.user_id)}
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : friendshipStatus[result.user_id] === "pending" &&
                      pendingDirection[result.user_id] === "received" ? (
                      <Button
                        size="sm"
                        className="gap-2 bg-white/10 text-white"
                        disabled
                      >
                        Pendente
                      </Button>
                    ) : (
                      <Button
                        onClick={() => sendFriendRequest(result.user_id)}
                        size="sm"
                        className="gap-2 bg-white/20 hover:bg-white/30 text-white"
                      >
                        <UserPlus className="h-4 w-4" />
                        Adicionar
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
