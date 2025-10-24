import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ClassroomStudent } from "@/types/classroom";
import { useClassrooms } from "@/hooks/useClassrooms";
import { Users, UserMinus, Loader2, Mail } from "lucide-react";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClassroomStudentListProps {
  classroomId: string;
}

export const ClassroomStudentList = ({
  classroomId,
}: ClassroomStudentListProps) => {
  const { getClassroomStudents, removeStudent } = useClassrooms();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      const data = await getClassroomStudents(classroomId);
      setStudents(data);
      setLoading(false);
    };

    fetchStudents();
  }, [classroomId, getClassroomStudents]);

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    const success = await removeStudent(classroomId, studentToRemove);
    if (success) {
      setStudents(students.filter((s) => s.student_id !== studentToRemove));
      setStudentToRemove(null);
    }
  };

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Lista de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Lista de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-white/80">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum aluno na sala ainda.</p>
            <p className="text-sm">
              Compartilhe o código da sala para os alunos entrarem!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="backdrop-blur-sm bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Lista de Alunos ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student: any) => (
              <Card
                key={student.id}
                className="border backdrop-blur-sm bg-white/5 border-white/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-white/20 text-white">
                          {student.profiles?.display_name?.[0]?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-white">
                          {student.profiles?.display_name || "Sem nome"}
                        </p>
                        {student.nickname && (
                          <p className="text-sm text-white/80 truncate">
                            @{student.nickname}
                          </p>
                        )}
                        <p className="text-xs text-white/80">
                          Entrou em{" "}
                          {format(new Date(student.joined_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStudentToRemove(student.student_id)}
                      className="text-red-300 hover:bg-red-500/20 hover:text-red-200 border-red-500/50 bg-red-500/10 flex-shrink-0"
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={studentToRemove !== null}
        onOpenChange={(open) => !open && setStudentToRemove(null)}
      >
        <AlertDialogContent className="backdrop-blur-sm bg-white/5 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Remover Aluno
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80">
              Tem certeza que deseja remover este aluno da sala? Esta ação não
              pode ser desfeita e o aluno precisará entrar novamente com o
              código da sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-white/5 text-white hover:bg-white/20">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border-red-500/50"
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
