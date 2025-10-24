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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClassrooms } from "@/hooks/useClassrooms";
import {
  CreateClassroomData,
  GradeLevel,
  ClassroomSubject,
} from "@/types/classroom";
import { Loader2, School } from "lucide-react";

interface CreateClassroomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateClassroomModal = ({
  open,
  onOpenChange,
}: CreateClassroomModalProps) => {
  const { createClassroom, loading } = useClassrooms();
  const [formData, setFormData] = useState<CreateClassroomData>({
    name: "",
    description: "",
    school_name: "",
    grade_level: undefined,
    subject: "general",
    competition_start_date: new Date().toISOString().split("T")[0],
    competition_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    max_students: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createClassroom({
      ...formData,
      competition_start_date: new Date(
        formData.competition_start_date
      ).toISOString(),
      competition_end_date: new Date(
        formData.competition_end_date
      ).toISOString(),
    });

    if (result) {
      onOpenChange(false);
      setFormData({
        name: "",
        description: "",
        school_name: "",
        grade_level: undefined,
        subject: "general",
        competition_start_date: new Date().toISOString().split("T")[0],
        competition_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        max_students: 50,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-lg bg-white/20 border-white/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Criar Nova Sala de Aula
          </DialogTitle>
          <DialogDescription>
            Configure sua sala educacional e comece a competição com seus
            alunos!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da Sala <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Turma 9A - Ciências"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os objetivos e regras da sala..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">Nome da Escola</Label>
              <Input
                id="school_name"
                placeholder="Ex: Escola Municipal..."
                value={formData.school_name}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
                className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_students">Máximo de Alunos</Label>
              <Input
                id="max_students"
                type="number"
                min="1"
                max="100"
                value={formData.max_students}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_students: parseInt(e.target.value),
                  })
                }
                className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade_level">Nível Escolar</Label>
              <Select
                value={formData.grade_level}
                onValueChange={(value: GradeLevel) =>
                  setFormData({ ...formData, grade_level: value })
                }
              >
                <SelectTrigger
                  id="grade_level"
                  className="backdrop-blur-sm bg-white/20 border-white/30 text-white"
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-lg bg-white/20 border-white/30">
                  <SelectItem value="elementary">Ensino Fundamental</SelectItem>
                  <SelectItem value="middle">Ensino Médio</SelectItem>
                  <SelectItem value="high">Pré-Vestibular</SelectItem>
                  <SelectItem value="college">Ensino Superior</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Matéria Principal</Label>
              <Select
                value={formData.subject}
                onValueChange={(value: ClassroomSubject) =>
                  setFormData({ ...formData, subject: value })
                }
              >
                <SelectTrigger
                  id="subject"
                  className="backdrop-blur-sm bg-white/20 border-white/30 text-white"
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-lg bg-white/20 border-white/30">
                  <SelectItem value="general">Geral</SelectItem>
                  <SelectItem value="science">Ciências</SelectItem>
                  <SelectItem value="history">História</SelectItem>
                  <SelectItem value="geography">Geografia</SelectItem>
                  <SelectItem value="art">Arte</SelectItem>
                  <SelectItem value="sports">Educação Física</SelectItem>
                  <SelectItem value="math">Matemática</SelectItem>
                  <SelectItem value="language">Línguas</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                Data de Início <span className="text-red-500">*</span>
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.competition_start_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    competition_start_date: e.target.value,
                  })
                }
                required
                className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">
                Data de Término <span className="text-red-500">*</span>
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.competition_end_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    competition_end_date: e.target.value,
                  })
                }
                required
                min={formData.competition_start_date}
                className="backdrop-blur-sm bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>
          </div>

          <div className="bg-blue-50/80 dark:bg-blue-900/40 p-4 rounded-lg backdrop-blur-sm border border-blue-200/80 dark:border-blue-800/80">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Dica:</strong> As datas de competição não podem ser
              alteradas após a criação da sala. Escolha com cuidado!
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="backdrop-blur-sm bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="backdrop-blur-sm bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Sala"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
