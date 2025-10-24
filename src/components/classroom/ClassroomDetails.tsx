import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassroomWithDetails } from "@/types/classroom";
import { ClassroomRankings } from "./ClassroomRankings";
import { ClassroomStatistics } from "./ClassroomStatistics";
import { ClassroomStudentList } from "./ClassroomStudentList";
import { CustomQuestionsManager } from "./CustomQuestionsManager";
import {
  School,
  Trophy,
  Users,
  BarChart3,
  HelpCircle,
  Play,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface ClassroomDetailsProps {
  classroom: ClassroomWithDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTeacher?: boolean;
}

export const ClassroomDetails = ({
  classroom,
  open,
  onOpenChange,
  isTeacher = false,
}: ClassroomDetailsProps) => {
  const [activeTab, setActiveTab] = useState("rankings");
  const { toast } = useToast();

  if (!classroom) return null;

  const isActive = () => {
    const now = new Date();
    const start = new Date(classroom.competition_start_date);
    const end = new Date(classroom.competition_end_date);
    return now >= start && now <= end && classroom.is_active;
  };

  const handleStartCompetition = () => {
    toast({
      title: "🎯 Competição Iniciada!",
      description:
        "A competição da sala foi iniciada. Os alunos podem começar a jogar!",
    });
    // Aqui você pode implementar a lógica para iniciar a competição
    // Por exemplo, atualizar o status da sala no banco de dados
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="6xl"
      maxHeight="screen"
    >
      <div className="flex flex-col h-[90vh] max-h-[90vh]">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <School className="h-6 w-6 text-white mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold tracking-tight text-xl mb-2 text-white">
                  {classroom.name}
                </h2>
                {classroom.description && (
                  <p className="text-sm text-white/80">
                    {classroom.description}
                  </p>
                )}
              </div>
            </div>
            {isTeacher && isActive() && (
              <Button
                onClick={handleStartCompetition}
                size="sm"
                className="bg-green-600/90 hover:bg-green-700/90 text-white backdrop-blur-sm border border-green-500/30 flex-shrink-0"
              >
                <Play className="h-4 w-4 mr-2" />
                Iniciar Competição
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {isActive() ? (
              <Badge className="bg-white/20 text-white border-white/20 hover:bg-white/30">
                Em Andamento
              </Badge>
            ) : (
              <Badge className="bg-white/5 text-white/80 border-white/20 hover:bg-white/20">
                Finalizada
              </Badge>
            )}
            {classroom.school_name && (
              <Badge className="bg-white/5 text-white/80 border-white/20 hover:bg-white/20">
                {classroom.school_name}
              </Badge>
            )}
            {classroom.subject && (
              <Badge className="bg-white/5 text-white/80 border-white/20 hover:bg-white/20">
                {classroom.subject.charAt(0).toUpperCase() +
                  classroom.subject.slice(1)}
              </Badge>
            )}
          </div>

          <div className="mt-2 text-sm text-white/80">
            📅{" "}
            {format(
              new Date(classroom.competition_start_date),
              "dd 'de' MMMM",
              {
                locale: ptBR,
              }
            )}{" "}
            até{" "}
            {format(
              new Date(classroom.competition_end_date),
              "dd 'de' MMMM 'de' yyyy",
              {
                locale: ptBR,
              }
            )}
          </div>

          {isTeacher && (
            <div className="mt-2 mb-2 flex items-center gap-2">
              <span className="text-sm text-white/80">Código da sala:</span>
              <code className="px-3 py-1 bg-white/5 backdrop-blur-sm rounded font-mono text-base font-bold text-white">
                {classroom.class_code}
              </code>
            </div>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList
            className={`grid w-full ${
              isTeacher ? "grid-cols-4" : "grid-cols-2"
            } bg-white/5 backdrop-blur-sm border-white/20`}
          >
            <TabsTrigger
              value="rankings"
              className="flex items-center gap-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Rankings</span>
              <span className="sm:hidden">Rank</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {isTeacher && (
              <>
                <TabsTrigger
                  value="students"
                  className="flex items-center gap-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Alunos</span>
                  <span className="sm:hidden">Alunos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="questions"
                  className="flex items-center gap-2 text-white/80 data-[state=active]:bg-white/20 data-[state=active]:text-white"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Perguntas</span>
                  <span className="sm:hidden">Q&A</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="rankings" className="mt-0">
              <ClassroomRankings classroomId={classroom.id} />
            </TabsContent>

            <TabsContent value="statistics" className="mt-0">
              <ClassroomStatistics classroomId={classroom.id} />
            </TabsContent>

            {isTeacher && (
              <>
                <TabsContent value="students" className="mt-0">
                  <ClassroomStudentList classroomId={classroom.id} />
                </TabsContent>

                <TabsContent value="questions" className="mt-0">
                  <CustomQuestionsManager classroomId={classroom.id} />
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </ResponsiveDialog>
  );
};
