import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { withRetry } from "@/utils/retryWrapper";

interface QueuedAction {
  id: string;
  type: "answer" | "join_room" | "update_score" | "start_game";
  data: any;
  timestamp: number;
  retries: number;
}

interface OfflineData {
  actions: QueuedAction[];
  lastSyncAttempt: Date | null;
}

interface UseOfflineMultiplayerOptions {
  autoSync?: boolean;
  syncInterval?: number;
  maxOfflineActions?: number;
}

export const useOfflineMultiplayer = (
  roomId?: string,
  options: UseOfflineMultiplayerOptions = {}
) => {
  const {
    autoSync = true,
    syncInterval = 10000,
    maxOfflineActions = 50,
  } = options;

  const [offlineActions, setOfflineActions] = useState<QueuedAction[]>([]);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Get offline data from localStorage
  const getOfflineData = useCallback((): OfflineData => {
    try {
      const stored = localStorage.getItem(`offline_multiplayer_${roomId || "default"}`);
      return stored ? JSON.parse(stored) : { actions: [], lastSyncAttempt: null };
    } catch {
      return { actions: [], lastSyncAttempt: null };
    }
  }, [roomId]);

  // Save offline data to localStorage
  const saveOfflineData = useCallback((data: OfflineData) => {
    try {
      localStorage.setItem(`offline_multiplayer_${roomId || "default"}`, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save offline data:", error);
    }
  }, [roomId]);

  // Queue an action for offline execution
  const queueAction = useCallback((
    type: QueuedAction["type"],
    data: any
  ) => {
    const action: QueuedAction = {
      id: `${Date.now()}_${Math.random()}`,
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    setOfflineActions(prev => {
      const updated = [...prev, action];
      
      // Limit number of offline actions
      if (updated.length > maxOfflineActions) {
        updated.splice(0, updated.length - maxOfflineActions);
      }
      
      saveOfflineData({
        actions: updated,
        lastSyncAttempt,
      });
      
      return updated;
    });
  }, [lastSyncAttempt, maxOfflineActions, saveOfflineData]);

  // Execute a single action
  const executeAction = useCallback(async (action: QueuedAction): Promise<void> => {
    const { type, data } = action;

    const operations = {
      answer: async () => {
        await supabase
          .from("multiplayer_answers")
          .insert({
            room_id: roomId,
            user_id: data.userId,
            question_id: data.questionId,
            answer_index: data.answerIndex,
            is_correct: data.isCorrect,
            time_spent: data.timeSpent,
          });
      },
      
      join_room: async () => {
        await supabase
          .from("multiplayer_rooms")
          .update({ guest_id: data.userId })
          .eq("id", roomId);
      },
      
      update_score: async () => {
        await supabase
          .from("multiplayer_rooms")
          .update(data.scoreField === "host_score" 
            ? { host_score: data.score }
            : { guest_score: data.score }
          )
          .eq("id", roomId);
      },
      
      start_game: async () => {
        await supabase
          .from("multiplayer_rooms")
          .update({
            game_status: "playing",
            current_question_id: data.questionId,
            question_start_time: new Date().toISOString(),
          })
          .eq("id", roomId);
      },
    };

    const operation = operations[type];
    if (operation) {
      await withRetry(operation, {
        maxRetries: 3,
        delay: 1000,
        onRetry: (attempt, error) => {
          console.warn(`Retry ${attempt} for action ${action.id}:`, error);
        },
      });
    } else {
      throw new Error(`Unknown action type: ${type}`);
    }
  }, [roomId]);

  // Sync all pending actions
  const syncPendingActions = useCallback(async () => {
    if (isSyncing || offlineActions.length === 0) return;

    setIsSyncing(true);
    setLastSyncAttempt(new Date());

    try {
      const successfulActions: string[] = [];

      for (const action of offlineActions) {
        try {
          await executeAction(action);
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          action.retries += 1;
          
          // Remove if too many retries
          if (action.retries >= 3) {
            successfulActions.push(action.id); // Remove failed action
          }
        }
      }

      // Remove successfully synced actions
      if (successfulActions.length > 0) {
        setOfflineActions(prev => {
          const updated = prev.filter(action => !successfulActions.includes(action.id));
          saveOfflineData({
            actions: updated,
            lastSyncAttempt: new Date(),
          });
          return updated;
        });
      }

    } catch (error) {
      console.error("Failed to sync pending actions:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, offlineActions, executeAction, saveOfflineData]);

  // Auto-sync when connection is restored
  useEffect(() => {
    if (!autoSync || offlineActions.length === 0) return;

    const checkConnectionAndSync = async () => {
      try {
        // Simple connection test
        await supabase.from("profiles").select("id").limit(1);
        
        // If we reach here, we're connected
        if (lastSyncAttempt) {
          const timeSinceLastSync = Date.now() - lastSyncAttempt.getTime();
          if (timeSinceLastSync > syncInterval) {
            await syncPendingActions();
          }
        }
      } catch {
        // Connection failed, skip auto-sync
      }
    };

    checkConnectionAndSync();
    
    // Set up interval for periodic sync attempts
    let intervalId: NodeJS.Timeout;
    
    if (isOnline()) {
      intervalId = setInterval(syncPendingActions, syncInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoSync, offlineActions.length, lastSyncAttempt, syncInterval, syncPendingActions]);

  // Initialize offline actions from localStorage
  useEffect(() => {
    const savedData = getOfflineData();
    setOfflineActions(savedData.actions || []);
    setLastSyncAttempt(savedData.lastSyncAttempt ? new Date(savedData.lastSyncAttempt) : null);
  }, [getOfflineData]);

  // Simple online detection
  const isOnline = useCallback(() => navigator.onLine, []);

  return {
    queueAction,
    syncPendingActions,
    offlineActions,
    lastSyncAttempt,
    isSyncing,
    isOnline: isOnline(),
  };
};
