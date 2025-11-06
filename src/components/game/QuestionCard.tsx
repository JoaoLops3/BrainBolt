import { Question, GameMode } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

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
        ? "bg-white/30 border-white/30 text-white active:bg-white/30"
        : "bg-white/5 border-white/20 hover:bg-white/20 text-white active:bg-white/30";
    }

    if (index === question.correctAnswer) {
      return "bg-green-500/90 backdrop-blur-lg text-white border-green-400 shadow-lg shadow-green-500/50";
    }

    if (selectedAnswer === index && index !== question.correctAnswer) {
      return "bg-red-500/90 backdrop-blur-lg text-white border-red-400 shadow-lg shadow-red-500/50";
    }

    return "bg-white/5 border-white/20 text-white opacity-60";
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
      <Card className="rounded-lg border text-card-foreground backdrop-blur-lg bg-white/20 border-white/30 shadow-xl">
        <CardHeader className="flex flex-col space-y-1.5 p-4 sm:p-6">
          <CardTitle className="font-semibold tracking-tight text-lg sm:text-xl md:text-2xl text-center text-white leading-tight">
            {question.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => !showAnswer && onSelectAnswer(index)}
              disabled={showAnswer}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground w-full h-auto min-h-[52px] sm:min-h-[60px] text-left justify-start p-3 sm:p-4 transition-all",
                getButtonStyle(index)
              )}
              variant="ghost"
            >
              <span className="font-semibold mr-2 sm:mr-3 text-base sm:text-lg flex-shrink-0">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-sm sm:text-base leading-tight">
                {option}
              </span>
            </Button>
          ))}

          {/* Show explanation if available and answer is shown */}
          {showAnswer && question.explanation && (
            <div className="mt-4 p-4 bg-blue-500/20 backdrop-blur-lg rounded-lg border border-blue-400/30 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-300 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    💡 Explicação:
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">
                    {question.explanation}
                  </p>
                  {question.isCustom && (
                    <p className="text-xs text-blue-200 italic mt-2">
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
