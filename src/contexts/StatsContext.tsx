import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserStats {
  // Perfil básico
  totalScore: number;
  gamesPlayed: number;
  bestStreak: number;
  gamesWon: number;
  gamesLost: number;

  // Multiplayer
  multiplayerWins: number;
  multiplayerLosses: number;

  // Modos de jogo
  speedGamesPlayed: number;
  normalGamesPlayed: number;

  // Estatísticas calculadas
  averageScore: number;
  winPercentage: number;

  // Conquistas e personagens
  achievementsUnlocked: number;
  totalAchievements: number;
  charactersUnlocked: number;
  totalCharacters: number;

  // Amigos
  friendsCount: number;
  pendingInvites: number; // Multiplayer invites recebidos
  pendingFriendRequests: number; // Pedidos de amizade recebidos

  // Performance por categoria
  categoryStats: Record<
    string,
    {
      questionsAnswered: number;
      correctAnswers: number;
      accuracy: number;
      bestStreak: number;
    }
  >;
}

interface StatsContextType {
  stats: UserStats | null;
  loading: boolean;
  refreshStats: () => Promise<void>;
  updateStats: (updates: Partial<UserStats>) => void;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar estatísticas do perfil
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar conquistas
      const { data: achievements, error: achievementsError } = await supabase
        .from("user_achievements")
        .select(
          `
          id,
          is_completed,
          achievement:achievements(id)
        `
        )
        .eq("user_id", user.id);

      if (achievementsError) throw achievementsError;

      // Buscar total de conquistas disponíveis
      const { data: totalAchievements, error: totalAchievementsError } =
        await supabase.from("achievements").select("id").eq("is_hidden", false);

      if (totalAchievementsError) throw totalAchievementsError;

      // Buscar personagens
      const { data: characters, error: charactersError } = await supabase
        .from("user_characters")
        .select("id")
        .eq("user_id", user.id);

      if (charactersError) throw charactersError;

      // Buscar total de personagens disponíveis
      const { data: totalCharacters, error: totalCharactersError } =
        await supabase.from("characters").select("id");

      if (totalCharactersError) throw totalCharactersError;

      // Buscar amigos
      const { data: friends, error: friendsError } = await supabase
        .from("friendships")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (friendsError) throw friendsError;

      // Buscar convites pendentes
      const { data: pendingInvites, error: invitesError } = await supabase
        .from("multiplayer_invitations")
        .select("id")
        .eq("invited_id", user.id)
        .eq("status", "pending");

      if (invitesError) throw invitesError;

      // Buscar pedidos de amizade pendentes (recebidos)
      const { data: pendingFriendRequests, error: friendRequestsError } =
        await supabase
          .from("friendships")
          .select("id")
          .eq("friend_id", user.id)
          .eq("status", "pending");

      if (friendRequestsError) throw friendRequestsError;

      // Buscar estatísticas por categoria
      const { data: categoryStats, error: categoryStatsError } = await supabase
        .from("category_performance")
        .select("*")
        .eq("user_id", user.id);

      if (categoryStatsError) throw categoryStatsError;

      // Processar estatísticas por categoria
      const categoryStatsMap: Record<string, any> = {};
      categoryStats?.forEach((stat) => {
        categoryStatsMap[stat.category] = {
          questionsAnswered: stat.questions_answered,
          correctAnswers: stat.correct_answers,
          accuracy: stat.accuracy_percentage,
          bestStreak: stat.best_streak,
        };
      });

      const userStats: UserStats = {
        totalScore: profile?.total_score || 0,
        gamesPlayed: profile?.games_played || 0,
        bestStreak: profile?.best_streak || 0,
        gamesWon: profile?.games_won || 0,
        gamesLost: profile?.games_lost || 0,
        multiplayerWins: profile?.multiplayer_wins || 0,
        multiplayerLosses: profile?.multiplayer_losses || 0,
        speedGamesPlayed: profile?.speed_games_played || 0,
        normalGamesPlayed: profile?.normal_games_played || 0,
        averageScore: profile?.average_score || 0,
        winPercentage: profile?.win_percentage || 0,
        achievementsUnlocked:
          achievements?.filter((a) => a.is_completed).length || 0,
        totalAchievements: totalAchievements?.length || 0,
        charactersUnlocked: characters?.length || 0,
        totalCharacters: totalCharacters?.length || 0,
        friendsCount: friends?.length || 0,
        pendingInvites: pendingInvites?.length || 0,
        pendingFriendRequests: pendingFriendRequests?.length || 0,
        categoryStats: categoryStatsMap,
      };

      setStats(userStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setStats((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const value = {
    stats,
    loading,
    refreshStats,
    updateStats,
  };

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
};

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
};
