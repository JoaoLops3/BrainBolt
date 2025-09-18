import { useState, useEffect, useCallback } from "react";
import { useNotifications } from "./useNotifications";

interface OfflineData {
  gameSessions: any[];
  multiplayerInvites: any[];
  pendingActions: any[];
}

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    gameSessions: [],
    multiplayerInvites: [],
    pendingActions: [],
  });
  const { showOfflineNotification, showOnlineNotification } =
    useNotifications();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showOnlineNotification();
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showOfflineNotification();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showOfflineNotification, showOnlineNotification]);

  const loadOfflineData = useCallback(() => {
    try {
      const stored = localStorage.getItem("perguntados-offline-data");
      if (stored) {
        const data = JSON.parse(stored);
        setOfflineData(data);
      }
    } catch (error) {
      console.error("Error loading offline data:", error);
    }
  }, []);

  const saveOfflineData = useCallback((data: OfflineData) => {
    try {
      localStorage.setItem("perguntados-offline-data", JSON.stringify(data));
      setOfflineData(data);
    } catch (error) {
      console.error("Error saving offline data:", error);
    }
  }, []);

  const addOfflineGameSession = useCallback(
    (gameSession: any) => {
      const newData = {
        ...offlineData,
        gameSessions: [
          ...offlineData.gameSessions,
          {
            ...gameSession,
            id: `offline-${Date.now()}`,
            isOffline: true,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      saveOfflineData(newData);
    },
    [offlineData, saveOfflineData]
  );

  const addOfflineMultiplayerInvite = useCallback(
    (invite: any) => {
      const newData = {
        ...offlineData,
        multiplayerInvites: [
          ...offlineData.multiplayerInvites,
          {
            ...invite,
            id: `offline-invite-${Date.now()}`,
            isOffline: true,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      saveOfflineData(newData);
    },
    [offlineData, saveOfflineData]
  );

  const addPendingAction = useCallback(
    (action: any) => {
      const newData = {
        ...offlineData,
        pendingActions: [
          ...offlineData.pendingActions,
          {
            ...action,
            id: `pending-${Date.now()}`,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      saveOfflineData(newData);
    },
    [offlineData, saveOfflineData]
  );

  const syncOfflineData = useCallback(async () => {
    if (!isOnline) return;

    try {
      // Sync game sessions
      for (const session of offlineData.gameSessions) {
        if (session.isOffline) {
          try {
            // Simulate API call - replace with actual API
            console.log("Syncing game session:", session);
            // await syncGameSession(session);
          } catch (error) {
            console.error("Error syncing game session:", error);
          }
        }
      }

      // Sync multiplayer invites
      for (const invite of offlineData.multiplayerInvites) {
        if (invite.isOffline) {
          try {
            // Simulate API call - replace with actual API
            console.log("Syncing multiplayer invite:", invite);
            // await syncMultiplayerInvite(invite);
          } catch (error) {
            console.error("Error syncing multiplayer invite:", error);
          }
        }
      }

      // Sync pending actions
      for (const action of offlineData.pendingActions) {
        try {
          // Simulate API call - replace with actual API
          console.log("Syncing pending action:", action);
          // await syncPendingAction(action);
        } catch (error) {
          console.error("Error syncing pending action:", error);
        }
      }

      // Clear synced data
      const clearedData = {
        gameSessions: [],
        multiplayerInvites: [],
        pendingActions: [],
      };
      saveOfflineData(clearedData);
    } catch (error) {
      console.error("Error syncing offline data:", error);
    }
  }, [isOnline, offlineData, saveOfflineData]);

  const getOfflineGameSessions = useCallback(() => {
    return offlineData.gameSessions.filter((session) => session.isOffline);
  }, [offlineData.gameSessions]);

  const getOfflineMultiplayerInvites = useCallback(() => {
    return offlineData.multiplayerInvites.filter((invite) => invite.isOffline);
  }, [offlineData.multiplayerInvites]);

  const getPendingActions = useCallback(() => {
    return offlineData.pendingActions;
  }, [offlineData.pendingActions]);

  const clearOfflineData = useCallback(() => {
    const clearedData = {
      gameSessions: [],
      multiplayerInvites: [],
      pendingActions: [],
    };
    saveOfflineData(clearedData);
  }, [saveOfflineData]);

  const canPlayOffline = useCallback(() => {
    // Check if we have enough offline data to play
    return (
      offlineData.gameSessions.length > 0 ||
      localStorage.getItem("perguntados-questions-cache") !== null
    );
  }, [offlineData.gameSessions]);

  const getOfflineStats = useCallback(() => {
    return {
      totalOfflineSessions: offlineData.gameSessions.length,
      totalOfflineInvites: offlineData.multiplayerInvites.length,
      totalPendingActions: offlineData.pendingActions.length,
      canPlayOffline: canPlayOffline(),
    };
  }, [offlineData, canPlayOffline]);

  return {
    isOnline,
    offlineData,
    addOfflineGameSession,
    addOfflineMultiplayerInvite,
    addPendingAction,
    syncOfflineData,
    getOfflineGameSessions,
    getOfflineMultiplayerInvites,
    getPendingActions,
    clearOfflineData,
    canPlayOffline,
    getOfflineStats,
  };
};
