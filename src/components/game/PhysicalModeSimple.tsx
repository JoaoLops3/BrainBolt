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
  Plug,
  RefreshCw,
} from "lucide-react";
import { useArduinoSerial } from "@/hooks/useArduinoSerial";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CompetitionModal } from "./CompetitionModal";

interface PhysicalModeSimpleProps {
  onBackToMenu: () => void;
  onStartGame: (mode: "physical") => void;
  onStartPhysicalGame?: () => void;
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
  const [competitionWinner, setCompetitionWinner] = useState<
    "FAST1" | "FAST2" | null
  >(null);
  const [reactionTime, setReactionTime] = useState<number | undefined>(
    undefined
  );
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionMode, setCompetitionMode] = useState<"waiting" | "winner">(
    "waiting"
  );
  const [testingButtons, setTestingButtons] = useState(false);
  const [testingLEDs, setTestingLEDs] = useState(false);

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
        } else if (message.type === "competition_winner") {
          handleCompetitionWinner(message.winner, message.reaction_time);
        }
      } catch (error) {}
    });
  }, [onMessage]);

  const handleButtonPress = (button: string) => {
    setLastButtonPressed(button);

    // Se estiver em modo de teste de botões, mostrar qual foi pressionado
    if (testingButtons) {
      toast({
        title: "✅ Botão Detectado!",
        description: `Botão ${button} está funcionando corretamente`,
      });
    } else {
      toast({
        title: "Botão pressionado!",
        description: `Botão ${button} detectado`,
      });
    }

    setTimeout(() => {
      setLastButtonPressed(null);
    }, 1000);
  };

  const handleCompetitionWinner = (winner: "FAST1" | "FAST2", time: number) => {
    setCompetitionWinner(winner);
    setReactionTime(time);
    setCompetitionMode("winner");

    const playerName = winner === "FAST1" ? "Jogador 1" : "Jogador 2";

    toast({
      title: "🏆 Vencedor da Competição!",
      description: `${playerName} apertou primeiro (${time}ms)`,
    });
  };

  const handleCloseCompetitionModal = () => {
    setShowCompetitionModal(false);
    setCompetitionWinner(null);
    setReactionTime(undefined);
    setCompetitionMode("waiting");
  };

  const startCompetitionWaiting = async () => {
    setCompetitionMode("waiting");
    setShowCompetitionModal(true);
    setCompetitionWinner(null);
    setReactionTime(undefined);

    // Enviar comando de início de pergunta para o Arduino
    await sendCommand({
      type: "question_start",
    });

    toast({
      title: "Competição Iniciada!",
      description: "Aperte FAST1 ou FAST2 para começar!",
    });
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

    // Mostrar modal de competição aguardando jogadores
    startCompetitionWaiting();

    // Enviar comando de início de pergunta para o Arduino
    await sendCommand({
      type: "question_start",
    });

    onStartGame("physical");
  };

  const testButtons = async () => {
    if (!isConnected) return;

    if (testingButtons) {
      // Parar teste
      setTestingButtons(false);
      toast({
        title: "Teste finalizado",
        description: "Modo de teste de botões desativado",
      });
    } else {
      // Iniciar teste
      setTestingButtons(true);
      toast({
        title: "🎮 Teste de Botões Iniciado",
        description:
          "Pressione qualquer botão no Arduino para testar. Os 6 botões são: A, B, C, D, FAST1 e FAST2",
        duration: 5000,
      });
    }
  };

  const testLEDs = async () => {
    if (!isConnected) return;

    if (testingLEDs) {
      // Parar teste
      setTestingLEDs(false);
      await sendCommand({
        type: "stop_led_test",
      });
      toast({
        title: "Teste finalizado",
        description: "LEDs desligados",
      });
    } else {
      // Iniciar teste sequencial dos LEDs
      setTestingLEDs(true);
      await sendCommand({
        type: "test_leds_sequential",
      });
      toast({
        title: "💡 Teste de LEDs Iniciado",
        description:
          "Os LEDs vão acender um por vez. Total: 6 LEDs (A, B, C, D, FAST1, FAST2)",
        duration: 5000,
      });
    }
  };

  return (
    <>
      <CompetitionModal
        winner={competitionWinner}
        reactionTime={reactionTime}
        isOpen={showCompetitionModal}
        onClose={handleCloseCompetitionModal}
        mode={competitionMode}
      />

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
          <div className="flex items-center justify-between mb-4 mt-[4.5rem]">
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
                      <div className="font-semibold">
                        Navegador não suportado
                      </div>
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
                      className={cn(
                        "text-white border-white/50",
                        testingButtons
                          ? "bg-green-500/30 border-green-400/70 animate-pulse"
                          : "bg-white/5 hover:bg-white/20"
                      )}
                    >
                      <Settings
                        className={cn(
                          "h-4 w-4 mr-2",
                          testingButtons && "animate-spin"
                        )}
                      />
                      {testingButtons ? "Testando..." : "Testar Botões"}
                    </Button>
                    <Button
                      onClick={testLEDs}
                      variant="outline"
                      className={cn(
                        "text-white border-white/50",
                        testingLEDs
                          ? "bg-yellow-500/30 border-yellow-400/70 animate-pulse"
                          : "bg-white/5 hover:bg-white/20"
                      )}
                    >
                      <Zap
                        className={cn(
                          "h-4 w-4 mr-2",
                          testingLEDs && "animate-bounce"
                        )}
                      />
                      {testingLEDs ? "Testando..." : "Testar LEDs"}
                    </Button>
                  </div>
                  <Button
                    onClick={startCompetitionWaiting}
                    variant="outline"
                    className="w-full text-white border-white/50 bg-white/5 hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Testar Competição
                  </Button>
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
                    <strong>3.</strong> Clique em "Conectar Arduino" e selecione
                    a porta
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-white/60 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <strong>4.</strong> Clique em "Iniciar Jogo Físico" e comece
                    a jogar!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
