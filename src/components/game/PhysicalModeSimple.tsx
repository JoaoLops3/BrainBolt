import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gamepad2,
  Wifi,
  WifiOff,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Play,
  Plug,
  RefreshCw,
} from "lucide-react";
import { useArduinoSerial } from "@/hooks/useArduinoSerial";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PhysicalModeSimpleProps {
  onBackToMenu: () => void;
  onStartGame: (mode: "physical") => void;
}

export const PhysicalModeSimple = ({
  onBackToMenu,
  onStartGame,
}: PhysicalModeSimpleProps) => {
  const { isConnected, connect, disconnect, sendCommand, onMessage } =
    useArduinoSerial();
  const { toast } = useToast();
  const [gameActive, setGameActive] = useState(false);
  const [lastButtonPressed, setLastButtonPressed] = useState<string | null>(
    null
  );
  const [isWebSerialSupported, setIsWebSerialSupported] = useState(false);

  // Verificar suporte ao Web Serial
  useEffect(() => {
    setIsWebSerialSupported("serial" in navigator);
  }, []);

  // Registrar callback para receber mensagens do Arduino
  useEffect(() => {
    onMessage((data: string) => {
      try {
        const message = JSON.parse(data);
        if (message.type === "button_press") {
          handleButtonPress(message.button);
        }
      } catch (error) {
        // Se não for JSON, tratar como mensagem de texto
        console.log("📱 Arduino:", data);
      }
    });
  }, [onMessage]);

  const handleButtonPress = (button: string) => {
    setLastButtonPressed(button);

    toast({
      title: "Botão pressionado!",
      description: `Botão ${button} detectado`,
    });

    setTimeout(() => {
      setLastButtonPressed(null);
    }, 1000);
  };

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
    setGameActive(false);
  };

  const startPhysicalGame = async () => {
    if (!isConnected) {
      toast({
        title: "Hardware não conectado",
        description: "Conecte o Arduino antes de iniciar",
        variant: "destructive",
      });
      return;
    }

    setGameActive(true);

    // Enviar comando de início de jogo
    await sendCommand({
      type: "start_game",
      game_mode: "physical",
    });

    onStartGame("physical");
  };

  const testButtons = async () => {
    if (!isConnected) return;

    await sendCommand({
      type: "test_buttons_start",
    });

    toast({
      title: "Teste iniciado",
      description: "Pressione os botões no Arduino para testar",
    });
  };

  const testLEDs = async () => {
    if (!isConnected) return;

    await sendCommand({
      type: "test_all_leds",
    });

    toast({
      title: "Teste de LEDs",
      description: "Testando todos os LEDs sequencialmente",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-4 safe-top safe-bottom overflow-hidden relative">
      {/* Background animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-4 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-4 w-24 h-24 bg-green-500/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-2xl mx-auto justify-center px-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4 mt-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToMenu}
            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Badge
            variant="secondary"
            className={cn(
              "px-4 py-2 bg-white/20 text-white border border-white/30",
              isConnected
                ? "bg-green-500/20 border-green-400/50"
                : "bg-red-500/20 border-red-400/50"
            )}
          >
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Conectado
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                Desconectado
              </>
            )}
          </Badge>
        </div>

        {/* Card principal */}
        <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl w-fit">
              <Gamepad2 className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Modo Físico
            </CardTitle>
            <CardDescription className="text-white/80">
              Controle o jogo com botões físicos conectados ao Arduino
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Aviso de suporte do navegador */}
            {!isWebSerialSupported && (
              <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-yellow-100">
                  <AlertCircle className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Navegador não suportado</div>
                    <div className="text-sm opacity-80">
                      Use Chrome, Edge ou Opera para conectar ao Arduino
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status da conexão */}
            <div className="text-center space-y-4">
              <div
                className={cn(
                  "px-6 py-4 rounded-xl border transition-all duration-300",
                  isConnected
                    ? "bg-green-500/20 border-green-400/50 text-green-100"
                    : "bg-red-500/20 border-red-400/50 text-red-100"
                )}
              >
                <div className="flex items-center justify-center gap-3">
                  {isConnected ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                  <div>
                    <div className="font-semibold">
                      {isConnected
                        ? "Arduino Conectado"
                        : "Arduino Desconectado"}
                    </div>
                    <div className="text-sm opacity-80">
                      {isConnected
                        ? "Hardware pronto para uso"
                        : "Conecte o Arduino via USB"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de conexão */}
              <div className="flex gap-3 justify-center">
                {!isConnected ? (
                  <Button
                    onClick={handleConnect}
                    disabled={!isWebSerialSupported}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    <Plug className="h-4 w-4 mr-2" />
                    Conectar Arduino
                  </Button>
                ) : (
                  <Button
                    onClick={handleDisconnect}
                    variant="outline"
                    className="text-white border-white/50 bg-white/5 hover:bg-white/20"
                  >
                    <WifiOff className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                )}
              </div>
            </div>

            {/* Botões de teste */}
            {isConnected && (
              <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-center">
                  Testes do Hardware
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={testButtons}
                    variant="outline"
                    className="text-white border-white/50 bg-white/5 hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Testar Botões
                  </Button>
                  <Button
                    onClick={testLEDs}
                    variant="outline"
                    className="text-white border-white/50 bg-white/5 hover:bg-white/20"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Testar LEDs
                  </Button>
                </div>
              </div>
            )}

            {/* Feedback do último botão pressionado */}
            {lastButtonPressed && (
              <div className="text-center">
                <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-3 text-blue-100">
                    <Zap className="h-6 w-6 animate-pulse" />
                    <div>
                      <div className="font-semibold">Botão Pressionado!</div>
                      <div className="text-2xl font-bold">
                        {lastButtonPressed}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botão de iniciar jogo */}
            <div className="text-center">
              <Button
                onClick={startPhysicalGame}
                disabled={!isConnected || gameActive}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transform hover:scale-105 transition-all duration-300 shadow-xl disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3 justify-center">
                  {gameActive ? (
                    <>
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Jogo Ativo</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-6 w-6" />
                      <span>Iniciar Jogo Físico</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instruções simplificadas */}
        <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-3">
              🎯 Como usar (Super Simples!)
            </h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>1.</strong> Conecte o Arduino ao computador via USB
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>2.</strong> Certifique-se de que o código está
                  carregado no Arduino
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>3.</strong> Clique em "Conectar Arduino" e selecione a
                  porta
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>4.</strong> Clique em "Iniciar Jogo Físico" e comece a
                  jogar!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
