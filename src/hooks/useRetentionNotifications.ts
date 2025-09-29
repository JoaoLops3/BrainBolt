import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStats } from "@/contexts/StatsContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export const useRetentionNotifications = () => {
  const { user } = useAuth();
  const { stats } = useStats();
  const { settings, sendLocalNotification } = usePushNotifications();

  // Verificar última sessão para notificação de inatividade
  const checkInactivity = useCallback(() => {
    if (!settings.dailyReminders || !user) return;

    const lastSession = localStorage.getItem("brainbolt-last-session");
    const now = new Date();

    if (lastSession) {
      const lastSessionDate = new Date(lastSession);
      const daysSinceLastSession = Math.floor(
        (now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Se não jogou por 3 dias, enviar notificação especial
      if (daysSinceLastSession >= 3) {
        sendLocalNotification(
          "🎯 Sentimos sua falta!",
          "Que tal voltar e bater seu recorde?",
          {
            tag: "comeback",
            requireInteraction: true,
          }
        );
      }

      // Se não jogou por 7 dias, notificação mais direta
      if (daysSinceLastSession >= 7) {
        sendLocalNotification(
          "🔥 Sua streak está esperando!",
          "Não deixe seu progresso escapar. Jogue agora!",
          {
            tag: "week-inactive",
            requireInteraction: true,
          }
        );
      }
    }
  }, [settings.dailyReminders, user, sendLocalNotification]);

  // Notificação de milestone (marcos importantes)
  const checkMilestones = useCallback(() => {
    if (!settings.achievements || !stats) return;

    const { totalScore, gamesPlayed, bestStreak } = stats;

    // Marcos de pontuação
    const scoreCheckpoints = [1000, 5000, 10000, 25000, 50000, 100000];
    const lastNotifiedScore = parseInt(
      localStorage.getItem("brainbolt-last-score-milestone") || "0"
    );

    for (const checkpoint of scoreCheckpoints) {
      if (totalScore >= checkpoint && lastNotifiedScore < checkpoint) {
        sendLocalNotification(
          "🎊 Marco Atingido!",
          `Você alcançou ${checkpoint.toLocaleString()} pontos!`,
          {
            tag: "score-milestone",
            requireInteraction: true,
          }
        );
        localStorage.setItem(
          "brainbolt-last-score-milestone",
          checkpoint.toString()
        );
        break;
      }
    }

    // Marcos de jogos
    const gameCheckpoints = [10, 25, 50, 100, 250, 500];
    const lastNotifiedGames = parseInt(
      localStorage.getItem("brainbolt-last-games-milestone") || "0"
    );

    for (const checkpoint of gameCheckpoints) {
      if (gamesPlayed >= checkpoint && lastNotifiedGames < checkpoint) {
        sendLocalNotification(
          "🎮 Veterano do Quiz!",
          `${checkpoint} jogos completados! Você está ficando expert!`,
          {
            tag: "games-milestone",
            requireInteraction: true,
          }
        );
        localStorage.setItem(
          "brainbolt-last-games-milestone",
          checkpoint.toString()
        );
        break;
      }
    }

    // Marcos de streak
    const streakCheckpoints = [5, 10, 20, 50, 100];
    const lastNotifiedStreak = parseInt(
      localStorage.getItem("brainbolt-last-streak-milestone") || "0"
    );

    for (const checkpoint of streakCheckpoints) {
      if (bestStreak >= checkpoint && lastNotifiedStreak < checkpoint) {
        sendLocalNotification(
          "🔥 Streak Incrível!",
          `${checkpoint} respostas seguidas corretas! Você está on fire!`,
          {
            tag: "streak-milestone",
            requireInteraction: true,
          }
        );
        localStorage.setItem(
          "brainbolt-last-streak-milestone",
          checkpoint.toString()
        );
        break;
      }
    }
  }, [settings.achievements, stats, sendLocalNotification]);

  // Notificação de fim de sessão motivacional
  const sendSessionEndNotification = useCallback(() => {
    if (!settings.gameUpdates) return;

    const encouragements = [
      "Ótima sessão! Que tal mais uma partida rápida? 🧠",
      "Você está melhorando! Continue assim! 💪",
      "Cada pergunta te deixa mais inteligente! 🌟",
      "Desafie-se com mais perguntas! 🎯",
      "Seu cérebro agradece o exercício! 🏋️‍♂️",
    ];

    const randomEncouragement =
      encouragements[Math.floor(Math.random() * encouragements.length)];

    // Agendar notificação para 2 horas depois
    setTimeout(() => {
      sendLocalNotification("🎮 Pronto para mais?", randomEncouragement, {
        tag: "session-followup",
      });
    }, 2 * 60 * 60 * 1000); // 2 horas
  }, [settings.gameUpdates, sendLocalNotification]);

  // Atualizar última sessão
  const updateLastSession = useCallback(() => {
    localStorage.setItem("brainbolt-last-session", new Date().toISOString());
  }, []);

  // Verificar inatividade diariamente
  useEffect(() => {
    if (!user) return;

    checkInactivity();
    checkMilestones();
    updateLastSession();

    // Verificar inatividade a cada 24 horas
    const inactivityInterval = setInterval(
      checkInactivity,
      24 * 60 * 60 * 1000
    );

    return () => {
      clearInterval(inactivityInterval);
    };
  }, [user, checkInactivity, checkMilestones, updateLastSession]);

  // Verificar milestones quando stats mudarem
  useEffect(() => {
    if (stats) {
      checkMilestones();
    }
  }, [stats, checkMilestones]);

  return {
    updateLastSession,
    sendSessionEndNotification,
    checkMilestones,
  };
};
