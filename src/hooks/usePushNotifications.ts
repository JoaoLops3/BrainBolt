import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  dailyReminders: boolean;
  achievements: boolean;
  friendsActivity: boolean;
  gameUpdates: boolean;
  marketingUpdates: boolean;
}

interface PushNotificationHook {
  isSupported: boolean;
  permission: NotificationPermission;
  settings: NotificationSettings;
  isLoading: boolean;
  requestPermission: () => Promise<boolean>;
  updateSettings: (newSettings: Partial<NotificationSettings>) => Promise<void>;
  sendLocalNotification: (
    title: string,
    body: string,
    options?: NotificationOptions
  ) => void;
  scheduleDaily: (hour: number, minute: number) => void;
  clearScheduled: () => void;
  testNotifications: () => void;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReminders: true,
  achievements: true,
  friendsActivity: false,
  gameUpdates: false,
  marketingUpdates: false,
};

export const usePushNotifications = (): PushNotificationHook => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isSupported] = useState(() => "Notification" in window);
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : "denied"
  );
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem(
      "brainbolt-notification-settings"
    );
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error("Erro ao carregar configurações de notificação:", error);
      }
    }
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = useCallback((newSettings: NotificationSettings) => {
    localStorage.setItem(
      "brainbolt-notification-settings",
      JSON.stringify(newSettings)
    );
    setSettings(newSettings);
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast({
        title: "❌ Não suportado",
        description: "Seu navegador não suporta notificações.",
        variant: "destructive",
      });
      return false;
    }

    if (permission === "granted") {
      return true;
    }

    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast({
          title: "🔔 Notificações ativadas!",
          description: "Você receberá lembretes para jogar.",
        });
        return true;
      } else {
        toast({
          title: "❌ Permissão negada",
          description:
            "Ative nas configurações do navegador para receber notificações.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao solicitar permissão:", error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, toast]);

  // Atualizar configurações
  const updateSettings = useCallback(
    async (newSettings: Partial<NotificationSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      saveSettings(updatedSettings);

      toast({
        title: "✅ Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    },
    [settings, saveSettings, toast]
  );

  // Enviar notificação local
  const sendLocalNotification = useCallback(
    (title: string, body: string, options: NotificationOptions = {}) => {
      if (!isSupported || permission !== "granted") {
        return;
      }

      const notification = new Notification(title, {
        body,
        icon: "/Brain-Bolt-Logo.png",
        badge: "/Brain-Bolt-Logo.png",
        tag: "brainbolt-notification",
        requireInteraction: false,
        silent: false,
        ...options,
      });

      // Auto-fechar após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Focar na aba quando clicar na notificação
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    },
    [isSupported, permission]
  );

  // Agendar múltiplas notificações diárias
  const scheduleMultipleDaily = useCallback(() => {
    if (!settings.dailyReminders || permission !== "granted") {
      return;
    }

    // Limpar agendamentos anteriores
    clearScheduled();

    const scheduleTimeSlots = [
      {
        hour: 7,
        minute: 0,
        message: "☀️ Bom dia! Que tal começar o dia exercitando o cérebro?",
      },
      {
        hour: 12,
        minute: 0,
        message: "🍽️ Pausa para o almoço! Que tal uma partida rápida?",
      },
      {
        hour: 19,
        minute: 0,
        message: "🌙 Boa noite! Hora de relaxar com um quiz!",
      },
    ];

    const timeoutIds: number[] = [];

    scheduleTimeSlots.forEach(({ hour, minute, message }, index) => {
      const scheduleNotification = () => {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // Se já passou do horário hoje, agendar para amanhã
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        const msUntilNotification = scheduledTime.getTime() - now.getTime();

        const timeoutId = setTimeout(() => {
          sendLocalNotification("🧠 Brain Bolt te chama!", message, {
            tag: `daily-reminder-${hour}`,
            requireInteraction: true,
          });

          // Reagendar para o próximo dia
          scheduleMultipleDaily();
        }, msUntilNotification);

        timeoutIds.push(timeoutId as unknown as number);
      };

      scheduleNotification();
    });

    // Salvar IDs dos timeouts para poder cancelar depois
    localStorage.setItem(
      "brainbolt-daily-reminder-ids",
      JSON.stringify(timeoutIds)
    );
  }, [settings.dailyReminders, permission, sendLocalNotification]);

  // Manter compatibilidade com função antiga (agora chama a múltipla)
  const scheduleDaily = useCallback(
    (hour: number, minute: number) => {
      scheduleMultipleDaily();
    },
    [scheduleMultipleDaily]
  );

  // Limpar notificações agendadas
  const clearScheduled = useCallback(() => {
    // Limpar timeouts múltiplos (novo sistema)
    const timeoutIdsStr = localStorage.getItem("brainbolt-daily-reminder-ids");
    if (timeoutIdsStr) {
      try {
        const timeoutIds: number[] = JSON.parse(timeoutIdsStr);
        timeoutIds.forEach((id) => clearTimeout(id));
        localStorage.removeItem("brainbolt-daily-reminder-ids");
      } catch (error) {
        console.error("Erro ao limpar timeouts múltiplos:", error);
      }
    }

    // Limpar timeout único (sistema antigo - compatibilidade)
    const singleTimeoutId = localStorage.getItem("brainbolt-daily-reminder-id");
    if (singleTimeoutId) {
      clearTimeout(parseInt(singleTimeoutId));
      localStorage.removeItem("brainbolt-daily-reminder-id");
    }
  }, []);

  // Configurar lembretes diários quando as configurações mudarem
  useEffect(() => {
    if (settings.dailyReminders && permission === "granted") {
      // Agendar para múltiplos horários (7h, 12h, 19h)
      scheduleMultipleDaily();
    } else {
      clearScheduled();
    }

    return () => {
      clearScheduled();
    };
  }, [
    settings.dailyReminders,
    permission,
    scheduleMultipleDaily,
    clearScheduled,
  ]);

  // Função de teste para demonstrar as notificações
  const testNotifications = useCallback(() => {
    if (permission !== "granted") {
      requestPermission();
      return;
    }

    const testMessages = [
      {
        title: "☀️ Teste - Manhã",
        body: "Bom dia! Que tal começar o dia exercitando o cérebro?",
      },
      {
        title: "🍽️ Teste - Almoço",
        body: "Pausa para o almoço! Que tal uma partida rápida?",
      },
      {
        title: "🌙 Teste - Noite",
        body: "Boa noite! Hora de relaxar com um quiz!",
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
  }, [permission, requestPermission, sendLocalNotification]);

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
    testNotifications, // Função de teste
  };
};
