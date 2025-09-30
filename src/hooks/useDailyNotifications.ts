import { useEffect } from "react";
import { useNativeNotifications } from "./useNativeNotifications";

export const useDailyNotifications = () => {
  const { sendLocalNotification, permission, settings } =
    useNativeNotifications();

  useEffect(() => {
    if (permission !== "granted" || !settings.dailyReminders) return;

    const scheduleDailyNotifications = () => {
      const now = new Date();
      const notifications = [
        {
          hour: 9,
          minute: 0,
          title: "☀️ Bom dia!",
          body: "Comece o dia exercitando seu cérebro! 🧠",
          tag: "morning",
        },
        {
          hour: 14,
          minute: 0,
          title: "🌞 Pausa para o Quiz?",
          body: "Que tal uma pausa inteligente? Jogue Brain Bolt! 🎯",
          tag: "afternoon",
        },
        {
          hour: 19,
          minute: 0,
          title: "🌆 Fim de tarde!",
          body: "Relaxe com um quiz. Seu cérebro agradece! ⭐",
          tag: "evening",
        },
        {
          hour: 21,
          minute: 30,
          title: "🌙 Antes de dormir...",
          body: "Uma última partida para exercitar a mente! 🎮",
          tag: "night",
        },
      ];

      notifications.forEach(({ hour, minute, title, body, tag }) => {
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);

        // Se o horário já passou hoje, agendar para amanhã
        if (targetTime <= now) {
          targetTime.setDate(targetTime.getDate() + 1);
        }

        const timeUntilNotification = targetTime.getTime() - now.getTime();

        setTimeout(() => {
          sendLocalNotification(title, body, {
            tag,
            requireInteraction: false,
            icon: "/Brain-Bolt-Logo.png",
          });

          // Reagendar para o próximo dia
          setInterval(() => {
            sendLocalNotification(title, body, {
              tag,
              requireInteraction: false,
              icon: "/Brain-Bolt-Logo.png",
            });
          }, 24 * 60 * 60 * 1000); // A cada 24 horas
        }, timeUntilNotification);
      });
    };

    // Notificações especiais de fim de semana
    const scheduleWeekendNotifications = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();

      // Sábado (6) e Domingo (0)
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        const weekendMessages = [
          {
            title: "🎉 Fim de semana!",
            body: "Tempo livre? Que tal desafiar sua mente! 🧩",
            delay: 2 * 60 * 60 * 1000, // 2 horas
          },
          {
            title: "⚡ Está entediado?",
            body: "Brain Bolt tem perguntas incríveis esperando! 🌟",
            delay: 6 * 60 * 60 * 1000, // 6 horas
          },
        ];

        weekendMessages.forEach(({ title, body, delay }) => {
          setTimeout(() => {
            sendLocalNotification(title, body, {
              tag: "weekend-special",
              requireInteraction: false,
            });
          }, delay);
        });
      }
    };

    // Notificações motivacionais aleatórias
    const scheduleRandomMotivation = () => {
      const motivationalMessages = [
        {
          title: "🏆 Você é incrível!",
          body: "Cada pergunta te torna mais inteligente. Continue! 💪",
        },
        {
          title: "🎯 Desafio aceito?",
          body: "Que categoria você vai dominar hoje? 🤔",
        },
        {
          title: "🧠 Exercite sua mente!",
          body: "5 minutos de quiz fazem toda diferença! ⏰",
        },
        {
          title: "⚡ Momento Quiz!",
          body: "Sua inteligência está esperando para brilhar! ✨",
        },
        {
          title: "🌟 Seja o expert!",
          body: "Domine todas as categorias no Brain Bolt! 🎓",
        },
      ];

      // Enviar uma notificação motivacional aleatória a cada 6-8 horas
      const scheduleNextMotivation = () => {
        const randomDelay = (6 + Math.random() * 2) * 60 * 60 * 1000; // 6-8 horas
        const randomMessage =
          motivationalMessages[
            Math.floor(Math.random() * motivationalMessages.length)
          ];

        setTimeout(() => {
          sendLocalNotification(randomMessage.title, randomMessage.body, {
            tag: "motivation",
            requireInteraction: false,
          });
          scheduleNextMotivation(); // Reagendar próxima
        }, randomDelay);
      };

      scheduleNextMotivation();
    };

    scheduleDailyNotifications();
    scheduleWeekendNotifications();
    scheduleRandomMotivation();
  }, [permission, settings.dailyReminders, sendLocalNotification]);

  return null;
};
