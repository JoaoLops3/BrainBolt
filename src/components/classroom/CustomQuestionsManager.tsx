import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateQuestionModal } from "./CreateQuestionModal";
import { CustomQuestion } from "@/types/classroom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BarChart3,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface CustomQuestionsManagerProps {
  classroomId: string;
}

const categoryLabels = {
  sports: {
    label: "Esportes",
    emoji: "⚽",
    color: "bg-blue-100 text-blue-700",
  },
  entertainment: {
    label: "Entretenimento",
    emoji: "🎬",
    color: "bg-pink-100 text-pink-700",
  },
  art: { label: "Arte", emoji: "🎨", color: "bg-purple-100 text-purple-700" },
  science: {
    label: "Ciências",
    emoji: "🔬",
    color: "bg-green-100 text-green-700",
  },
  geography: {
    label: "Geografia",
    emoji: "🌍",
    color: "bg-orange-100 text-orange-700",
  },
  history: {
    label: "História",
    emoji: "🏛️",
    color: "bg-amber-100 text-amber-700",
  },
  mathematics: {
    label: "Matemática",
    emoji: "🔢",
    color: "bg-cyan-100 text-cyan-700",
  },
  portuguese: {
    label: "Português",
    emoji: "📚",
    color: "bg-indigo-100 text-indigo-700",
  },
};

const difficultyLabels = {
  easy: { label: "Fácil", color: "bg-green-100 text-green-700" },
  medium: { label: "Médio", color: "bg-yellow-100 text-yellow-700" },
  hard: { label: "Difícil", color: "bg-red-100 text-red-700" },
};

export const CustomQuestionsManager = ({
  classroomId,
}: CustomQuestionsManagerProps) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<CustomQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<CustomQuestion[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<CustomQuestion | null>(
    null
  );
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  // Load questions
  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("custom_questions")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuestions((data as CustomQuestion[]) || []);
    } catch (error: any) {
      console.error("Error loading questions:", error);
      toast({
        title: "❌ Erro ao carregar perguntas",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`custom_questions_${classroomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "custom_questions",
          filter: `classroom_id=eq.${classroomId}`,
        },
        () => {
          loadQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroomId]);

  // Filter questions
  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((q) => q.category === filterCategory);
    }

    if (filterDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === filterDifficulty);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, filterCategory, filterDifficulty]);

  const handleToggleActive = async (
    questionId: string,
    currentStatus: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("custom_questions")
        .update({ is_active: !currentStatus })
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: currentStatus ? "🔒 Pergunta desativada" : "✅ Pergunta ativada",
        description: currentStatus
          ? "A pergunta não aparecerá mais nos jogos."
          : "A pergunta está disponível para os jogos.",
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("custom_questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;

      toast({
        title: "✅ Pergunta excluída",
        description: "A pergunta foi removida com sucesso.",
      });

      setDeleteQuestionId(null);
    } catch (error: any) {
      toast({
        title: "❌ Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (question: CustomQuestion) => {
    setEditingQuestion(question);
    setIsCreateModalOpen(true);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingQuestion(null);
  };

  const getAccuracyPercentage = (question: CustomQuestion): number => {
    if (question.usage_count === 0) return 0;
    return Math.round((question.correct_count / question.usage_count) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Banco de Perguntas</h2>
          <p className="text-white/80">
            Gerencie as perguntas customizadas da sala
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Pergunta
        </Button>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-base text-white">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                placeholder="Buscar pergunta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 backdrop-blur-sm placeholder:text-white/60 text-white focus:bg-white/20 focus:border-white/40"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="bg-white/5 border-white/20 backdrop-blur-sm text-white">
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-white/5 border-white/20">
                <SelectItem value="all" className="text-white">
                  Todas as categorias
                </SelectItem>
                {Object.entries(categoryLabels).map(
                  ([key, { label, emoji }]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {emoji} {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger className="bg-white/5 border-white/20 backdrop-blur-sm text-white">
                <SelectValue placeholder="Todas as dificuldades" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-sm bg-white/5 border-white/20">
                <SelectItem value="all" className="text-white">
                  Todas as dificuldades
                </SelectItem>
                {Object.entries(difficultyLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="text-white">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between text-sm text-white/80">
            <span>
              {filteredQuestions.length} de {questions.length} perguntas
            </span>
            {questions.length > 0 && (
              <span>{questions.filter((q) => q.is_active).length} ativas</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-white/80">Carregando perguntas...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/5 border-white/20">
          <CardContent className="py-12 text-center">
            <p className="text-white/80 mb-4">
              {questions.length === 0
                ? "Nenhuma pergunta criada ainda."
                : "Nenhuma pergunta encontrada com os filtros aplicados."}
            </p>
            {questions.length === 0 && (
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Pergunta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredQuestions.map((question) => {
            const accuracy = getAccuracyPercentage(question);
            const categoryInfo = categoryLabels[question.category];
            const difficultyInfo = difficultyLabels[question.difficulty];

            return (
              <Card
                key={question.id}
                className={`backdrop-blur-sm bg-white/5 border-white/20 ${
                  !question.is_active ? "opacity-60" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          className={`${categoryInfo.color} border-white/20`}
                        >
                          {categoryInfo.emoji} {categoryInfo.label}
                        </Badge>
                        <Badge
                          className={`${difficultyInfo.color} border-white/20`}
                        >
                          {difficultyInfo.label}
                        </Badge>
                        {!question.is_active && (
                          <Badge
                            variant="outline"
                            className="bg-white/5 text-white/80 border-white/20"
                          >
                            Inativa
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base font-medium text-white">
                        {question.question}
                      </CardTitle>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleToggleActive(question.id, question.is_active)
                        }
                        title={question.is_active ? "Desativar" : "Ativar"}
                        className="text-white hover:bg-white/20"
                      >
                        {question.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(question)}
                        title="Editar"
                        className="text-white hover:bg-white/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteQuestionId(question.id)}
                        title="Excluir"
                        className="text-red-300 hover:bg-red-500/20 hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Options */}
                  <div className="grid gap-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-md text-sm flex items-center gap-2 ${
                          index === question.correct_answer
                            ? "bg-green-500/20 border border-green-500/50 backdrop-blur-sm"
                            : "bg-white/5 backdrop-blur-sm"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold text-white">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 text-white">{option}</span>
                        {index === question.correct_answer && (
                          <CheckCircle2 className="h-4 w-4 text-green-300" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="bg-blue-500/20 p-3 rounded-md backdrop-blur-sm border border-blue-500/50">
                      <p className="text-xs font-medium text-blue-300 mb-1">
                        💡 Explicação:
                      </p>
                      <p className="text-sm text-blue-200">
                        {question.explanation}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/20 text-xs text-white/80">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{question.usage_count} usos</span>
                    </div>
                    {question.usage_count > 0 && (
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            accuracy >= 70
                              ? "text-green-300"
                              : "text-yellow-300"
                          }
                        >
                          {accuracy}% de acertos
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateQuestionModal
        open={isCreateModalOpen}
        onOpenChange={handleModalClose}
        classroomId={classroomId}
        onQuestionCreated={loadQuestions}
        editQuestion={editingQuestion}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteQuestionId}
        onOpenChange={(open) => !open && setDeleteQuestionId(null)}
      >
        <AlertDialogContent className="backdrop-blur-sm bg-white/5 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Excluir pergunta?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Esta ação não pode ser desfeita. A pergunta será removida
              permanentemente do banco de perguntas da sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/5 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteQuestionId && handleDelete(deleteQuestionId)}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/50"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
