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

interface TeacherDashboardProps {
  onBack: () => void;
}

export const TeacherDashboard = ({ onBack }: TeacherDashboardProps) => {
  const { classrooms, loading } = useClassrooms();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (classroom: ClassroomWithDetails) => {
    setSelectedClassroom(classroom);
    setDetailsOpen(true);
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
    </div>
  );
};

