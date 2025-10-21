import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Send,
  Search,
  User,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string;
  total_score: number;
  games_played: number;
  win_percentage: number;
  multiplayer_wins: number;
  multiplayer_losses: number;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  friend_profile: Profile;
}

interface FriendInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomCode: string;
}

export const FriendInviteModal = ({
  open,
  onOpenChange,
  roomId,
  roomCode,
}: FriendInviteModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  // Fetch user's friends
  const fetchFriends = async () => {
    if (!user) return;

    try {
      setLoading(true);

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
            friend_profile:
              friendProfiles?.find((p) => p.user_id === friendship.friend_id) ||
              null,
          }))
          .filter((f) => f.friend_profile) as Friendship[];

        setFriends(friendsWithProfiles);
      } else {
        setFriends([]);
      }

      // Check which friends already have pending invites for this room
      const { data: existingInvites, error: invitesError } = await supabase
        .from("multiplayer_invitations")
        .select("invited_id")
        .eq("room_id", roomId)
        .eq("inviter_id", user.id)
        .eq("status", "pending");

      if (invitesError) throw invitesError;

      setSentInvites(
        new Set(existingInvites.map((invite) => invite.invited_id))
      );
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de amigos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Send invitation to friend
  const sendInvitation = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("multiplayer_invitations").insert({
        room_id: roomId,
        inviter_id: user.id,
        invited_id: friendId,
      });

      if (error) throw error;

      setSentInvites((prev) => new Set(prev).add(friendId));

      toast({
        title: "Convite enviado!",
        description: "Seu amigo receberá o convite para jogar",
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open) {
      fetchFriends();
    }
  }, [open, user]);

  const filteredFriends = friends.filter((friend) =>
    friend.friend_profile.display_name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto backdrop-blur-lg bg-gradient-to-br from-[hsl(262,83%,58%)]/95 via-[hsl(330,81%,60%)]/95 to-[hsl(45,93%,58%)]/95 border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Convidar Amigos
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Código da sala:{" "}
            <span className="font-mono font-bold">{roomCode}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar amigos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {friends.length === 0
                  ? "Você ainda não tem amigos adicionados"
                  : "Nenhum amigo encontrado"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredFriends.map((friendship) => {
                const isInvited = sentInvites.has(friendship.friend_id);

                return (
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
                              {friendship.friend_profile.win_percentage?.toFixed(
                                1
                              ) || 0}
                              % vitórias
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {friendship.friend_profile.multiplayer_wins ||
                                0}{" "}
                              vitórias MP
                            </span>
                          </div>
                        </div>
                      </div>

                      {isInvited ? (
                        <Badge variant="secondary">Convite Enviado</Badge>
                      ) : (
                        <Button
                          onClick={() => sendInvitation(friendship.friend_id)}
                          className="gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Convidar
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
