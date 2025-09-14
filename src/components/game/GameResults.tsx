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

const categoryIcons = {
  sports: sportsIcon,
  entertainment: entertainmentIcon,
  art: artIcon,
  science: scienceIcon,
  geography: geographyIcon,
  history: historyIcon,
};

export const GameResults = ({
  stats,
  categories,
  onPlayAgain,
  onBackToMenu,
}: GameResultsProps) => {
  const accuracy = Math.round(
    (stats.correctAnswers / stats.totalQuestions) * 100
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
    <div className="min-h-screen bg-gradient-to-br from-primary to-entertainment flex items-center justify-center p-4 no-scroll">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Resultado Final
          </h1>
          <p className="text-xl text-muted-foreground">
            {getPerformanceMessage()}
          </p>
        </div>

        {/* Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg
              className="w-32 h-32 transform -rotate-90"
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
                <div className="text-3xl font-bold text-primary">
                  {accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Precisão</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-center p-4 bg-muted rounded-2xl">
            <div className="text-2xl font-bold text-primary">
              {stats.correctAnswers}
            </div>
            <div className="text-sm text-muted-foreground">
              Respostas Certas
            </div>
          </div>
          <div className="text-center p-4 bg-muted rounded-2xl">
            <div className="text-2xl font-bold text-primary">
              {stats.totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground">
              Total de Perguntas
            </div>
          </div>
        </div>

        {/* Categories Progress */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Personagens Coletados ({collectedCount}/6)
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative rounded-xl p-3 transition-all duration-300 ${
                  category.collected
                    ? `bg-${category.id}/20 border-2 border-${category.id}`
                    : "bg-muted border-2 border-transparent grayscale"
                }`}
              >
                <img
                  src={categoryIcons[category.id]}
                  alt={category.name}
                  className="w-12 h-12 mx-auto mb-1"
                />
                <p className="text-xs font-medium text-center">
                  {category.name}
                </p>
                {category.collected && (
                  <div className="absolute -top-1 -right-1 bg-correct-answer text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onPlayAgain}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Jogar Novamente
          </Button>
          <Button
            onClick={onBackToMenu}
            variant="outline"
            className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-4 rounded-xl transition-all duration-300"
          >
            Voltar ao Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
