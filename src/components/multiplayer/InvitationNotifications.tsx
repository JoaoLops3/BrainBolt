import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Check,
  X,
  User,
  Users,
  Clock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string;
}

interface MultiplayerInvitation {
  id: string;
  room_id: string;
  inviter_id: string;
  invited_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  room_code?: string;
  inviter_profile: Profile;
}

interface InvitationNotificationsProps {
  onJoinRoom: (roomId: string) => void;
}

export const InvitationNotifications = ({ onJoinRoom }: InvitationNotificationsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<MultiplayerInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pending invitations
  const fetchInvitations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Expire old invitations first
      await supabase.rpc('expire_old_invitations');
      
      // Fetch pending invitations with room and profile data
      const { data: rawInvitations, error: invitationsError } = await supabase
        .from("multiplayer_invitations")
        .select(`
          *,
          multiplayer_rooms!multiplayer_invitations_room_id_fkey (
            room_code,
            game_status
          )
        `)
        .eq("invited_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (invitationsError) throw invitationsError;

      if (rawInvitations && rawInvitations.length > 0) {
        // Fetch inviter profiles
        const inviterIds = rawInvitations.map(inv => inv.inviter_id);
        const { data: inviterProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", inviterIds);

        if (profilesError) throw profilesError;

        const invitationsWithProfiles = rawInvitations
          .map(invitation => {
            const room = (invitation as any).multiplayer_rooms;
            const inviterProfile = inviterProfiles?.find(
              p => p.user_id === invitation.inviter_id
            );

            // Only include invitations for rooms that are still waiting
            if (room?.game_status === 'waiting' && inviterProfile) {
              return {
                ...invitation,
                room_code: room.room_code,
                inviter_profile: inviterProfile,
              };
            }
            return null;
          })
          .filter(Boolean) as MultiplayerInvitation[];

        setInvitations(invitationsWithProfiles);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Accept invitation
  const acceptInvitation = async (invitation: MultiplayerInvitation) => {
    try {
      // Update invitation status
      const { error: updateError } = await supabase
        .from("multiplayer_invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Join the room
      const { error: joinError } = await supabase
        .from("multiplayer_rooms")
        .update({ guest_id: user?.id })
        .eq("id", invitation.room_id)
        .eq("game_status", "waiting")
        .is("guest_id", null);

      if (joinError) {
        // Revert invitation status if room join failed
        await supabase
          .from("multiplayer_invitations")
          .update({ status: "pending" })
          .eq("id", invitation.id);
        
        toast({
          title: "Sala indisponível",
          description: "A sala já está cheia ou o jogo já começou",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Convite aceito!",
        description: "Entrando na sala do seu amigo...",
      });

      onJoinRoom(invitation.room_id);
      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite",
        variant: "destructive",
      });
    }
  };

  // Decline invitation
  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("multiplayer_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Convite recusado",
        description: "O convite foi recusado",
      });

      fetchInvitations(); // Refresh the list
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível recusar o convite",
        variant: "destructive",
      });
    }
  };

  // Listen for real-time invitation updates
  useEffect(() => {
    if (!user) return;

    fetchInvitations();

    const channel = supabase
      .channel('invitation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'multiplayer_invitations',
          filter: `invited_id=eq.${user.id}`,
        },
        () => {
          fetchInvitations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5 text-primary" />
          Convites Recebidos
          <Badge variant="secondary" className="ml-auto">
            {invitations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map((invitation) => (
          <Card key={invitation.id} className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={invitation.inviter_profile.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {invitation.inviter_profile.display_name || "Jogador"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Te convidou para jogar • Sala: {invitation.room_code}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(invitation.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => acceptInvitation(invitation)}
                    className="gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => declineInvitation(invitation.id)}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" />
                    Recusar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};