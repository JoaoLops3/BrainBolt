import { Question, GameMode } from "@/types/game";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Zap, Clock, Lightbulb } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  showAnswer: boolean;
  onSelectAnswer: (index: number) => void;
  gameMode?: GameMode;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showAnswer,
  onSelectAnswer,
  gameMode = "normal",
}: QuestionCardProps) => {
  const getButtonStyle = (index: number) => {
    if (!showAnswer) {
      return selectedAnswer === index
        ? "bg-primary text-primary-foreground shadow-lg scale-105"
        : "bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary/50 hover:shadow-md transition-all duration-200";
    }

    if (index === question.correctAnswer) {
      return "bg-green-500 text-white border-2 border-green-400 shadow-lg";
    }

    if (selectedAnswer === index && index !== question.correctAnswer) {
      return "bg-red-500 text-white border-2 border-red-400 shadow-lg";
    }

    return "bg-gray-100 text-gray-400 opacity-60";
  };

  const categoryColors: Record<string, string> = {
    sports: "bg-gradient-to-r from-blue-500 to-blue-600",
    entertainment: "bg-gradient-to-r from-pink-500 to-pink-600",
    art: "bg-gradient-to-r from-purple-500 to-purple-600",
    science: "bg-gradient-to-r from-green-500 to-green-600",
    geography: "bg-gradient-to-r from-orange-500 to-orange-600",
    history: "bg-gradient-to-r from-amber-500 to-amber-600",
    mathematics: "bg-gradient-to-r from-cyan-500 to-cyan-600",
    portuguese: "bg-gradient-to-r from-indigo-500 to-indigo-600",
  };

  const categoryNames: Record<string, string> = {
    sports: "Esportes",
    entertainment: "Entretenimento",
    art: "Arte",
    science: "Ciências",
    geography: "Geografia",
    history: "História",
    mathematics: "Matemática",
    portuguese: "Português",
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Progress */}
      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-3 sm:p-4 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80 text-sm font-medium">Progresso</span>
          <span className="text-white text-sm font-bold">
            {questionNumber} / {totalQuestions}
          </span>
        </div>
        <Progress
          value={(questionNumber / totalQuestions) * 100}
          className="h-2 sm:h-3 bg-white/20"
        />
      </div>

      {/* Question Card */}
      <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 flex-wrap">
              <Badge
                variant="secondary"
                className={`${
                  categoryColors[question.category]
                } text-white border-white/20`}
              >
                {categoryNames[question.category]}
              </Badge>

              {gameMode === "speed" && (
                <Badge
                  variant="destructive"
                  className="bg-orange-500 text-white"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Veloz
                </Badge>
              )}
            </div>

            <Badge
              variant="outline"
              className="border-muted text-muted-foreground"
            >
              {questionNumber} / {totalQuestions}
            </Badge>
          </div>

          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
            {question.question}
          </CardTitle>

          <CardDescription className="text-sm sm:text-base">
            Escolha a alternativa correta
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => !showAnswer && onSelectAnswer(index)}
              disabled={showAnswer}
              className={cn(
                "w-full p-4 sm:p-6 text-left text-base sm:text-lg transition-all duration-300 hover:scale-[1.02] justify-start font-medium",
                getButtonStyle(index)
              )}
              variant="ghost"
            >
              <span className="mr-3 sm:mr-4 font-bold text-primary">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="flex-1 text-left">{option}</span>
            </Button>
          ))}

          {/* Show explanation if available and answer is shown */}
          {showAnswer && question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800 animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    💡 Explicação:
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                    {question.explanation}
                  </p>
                  {question.isCustom && (
                    <p className="text-xs text-blue-500 dark:text-blue-500 italic mt-2">
                      ✨ Pergunta criada pelo professor
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
