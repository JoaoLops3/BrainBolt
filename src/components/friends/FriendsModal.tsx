import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserPlus,
  Users,
  Check,
  X,
  User,
  Trophy,
  Target,
  Search,
  Eye,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Friendship } from "@/types/game";
import { FriendProfileModal } from "./FriendProfileModal";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string;
  total_score: number;
  games_played: number;
  games_won: number;
  games_lost: number;
  multiplayer_wins: number;
  multiplayer_losses: number;
  speed_games_played: number;
  normal_games_played: number;
  win_percentage: number;
  average_score: number;
  best_streak: number;
}

import { UserSearchModal } from "./UserSearchModal";

interface FriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FriendsModal = ({ open, onOpenChange }: FriendsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<
    (Friendship & { friend_profile: Profile })[]
  >([]);
  const [friendRequests, setFriendRequests] = useState<
    (Friendship & { requester_profile: Profile })[]
  >([]);

  // Estados para busca de perfil
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);

  // Fetch friends and requests
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch accepted friendships
      const { data: acceptedFriends, error: friendsError } = await supabase
        .from("friendships")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (friendsError) throw friendsError;

      // Fetch profiles for friends
      if (acceptedFriends && acceptedFriends.length > 0) {
        const friendIds = acceptedFriends.map((f) => f.friend_id);
        const { data: friendProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", friendIds);

        if (profilesError) throw profilesError;

        const friendsWithProfiles = acceptedFriends
          .map((friendship) => ({
            ...friendship,
            status: friendship.status as Friendship["status"],
            friend_profile:
              friendProfiles?.find((p) => p.user_id === friendship.friend_id) ||
              null,
          }))
          .filter((f) => f.friend_profile);

        setFriends(friendsWithProfiles as any);
      } else {
        setFriends([]);
      }

      // Fetch pending friend requests (received)
      const { data: pendingRequests, error: requestsError } = await supabase
        .from("friendships")
        .select("*")
        .eq("friend_id", user.id)
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      // Fetch profiles for requesters
      if (pendingRequests && pendingRequests.length > 0) {
        const requesterIds = pendingRequests.map((r) => r.user_id);
        const { data: requesterProfiles, error: requesterProfilesError } =
          await supabase
            .from("profiles")
            .select("*")
            .in("user_id", requesterIds);

        if (requesterProfilesError) throw requesterProfilesError;

        const requestsWithProfiles = pendingRequests
          .map((request) => ({
            ...request,
            status: request.status as Friendship["status"],
            requester_profile:
              requesterProfiles?.find((p) => p.user_id === request.user_id) ||
              null,
          }))
          .filter((r) => r.requester_profile);

        setFriendRequests(requestsWithProfiles as any);
      } else {
        setFriendRequests([]);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Search for user profile
  const searchUserProfile = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("display_name", `%${query.trim()}%`)
        .limit(5);

      if (error) throw error;

      // Filter out current user
      const filteredProfiles =
        profiles?.filter((p) => p.user_id !== user?.id) || [];
      setSearchResults(filteredProfiles);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar usuários",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Send friend request to specific user
  const sendFriendRequestToUser = async (targetUserId: string) => {
    if (!user) return;

    setLoading(true);
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

      toast({
        title: "Sucesso!",
        description: "Pedido de amizade enviado",
      });

      setSearchQuery("");
      setSearchResults([]);
      fetchData();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send friend request (legacy function for backward compatibility)
  const sendFriendRequest = async () => {
    if (!user || !friendEmail.trim()) return;

    setLoading(true);
    try {
      // Find user by email
      const { data: targetProfile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("display_name", friendEmail.trim())
        .single();

      if (profileError || !targetProfile) {
        toast({
          title: "Usuário não encontrado",
          description: "Verifique o nome de usuário",
          variant: "destructive",
        });
        return;
      }

      if (targetProfile.user_id === user.id) {
        toast({
          title: "Erro",
          description: "Você não pode adicionar a si mesmo",
          variant: "destructive",
        });
        return;
      }

      // Send friend request
      const { error } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: targetProfile.user_id,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          toast({
            title: "Erro",
            description: "Pedido de amizade já enviado",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Pedido de amizade enviado",
      });

      setFriendEmail("");
      fetchData();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (
    friendshipId: string,
    requesterId: string
  ) => {
    if (!user) return;

    try {
      // Update the original request to accepted
      const { error: updateError } = await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", friendshipId);

      if (updateError) throw updateError;

      // Create the reverse friendship
      const { error: insertError } = await supabase.from("friendships").insert({
        user_id: user.id,
        friend_id: requesterId,
        status: "accepted",
      });

      if (insertError) throw insertError;

      toast({
        title: "Amigo adicionado!",
        description: "Agora vocês são amigos",
      });

      fetchData();
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o pedido",
        variant: "destructive",
      });
    }
  };

  // Reject friend request
  const rejectFriendRequest = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      toast({
        title: "Pedido rejeitado",
        description: "O pedido de amizade foi rejeitado",
      });

      fetchData();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o pedido",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, user]);

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUserProfile(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] allow-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Amigos
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Amigos ({friends.length})</TabsTrigger>
            <TabsTrigger value="requests">
              Pedidos ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não tem amigos adicionados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friendship) => (
                  <Card key={friendship.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={friendship.friend_profile.avatar_url}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {friendship.friend_profile.display_name ||
                              "Jogador"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {friendship.friend_profile.win_percentage.toFixed(
                                1
                              )}
                              % vitórias
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {friendship.friend_profile.games_played} jogos
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProfile(friendship.friend_profile);
                            setShowProfileModal(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Badge variant="secondary">Amigo</Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {friendRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum pedido de amizade pendente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={request.requester_profile.avatar_url}
                          />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">
                            {request.requester_profile.display_name ||
                              "Jogador"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Quer ser seu amigo
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            acceptFriendRequest(request.id, request.user_id)
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectFriendRequest(request.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar e Adicionar Amigo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome de usuário</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite o nome de usuário para buscar"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Search Results */}
                {searchLoading && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Search className="h-6 w-6 mx-auto mb-2 animate-spin" />
                    Buscando usuários...
                  </div>
                )}

                {searchResults.length > 0 && !searchLoading && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Resultados da busca ({searchResults.length})
                    </h4>
                    {searchResults.map((profile) => (
                      <Card key={profile.user_id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">
                                {profile.display_name || "Jogador"}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3" />
                                  {profile.win_percentage?.toFixed(1) || 0}%
                                  vitórias
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {profile.games_played || 0} jogos
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProfile(profile);
                                setShowProfileModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Perfil
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                sendFriendRequestToUser(profile.user_id)
                              }
                              disabled={loading}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {searchQuery &&
                  searchResults.length === 0 &&
                  !searchLoading && (
                    <div className="text-center py-4 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum usuário encontrado</p>
                      <p className="text-xs">Tente outro nome de usuário</p>
                    </div>
                  )}

                {!searchQuery && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Digite o nome de um usuário para buscar</p>
                    <p className="text-sm">
                      Você verá o perfil antes de adicionar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Profile Modal */}
      <FriendProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        profile={selectedProfile}
      />
    </Dialog>
  );
};
