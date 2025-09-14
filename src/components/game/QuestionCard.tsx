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
import { Zap, Clock } from "lucide-react";

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
      return "bg-green-500 text-white animate-pulse border-2 border-green-400 shadow-lg";
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
  };

  const categoryNames: Record<string, string> = {
    sports: "Esportes",
    entertainment: "Entretenimento",
    art: "Arte",
    science: "Ciências",
    geography: "Geografia",
    history: "História",
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4 no-scroll">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress */}
        <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm font-medium">Progresso</span>
            <span className="text-white text-sm font-bold">
              {questionNumber} / {totalQuestions}
            </span>
          </div>
          <Progress
            value={(questionNumber / totalQuestions) * 100}
            className="h-3 bg-white/20"
          />
        </div>

        {/* Question Card */}
        <Card className="bg-white/95 backdrop-blur-lg border-white/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
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

            <CardTitle className="text-2xl font-bold leading-tight">
              {question.question}
            </CardTitle>

            <CardDescription className="text-base">
              Escolha a alternativa correta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => !showAnswer && onSelectAnswer(index)}
                disabled={showAnswer}
                className={cn(
                  "w-full p-6 text-left text-lg transition-all duration-300 hover:scale-[1.02] justify-start font-medium",
                  getButtonStyle(index)
                )}
                variant="ghost"
              >
                <span className="mr-4 font-bold text-primary">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="flex-1">{option}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
