import { useState, useEffect, useCallback } from "react";
import { useToast } from "./use-toast";

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true,
  });
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    if ("Notification" in window) {
      setIsSupported(true);
      updatePermissionStatus();
    }
  }, []);

  const updatePermissionStatus = useCallback(() => {
    if (!("Notification" in window)) return;

    const permissionStatus = Notification.permission;
    setPermission({
      granted: permissionStatus === "granted",
      denied: permissionStatus === "denied",
      default: permissionStatus === "default",
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "Notificações não suportadas",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      updatePermissionStatus();

      if (permission === "granted") {
        toast({
          title: "Notificações ativadas!",
          description:
            "Você receberá notificações sobre convites multiplayer e atualizações.",
        });
        return true;
      } else {
        toast({
          title: "Notificações negadas",
          description:
            "Você pode ativar as notificações nas configurações do navegador.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Erro ao solicitar permissão",
        description: "Não foi possível solicitar permissão para notificações.",
        variant: "destructive",
      });
      return false;
    }
  }, [isSupported, toast, updatePermissionStatus]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!permission.granted) {
        console.warn("Notifications not granted");
        return;
      }

      try {
        const notification = new Notification(title, {
          icon: "/Brain-Bolt-Logo.png",
          badge: "/Brain-Bolt-Logo.png",
          requireInteraction: true,
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [permission.granted]
  );

  const showMultiplayerInvite = useCallback(
    (inviterName: string, roomCode: string) => {
      return showNotification(`Convite de ${inviterName}`, {
        body: `Você foi convidado para uma partida multiplayer! Código: ${roomCode}`,
        tag: `multiplayer-invite-${roomCode}`,
        data: {
          type: "multiplayer-invite",
          roomCode,
          inviterName,
        },
      });
    },
    [showNotification]
  );

  const showGameUpdate = useCallback(
    (
      message: string,
      type: "achievement" | "level-up" | "friend-activity" = "achievement"
    ) => {
      const titles = {
        achievement: "🏆 Nova Conquista!",
        "level-up": "⭐ Level Up!",
        "friend-activity": "👥 Atividade de Amigo",
      };

      return showNotification(titles[type], {
        body: message,
        tag: `game-update-${type}`,
        data: {
          type: "game-update",
          updateType: type,
        },
      });
    },
    [showNotification]
  );

  const showOfflineNotification = useCallback(() => {
    return showNotification("Modo Offline Ativado", {
      body: "Você está offline. Algumas funcionalidades podem estar limitadas.",
      tag: "offline-mode",
      data: {
        type: "offline-mode",
      },
    });
  }, [showNotification]);

  const showOnlineNotification = useCallback(() => {
    return showNotification("Conectado Novamente", {
      body: "Você está online! Todas as funcionalidades foram restauradas.",
      tag: "online-mode",
      data: {
        type: "online-mode",
      },
    });
  }, [showNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    showMultiplayerInvite,
    showGameUpdate,
    showOfflineNotification,
    showOnlineNotification,
    updatePermissionStatus,
  };
};
