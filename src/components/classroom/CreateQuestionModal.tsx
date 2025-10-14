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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle, Save, AlertCircle } from "lucide-react";

interface CreateQuestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroomId?: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: "sports", label: "⚽ Esportes", color: "bg-blue-500" },
  { value: "entertainment", label: "🎬 Entretenimento", color: "bg-pink-500" },
  { value: "art", label: "🎨 Arte", color: "bg-purple-500" },
  { value: "science", label: "🔬 Ciências", color: "bg-green-500" },
  { value: "geography", label: "🌍 Geografia", color: "bg-orange-500" },
  { value: "history", label: "🏛️ História", color: "bg-amber-500" },
];

const DIFFICULTIES = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Médio" },
  { value: "hard", label: "Difícil" },
];

export const CreateQuestionModal = ({
  open,
  onOpenChange,
  classroomId,
  onSuccess,
}: CreateQuestionModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: 0,
    category: "sports",
    difficulty: "medium",
    explanation: "",
    is_public: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.question_text.trim()) {
      toast({
        title: "❌ Erro",
        description: "Digite a pergunta",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.option_a.trim() ||
      !formData.option_b.trim() ||
      !formData.option_c.trim() ||
      !formData.option_d.trim()
    ) {
      toast({
        title: "❌ Erro",
        description: "Preencha todas as alternativas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("custom_questions").insert({
        created_by: userData.user.id,
        classroom_id: classroomId || null,
        question_text: formData.question_text,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_answer: formData.correct_answer,
        category: formData.category,
        difficulty: formData.difficulty,
        explanation: formData.explanation || null,
        is_public: formData.is_public,
      });

      if (error) throw error;

      toast({
        title: "✅ Pergunta criada!",
        description: "Sua pergunta foi adicionada com sucesso.",
      });

      // Resetar formulário
      setFormData({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: 0,
        category: "sports",
        difficulty: "medium",
        explanation: "",
        is_public: false,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao criar pergunta:", error);
      toast({
        title: "❌ Erro ao criar pergunta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="2xl"
      maxHeight="screen"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2 text-xl font-bold">
          <PlusCircle className="h-6 w-6" />
          Criar Nova Pergunta
        </div>

        {/* Alerta informativo */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">Dicas para criar boas perguntas:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Seja claro e objetivo na pergunta</li>
              <li>Crie alternativas plausíveis mas com apenas uma correta</li>
              <li>Adicione uma explicação para ajudar no aprendizado</li>
            </ul>
          </div>
        </div>

        {/* Pergunta */}
        <div className="space-y-2">
          <Label htmlFor="question">Pergunta *</Label>
          <Textarea
            id="question"
            placeholder="Digite a pergunta aqui..."
            value={formData.question_text}
            onChange={(e) =>
              setFormData({ ...formData, question_text: e.target.value })
            }
            rows={3}
            required
          />
        </div>

        {/* Alternativas */}
        <div className="space-y-4">
          <Label>Alternativas *</Label>

          <RadioGroup
            value={formData.correct_answer.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, correct_answer: parseInt(value) })
            }
          >
            {["A", "B", "C", "D"].map((letter, index) => (
              <div
                key={letter}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${letter}`}
                  className="mt-2"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`option-${letter}`}
                    className="font-bold text-primary cursor-pointer"
                  >
                    {letter}.
                  </Label>
                  <Input
                    placeholder={`Alternativa ${letter}`}
                    value={
                      formData[
                        `option_${letter.toLowerCase()}` as keyof typeof formData
                      ] as string
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`option_${letter.toLowerCase()}`]: e.target.value,
                      })
                    }
                    required
                  />
                  {formData.correct_answer === index && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ Resposta Correta
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Explicação */}
        <div className="space-y-2">
          <Label htmlFor="explanation">
            Explicação <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="explanation"
            placeholder="Explique por que a resposta está correta..."
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            rows={2}
          />
        </div>

        {/* Metadados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dificuldade */}
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) =>
                setFormData({ ...formData, difficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Público */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="is_public" className="cursor-pointer">
              Pergunta Pública
            </Label>
            <p className="text-sm text-muted-foreground">
              Outros professores poderão usar esta pergunta
            </p>
          </div>
          <Switch
            id="is_public"
            checked={formData.is_public}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_public: checked })
            }
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Pergunta
              </>
            )}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
};
