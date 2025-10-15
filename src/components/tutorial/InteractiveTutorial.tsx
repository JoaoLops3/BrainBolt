import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Zap,
  Users,
  Trophy,
  Brain,
  School,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  action?: string;
}

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Bem-vindo ao Brain Bolt! 🧠",
    description:
      "Brain Bolt é um jogo de quiz educacional que transforma aprendizado em diversão! Vamos fazer um tour rápido pelas funcionalidades.",
    icon: <Brain className="h-16 w-16 text-purple-500" />,
    tips: [
      "400+ perguntas em 6 categorias diferentes",
      "Jogue sozinho ou com amigos online",
      "Colete conquistas e desbloqueie personagens",
    ],
    action: "Vamos começar!",
  },
  {
    id: 2,
    title: "Modos de Jogo 🎮",
    description:
      "Escolha entre diferentes modos de jogo de acordo com seu estilo:",
    icon: <Play className="h-16 w-16 text-blue-500" />,
    tips: [
      "⏱️ Normal: Sem pressão de tempo, ideal para estudar",
      "⚡ Veloz: 15 segundos por pergunta para desafio intenso",
      "🏫 Físico: Use botões físicos em sala de aula",
    ],
    action: "Próximo",
  },
  {
    id: 3,
    title: "Multiplayer em Tempo Real 🌐",
    description: "Desafie seus amigos em partidas online emocionantes!",
    icon: <Users className="h-16 w-16 text-pink-500" />,
    tips: [
      "Crie uma sala privada e compartilhe o código",
      "15 segundos por pergunta para ambos os jogadores",
      "Veja quem é o mais rápido e inteligente!",
    ],
    action: "Continuar",
  },
  {
    id: 4,
    title: "Conquistas e Personagens 🏆",
    description: "Colecione personagens e conquiste troféus!",
    icon: <Trophy className="h-16 w-16 text-yellow-500" />,
    tips: [
      "Acerte 2+ perguntas de uma categoria para ganhar um personagem",
      "Desbloqueie conquistas especiais jogando",
      "Compare suas estatísticas com amigos",
    ],
    action: "Próximo",
  },
  {
    id: 5,
    title: "Salas Educacionais 🏫",
    description: "Professores podem criar salas para competições em turma!",
    icon: <School className="h-16 w-16 text-green-500" />,
    tips: [
      "Professores: Criem perguntas customizadas",
      "Organizem competições com rankings",
      "Alunos: Entrem em salas e compitam com colegas",
    ],
    action: "Próximo",
  },
  {
    id: 6,
    title: "Pronto para Começar! 🚀",
    description:
      "Você já sabe tudo que precisa! Hora de testar seus conhecimentos.",
    icon: <Check className="h-16 w-16 text-purple-500" />,
    tips: [
      "Dica: Comece pelo Modo Normal para se familiarizar",
      "Explore as categorias que mais gosta",
      "Convide amigos para jogar juntos!",
    ],
    action: "Começar a Jogar!",
  },
];

export const InteractiveTutorial = ({
  onComplete,
  onSkip,
}: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  useEffect(() => {
    // Prevent scroll when tutorial is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center safe-top safe-bottom animate-in fade-in-0">
      {/* Wrapper responsivo com scroll */}
      <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <Card className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl my-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200 dark:border-purple-800 shadow-2xl animate-in slide-in-from-bottom-4">
          {/* Header com progresso */}
          <div className="p-4 sm:p-5 md:p-6 pb-0">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-purple-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-xs sm:text-sm">
                  {currentStep + 1}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  de {tutorialSteps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <Progress value={progress} className="h-1.5 sm:h-2 mb-4 sm:mb-6" />
          </div>

          <CardContent className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Ícone principal */}
            <div className="flex justify-center animate-in zoom-in-50 duration-500">
              <div className="bg-white dark:bg-gray-900 rounded-full p-4 sm:p-5 md:p-6 shadow-lg">
                <div className="scale-75 sm:scale-90 md:scale-100">
                  {step.icon}
                </div>
              </div>
            </div>

            {/* Título */}
            <div className="text-center space-y-2 sm:space-y-3 animate-in slide-in-from-bottom-2 duration-500 px-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                {step.title}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto">
                {step.description}
              </p>
            </div>

            {/* Dicas */}
            <div className="space-y-2 sm:space-y-3 animate-in slide-in-from-bottom-3 duration-500 delay-100">
              {step.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-purple-100 dark:border-purple-900"
                >
                  <div className="bg-purple-500 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>

            {/* Botões de navegação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 pt-3 sm:pt-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center justify-center gap-2 h-11 sm:h-10 text-sm sm:text-base order-2 sm:order-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden xs:inline">Anterior</span>
                <span className="xs:hidden">Voltar</span>
              </Button>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
                {currentStep < tutorialSteps.length - 1 && (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-xs sm:text-sm h-9 sm:h-10"
                  >
                    Pular Tutorial
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-11 sm:h-10 text-sm sm:text-base font-medium"
                >
                  <span>{step.action}</span>
                  {currentStep < tutorialSteps.length - 1 ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Indicadores de passo */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-3">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? "w-6 sm:w-8 bg-purple-500"
                      : index < currentStep
                      ? "w-1.5 sm:w-2 bg-purple-300"
                      : "w-1.5 sm:w-2 bg-gray-300 dark:bg-gray-700"
                  }`}
                  aria-label={`Ir para passo ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
