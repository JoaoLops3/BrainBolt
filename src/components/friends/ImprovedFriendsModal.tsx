import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Friendship } from "@/types/game";
import { FriendProfileModal } from "./FriendProfileModal";
import { UserSearchModal } from "./UserSearchModal";
import { FriendComparisonModal } from "./FriendComparisonModal";

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

interface ImprovedFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImprovedFriendsModal = ({
  open,
  onOpenChange,
}: ImprovedFriendsModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<
    (Friendship & { friend_profile: Profile })[]
  >([]);
  const [friendRequests, setFriendRequests] = useState<
    (Friendship & { requester_profile: Profile })[]
  >([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonFriendId, setComparisonFriendId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

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

  const openComparison = (friendId: string) => {
    setComparisonFriendId(friendId);
    setShowComparison(true);
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, user]);

  return (
    <>
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        maxWidth="2xl"
        maxHeight="screen"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            Amigos
          </div>

          <Tabs defaultValue="friends" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 gap-1">
              <TabsTrigger
                value="friends"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Amigos</span>
                <span className="sm:hidden">Amigos</span>
                <span className="ml-1">({friends.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Pedidos</span>
                <span className="sm:hidden">Pedidos</span>
                <span className="ml-1">({friendRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-1.5 whitespace-nowrap"
              >
                Buscar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você ainda não tem amigos adicionados</p>
                  <p className="text-sm">
                    Use a aba "Buscar" para encontrar outros jogadores
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friendship) => (
                    <Card
                      key={friendship.id}
                      className="p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                            <AvatarImage
                              src={friendship.friend_profile.avatar_url}
                            />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {friendship.friend_profile.display_name ||
                                "Jogador"}
                            </h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
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
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Ver</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openComparison(friendship.friend_profile.user_id)
                            }
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">
                              Comparar
                            </span>
                          </Button>
                          <Badge variant="secondary" className="text-xs">
                            Amigo
                          </Badge>
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
                    <Card
                      key={request.id}
                      className="p-4 sm:p-6 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                            <AvatarImage
                              src={request.requester_profile.avatar_url}
                            />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">
                              {request.requester_profile.display_name ||
                                "Jogador"}
                            </h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Quer ser seu amigo
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              acceptFriendRequest(request.id, request.user_id)
                            }
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">
                              Aceitar
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectFriendRequest(request.id)}
                            className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
                          >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">
                              Recusar
                            </span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="space-y-4">
                <Button
                  onClick={() => setShowUserSearch(true)}
                  className="w-full h-10 sm:h-12"
                  size="lg"
                >
                  <Search className="h-4 w-4 mr-2" />
                  <span className="text-sm sm:text-base">
                    Buscar por Nome, Username ou Email
                  </span>
                </Button>

                <div className="text-center text-muted-foreground">
                  <p className="text-xs sm:text-sm">
                    Encontre outros jogadores e compare suas estatísticas!
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveDialog>

      {selectedProfile && (
        <FriendProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          profile={selectedProfile}
        />
      )}

      <UserSearchModal
        open={showUserSearch}
        onOpenChange={setShowUserSearch}
        onUserAdded={() => {
          setShowUserSearch(false);
          fetchData();
        }}
      />

      <FriendComparisonModal
        open={showComparison}
        onOpenChange={setShowComparison}
        friendId={comparisonFriendId}
      />
    </>
  );
};
