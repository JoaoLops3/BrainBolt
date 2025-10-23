import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface PhysicalDevice {
  id: string;
  type: "arduino" | "esp32";
  connected: boolean;
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
          });

          toast({
            title: "Hardware conectado!",
            description: "Dispositivo físico pronto para uso",
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

  return {
    device,
    isConnected,
    connectDevice,
    disconnectDevice,
    sendToDevice,
    onButtonPress,
  };
};
