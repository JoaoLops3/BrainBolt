import { useState } from "react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomCard } from "./ClassroomCard";
import { CreateClassroomModal } from "./CreateClassroomModal";
import { ClassroomDetails } from "./ClassroomDetails";
import { ClassroomWithDetails } from "@/types/classroom";
import { School, Plus, Loader2, GraduationCap, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="min-h-screen bg-gradient-primary p-4 safe-top safe-bottom">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Menu
          </Button>

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
                  className="bg-white text-primary hover:bg-white/90"
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
                  className="bg-white text-primary hover:bg-white/90"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão da sala</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a sala "{classroomToDelete?.name}"?
              <br />
              <br />
              <strong className="text-red-600 dark:text-red-400">
                ⚠️ Esta ação não pode ser desfeita!
              </strong>
              <br />
              <br />
              Serão excluídos permanentemente:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todos os alunos da sala</li>
                <li>Todas as perguntas customizadas</li>
                <li>Todo o histórico de jogos</li>
                <li>Todos os convites pendentes</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Sim, excluir sala
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
