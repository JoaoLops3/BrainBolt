import { Button } from "@/components/ui/button";
import { CategoryInfo } from "@/types/game";
import sportsIcon from "@/assets/sports-icon.png";
import entertainmentIcon from "@/assets/entertainment-icon.png";
import artIcon from "@/assets/art-icon.png";
import scienceIcon from "@/assets/science-icon.png";
import geographyIcon from "@/assets/geography-icon.png";
import historyIcon from "@/assets/history-icon.png";

interface GameMenuProps {
  categories: CategoryInfo[];
  onStartGame: () => void;
}

const categoryIcons = {
  sports: sportsIcon,
  entertainment: entertainmentIcon,
  art: artIcon,
  science: scienceIcon,
  geography: geographyIcon,
  history: historyIcon,
};

export const GameMenu = ({ categories, onStartGame }: GameMenuProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-sports flex items-center justify-center p-4 no-scroll">
      <div className="text-center space-y-8 max-w-2xl w-full">
        {/* Logo/Title */}
        <div className="animate-bounce-in">
          <h1 className="text-6xl font-bold text-white mb-2">BrainBolt</h1>
          <p className="text-white/80 text-xl">Teste seus conhecimentos!</p>
        </div>

        {/* Categories Collection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 animate-slide-up">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Coleção de Personagens
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`relative rounded-2xl p-4 transition-all duration-300 ${
                  category.collected
                    ? `bg-${category.id} shadow-lg`
                    : "bg-white/20 grayscale opacity-60"
                }`}
              >
                <img
                  src={categoryIcons[category.id]}
                  alt={category.name}
                  className="w-16 h-16 mx-auto mb-2 transition-transform hover:scale-110"
                />
                <p className="text-white text-sm font-medium">
                  {category.name}
                </p>
                {category.collected && (
                  <div className="absolute -top-2 -right-2 bg-correct-answer text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button
            onClick={onStartGame}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 font-bold text-xl px-12 py-6 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            Começar Jogo
          </Button>
        </div>

        {/* Footer */}
        <p
          className="text-white/60 text-sm animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          Responda perguntas de 6 categorias diferentes e colete todos os
          personagens!
        </p>
      </div>
    </div>
  );
};
