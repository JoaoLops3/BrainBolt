import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import {
  LocalNotifications,
  PermissionStatus,
} from "@capacitor/local-notifications";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  dailyReminders: boolean;
  achievements: boolean;
  friendsActivity: boolean;
  gameUpdates: boolean;
  marketingUpdates: boolean;
}

interface NativeNotificationHook {
  isSupported: boolean;
  permission: "granted" | "denied" | "default";
  settings: NotificationSettings;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  sendLocalNotification: (
    title: string,
    body: string,
    options?: { tag?: string; requireInteraction?: boolean }
  ) => Promise<void>;
  scheduleDaily: (hour: number, minute: number) => Promise<void>;
  clearScheduled: () => Promise<void>;
  testNotifications: () => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminders: true,
  achievements: true,
  friendsActivity: false,
  gameUpdates: false,
  marketingUpdates: false,
};

export const useNativeNotifications = (): NativeNotificationHook => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isSupported] = useState(
    () => Capacitor.isNativePlatform() || "Notification" in window
  );
  const [permission, setPermission] = useState<
    "granted" | "denied" | "default"
  >("default");
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isNative] = useState(() => Capacitor.isNativePlatform());

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "brainbolt-notification-settings"
    );
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
  }, []);

  // Verificar permissão atual
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (isNative) {
          const status = await LocalNotifications.checkPermissions();
          setPermission(status.display);
        } else {
          setPermission(Notification.permission);
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        setPermission("denied");
      }
    };

    if (isSupported) {
      checkPermission();
    }
  }, [isSupported, isNative]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    setIsLoading(true);
    try {
      if (isNative) {
        // Capacitor (iOS/Android)
        const status = await LocalNotifications.requestPermissions();
        const granted = status.display === "granted";
        setPermission(status.display);

        if (granted) {
          toast({
            title: "✅ Notificações ativadas!",
            description: "Você receberá lembretes e conquistas.",
          });
        } else {
          toast({
            title: "❌ Permissão negada",
            description: "Você pode ativar nas configurações do sistema.",
            variant: "destructive",
          });
        }

        return granted;
      } else {
        // Web (fallback)
        const result = await Notification.requestPermission();
        setPermission(result);

        if (result === "granted") {
          toast({
            title: "✅ Notificações ativadas!",
            description: "Você receberá lembretes e conquistas.",
          });
        } else {
          toast({
            title: "❌ Permissão negada",
            description: "Você pode ativar nas configurações do navegador.",
            variant: "destructive",
          });
        }

        return result === "granted";
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      toast({
        title: "❌ Erro nas notificações",
        description: "Não foi possível configurar as notificações.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isNative, toast]);

  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      localStorage.setItem(
        "brainbolt-notification-settings",
        JSON.stringify(updatedSettings)
      );

      toast({
        title: "⚙️ Configurações salvas",
        description: "Suas preferências foram atualizadas.",
      });
    },
    [settings, toast]
  );

  const sendLocalNotification = useCallback(
    async (
      title: string,
      body: string,
      options: { tag?: string; requireInteraction?: boolean } = {}
    ) => {
      if (permission !== "granted") return;

      try {
        if (isNative) {
          // Capacitor - Notificação nativa
          await LocalNotifications.schedule({
            notifications: [
              {
                title,
                body,
                id: Date.now(),
                largeIcon: "res://drawable/ic_launcher",
                smallIcon: "res://drawable/ic_stat_icon_config_sample",
                iconColor: "#8B5CF6",
                extra: {
                  tag: options.tag || "default",
                },
              },
            ],
          });
        } else {
          // Web - Fallback
          new Notification(title, {
            body,
            icon: "/Brain-Bolt-Logo.png",
            tag: options.tag,
            requireInteraction: options.requireInteraction,
          });
        }
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
      }
    },
    [permission, isNative]
  );

  const scheduleDaily = useCallback(
    async (hour: number, minute: number) => {
      if (permission !== "granted" || !isNative) return;

      try {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // Se o horário já passou hoje, agendar para amanhã
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        await LocalNotifications.schedule({
          notifications: [
            {
              title: "🎯 Brain Bolt",
              body: "Hora de exercitar sua mente!",
              id: hour * 100 + minute, // ID único baseado no horário
              schedule: {
                at: scheduledTime,
                repeats: true,
                every: "day",
              },
              largeIcon: "res://drawable/ic_launcher",
              smallIcon: "res://drawable/ic_stat_icon_config_sample",
              iconColor: "#8B5CF6",
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao agendar notificação:", error);
      }
    },
    [permission, isNative]
  );

  const clearScheduled = useCallback(async () => {
    if (!isNative) return;

    try {
      const pending = await LocalNotifications.getPending();
      const ids = pending.notifications.map((n) => n.id);

      if (ids.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications,
        });
      }
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  }, [isNative]);

  const testNotifications = useCallback(async () => {
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }

    const testMessages = [
      {
        title: "☀️ Bom dia!",
        body: "Comece o dia com um quiz matinal!",
      },
      {
        title: "🌞 Pausa para o almoço?",
        body: "Que tal um quiz rápido antes de comer?",
      },
      {
        title: "🌆 Boa noite!",
        body: "Relaxe com um quiz antes de dormir!",
      },
    ];

    testMessages.forEach((msg, index) => {
      setTimeout(() => {
        sendLocalNotification(msg.title, msg.body, {
          tag: `test-${index}`,
          requireInteraction: false,
        });
      }, index * 2000); // 2 segundos entre cada notificação
    });

    toast({
      title: "🧪 Teste iniciado!",
      description: "Você verá 3 notificações nos próximos segundos.",
    });
  }, [permission, requestPermission, sendLocalNotification, toast]);

  return {
    isSupported,
    permission,
    settings,
    isLoading,
    requestPermission,
    updateSettings,
    sendLocalNotification,
    scheduleDaily,
    clearScheduled,
    testNotifications,
  };
};
