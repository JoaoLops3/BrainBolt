export type GradeLevel = 'elementary' | 'middle' | 'high' | 'college' | 'other';
export type ClassroomSubject = 'general' | 'science' | 'history' | 'geography' | 'art' | 'sports' | 'entertainment' | 'math' | 'language' | 'other';
export type StudentStatus = 'active' | 'inactive' | 'removed';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  school_name?: string;
  grade_level?: GradeLevel;
  subject?: ClassroomSubject;
  class_code: string;
  competition_start_date: string;
  competition_end_date: string;
  is_active: boolean;
  max_students?: number;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClassroomStudent {
  id: string;
  classroom_id: string;
  student_id: string;
  joined_at: string;
  status: StudentStatus;
  nickname?: string;
  created_at: string;
}

export interface ClassroomInvitation {
  id: string;
  classroom_id: string;
  student_email: string;
  invited_by: string;
  status: InvitationStatus;
  invited_at: string;
  responded_at?: string;
  expires_at: string;
  created_at: string;
}

export interface ClassroomGameSession {
  id: string;
  classroom_id: string;
  student_id: string;
  game_session_id: string;
  rank_in_classroom?: number;
  created_at: string;
}

export interface ClassroomAnnouncement {
  id: string;
  classroom_id: string;
  teacher_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassroomRanking {
  student_id: string;
  student_name: string;
  total_score: number;
  games_played: number;
  correct_answers: number;
  accuracy_percentage: number;
  best_streak: number;
  rank: number;
}

export interface ClassroomStatistics {
  total_students: number;
  active_students: number;
  total_games_played: number;
  average_score: number;
  average_accuracy: number;
  most_active_student_id?: string;
  most_active_student_name?: string;
  top_scorer_id?: string;
  top_scorer_name?: string;
  top_score?: number;
}

export interface CreateClassroomData {
  name: string;
  description?: string;
  school_name?: string;
  grade_level?: GradeLevel;
  subject?: ClassroomSubject;
  competition_start_date: string;
  competition_end_date: string;
  max_students?: number;
  settings?: Record<string, any>;
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  school_name?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
}

export interface ClassroomWithDetails extends Classroom {
  student_count?: number;
  active_student_count?: number;
  teacher_name?: string;
  teacher_email?: string;
}

