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
  id: string;
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

  const searchUsers = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("search_users", {
        search_term: query.trim(),
      });

      if (error) throw error;
      const results = data || [];
      setSearchResults(results);

      // Após obter resultados, buscar status de amizade para cada usuário listado
      if (results.length > 0 && user) {
        const ids = results.map((r: SearchResult) => r.id);
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
          ids.forEach((id) => (statusMap[id] = "none"));

          (rels || []).forEach((rel) => {
            const otherId =
              rel.user_id === user.id ? rel.friend_id : rel.user_id;
            // Priorizar accepted sobre pending
            if (rel.status === "accepted") {
              statusMap[otherId] = "accepted";
            } else if (
              rel.status === "pending" &&
              statusMap[otherId] !== "accepted"
            ) {
              statusMap[otherId] = "pending";
            }
          });

          // Incluir os recém enviados nesta sessão
          sentRequests.forEach((id) => {
            if (statusMap[id] !== "accepted") statusMap[id] = "pending";
          });

          setFriendshipStatus(statusMap);
        } catch (e) {
          console.error("Error fetching friendship status:", e);
        }
      } else {
        setFriendshipStatus({});
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
      <DialogContent className="max-w-2xl max-h-[80vh] allow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Usuários
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Busque por nome, username ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Search results */}
          {loading && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              Buscando usuários...
            </div>
          )}

          {!loading && searchQuery.trim() && searchResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário encontrado</p>
              <p className="text-sm">
                Tente buscar por nome, username ou email
              </p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {searchResults.length} usuário(s) encontrado(s)
              </p>

              {searchResults.map((result) => (
                <Card key={result.id} className="p-4">
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
                          <h4 className="font-semibold">
                            {result.display_name || "Jogador Anônimo"}
                          </h4>
                          {result.username && (
                            <Badge variant="outline" className="text-xs">
                              <AtSign className="h-3 w-3 mr-1" />
                              {result.username}
                            </Badge>
                          )}
                          {friendshipStatus[result.id] === "accepted" && (
                            <Badge className="text-xs bg-green-500/20 text-green-300 border-green-400/30">
                              Amigo
                            </Badge>
                          )}
                          {friendshipStatus[result.id] === "pending" && (
                            <Badge className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                              Pendente
                            </Badge>
                          )}
                        </div>

                        {result.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {result.email}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

                    {friendshipStatus[result.id] === "accepted" ? (
                      <Button size="sm" className="gap-2" disabled>
                        Amigo
                      </Button>
                    ) : friendshipStatus[result.id] === "pending" ||
                      sentRequests.has(result.id) ? (
                      <Button size="sm" className="gap-2" disabled>
                        Já enviado
                      </Button>
                    ) : (
                      <Button
                        onClick={() => sendFriendRequest(result.id)}
                        size="sm"
                        className="gap-2"
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
