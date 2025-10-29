import { useState } from "react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomCard } from "./ClassroomCard";
import { CreateClassroomModal } from "./CreateClassroomModal";
import { ClassroomDetails } from "./ClassroomDetails";
import { ClassroomWithDetails } from "@/types/classroom";
import { School, Plus, Loader2, GraduationCap, ArrowLeft } from "lucide-react";
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

interface TeacherDashboardProps {
  onBack: () => void;
}

export const TeacherDashboard = ({ onBack }: TeacherDashboardProps) => {
  const { classrooms, loading, deleteClassroom } = useClassrooms();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classroomToDelete, setClassroomToDelete] =
    useState<ClassroomWithDetails | null>(null);

  const handleViewDetails = (classroom: ClassroomWithDetails) => {
    setSelectedClassroom(classroom);
    setDetailsOpen(true);
  };

  const handleDeleteClassroom = (classroom: ClassroomWithDetails) => {
    setClassroomToDelete(classroom);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!classroomToDelete) return;

    const success = await deleteClassroom(classroomToDelete.id);
    if (success) {
      setDeleteDialogOpen(false);
      setClassroomToDelete(null);
    }
  };

  const activeClassrooms = classrooms.filter((c) => {
    const now = new Date();
    const end = new Date(c.competition_end_date);
    return c.is_active && end > now;
  });

  const inactiveClassrooms = classrooms.filter((c) => {
    const now = new Date();
    const end = new Date(c.competition_end_date);
    return !c.is_active || end <= now;
  });

  return (
    <div className="min-h-[100dvh] bg-gradient-primary p-4 pt-50 safe-top safe-bottom overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-10 mt-10">
            <Button
              variant="ghost"
              onClick={onBack}
              className="h-10 w-10 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <Card className="backdrop-blur-lg bg-white/20 border-white/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">
                      Minhas Salas de Aula
                    </CardTitle>
                    <p className="text-white/80 text-sm">
                      Gerencie suas turmas e acompanhe o progresso dos alunos
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  size="lg"
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Nova Sala
                </Button>
              </div>
            </CardHeader>
          </Card>
        </div>

        {loading ? (
          <Card className="backdrop-blur-lg bg-white/20 border-white/30">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </CardContent>
          </Card>
        ) : classrooms.length === 0 ? (
          <Card className="backdrop-blur-lg bg-white/20 border-white/30">
            <CardContent className="py-12">
              <div className="text-center text-white">
                <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">
                  Nenhuma sala criada ainda
                </h3>
                <p className="text-white/80 mb-6">
                  Crie sua primeira sala de aula e comece a engajar seus alunos!
                </p>
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  size="lg"
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-white/20"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Criar Primeira Sala
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Classrooms */}
            {activeClassrooms.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Salas Ativas ({activeClassrooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeClassrooms.map((classroom) => (
                    <ClassroomCard
                      key={classroom.id}
                      classroom={classroom}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeleteClassroom}
                      isTeacher={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Classrooms */}
            {inactiveClassrooms.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <School className="h-5 w-5 opacity-50" />
                  Salas Arquivadas ({inactiveClassrooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveClassrooms.map((classroom) => (
                    <ClassroomCard
                      key={classroom.id}
                      classroom={classroom}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeleteClassroom}
                      isTeacher={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateClassroomModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <ClassroomDetails
        classroom={selectedClassroom}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        isTeacher={true}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-sm w-[90vw] rounded-2xl p-5 gap-3 backdrop-blur-lg bg-white/20 border-white/30">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-center text-base">
              Excluir sala?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2.5">
              <p className="text-center font-semibold text-foreground text-sm">
                "{classroomToDelete?.name}"
              </p>

              <div className="bg-red-50/80 dark:bg-red-950/50 border border-red-200/80 dark:border-red-900/80 rounded-lg p-2.5 backdrop-blur-sm">
                <p className="text-xs text-red-700 dark:text-red-400 font-medium text-center">
                  ⚠️ Ação irreversível!
                </p>
              </div>

              <div className="text-xs">
                <p className="font-medium mb-1.5">Será excluído:</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>• Alunos da sala</li>
                  <li>• Perguntas customizadas</li>
                  <li>• Histórico de jogos</li>
                  <li>• Convites pendentes</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-row">
            <AlertDialogCancel className="flex-1 m-0 backdrop-blur-sm bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="flex-1 bg-red-600/90 hover:bg-red-700/90 text-white backdrop-blur-sm border border-red-500/30"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
