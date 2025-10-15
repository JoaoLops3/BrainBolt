import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClassroomWithDetails } from "@/types/classroom";
import {
  School,
  Users,
  Calendar,
  Copy,
  Eye,
  Settings,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClassroomCardProps {
  classroom: ClassroomWithDetails;
  onViewDetails: (classroom: ClassroomWithDetails) => void;
  onSettings?: (classroom: ClassroomWithDetails) => void;
  onDelete?: (classroom: ClassroomWithDetails) => void;
  isTeacher?: boolean;
}

export const ClassroomCard = ({
  classroom,
  onViewDetails,
  onSettings,
  onDelete,
  isTeacher = false,
}: ClassroomCardProps) => {
  const { toast } = useToast();

  const copyClassCode = () => {
    try {
      if (navigator && (navigator as any).clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(classroom.class_code).then(
          () =>
            toast({
              title: "✅ Código copiado!",
              description: `Código ${classroom.class_code} copiado para a área de transferência.`,
            }),
          () => {
            throw new Error("Clipboard API falhou");
          }
        );
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = classroom.class_code;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          toast({
            title: "✅ Código copiado!",
            description: `Código ${classroom.class_code} copiado para a área de transferência.`,
          });
        } else {
          throw new Error("document.execCommand falhou");
        }
      }
    } catch (error) {
      toast({
        title: "❌ Não foi possível copiar",
        description: "Copie manualmente o código da sala.",
        variant: "destructive",
      });
    }
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(classroom.competition_start_date);
    const end = new Date(classroom.competition_end_date);
    return now >= start && now <= end && classroom.is_active;
  };

  const getStatusBadge = () => {
    const now = new Date();
    const start = new Date(classroom.competition_start_date);
    const end = new Date(classroom.competition_end_date);

    if (!classroom.is_active) {
      return <Badge variant="destructive">Inativa</Badge>;
    }

    if (now < start) {
      return (
        <Badge variant="secondary" className="bg-blue-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Aguardando Início
        </Badge>
      );
    }

    if (now > end) {
      return <Badge variant="secondary">Finalizada</Badge>;
    }

    return (
      <Badge variant="default" className="bg-green-500">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Em Andamento
      </Badge>
    );
  };

  const getSubjectColor = () => {
    const colors: Record<string, string> = {
      science:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      history:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
      geography:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      art: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      sports: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      math: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      language: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
    };
    return colors[classroom.subject || "general"] || colors.general;
  };

  const getGradeLevelLabel = () => {
    const labels: Record<string, string> = {
      elementary: "Fund.",
      middle: "Médio",
      high: "Pré-Vest.",
      college: "Superior",
      other: "Outro",
    };
    return labels[classroom.grade_level || "other"];
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <School className="h-5 w-5 text-primary flex-shrink-0" />
              <h3 className="font-bold text-lg truncate">{classroom.name}</h3>
            </div>
            {classroom.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {classroom.description}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {classroom.school_name && (
          <div className="flex items-center gap-2 text-sm">
            <School className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">{classroom.school_name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {classroom.grade_level && (
            <Badge variant="outline" className="text-xs">
              {getGradeLevelLabel()}
            </Badge>
          )}
          {classroom.subject && (
            <Badge className={`text-xs ${getSubjectColor()}`}>
              {classroom.subject === "general"
                ? "Geral"
                : classroom.subject.charAt(0).toUpperCase() +
                  classroom.subject.slice(1)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {classroom.student_count || 0} aluno
            {(classroom.student_count || 0) !== 1 ? "s" : ""}
            {classroom.max_students && ` / ${classroom.max_students}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(classroom.competition_start_date), "dd/MMM", {
              locale: ptBR,
            })}{" "}
            -{" "}
            {format(new Date(classroom.competition_end_date), "dd/MMM/yy", {
              locale: ptBR,
            })}
          </span>
        </div>

        {isTeacher && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 bg-muted rounded px-3 py-2 font-mono text-center text-lg font-bold tracking-wider">
              {classroom.class_code}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyClassCode}
              className="flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-3">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onViewDetails(classroom)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
        {isTeacher && onSettings && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSettings(classroom)}
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
        {isTeacher && onDelete && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(classroom)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            title="Excluir sala"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
