import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassroomWithDetails } from "@/types/classroom";
import { ClassroomRankings } from "./ClassroomRankings";
import { ClassroomStatistics } from "./ClassroomStatistics";
import { ClassroomStudentList } from "./ClassroomStudentList";
import { CustomQuestionsManager } from "./CustomQuestionsManager";
import { StudentGamePanel } from "./StudentGamePanel";
import {
  School,
  Trophy,
  Users,
  BarChart3,
  HelpCircle,
  Gamepad2,
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

  const handleStartGame = () => {
    // Fechar o dialog
    onOpenChange(false);

    // Navegar para a tela de jogo
    // O jogo já vai salvar automaticamente no ranking da sala
    toast({
      title: "🎮 Iniciando jogo!",
      description: `Seus pontos serão salvos em ${classroom.name}`,
    });
  };

  const isActive = () => {
    const now = new Date();
    const start = new Date(classroom.competition_start_date);
    const end = new Date(classroom.competition_end_date);
    return now >= start && now <= end && classroom.is_active;
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="6xl"
      maxHeight="screen"
    >
      <div className="flex flex-col h-[75vh] sm:h-[80vh] max-h-[75vh] sm:max-h-[80vh]">
        <div className="flex flex-col gap-1.5 text-center sm:text-left flex-shrink-0 pt-4 sm:pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <School className="h-6 w-6 text-white mt-1 flex-shrink-0" />
              <div className="min-w-0">
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
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
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

          <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-white/80">
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
            <div className="mt-1.5 sm:mt-2 mb-2 sm:mb-4 flex items-center gap-2">
              <span className="text-xs sm:text-sm text-white/80">
                Código da sala:
              </span>
              <code className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/5 backdrop-blur-sm rounded font-mono text-sm sm:text-base font-bold text-white">
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
              isTeacher ? "grid-cols-4" : "grid-cols-3"
            } h-auto p-px gap-px overflow-hidden items-stretch rounded-md border bg-white/5 backdrop-blur-sm border-white/20`}
          >
            <TabsTrigger
              value="rankings"
              className="flex h-full w-full items-center gap-1.5 px-1.5 py-[2px] my-px text-[10px] sm:text-[11px] text-white/80 rounded-md box-border leading-tight data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-white/30"
            >
              <Trophy className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Rankings</span>
              <span className="sm:hidden">Rank</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex h-full w-full items-center gap-1.5 px-1.5 py-[2px] my-px text-[10px] sm:text-[11px] text-white/80 rounded-md box-border leading-tight data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-white/30"
            >
              <BarChart3 className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Estatísticas</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {!isTeacher && (
              <TabsTrigger
                value="play"
                className="flex h-full w-full items-center gap-1.5 px-1.5 py-[2px] my-px text-[10px] sm:text-[11px] text-white/80 rounded-md box-border leading-tight data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-white/30"
              >
                <Gamepad2 className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">Jogar</span>
                <span className="sm:hidden">Jogar</span>
              </TabsTrigger>
            )}
            {isTeacher && (
              <>
                <TabsTrigger
                  value="students"
                  className="flex h-full w-full items-center gap-1.5 px-1.5 py-[2px] my-px text-[10px] sm:text-[11px] text-white/80 rounded-md box-border leading-tight data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-white/30"
                >
                  <Users className="h-3 w-3 shrink-0" />
                  <span className="hidden sm:inline">Alunos</span>
                  <span className="sm:hidden">Alunos</span>
                </TabsTrigger>
                <TabsTrigger
                  value="questions"
                  className="flex h-full w-full items-center gap-1.5 px-1.5 py-[2px] my-px text-[10px] sm:text-[11px] text-white/80 rounded-md box-border leading-tight data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:outline data-[state=active]:outline-1 data-[state=active]:outline-white/30"
                >
                  <HelpCircle className="h-3 w-3 shrink-0" />
                  <span className="hidden sm:inline">Perguntas</span>
                  <span className="sm:hidden">Q&A</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-2 sm:mt-4">
            <TabsContent value="rankings" className="mt-0">
              <ClassroomRankings classroomId={classroom.id} />
            </TabsContent>

            <TabsContent value="statistics" className="mt-0">
              <ClassroomStatistics classroomId={classroom.id} />
            </TabsContent>

            {!isTeacher && (
              <TabsContent value="play" className="mt-0">
                <StudentGamePanel
                  classroomId={classroom.id}
                  classroomName={classroom.name}
                  onStartGame={handleStartGame}
                />
              </TabsContent>
            )}

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
