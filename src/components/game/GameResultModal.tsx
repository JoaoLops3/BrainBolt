import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameResultModalProps {
  isOpen: boolean;
  player1Score: number;
  player2Score: number;
  onBackToMenu: () => void;
}

export const GameResultModal = ({
  isOpen,
  player1Score,
  player2Score,
  onBackToMenu,
}: GameResultModalProps) => {
  const winner =
    player1Score > player2Score ? 1 : player2Score > player1Score ? 2 : 0; // 0 = empate

  const winnerName =
    winner === 1 ? "Jogador 1" : winner === 2 ? "Jogador 2" : "Empate";

  const player1Color = "from-blue-500 to-cyan-500";
  const player2Color = "from-purple-500 to-pink-500";

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-3xl border-white/30 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] ring-1 ring-white/10">
        <div className="text-center space-y-2 sm:space-y-3 py-1 sm:py-2">
          {/* Título */}
          <div>
            <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-1 sm:mb-2 animate-bounce" />
            <DialogTitle className="text-xl sm:text-3xl font-bold mb-0.5 sm:mb-1">
              {winner === 0 ? "🤝 Empate!" : "🎉 Jogo Finalizado!"}
            </DialogTitle>
            {winner !== 0 && (
              <p className="text-sm sm:text-lg text-white/80">
                {winnerName} Venceu!
              </p>
            )}
          </div>

          {/* Placar Final */}
          <div className="bg-white/10 rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-sm">
            <h3 className="text-sm sm:text-base font-semibold mb-1.5 sm:mb-2 text-white/90">
              Placar Final
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {/* Jogador 1 */}
              <div
                className={cn(
                  "relative p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300",
                  winner === 1
                    ? `bg-gradient-to-br ${player1Color} shadow-lg shadow-blue-500/50 sm:scale-105`
                    : "bg-white/5"
                )}
              >
                {winner === 1 && (
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2">
                    <div className="bg-yellow-400 rounded-full p-0.5 sm:p-1">
                      <Star
                        className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-900"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">
                    Jogador 1
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold">
                    {player1Score}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/60 mt-0.5 sm:mt-1">
                    pontos
                  </div>
                </div>
              </div>

              {/* Jogador 2 */}
              <div
                className={cn(
                  "relative p-2 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300",
                  winner === 2
                    ? `bg-gradient-to-br ${player2Color} shadow-lg shadow-purple-500/50 sm:scale-105`
                    : "bg-white/5"
                )}
              >
                {winner === 2 && (
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2">
                    <div className="bg-yellow-400 rounded-full p-0.5 sm:p-1">
                      <Star
                        className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-900"
                        fill="currentColor"
                      />
                    </div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">
                    Jogador 2
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold">
                    {player2Score}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-white/60 mt-0.5 sm:mt-1">
                    pontos
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3">
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div>
                <div className="text-base sm:text-xl font-bold">10</div>
                <div className="text-[9px] sm:text-[10px] text-white/60">
                  Perguntas
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-bold">
                  {Math.max(player1Score, player2Score)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-white/60 leading-tight">
                  Maior
                  <br className="sm:hidden" /> Pontuação
                </div>
              </div>
              <div>
                <div className="text-base sm:text-xl font-bold">
                  {Math.abs(player1Score - player2Score)}
                </div>
                <div className="text-[9px] sm:text-[10px] text-white/60">
                  Diferença
                </div>
              </div>
            </div>
          </div>

          {/* Mensagem de parabéns */}
          {winner !== 0 && (
            <div className="text-center py-0.5 sm:py-1">
              <p className="text-sm sm:text-base font-semibold text-white/90">
                🎊 Parabéns, {winnerName}! 🎊
              </p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">
                Você demonstrou grande conhecimento!
              </p>
            </div>
          )}

          {winner === 0 && (
            <div className="text-center py-0.5 sm:py-1">
              <p className="text-sm sm:text-base font-semibold text-white/90">
                🤝 Empate Perfeito! 🤝
              </p>
              <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">
                Ambos os jogadores foram excelentes!
              </p>
            </div>
          )}

          {/* Botão de voltar */}
          <Button
            onClick={onBackToMenu}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 sm:py-4 text-sm sm:text-base shadow-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar ao Modo Físico
          </Button>
        </div>

        {/* Efeito de confetes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-3 h-3 rounded-full animate-ping",
                i % 3 === 0
                  ? "bg-yellow-400"
                  : i % 3 === 1
                  ? "bg-blue-400"
                  : "bg-purple-400"
              )}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
