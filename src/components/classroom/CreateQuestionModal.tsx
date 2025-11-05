import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X } from "lucide-react";
import { CategoryType } from "@/types/game";
import { CustomQuestion, CreateCustomQuestionData } from "@/types/classroom";

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroomId: string;
  onQuestionCreated?: () => void;
  editQuestion?: CustomQuestion | null;
}

const categories: { value: CategoryType; label: string; emoji: string }[] = [
  { value: "sports", label: "Esportes", emoji: "⚽" },
  { value: "entertainment", label: "Entretenimento", emoji: "🎬" },
  { value: "art", label: "Arte", emoji: "🎨" },
  { value: "science", label: "Ciências", emoji: "🔬" },
  { value: "geography", label: "Geografia", emoji: "🌍" },
  { value: "history", label: "História", emoji: "🏛️" },
  { value: "mathematics", label: "Matemática", emoji: "🔢" },
  { value: "portuguese", label: "Português", emoji: "📚" },
];

const difficulties = [
  { value: "easy", label: "Fácil", color: "text-green-600" },
  { value: "medium", label: "Médio", color: "text-yellow-600" },
  { value: "hard", label: "Difícil", color: "text-red-600" },
];

export const CreateQuestionModal = ({
  open,
  onOpenChange,
  classroomId,
  onQuestionCreated,
  editQuestion,
}: CreateQuestionModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [question, setQuestion] = useState(editQuestion?.question || "");
  const [options, setOptions] = useState<string[]>(
    editQuestion?.options || ["", "", "", ""]
  );
  const [correctAnswer, setCorrectAnswer] = useState<string>(
    editQuestion?.correct_answer?.toString() || "0"
  );
  const [category, setCategory] = useState<CategoryType>(
    (editQuestion?.category as CategoryType) || "sports"
  );
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    (editQuestion?.difficulty as "easy" | "medium" | "hard") || "medium"
  );
  const [explanation, setExplanation] = useState(
    editQuestion?.explanation || ""
  );

  // Reset form when modal opens/closes
  const resetForm = () => {
    if (editQuestion) {
      setQuestion(editQuestion.question);
      setOptions(editQuestion.options);
      setCorrectAnswer(editQuestion.correct_answer.toString());
      setCategory(editQuestion.category as CategoryType);
      setDifficulty(editQuestion.difficulty as "easy" | "medium" | "hard");
      setExplanation(editQuestion.explanation || "");
    } else {
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("0");
      setCategory("sports");
      setDifficulty("medium");
      setExplanation("");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = (): boolean => {
    if (!question.trim()) {
      toast({
        title: "⚠️ Pergunta obrigatória",
        description: "Digite uma pergunta válida.",
        variant: "destructive",
      });
      return false;
    }

    const filledOptions = options.filter((opt) => opt.trim()).length;
    if (filledOptions < 4) {
      toast({
        title: "⚠️ Opções incompletas",
        description: "Preencha todas as 4 opções de resposta.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const questionData: CreateCustomQuestionData = {
        classroom_id: classroomId,
        question: question.trim(),
        question_text: question.trim(),
        options: options.map((opt) => opt.trim()),
        option_a: options[0]?.trim() || "",
        option_b: options[1]?.trim() || "",
        option_c: options[2]?.trim() || "",
        option_d: options[3]?.trim() || "",
        correct_answer: parseInt(correctAnswer),
        category,
        difficulty,
        explanation: explanation.trim() || null,
        is_active: true,
        created_by: user.id,
      };

      if (editQuestion) {
        // Update existing question
        const { error } = await supabase
          .from("custom_questions")
          .update(questionData)
          .eq("id", editQuestion.id);

        if (error) throw error;

        toast({
          title: "✅ Pergunta atualizada!",
          description: "A pergunta foi atualizada com sucesso.",
        });
      } else {
        // Create new question
        const { error } = await supabase
          .from("custom_questions")
          .insert([questionData]);

        if (error) throw error;

        toast({
          title: "✅ Pergunta criada!",
          description: "A pergunta foi adicionada à sala de aula.",
        });
      }

      resetForm();
      onOpenChange(false);
      onQuestionCreated?.();
    } catch (error: any) {
      console.error("Error saving question:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
      maxWidth="2xl"
      maxHeight="screen"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold text-white pl-14 pt-3">
          {editQuestion ? "Editar Pergunta" : "Criar Nova Pergunta"}
        </div>

        <div className="space-y-4 sm:space-y-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto pr-2">
          {/* Question */}
          <div className="space-y-2">
            <Label
              htmlFor="question"
              className="text-sm sm:text-base font-medium text-white/90"
            >
              Pergunta *
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite a pergunta aqui..."
              className="min-h-[80px] sm:min-h-[100px] resize-none backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:border-white/40"
              maxLength={500}
            />
            <p className="text-xs sm:text-sm text-white/70 text-right">
              {question.length}/500
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm sm:text-base font-medium text-white/90">
              Opções de Resposta *
            </Label>
            <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="shrink-0 border-white/40 text-white focus-visible:ring-white/30"
                  />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                      maxLength={200}
                      className={
                        parseInt(correctAnswer) === index
                          ? "border-green-400/60 bg-green-500/20 backdrop-blur-sm text-white placeholder:text-white/60 focus-visible:ring-green-400/30 focus-visible:border-green-400/60"
                          : "backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:border-white/40"
                      }
                    />
                  </div>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs sm:text-sm text-white/70">
              ✓ Selecione a opção correta clicando no círculo
            </p>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium text-white/90">
                Categoria *
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as CategoryType)}
              >
                <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/20 text-white focus:ring-white/30 focus:border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/10 border-white/20">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-white focus:bg-white/20 focus:text-white"
                    >
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base font-medium text-white/90">
                Dificuldade *
              </Label>
              <Select
                value={difficulty}
                onValueChange={(val) =>
                  setDifficulty(val as "easy" | "medium" | "hard")
                }
              >
                <SelectTrigger className="backdrop-blur-sm bg-white/10 border-white/20 text-white focus:ring-white/30 focus:border-white/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-xl bg-white/10 border-white/20">
                  {difficulties.map((diff) => (
                    <SelectItem
                      key={diff.value}
                      value={diff.value}
                      className="text-white focus:bg-white/20 focus:text-white"
                    >
                      <span className={diff.color}>{diff.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Explanation (optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="explanation"
              className="text-sm sm:text-base font-medium text-white/90"
            >
              Explicação (Opcional)
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Adicione uma explicação educacional sobre a resposta correta..."
              className="min-h-[60px] sm:min-h-[80px] resize-none backdrop-blur-sm bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/30 focus-visible:border-white/40"
              maxLength={500}
            />
            <p className="text-xs sm:text-sm text-white/70">
              💡 Esta explicação será mostrada aos alunos após responderem
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-white/20">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/30"
          >
            <X className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">Cancelar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="backdrop-blur-sm bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:text-white focus-visible:ring-white/30 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">
              {isLoading
                ? "Salvando..."
                : editQuestion
                ? "Atualizar Pergunta"
                : "Criar Pergunta"}
            </span>
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
