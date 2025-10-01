import { useState } from "react";
import { useClassrooms } from "@/hooks/useClassrooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassroomCard } from "./ClassroomCard";
import { JoinClassroomModal } from "./JoinClassroomModal";
import { ClassroomDetails } from "./ClassroomDetails";
import { ClassroomWithDetails } from "@/types/classroom";
import { School, Plus, Loader2, Users, ArrowLeft } from "lucide-react";

interface StudentDashboardProps {
  onBack: () => void;
}

export const StudentDashboard = ({ onBack }: StudentDashboardProps) => {
  const { myClassrooms, loading } = useClassrooms();
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] =
    useState<ClassroomWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (classroom: ClassroomWithDetails) => {
    setSelectedClassroom(classroom);
    setDetailsOpen(true);
  };

  const activeClassrooms = myClassrooms.filter((c) => {
    const now = new Date();
    const end = new Date(c.competition_end_date);
    return c.is_active && end > now;
  });

  const pastClassrooms = myClassrooms.filter((c) => {
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
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">
                      Minhas Salas
                    </CardTitle>
                    <p className="text-white/80 text-sm">
                      Veja seu desempenho e rankings das salas
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setJoinModalOpen(true)}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Entrar em Sala
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
        ) : myClassrooms.length === 0 ? (
          <Card className="backdrop-blur-lg bg-white/20 border-white/30">
            <CardContent className="py-12">
              <div className="text-center text-white">
                <School className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">
                  Você não está em nenhuma sala ainda
                </h3>
                <p className="text-white/80 mb-6">
                  Peça o código ao seu professor e entre em uma sala para começar!
                </p>
                <Button
                  onClick={() => setJoinModalOpen(true)}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Entrar em Sala
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
                      isTeacher={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Classrooms */}
            {pastClassrooms.length > 0 && (
              <div>
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <School className="h-5 w-5 opacity-50" />
                  Salas Anteriores ({pastClassrooms.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastClassrooms.map((classroom) => (
                    <ClassroomCard
                      key={classroom.id}
                      classroom={classroom}
                      onViewDetails={handleViewDetails}
                      isTeacher={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <JoinClassroomModal open={joinModalOpen} onOpenChange={setJoinModalOpen} />

      <ClassroomDetails
        classroom={selectedClassroom}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        isTeacher={false}
      />
    </div>
  );
};

