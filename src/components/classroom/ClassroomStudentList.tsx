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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Alunos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Alunos ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {students.map((student: any) => (
              <Card key={student.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {student.profiles?.display_name?.[0]?.toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {student.profiles?.display_name || "Sem nome"}
                        </p>
                        {student.nickname && (
                          <p className="text-sm text-muted-foreground truncate">
                            @{student.nickname}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
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
                      className="text-destructive hover:bg-destructive hover:text-white flex-shrink-0"
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Aluno</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este aluno da sala? Esta ação não
              pode ser desfeita e o aluno precisará entrar novamente com o
              código da sala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

