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
import { Save, X, HelpCircle } from "lucide-react";
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
        <div className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          {editQuestion ? "Editar Pergunta" : "Criar Nova Pergunta"}
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-medium">
              Pergunta *
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Digite a pergunta aqui..."
              className="min-h-[80px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {question.length}/500
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Opções de Resposta *</Label>
            <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    className="shrink-0"
                  />
                  <div className="flex-1">
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Opção ${String.fromCharCode(65 + index)}`}
                      maxLength={200}
                      className={
                        parseInt(correctAnswer) === index
                          ? "border-green-500 bg-green-50 dark:bg-green-950"
                          : ""
                      }
                    />
                  </div>
                </div>
              ))}
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              ✓ Selecione a opção correta clicando no círculo
            </p>
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria *</Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val as CategoryType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.emoji} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Dificuldade *</Label>
              <Select
                value={difficulty}
                onValueChange={(val) =>
                  setDifficulty(val as "easy" | "medium" | "hard")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((diff) => (
                    <SelectItem key={diff.value} value={diff.value}>
                      <span className={diff.color}>{diff.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Explanation (optional) */}
          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-sm font-medium">
              Explicação (Opcional)
            </Label>
            <Textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Adicione uma explicação educacional sobre a resposta correta..."
              className="min-h-[60px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              💡 Esta explicação será mostrada aos alunos após responderem
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading
              ? "Salvando..."
              : editQuestion
              ? "Atualizar Pergunta"
              : "Criar Pergunta"}
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
};
