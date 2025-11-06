import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trophy, Timer, Zap, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompetitionModalProps {
  winner: "FAST1" | "FAST2" | null;
  reactionTime?: number;
  isOpen: boolean;
  onClose: () => void;
  mode: "waiting" | "winner"; // Novo: modo do modal
}

export const CompetitionModal = ({
  winner,
  reactionTime,
  isOpen,
  onClose,
  mode,
}: CompetitionModalProps) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen && mode === "winner") {
      console.log("⏰ Iniciando countdown de 3 segundos...");
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log("⏰ Countdown finalizado, fechando modal...");
            setTimeout(() => {
              console.log("🔒 Chamando onClose do modal");
              onClose();
            }, 500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        console.log("🧹 Limpando timer do countdown");
        clearInterval(timer);
      };
    }
  }, [isOpen, mode, onClose]);

  const playerName = winner === "FAST1" ? "Jogador 1" : "Jogador 2";
  const playerColor =
    winner === "FAST1"
      ? "from-blue-500 to-cyan-500"
      : "from-purple-500 to-pink-500";

  // Modal de espera - aguardando jogadores apertarem os botões
  if (mode === "waiting") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-3xl border-white/30 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-white/10 [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-bold flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-blue-400 animate-pulse" />
              Competição Iniciada!
            </DialogTitle>
            <DialogDescription className="text-center text-white/70 text-base mt-2">
              Quem vai responder esta pergunta?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Instrução principal */}
            <div className="text-center space-y-4">
              <div className="text-2xl font-bold text-white mb-6">
                ⚡ APERTE SEU BOTÃO RÁPIDO! ⚡
              </div>

              {/* Dois jogadores lado a lado */}
              <div className="grid grid-cols-2 gap-4 relative">
                {/* Jogador 1 */}
                <div className="space-y-3">
                  <div
                    className={cn(
                      "mx-auto w-24 h-24 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-2xl",
                      "animate-pulse"
                    )}
                  >
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Jogador 1</h3>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-none mt-2"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      FAST1
                    </Badge>
                  </div>
                </div>

                {/* Jogador 2 */}
                <div className="space-y-3">
                  <div
                    className={cn(
                      "mx-auto w-24 h-24 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl",
                      "animate-pulse"
                    )}
                    style={{ animationDelay: "0.3s" }}
                  >
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Jogador 2</h3>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none mt-2"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      FAST2
                    </Badge>
                  </div>
                </div>

                {/* VS - centralizado */}
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-2xl px-4 py-2 rounded-full shadow-xl animate-bounce">
                    VS
                  </div>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm space-y-2">
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-sm">
                  <strong>Aperte seu botão FAST</strong> o mais rápido possível!
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <p className="text-sm">
                  O <strong>primeiro a apertar</strong> responde a pergunta
                </p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <p className="text-sm">
                  Use os botões <strong>A, B, C, D</strong> para responder
                </p>
              </div>
            </div>

            {/* Animação de espera */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                <Timer className="h-4 w-4 text-white animate-spin" />
                <span className="text-sm text-white/70">
                  Aguardando jogadores...
                </span>
              </div>
            </div>
          </div>

          {/* Efeito de partículas */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full animate-ping",
                  i % 2 === 0 ? "bg-blue-400" : "bg-purple-400"
                )}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Modal de vencedor - mostra quem ganhou a competição
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-3xl border-white/30 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-white/10 [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400 animate-bounce" />
            Vencedor da Competição!
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 text-base mt-2">
            Quem apertou o botão primeiro?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Vencedor */}
          <div className="text-center space-y-4">
            <div
              className={cn(
                "mx-auto w-32 h-32 rounded-full flex items-center justify-center",
                "bg-gradient-to-br shadow-2xl",
                "animate-pulse",
                playerColor
              )}
            >
              <User className="h-16 w-16 text-white" />
            </div>

            <div>
              <h3 className="text-4xl font-bold mb-2">{playerName}</h3>
              <Badge
                variant="secondary"
                className={cn(
                  "px-4 py-2 text-lg font-semibold",
                  "bg-gradient-to-r",
                  playerColor,
                  "text-white border-none"
                )}
              >
                <Zap className="h-4 w-4 mr-2" />
                {winner}
              </Badge>
            </div>
          </div>

          {/* Tempo de reação */}
          {reactionTime !== undefined && (
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-3 text-white">
                <Timer className="h-6 w-6 text-blue-400" />
                <div>
                  <div className="text-sm opacity-80">Tempo de Reação</div>
                  <div className="text-2xl font-bold">{reactionTime}ms</div>
                </div>
              </div>
            </div>
          )}

          {/* Mensagem de incentivo */}
          <div className="text-center space-y-2">
            <p className="text-white/90 font-medium">
              🎯 Agora é sua vez de responder!
            </p>
            <p className="text-white/60 text-sm">
              Use os botões A, B, C, D para escolher sua resposta
            </p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <span className="text-sm text-white/70">Fechando em</span>
              <span className="text-2xl font-bold text-white">{countdown}</span>
            </div>
          </div>
        </div>

        {/* Efeito de confetti */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
