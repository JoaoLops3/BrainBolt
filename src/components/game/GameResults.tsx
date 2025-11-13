import { Button } from "@/components/ui/button";
import { GameStats, CategoryInfo } from "@/types/game";
import sportsIcon from "@/assets/sports-icon.png";
import entertainmentIcon from "@/assets/entertainment-icon.png";
import artIcon from "@/assets/art-icon.png";
import scienceIcon from "@/assets/science-icon.png";
import geographyIcon from "@/assets/geography-icon.png";
import historyIcon from "@/assets/history-icon.png";

interface GameResultsProps {
  stats: GameStats;
  categories: CategoryInfo[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const categoryIcons: Record<string, string> = {
  sports: sportsIcon,
  entertainment: entertainmentIcon,
  art: artIcon,
  science: scienceIcon,
  geography: geographyIcon,
  history: historyIcon,
  mathematics: scienceIcon, // Fallback para mathematics
  portuguese: artIcon, // Fallback para portuguese
};

export const GameResults = ({
  stats,
  categories,
  onPlayAgain,
  onBackToMenu,
}: GameResultsProps) => {
  const accuracy = Math.min(
    Math.round((stats.correctAnswers / stats.totalQuestions) * 100),
    100
  );
  const collectedCount = categories.filter((cat) => cat.collected).length;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Incrível! Você é um gênio! 🏆";
    if (accuracy >= 75) return "Muito bom! Continue assim! 🎉";
    if (accuracy >= 60) return "Bom trabalho! 👏";
    if (accuracy >= 40) return "Não foi mal! Pode melhorar! 📚";
    return "Continue tentando! A prática leva à perfeição! 💪";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-entertainment flex items-center justify-center p-3 sm:p-4 no-scroll safe-top safe-bottom">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md sm:max-w-lg w-full shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
            Resultado Final
          </h1>
          <p className="text-sm sm:text-base text-white/80">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="relative">
            <svg
              className="w-24 h-24 sm:w-28 sm:h-28 transform -rotate-90"
              viewBox="0 0 120 120"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(accuracy / 100) * 314} 314`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {accuracy}%
                </div>
                <div className="text-xs sm:text-sm text-white/70">Precisão</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.correctAnswers}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Certas</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-xl sm:text-2xl font-bold text-white">
              {stats.totalQuestions}
            </div>
            <div className="text-xs sm:text-sm text-white/70">Total</div>
          </div>
        </div>

        {/* Categories Progress */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center text-white">
            Personagens ({collectedCount}/6)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative rounded-lg p-2 transition-all duration-300 ${
                  category.collected
                    ? `bg-white/20 border-2 border-white/40`
                    : "bg-white/5 border-2 border-white/10 grayscale"
                }`}
              >
                {categoryIcons[category.id] ? (
                  <img
                    src={categoryIcons[category.id]}
                    alt={category.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-0.5"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-0.5 bg-white/10 rounded-full flex items-center justify-center">
                    <span className="text-sm sm:text-base font-bold text-white">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="text-[10px] sm:text-xs font-medium text-center truncate text-white">
                  {category.name}
                </p>
                {category.collected && (
                  <div className="absolute -top-1 -right-1 bg-correct-answer text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Jogar Novamente
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="w-full border-2 border-white/30 bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300"
          >
            Voltar ao Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
