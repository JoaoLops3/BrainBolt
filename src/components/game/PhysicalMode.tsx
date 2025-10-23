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
  Settings,
  Play,
  Pause,
} from "lucide-react";
import { usePhysicalMode } from "@/hooks/usePhysicalMode";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PhysicalModeProps {
  onBackToMenu: () => void;
  onStartGame: (mode: "physical") => void;
}

export const PhysicalMode = ({
  onBackToMenu,
  onStartGame,
}: PhysicalModeProps) => {
  const {
    device,
    isConnected,
    connectDevice,
    disconnectDevice,
    sendToDevice,
    onButtonPress,
  } = usePhysicalMode();
  const { toast } = useToast();
  const [gameActive, setGameActive] = useState(false);
  const [lastButtonPressed, setLastButtonPressed] = useState<string | null>(
    null
  );
  const [testMode, setTestMode] = useState(false);
  const [ledStates, setLedStates] = useState({
    A: false,
    B: false,
    C: false,
    D: false,
    FAST: false,
  });

  // Registrar callback para botões físicos
  useEffect(() => {
    onButtonPress((button: string) => {
      setLastButtonPressed(button);

      toast({
        title: "Botão pressionado!",
        description: `Botão ${button} detectado`,
      });

      // Simular resposta do jogo
      setTimeout(() => {
        setLastButtonPressed(null);
      }, 1000);
    });
  }, [onButtonPress, toast]);

  const startPhysicalGame = () => {
    if (!isConnected) {
      toast({
        title: "Hardware não conectado",
        description: "Conecte o Arduino antes de iniciar",
        variant: "destructive",
      });
      return;
    }

    setGameActive(true);

    // Enviar comando para iniciar jogo no dispositivo
    sendToDevice({
      type: "start_game",
      game_mode: "physical",
    });

    onStartGame("physical");
  };

  const testButtons = () => {
    if (!isConnected) return;

    setTestMode(true);

    // Enviar comando de teste para o Arduino
    sendToDevice({
      type: "test_buttons",
    });

    toast({
      title: "Teste iniciado",
      description: "Pressione os botões no Arduino para testar",
    });

    // Parar modo de teste após 10 segundos
    setTimeout(() => {
      setTestMode(false);
    }, 10000);
  };

  const controlLED = (
    led: string,
    action: "on" | "off" | "blink",
    duration = 1000
  ) => {
    if (!isConnected) return;

    sendToDevice({
      type: "control_leds",
      led,
      action,
      duration,
    });

    // Atualizar estado local do LED
    setLedStates((prev) => ({
      ...prev,
      [led]: action === "on" || action === "blink",
    }));

    toast({
      title: `LED ${led} ${action}`,
      description: `Controlando LED ${led} - ${action}`,
    });
  };

  const testAllLEDs = () => {
    if (!isConnected) return;

    const leds = ["A", "B", "C", "D", "FAST"];

    leds.forEach((led, index) => {
      setTimeout(() => {
        controlLED(led, "on", 500);
        setTimeout(() => {
          controlLED(led, "off", 0);
        }, 500);
      }, index * 200);
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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBackToMenu}
            className="text-white hover:bg-white/20 backdrop-blur-lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
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
                        ? "Hardware Conectado"
                        : "Hardware Desconectado"}
                    </div>
                    <div className="text-sm opacity-80">
                      {isConnected
                        ? "Arduino pronto para uso"
                        : "Conecte o Arduino via USB"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de controle */}
              <div className="flex gap-3 justify-center">
                {!isConnected ? (
                  <Button
                    onClick={connectDevice}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Wifi className="h-4 w-4 mr-2" />
                    Conectar Hardware
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={disconnectDevice}
                      variant="outline"
                      className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                    >
                      <WifiOff className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                    <Button
                      onClick={testButtons}
                      variant="outline"
                      className={cn(
                        "text-white border-white/50 bg-white/10 hover:bg-white/20",
                        testMode && "bg-yellow-500/20 border-yellow-400/50"
                      )}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {testMode ? "Testando..." : "Testar Botões"}
                    </Button>
                    <Button
                      onClick={testAllLEDs}
                      variant="outline"
                      className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Testar LEDs
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Status dos LEDs */}
            {isConnected && (
              <div className="bg-white/10 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white text-center">
                  Status dos LEDs
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(ledStates).map(([led, isOn]) => (
                    <div key={led} className="text-center">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full mx-auto mb-1 transition-all duration-300",
                          isOn
                            ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                            : "bg-gray-600"
                        )}
                      />
                      <div className="text-xs text-white/80">{led}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => controlLED("A", "on")}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                  >
                    LED A
                  </Button>
                  <Button
                    onClick={() => controlLED("B", "on")}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                  >
                    LED B
                  </Button>
                  <Button
                    onClick={() => controlLED("C", "on")}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                  >
                    LED C
                  </Button>
                  <Button
                    onClick={() => controlLED("D", "on")}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                  >
                    LED D
                  </Button>
                  <Button
                    onClick={() => controlLED("FAST", "on")}
                    size="sm"
                    variant="outline"
                    className="text-white border-white/50 bg-white/10 hover:bg-white/20"
                  >
                    LED FAST
                  </Button>
                </div>
              </div>
            )}

            {/* Último botão pressionado */}
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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold transform hover:scale-105 transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  {gameActive ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                  <span>
                    {gameActive ? "Jogo Ativo" : "Iniciar Jogo Físico"}
                  </span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-white/20 backdrop-blur-xl border-white/30 shadow-2xl">
          <CardContent className="p-4">
            <h4 className="font-semibold text-white mb-3">Como usar:</h4>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>Conecte o Arduino ao computador via USB</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  Inicie o servidor de hardware:{" "}
                  <code className="bg-white/20 px-1 rounded">npm run dev</code>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  Execute o bridge:{" "}
                  <code className="bg-white/20 px-1 rounded">
                    npm run bridge
                  </code>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  Pressione os botões físicos para responder às perguntas
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
