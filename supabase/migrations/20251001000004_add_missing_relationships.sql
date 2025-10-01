-- Add missing relationships for PostgREST embeddings

-- Create FK from classroom_students.student_id -> profiles.user_id (for profiles:student_id embedding)
ALTER TABLE public.classroom_students
ADD CONSTRAINT classroom_students_student_fk_profiles
FOREIGN KEY (student_id) REFERENCES public.profiles(user_id)
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

-- (Optional) Create FK from classrooms.teacher_id -> profiles.user_id to enable embeddings if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'classrooms_teacher_fk_profiles'
      AND tc.table_schema = 'public'
      AND tc.table_name = 'classrooms'
  ) THEN
    ALTER TABLE public.classrooms
    ADD CONSTRAINT classrooms_teacher_fk_profiles
    FOREIGN KEY (teacher_id) REFERENCES public.profiles(user_id)
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED;
  END IF;
END $$;

-- Ensure existing RLS policies are not broken by these FKs (no changes required)

-- Helpful index for fast lookups
CREATE INDEX IF NOT EXISTS idx_classroom_students_student_id ON public.classroom_students(student_id);
