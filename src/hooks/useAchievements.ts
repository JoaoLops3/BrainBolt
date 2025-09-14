import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
}

interface Character {
  id: string;
  name: string;
  category: string;
  rarity: string;
}

interface NotificationData {
  type: "achievement" | "character";
  achievement?: Achievement;
  character?: Character;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [previousAchievements, setPreviousAchievements] = useState<Set<string>>(new Set());
  const [previousCharacters, setPreviousCharacters] = useState<Set<string>>(new Set());

  // Load initial state
  const loadInitialState = useCallback(async () => {
    if (!user) return;

    try {
      // Load user achievements
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (achievements) {
        setPreviousAchievements(new Set(achievements.map(a => a.achievement_id)));
      }

      // Load user characters
      const { data: characters } = await supabase
        .from("user_characters")
        .select("character_id")
        .eq("user_id", user.id);

      if (characters) {
        setPreviousCharacters(new Set(characters.map(c => c.character_id)));
      }
    } catch (error) {
      console.error("Error loading initial achievements state:", error);
    }
  }, [user]);

  // Check for new achievements
  const checkForNewUnlocks = useCallback(async () => {
    if (!user) return;

    try {
      // Check for new achievements
      const { data: currentAchievements } = await supabase
        .from("user_achievements")
        .select(`
          achievement_id,
          achievement:achievements(*)
        `)
        .eq("user_id", user.id)
        .eq("is_completed", true);

      if (currentAchievements) {
        const currentAchievementIds = new Set(currentAchievements.map(a => a.achievement_id));
        
        // Find newly unlocked achievements
        const newAchievements = currentAchievements.filter(a => 
          !previousAchievements.has(a.achievement_id)
        );

        if (newAchievements.length > 0) {
          // Show notification for the most recent achievement
          const latestAchievement = newAchievements[0];
          setNotification({
            type: "achievement",
            achievement: latestAchievement.achievement,
          });
        }

        setPreviousAchievements(currentAchievementIds);
      }

      // Check for new characters
      const { data: currentCharacters } = await supabase
        .from("user_characters")
        .select(`
          character_id,
          character:characters(*)
        `)
        .eq("user_id", user.id);

      if (currentCharacters) {
        const currentCharacterIds = new Set(currentCharacters.map(c => c.character_id));
        
        // Find newly unlocked characters
        const newCharacters = currentCharacters.filter(c => 
          !previousCharacters.has(c.character_id)
        );

        if (newCharacters.length > 0 && !notification) {
          // Show notification for the most recent character (only if no achievement notification)
          const latestCharacter = newCharacters[0];
          setNotification({
            type: "character",
            character: latestCharacter.character,
          });
        }

        setPreviousCharacters(currentCharacterIds);
      }
    } catch (error) {
      console.error("Error checking for new unlocks:", error);
    }
  }, [user, previousAchievements, previousCharacters, notification]);

  // Initialize state when user logs in
  useEffect(() => {
    if (user) {
      loadInitialState();
    }
  }, [user, loadInitialState]);

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return;

    const achievementsChannel = supabase
      .channel('user-achievements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Delay check to ensure transaction is complete
          setTimeout(checkForNewUnlocks, 1000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setTimeout(checkForNewUnlocks, 1000);
        }
      )
      .subscribe();

    const charactersChannel = supabase
      .channel('user-characters-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_characters',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setTimeout(checkForNewUnlocks, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(charactersChannel);
    };
  }, [user, checkForNewUnlocks]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    clearNotification,
  };
};