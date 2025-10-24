import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface PhysicalDevice {
  id: string;
  type: "arduino" | "esp32";
  connected: boolean;
  isRealArduino?: boolean;
  roomId?: string;
  playerId?: string;
}

interface ButtonPressEvent {
  type: "button_press";
  button: "A" | "B" | "C" | "D" | "FAST";
  player_id: string;
  timestamp: number;
}

interface PhysicalModeHook {
  device: PhysicalDevice | null;
  isConnected: boolean;
  connectDevice: () => void;
  disconnectDevice: () => void;
  sendToDevice: (message: any) => void;
  onButtonPress: (callback: (button: string) => void) => void;
  sendQuestionToArduino: (question: any) => void;
}

export const usePhysicalMode = (): PhysicalModeHook => {
  const [device, setDevice] = useState<PhysicalDevice | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [buttonCallback, setButtonCallback] = useState<
    ((button: string) => void) | null
  >(null);
  const { toast } = useToast();

  // Conectar ao WebSocket do hardware
  const connectDevice = useCallback(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return; // Já conectado
    }

    const wsUrl =
      import.meta.env.VITE_HARDWARE_WS_URL || "ws://localhost:8080/ws/hardware";

    try {
      const newWs = new WebSocket(wsUrl);

      newWs.onopen = () => {
        console.log("🔌 Conectado ao servidor de hardware");
        setIsConnected(true);

        // Registrar dispositivo
        newWs.send(
          JSON.stringify({
            type: "register",
            device: "web_client",
            mac: "web_" + Date.now(),
          })
        );
      };

      newWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("❌ Erro ao processar mensagem WebSocket:", error);
        }
      };

      newWs.onclose = () => {
        console.log("🔌 Desconectado do servidor de hardware");
        setIsConnected(false);
        setDevice(null);

        toast({
          title: "Hardware desconectado",
          description: "Tentando reconectar...",
          variant: "destructive",
        });

        // Tentar reconectar em 3 segundos
        setTimeout(connectDevice, 3000);
      };

      newWs.onerror = (error) => {
        console.error("❌ Erro WebSocket:", error);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao hardware",
          variant: "destructive",
        });
      };

      setWs(newWs);
    } catch (error) {
      console.error("❌ Erro ao conectar:", error);
      toast({
        title: "Erro de conexão",
        description: "Verifique se o servidor de hardware está rodando",
        variant: "destructive",
      });
    }
  }, [ws, toast]);

  // Desconectar dispositivo
  const disconnectDevice = useCallback(() => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    setIsConnected(false);
    setDevice(null);
  }, [ws]);

  // Enviar mensagem para o dispositivo
  const sendToDevice = useCallback(
    (message: any) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      } else {
        console.warn("⚠️ WebSocket não conectado");
      }
    },
    [ws]
  );

  // Registrar callback para botões
  const onButtonPress = useCallback((callback: (button: string) => void) => {
    setButtonCallback(() => callback);
  }, []);

  // Processar mensagens do WebSocket
  const handleWebSocketMessage = useCallback(
    (message: any) => {
      switch (message.type) {
        case "registered":
          setDevice({
            id: message.device_id,
            type: "arduino",
            connected: true,
            isRealArduino: message.is_real_arduino || false,
          });

          toast({
            title: message.is_real_arduino
              ? "Arduino Real Conectado!"
              : "Hardware Simulado Conectado!",
            description: message.is_real_arduino
              ? "Arduino físico pronto para uso"
              : "Dispositivo simulado pronto para teste",
          });
          break;

        case "room_created":
          if (device) {
            setDevice((prev) =>
              prev
                ? {
                    ...prev,
                    roomId: message.room_id,
                  }
                : null
            );
          }
          break;

        case "room_joined":
          if (device) {
            setDevice((prev) =>
              prev
                ? {
                    ...prev,
                    roomId: message.room_id,
                    playerId: message.player_id,
                  }
                : null
            );
          }
          break;

        case "button_press":
          // Chamar callback se registrado
          if (buttonCallback && message.button) {
            buttonCallback(message.button);
          }
          break;

        case "test_buttons_start":
          toast({
            title: "Teste iniciado",
            description: message.message,
          });
          break;

        case "test_feedback":
          toast({
            title: "Teste concluído",
            description: message.message,
          });
          break;

        case "led_control":
          console.log(
            `💡 LED ${message.led} ${message.action} por ${message.duration}ms`
          );
          break;

        case "game_start":
          toast({
            title: "Jogo iniciado",
            description: message.message,
          });
          break;

        case "error":
          console.error("❌ Erro do servidor:", message.message);
          toast({
            title: "Erro do hardware",
            description: message.message,
            variant: "destructive",
          });
          break;

        default:
          console.log("📨 Mensagem não tratada:", message.type);
      }
    },
    [device, buttonCallback, toast]
  );

  // Conectar automaticamente ao montar
  useEffect(() => {
    connectDevice();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Heartbeat para manter conexão
  useEffect(() => {
    if (!ws) return;

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        // Enviar mensagem de ping personalizada
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [ws]);

  // Enviar pergunta atual para o Arduino
  const sendQuestionToArduino = useCallback(
    (question: any) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        console.warn("⚠️ WebSocket não conectado");
        return;
      }

      const message = {
        type: "question_update",
        question: {
          id: question.id,
          text: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          difficulty: question.difficulty,
          category: question.category,
        },
        timestamp: Date.now(),
      };

      ws.send(JSON.stringify(message));
      console.log("📤 Enviando pergunta para Arduino:", question.question);
    },
    [ws]
  );

  return {
    device,
    isConnected,
    connectDevice,
    disconnectDevice,
    sendToDevice,
    onButtonPress,
    sendQuestionToArduino,
  };
};
