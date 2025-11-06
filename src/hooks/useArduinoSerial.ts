import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface ArduinoSerialHook {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: object) => Promise<void>;
  onMessage: (callback: (data: string) => void) => () => void; // Retorna função de cleanup
}

// Verificar suporte ao Web Serial API
const isWebSerialSupported = () => {
  return "serial" in navigator;
};

// Filtrar avisos de Bluetooth do console para reduzir poluição
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(" ");
    // Ignorar avisos de dispositivos Bluetooth bloqueados
    if (
      message.includes("Serial blocklist") ||
      message.includes("bluetoothServiceClassId")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

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

// Permitir múltiplos listeners para evitar corrida entre telas/componentes
const messageCallbacks = new Set<(data: string) => void>();
let reader: ReadableStreamDefaultReader | null = null;
let port: SerialPort | null = null;
let messageBuffer = ""; // Buffer para mensagens fragmentadas
let commandQueue: object[] = []; // Fila de comandos
let isProcessingQueue = false; // Flag para controlar processamento da fila

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
      // Se já temos uma porta e ela está aberta, apenas reutilize
      if (port && (port as any).readable) {
        setIsConnected(true);
        if ((port as any).readable && messageCallbacks.size > 0 && !reader) {
          readFromSerial(port as any);
        }
        toast({
          title: "Arduino já conectado",
          description: "Porta serial ativa",
        });
        return;
      }

      // Tentar reutilizar porta já autorizada
      const available = await navigator.serial.getPorts();
      if (available && available.length > 0) {
        port = available[0];
      } else {
        // Solicitar acesso à porta serial
        const selectedPort = await navigator.serial.requestPort();
        port = selectedPort;
      }

      // Configurar parâmetros da porta (115200 baud rate para Arduino)
      if (!(port as any).readable) {
        await (port as any).open({ baudRate: 115200 });
      }

      console.log("✅ Arduino conectado via Serial!");
      setIsConnected(true);

      toast({
        title: "Arduino conectado!",
        description: "Hardware pronto para uso",
      });

      // Ler dados da porta serial em uma loop assíncrona
      if (port.readable && messageCallbacks.size > 0) {
        readFromSerial(port);
      }

      // Enviar mensagem de conexão para o Arduino
      await sendCommand({
        type: "connected",
        message: "Arduino conectado via Web Serial",
      });
    } catch (error: any) {
      console.error("❌ Erro ao conectar Arduino:", error);

      // Porta já aberta (por esta aba ou outra) — tentar anexar leitor e seguir
      if (
        error?.name === "InvalidStateError" ||
        /already open/i.test(error?.message || "")
      ) {
        try {
          if (port) {
            setIsConnected(true);
            if (
              (port as any).readable &&
              messageCallbacks.size > 0 &&
              !reader
            ) {
              readFromSerial(port as any);
            }
            toast({
              title: "Arduino já conectado",
              description: "Reutilizando porta serial aberta",
            });
            return;
          }
        } catch (_) {
          // segue para tratamento padrão
        }
      }

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
      } else if (error.name === "NetworkError") {
        toast({
          title: "Falha ao abrir a porta",
          description:
            "Feche outros programas que usam a porta (Arduino IDE, VSCode Serial Monitor) e tente novamente.",
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

      if (!port.writable) {
        console.warn("⚠️ Porta não está disponível para escrita");
        return;
      }

      // Adicionar comando à fila
      commandQueue.push(command);

      // Iniciar processamento da fila se não estiver processando
      if (!isProcessingQueue) {
        processCommandQueue();
      }
    },
    [port, toast]
  );

  const onMessage = useCallback((callback: (data: string) => void) => {
    console.log("➕ Callback registrado. Total:", messageCallbacks.size + 1);
    messageCallbacks.add(callback);

    // Se já estiver conectado, iniciar leitura
    if (port && port.readable && !reader) {
      readFromSerial(port);
    }

    // Retornar função de cleanup para remover o callback
    return () => {
      console.log("➖ Callback removido. Total:", messageCallbacks.size - 1);
      messageCallbacks.delete(callback);
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    sendCommand,
    onMessage,
  };
};

// Função para processar fila de comandos
async function processCommandQueue() {
  if (isProcessingQueue || commandQueue.length === 0 || !port?.writable) {
    return;
  }

  isProcessingQueue = true;

  while (commandQueue.length > 0) {
    const command = commandQueue.shift();
    if (!command) continue;

    let writer: WritableStreamDefaultWriter | null = null;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(command) + "\n");

      writer = port.writable.getWriter();
      await writer.write(data);

      // Pequeno delay entre comandos para evitar sobrecarga
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error("❌ Erro ao enviar comando da fila:", error);
    } finally {
      if (writer) {
        try {
          writer.releaseLock();
        } catch (e) {
          console.error("Erro ao liberar writer:", e);
        }
      }
    }
  }

  isProcessingQueue = false;
}

// Função auxiliar para ler da porta serial
async function readFromSerial(port: SerialPort) {
  if (!port.readable || messageCallbacks.size === 0) return;

  const decoder = new TextDecoder();
  reader = port.readable.getReader();
  messageBuffer = ""; // Resetar buffer ao iniciar

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        console.log("📡 Leitura da porta serial finalizada");
        break;
      }

      if (value) {
        const text = decoder.decode(value);
        messageBuffer += text;

        // Processar mensagens completas (terminadas com \n)
        const lines = messageBuffer.split("\n");

        // Guardar a última linha incompleta no buffer
        messageBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            // Logar apenas mensagens JSON importantes
            if (trimmed.startsWith("{")) {
              console.log("📱 Arduino:", trimmed);
            }

            for (const cb of messageCallbacks) {
              try {
                cb(trimmed);
              } catch (e) {
                console.error("Listener error:", e);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Erro ao ler da porta serial:", error);
  } finally {
    reader?.releaseLock();
    reader = null;
    messageBuffer = ""; // Limpar buffer ao finalizar
  }
}
