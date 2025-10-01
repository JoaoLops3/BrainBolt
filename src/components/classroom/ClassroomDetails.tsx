import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassroomWithDetails } from "@/types/classroom";
import { ClassroomRankings } from "./ClassroomRankings";
import { ClassroomStatistics } from "./ClassroomStatistics";
import { ClassroomStudentList } from "./ClassroomStudentList";
import { School, Trophy, Users, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  if (!classroom) return null;

  const isActive = () => {
    const now = new Date();
    const start = new Date(classroom.competition_start_date);
    const end = new Date(classroom.competition_end_date);
    return now >= start && now <= end && classroom.is_active;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <School className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl mb-2">
                {classroom.name}
              </DialogTitle>
              {classroom.description && (
                <p className="text-sm text-muted-foreground">
                  {classroom.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {isActive() ? (
                  <Badge className="bg-green-500">Em Andamento</Badge>
                ) : (
                  <Badge variant="secondary">Finalizada</Badge>
                )}
                {classroom.school_name && (
                  <Badge variant="outline">{classroom.school_name}</Badge>
                )}
                {classroom.subject && (
                  <Badge variant="outline">
                    {classroom.subject.charAt(0).toUpperCase() +
                      classroom.subject.slice(1)}
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                📅{" "}
                {format(new Date(classroom.competition_start_date), "dd 'de' MMMM", {
                  locale: ptBR,
                })}{" "}
                até{" "}
                {format(new Date(classroom.competition_end_date), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </div>
              {isTeacher && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Código da sala:
                  </span>
                  <code className="px-3 py-1 bg-muted rounded font-mono text-lg font-bold">
                    {classroom.class_code}
                  </code>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rankings" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Rankings
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            {isTeacher && (
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Alunos
              </TabsTrigger>
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
              <TabsContent value="students" className="mt-0">
                <ClassroomStudentList classroomId={classroom.id} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

