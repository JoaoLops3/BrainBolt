import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ArduinoSerialHook {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: object) => Promise<void>;
  onMessage: (callback: (data: string) => void) => void;
}

// Verificar suporte ao Web Serial API
const isWebSerialSupported = () => {
  return "serial" in navigator;
};

// Declaração da interface SerialPort do navegador
interface SerialPort extends EventTarget {
  readable: ReadableStream | null;
  writable: WritableStream | null;
}

interface Serial extends EventTarget {
  requestPort: () => Promise<SerialPort>;
  getPorts: () => Promise<SerialPort[]>;
}

declare global {
  interface Navigator {
    serial: Serial;
  }
}

let messageCallback: ((data: string) => void) | null = null;
let reader: ReadableStreamDefaultReader | null = null;
let port: SerialPort | null = null;

export const useArduinoSerial = (): ArduinoSerialHook => {
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    if (!isWebSerialSupported()) {
      toast({
        title: "Navegador não suportado",
        description:
          "Web Serial API não está disponível. Use Chrome, Edge ou Opera.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Solicitar acesso à porta serial
      const selectedPort = await navigator.serial.requestPort();
      port = selectedPort;

      // Configurar parâmetros da porta (115200 baud rate para Arduino)
      await (port as any).open({ baudRate: 115200 });

      console.log("✅ Arduino conectado via Serial!");
      setIsConnected(true);

      toast({
        title: "Arduino conectado!",
        description: "Hardware pronto para uso",
      });

      // Ler dados da porta serial em uma loop assíncrona
      if (port.readable && messageCallback) {
        readFromSerial(port);
      }

      // Enviar mensagem de conexão para o Arduino
      await sendCommand({
        type: "connected",
        message: "Arduino conectado via Web Serial",
      });
    } catch (error: any) {
      console.error("❌ Erro ao conectar Arduino:", error);

      if (error.name === "NotFoundError") {
        toast({
          title: "Arduino não encontrado",
          description: "Certifique-se de que o Arduino está conectado via USB",
          variant: "destructive",
        });
      } else if (error.name === "SecurityError") {
        toast({
          title: "Erro de segurança",
          description: "Permissão para acessar porta serial negada",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro de conexão",
          description: error.message || "Não foi possível conectar ao Arduino",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    try {
      // Fechar reader se estiver aberto
      if (reader) {
        await reader.cancel();
        reader = null;
      }

      // Fechar porta
      if (port) {
        await (port as any).close();
        port = null;
      }

      setIsConnected(false);
      console.log("🔌 Arduino desconectado");

      toast({
        title: "Arduino desconectado",
        description: "Conexão encerrada",
      });
    } catch (error) {
      console.error("❌ Erro ao desconectar Arduino:", error);
    }
  }, [toast]);

  const sendCommand = useCallback(
    async (command: object) => {
      if (!port) {
        console.warn("⚠️ Porta serial não conectada");
        return;
      }

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(command) + "\n");

        if (port.writable) {
          const writer = port.writable.getWriter();
          await writer.write(data);
          writer.releaseLock();
        }
      } catch (error) {
        console.error("❌ Erro ao enviar comando:", error);
        toast({
          title: "Erro ao enviar comando",
          description: "Não foi possível enviar dados ao Arduino",
          variant: "destructive",
        });
      }
    },
    [port, toast]
  );

  const onMessage = useCallback((callback: (data: string) => void) => {
    messageCallback = callback;

    // Se já estiver conectado, iniciar leitura
    if (port && port.readable && !reader) {
      readFromSerial(port);
    }
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    sendCommand,
    onMessage,
  };
};

// Função auxiliar para ler da porta serial
async function readFromSerial(port: SerialPort) {
  if (!port.readable || !messageCallback) return;

  const decoder = new TextDecoder();
  reader = port.readable.getReader();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log("📡 Leitura da porta serial finalizada");
        break;
      }

      if (value) {
        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            console.log("📱 Arduino:", trimmed);
            messageCallback(trimmed);
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Erro ao ler da porta serial:", error);
  } finally {
    reader?.releaseLock();
    reader = null;
  }
}
