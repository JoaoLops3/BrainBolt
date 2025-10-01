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
import { Loader2, Users, KeyRound } from "lucide-react";

interface JoinClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinClassroomModal = ({
  open,
  onOpenChange,
}: JoinClassroomModalProps) => {
  const { joinClassroom, loading } = useClassrooms();
  const [classCode, setClassCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await joinClassroom(classCode);

    if (success) {
      onOpenChange(false);
      setClassCode("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
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
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest uppercase"
              required
            />
            <p className="text-xs text-muted-foreground text-center">
              O código tem 6 caracteres
            </p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              🎓 Ao entrar na sala, você poderá participar das competições e
              seus resultados serão registrados no ranking da turma!
            </p>
          </div>

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
            <Button type="submit" disabled={loading || classCode.length !== 6}>
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

