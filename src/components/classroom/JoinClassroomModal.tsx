import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClassrooms } from "@/hooks/useClassrooms";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, KeyRound, AlertTriangle } from "lucide-react";

interface JoinClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinClassroomModal = ({
  open,
  onOpenChange,
}: JoinClassroomModalProps) => {
  const { joinClassroom, loading, classrooms } = useClassrooms();
  const { user } = useAuth();
  const [classCode, setClassCode] = useState("");
  const [isOwnClassroom, setIsOwnClassroom] = useState(false);

  // Verificar se o código digitado é de uma sala própria
  const checkOwnClassroom = (code: string) => {
    if (!user || !classrooms.length) return false;
    return classrooms.some(
      (classroom) =>
        classroom.class_code === code.toUpperCase() &&
        classroom.teacher_id === user.id
    );
  };

  const handleCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setClassCode(upperValue);
    setIsOwnClassroom(checkOwnClassroom(upperValue));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOwnClassroom) {
      return;
    }

    const success = await joinClassroom(classCode);

    if (success) {
      onOpenChange(false);
      setClassCode("");
      setIsOwnClassroom(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md backdrop-blur-lg bg-gradient-to-br from-[hsl(262,83%,58%)]/95 via-[hsl(330,81%,60%)]/95 to-[hsl(45,93%,58%)]/95 border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Entrar em uma Sala
          </DialogTitle>
          <DialogDescription>
            Digite o código da sala fornecido pelo seu professor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class_code" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Código da Sala
            </Label>
            <Input
              id="class_code"
              placeholder="Ex: ABC123"
              value={classCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              maxLength={6}
              className={`text-center text-2xl font-mono tracking-widest uppercase ${
                isOwnClassroom
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : ""
              }`}
              required
            />
            <p className="text-xs text-muted-foreground text-center">
              O código tem 6 caracteres
            </p>
          </div>

          {isOwnClassroom ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-900 dark:text-red-100">
                  <p className="font-medium mb-1">❌ Sala própria detectada</p>
                  <p>
                    Este é o código da sua própria sala. Professores não podem
                    entrar na própria sala como alunos durante competições.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                🎓 Ao entrar na sala, você poderá participar das competições e
                seus resultados serão registrados no ranking da turma!
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setClassCode("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || classCode.length !== 6 || isOwnClassroom}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar na Sala"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
