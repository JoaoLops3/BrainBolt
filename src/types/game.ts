export type CategoryType =
  | "sports"
  | "entertainment"
  | "art"
  | "science"
  | "geography"
  | "history";
export type GameMode = "normal" | "speed" | "multiplayer";

export interface Question {
  id: string;
  category: CategoryType;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "medium" | "hard";
  explanation?: string;
  isCustom?: boolean;
  customQuestionId?: string;
}

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  color: string;
  icon: string;
  collected: boolean;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  questionsAnswered: number;
  categories: CategoryInfo[];
  gamePhase:
    | "menu"
    | "mode-selection"
    | "playing"
    | "results"
    | "multiplayer"
    | "teacherClassrooms"
    | "studentClassrooms";
  selectedAnswer: number | null;
  showAnswer: boolean;
  currentStreak: number;
  gameMode: GameMode;
  timeLeft: number;
  totalTime: number;
}

export interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  categoriesCompleted: CategoryType[];
  finalScore: number;
  gameMode: GameMode;
  maxStreak: number;
  timeSpent: number;
}

export interface MultiplayerRoom {
  id: string;
  room_code: string;
  host_id: string;
  guest_id?: string;
  current_question_id?: string;
  current_question_index: number;
  host_score: number;
  guest_score: number;
  host_answer?: number;
  guest_answer?: number;
  question_start_time?: string;
  game_status: "waiting" | "playing" | "question_answered" | "finished";
  winner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MultiplayerInvitation {
  id: string;
  room_id: string;
  inviter_id: string;
  invited_id: string;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: "pending" | "accepted" | "blocked";
  created_at: string;
  updated_at: string;
}
