import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { MultiplayerRoom } from "@/types/game";

interface Question {
  id: string;
  question: string;
  answers: string[];
  correct_answer: number_;
  category: string;
}

interface MultiplayerState {
  // Room state
  room: MultiplayerRoom | null;
  currentQuestion: Question | null;
  questions: Question[];
  
  // Game state
  gamePhase: "waiting" | "playing" | "finished";
  timeLeft: number;
  selectedAnswer: number | null;
  showAnswer: boolean;
  
  // Connection state
  isConnected: boolean;
  isHost: boolean;
  lastActivity: Date | null;
  
  // Actions
  setRoom: (room: Partial<MultiplayerRoom>) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setQuestions: (questions: Question[]) => void;
  setGamePhase: (phase: "waiting" | "playing" | "finished") => void;
  setTimeLeft: (time: number) => void;
  setSelectedAnswer: (answer: number | null) => void;
  setShowAnswer: (show: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setIsHost: (host: boolean) => void;
  setLastActivity: (date: Date) => void;
  
  // Complex actions
  updateRoomFromServer: (roomData: MultiplayerRoom) => void;
  resetGame: () => void;
}

const initialState = {
  room: null,
  currentQuestion: null,
  questions: [],
  gamePhase: "waiting" as const,
  timeLeft: 15,
  selectedAnswer: null,
  showAnswer: false,
  isConnected: false,
  isHost: false,
  lastActivity: null,
};

export const useMultiplayerStore = create<MultiplayerState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setRoom: (room) =>
      set((state) => ({ room: { ...state.room, ...room } })),
    
    setCurrentQuestion: (question) =>
      set({ currentQuestion: question }),
    
    setQuestions: (questions) =>
      set({ questions }),
    
    setGamePhase: (gamePhase) =>
      set({ gamePhase }),
    
    setTimeLeft: (timeLeft) =>
      set({ timeLeft }),
    
    setSelectedAnswer: (selectedAnswer) =>
      set({ selectedAnswer }),
    
    setShowAnswer: (showAnswer) =>
      set({ showAnswer }),
    
    setIsConnected: (isConnected) =>
      set({ isConnected }),
    
    setIsHost: (isHost) =>
      set({ isHost }),
    
    setLastActivity: (lastActivity) =>
      set({ lastActivity }),

    updateRoomFromServer: (roomData) =>
      set((state) => {
        const updatedRoom = { ...state.room, ...roomData };
        
        // Update game phase if changed
        const gamePhase = roomData.game_status === "waiting" 
          ? "waiting" as const
          : roomData.game_status === "playing"
          ? "playing" as const
          : "finished" as const;
        
        return {
          room: updatedRoom,
          gamePhase,
        };
      }),
    
    resetGame: () =>
      set(initialState),
  }))
);

// Selectors for performance
export const multiplayerSelectors = {
  room: (state: MultiplayerState) => state.room,
  gamePhase: (state: MultiplayerState) => state.gamePhase,
  isConnected: (state: MultiplayerState) => state.isConnected,
  isHost: (state: MultiplayerState) => state.isHost,
  timeLeft: (state: MultiplayerState) => state.timeLeft,
  currentQuestion: (state: MultiplayerState) => state.currentQuestion,
};
