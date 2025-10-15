import { supabase } from "@/integrations/supabase/client";

// Optimized field selection for multiplayer rooms
export const MULTIPLAYER_SELECT_FIELDS = `
  id,
  room_code,
  host_id,
  guest_id,
  game_status,
  current_question_id,
  current_question_index,
  question_start_time,
  host_score,
  guest_score,
  winner_id,
  created_at,
  updated_at,
  last_activity
`;

// Optimized multiplayer room queries
export const multiplayerQueries = {
  // Create room
  createRoom: async (data: {
    room_code: string;
    host_id: string;
  }) => {
    return supabase
      .from("multiplayer_rooms")
      .insert(data)
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Get room by code
  getRoomByCode: async (roomCode: string) => {
    return supabase
      .from("multiplayer_rooms")
      .select(MULTIPLAYER_SELECT_FIELDS)
      .eq("room_code", roomCode)
      .eq("game_status", "waiting")
      .is("guest_id", null)
      .limit(1)
      .maybeSingle();
  },

  // Get room by ID
  getRoomById: async (roomId: string) => {
    return supabase
      .from("multiplayer_rooms")
      .select(MULTIPLAYER_SELECT_FIELDS)
      .eq("id", roomId)
      .single();
  },

  // Join room
  joinRoom: async (roomId: string, guestId: string) => {
    return supabase
      .from("multiplayer_rooms")
      .update({ 
        guest_id: guestId,
        last_activity: new Date().toISOString()
      })
      .eq("id", roomId)
      .eq("game_status", "waiting")
      .is("guest_id", null)
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Update room (with heartbeat)
  updateRoom: async (roomId: string, updates: any) => {
    return supabase
      .from("multiplayer_rooms")
      .update({
        ...updates,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", roomId)
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Start game
  startGame: async (roomId: string, questionId: string, questionIndex: number) => {
    return supabase
      .from("multiplayer_rooms")
      .update({
        game_status: "playing",
        current_question_id: questionId,
        current_question_index: questionIndex,
        question_start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", roomId)
      .eq("game_status", "waiting")
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Submit answer
  submitAnswer: async (data: {
    room_id: string;
    user_id: string;
    question_id: string;
    answer_index: number;
    is_correct: boolean;
    time_spent: number;
  }) => {
    // First insert the answer
    await supabase
      .from("multiplayer_answers")
      .insert(data);

    // Then update scores
    const scoreField = data.user_id === "" ? "host_score" : "guest_score"; // You'll need to determine if host or guest
    
    return supabase
      .from("multiplayer_rooms")
      .update({
        [scoreField]: supabase.rpc("increment_score", { 
          room_id: data.room_id, 
          score_field: scoreField,
          points: data.is_correct ? 100 : 0
        }),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", data.room_id)
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Next question
  nextQuestion: async (roomId: string, questionId: string, questionIndex: number) => {
    return supabase
      .from("multiplayer_rooms")
      .update({
        current_question_id: questionId,
        current_question_index: questionIndex,
        question_start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", roomId)
      .eq("game_status", "playing")
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },

  // Finish game
  finishGame: async (roomId: string, winnerId: string | null) => {
    return supabase
      .from("multiplayer_rooms")
      .update({
        game_status: "finished",
        winner_id: winnerId,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", roomId)
      .select(MULTIPLAYER_SELECT_FIELDS)
      .single();
  },
};
