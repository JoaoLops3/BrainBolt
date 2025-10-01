import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Classroom,
  ClassroomStudent,
  ClassroomInvitation,
  ClassroomRanking,
  ClassroomStatistics,
  CreateClassroomData,
  UpdateClassroomData,
  ClassroomWithDetails,
} from "@/types/classroom";

export const useClassrooms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<ClassroomWithDetails[]>([]);
  const [myClassrooms, setMyClassrooms] = useState<ClassroomWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classrooms where user is teacher
  const fetchTeacherClassrooms = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("classrooms")
        .select(`
          *,
          classroom_students!inner(count)
        `)
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const classroomsWithDetails: ClassroomWithDetails[] = (data || []).map(
        (classroom: any) => ({
          ...classroom,
          student_count: classroom.classroom_students?.[0]?.count || 0,
        })
      );

      setClassrooms(classroomsWithDetails);
    } catch (err: any) {
      console.error("Error fetching teacher classrooms:", err);
      setError(err.message);
      toast({
        title: "❌ Erro ao carregar salas",
        description: "Não foi possível carregar suas salas de aula.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Fetch classrooms where user is student
  const fetchStudentClassrooms = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("classroom_students")
        .select(`
          *,
          classrooms:classroom_id (*)
        `)
        .eq("student_id", user.id)
        .eq("status", "active");

      if (fetchError) throw fetchError;

      const studentClassrooms: ClassroomWithDetails[] = (data || []).map(
        (item: any) => item.classrooms
      );

      setMyClassrooms(studentClassrooms);
    } catch (err: any) {
      console.error("Error fetching student classrooms:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Create new classroom
  const createClassroom = useCallback(
    async (classroomData: CreateClassroomData) => {
      if (!user) {
        toast({
          title: "❌ Erro",
          description: "Você precisa estar logado para criar uma sala.",
          variant: "destructive",
        });
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Generate unique class code
        const { data: codeData, error: codeError } = await supabase.rpc(
          "generate_classroom_code"
        );

        if (codeError) throw codeError;

        const classCode = codeData;

        const { data, error: createError } = await supabase
          .from("classrooms")
          .insert([
            {
              ...classroomData,
              teacher_id: user.id,
              class_code: classCode,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        toast({
          title: "✅ Sala criada!",
          description: `Código da sala: ${classCode}`,
        });

        await fetchTeacherClassrooms();
        return data as Classroom;
      } catch (err: any) {
        console.error("Error creating classroom:", err);
        setError(err.message);
        toast({
          title: "❌ Erro ao criar sala",
          description: err.message,
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, fetchTeacherClassrooms]
  );

  // Update classroom
  const updateClassroom = useCallback(
    async (classroomId: string, updates: UpdateClassroomData) => {
      if (!user) return false;

      setLoading(true);
      setError(null);

      try {
        const { error: updateError } = await supabase
          .from("classrooms")
          .update(updates)
          .eq("id", classroomId)
          .eq("teacher_id", user.id);

        if (updateError) throw updateError;

        toast({
          title: "✅ Sala atualizada!",
          description: "As informações da sala foram atualizadas.",
        });

        await fetchTeacherClassrooms();
        return true;
      } catch (err: any) {
        console.error("Error updating classroom:", err);
        setError(err.message);
        toast({
          title: "❌ Erro ao atualizar sala",
          description: err.message,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, fetchTeacherClassrooms]
  );

  // Delete classroom
  const deleteClassroom = useCallback(
    async (classroomId: string) => {
      if (!user) return false;

      setLoading(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("classrooms")
          .delete()
          .eq("id", classroomId)
          .eq("teacher_id", user.id);

        if (deleteError) throw deleteError;

        toast({
          title: "✅ Sala excluída!",
          description: "A sala foi removida com sucesso.",
        });

        await fetchTeacherClassrooms();
        return true;
      } catch (err: any) {
        console.error("Error deleting classroom:", err);
        setError(err.message);
        toast({
          title: "❌ Erro ao excluir sala",
          description: err.message,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, fetchTeacherClassrooms]
  );

  // Join classroom with code
  const joinClassroom = useCallback(
    async (classCode: string) => {
      if (!user) {
        toast({
          title: "❌ Erro",
          description: "Você precisa estar logado para entrar em uma sala.",
          variant: "destructive",
        });
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        // Find classroom by code
        const { data: classroom, error: findError } = await supabase
          .from("classrooms")
          .select("*")
          .eq("class_code", classCode.toUpperCase())
          .eq("is_active", true)
          .single();

        if (findError) throw new Error("Código de sala inválido");

        // Check if already a member
        const { data: existing } = await supabase
          .from("classroom_students")
          .select("*")
          .eq("classroom_id", classroom.id)
          .eq("student_id", user.id)
          .single();

        if (existing) {
          toast({
            title: "⚠️ Aviso",
            description: "Você já está nesta sala.",
            variant: "destructive",
          });
          return false;
        }

        // Join classroom
        const { error: joinError } = await supabase
          .from("classroom_students")
          .insert([
            {
              classroom_id: classroom.id,
              student_id: user.id,
              status: "active",
            },
          ]);

        if (joinError) throw joinError;

        toast({
          title: "✅ Entrada confirmada!",
          description: `Você entrou na sala: ${classroom.name}`,
        });

        await fetchStudentClassrooms();
        return true;
      } catch (err: any) {
        console.error("Error joining classroom:", err);
        setError(err.message);
        toast({
          title: "❌ Erro ao entrar na sala",
          description: err.message,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, fetchStudentClassrooms]
  );

  // Leave classroom
  const leaveClassroom = useCallback(
    async (classroomId: string) => {
      if (!user) return false;

      setLoading(true);
      setError(null);

      try {
        const { error: leaveError } = await supabase
          .from("classroom_students")
          .update({ status: "inactive" })
          .eq("classroom_id", classroomId)
          .eq("student_id", user.id);

        if (leaveError) throw leaveError;

        toast({
          title: "✅ Você saiu da sala",
          description: "Você não faz mais parte desta sala.",
        });

        await fetchStudentClassrooms();
        return true;
      } catch (err: any) {
        console.error("Error leaving classroom:", err);
        setError(err.message);
        toast({
          title: "❌ Erro ao sair da sala",
          description: err.message,
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user, toast, fetchStudentClassrooms]
  );

  // Get classroom rankings
  const getClassroomRankings = useCallback(
    async (classroomId: string): Promise<ClassroomRanking[]> => {
      try {
        const { data, error } = await supabase.rpc("get_classroom_rankings", {
          p_classroom_id: classroomId,
        });

        if (error) throw error;

        return data || [];
      } catch (err: any) {
        console.error("Error fetching classroom rankings:", err);
        toast({
          title: "❌ Erro ao carregar ranking",
          description: err.message,
          variant: "destructive",
        });
        return [];
      }
    },
    [toast]
  );

  // Get classroom statistics
  const getClassroomStatistics = useCallback(
    async (classroomId: string): Promise<ClassroomStatistics | null> => {
      try {
        const { data, error } = await supabase.rpc("get_classroom_statistics", {
          p_classroom_id: classroomId,
        });

        if (error) throw error;

        return data?.[0] || null;
      } catch (err: any) {
        console.error("Error fetching classroom statistics:", err);
        toast({
          title: "❌ Erro ao carregar estatísticas",
          description: err.message,
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );

  // Get classroom students
  const getClassroomStudents = useCallback(
    async (classroomId: string): Promise<ClassroomStudent[]> => {
      try {
        const { data, error } = await supabase
          .from("classroom_students")
          .select(`
            *,
            profiles:student_id (display_name, avatar_url)
          `)
          .eq("classroom_id", classroomId)
          .eq("status", "active");

        if (error) throw error;

        return data || [];
      } catch (err: any) {
        console.error("Error fetching classroom students:", err);
        return [];
      }
    },
    []
  );

  // Remove student from classroom
  const removeStudent = useCallback(
    async (classroomId: string, studentId: string) => {
      if (!user) return false;

      try {
        const { error } = await supabase
          .from("classroom_students")
          .update({ status: "removed" })
          .eq("classroom_id", classroomId)
          .eq("student_id", studentId);

        if (error) throw error;

        toast({
          title: "✅ Aluno removido",
          description: "O aluno foi removido da sala.",
        });

        return true;
      } catch (err: any) {
        console.error("Error removing student:", err);
        toast({
          title: "❌ Erro ao remover aluno",
          description: err.message,
          variant: "destructive",
        });
        return false;
      }
    },
    [user, toast]
  );

  useEffect(() => {
    if (user) {
      fetchTeacherClassrooms();
      fetchStudentClassrooms();
    }
  }, [user, fetchTeacherClassrooms, fetchStudentClassrooms]);

  return {
    classrooms,
    myClassrooms,
    loading,
    error,
    createClassroom,
    updateClassroom,
    deleteClassroom,
    joinClassroom,
    leaveClassroom,
    getClassroomRankings,
    getClassroomStatistics,
    getClassroomStudents,
    removeStudent,
    refreshClassrooms: fetchTeacherClassrooms,
    refreshMyClassrooms: fetchStudentClassrooms,
  };
};

