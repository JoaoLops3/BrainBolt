export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_hidden: boolean
          name: string
          requirement_category: string | null
          requirement_type: string
          requirement_value: number
          updated_at: string
        }
        Insert: {
          badge_color?: string
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_hidden?: boolean
          name: string
          requirement_category?: string | null
          requirement_type: string
          requirement_value: number
          updated_at?: string
        }
        Update: {
          badge_color?: string
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_hidden?: boolean
          name?: string
          requirement_category?: string | null
          requirement_type?: string
          requirement_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_performance: {
        Row: {
          accuracy_percentage: number | null
          average_time: number | null
          best_streak: number | null
          category: string
          correct_answers: number | null
          created_at: string | null
          id: string
          questions_answered: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          average_time?: number | null
          best_streak?: number | null
          category: string
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          questions_answered?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          average_time?: number | null
          best_streak?: number | null
          category?: string
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          questions_answered?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          name: string
          rarity: string
          special_ability: string | null
          unlock_requirement: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url: string
          name: string
          rarity?: string
          special_ability?: string | null
          unlock_requirement?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          name?: string
          rarity?: string
          special_ability?: string | null
          unlock_requirement?: number
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      game_sessions: {
        Row: {
          accuracy_percentage: number | null
          average_response_time: number | null
          categories_completed: string[] | null
          category_breakdown: Json | null
          completed_at: string
          correct_answers: number
          final_score: number
          game_mode: string
          game_result: string | null
          id: string
          max_streak: number | null
          opponent_id: string | null
          questions_answered: number
          room_id: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          average_response_time?: number | null
          categories_completed?: string[] | null
          category_breakdown?: Json | null
          completed_at?: string
          correct_answers?: number
          final_score?: number
          game_mode?: string
          game_result?: string | null
          id?: string
          max_streak?: number | null
          opponent_id?: string | null
          questions_answered?: number
          room_id?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          average_response_time?: number | null
          categories_completed?: string[] | null
          category_breakdown?: Json | null
          completed_at?: string
          correct_answers?: number
          final_score?: number
          game_mode?: string
          game_result?: string | null
          id?: string
          max_streak?: number | null
          opponent_id?: string | null
          questions_answered?: number
          room_id?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      multiplayer_invitations: {
        Row: {
          created_at: string
          id: string
          invited_id: string
          inviter_id: string
          room_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_id: string
          inviter_id: string
          room_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_id?: string
          inviter_id?: string
          room_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      multiplayer_rooms: {
        Row: {
          created_at: string
          current_question_id: string | null
          current_question_index: number | null
          game_status: string | null
          guest_answer: number | null
          guest_id: string | null
          guest_score: number | null
          host_answer: number | null
          host_id: string
          host_score: number | null
          id: string
          question_start_time: string | null
          room_code: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          current_question_id?: string | null
          current_question_index?: number | null
          game_status?: string | null
          guest_answer?: number | null
          guest_id?: string | null
          guest_score?: number | null
          host_answer?: number | null
          host_id: string
          host_score?: number | null
          id?: string
          question_start_time?: string | null
          room_code: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          current_question_id?: string | null
          current_question_index?: number | null
          game_status?: string | null
          guest_answer?: number | null
          guest_id?: string | null
          guest_score?: number | null
          host_answer?: number | null
          host_id?: string
          host_score?: number | null
          id?: string
          question_start_time?: string | null
          room_code?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_response_time: number | null
          average_score: number | null
          best_streak: number | null
          categories_mastered: number | null
          created_at: string
          display_name: string | null
          email: string | null
          favorite_category: string | null
          games_lost: number | null
          games_played: number | null
          games_won: number | null
          id: string
          longest_streak: number | null
          multiplayer_losses: number | null
          multiplayer_wins: number | null
          normal_games_played: number | null
          speed_games_played: number | null
          total_score: number | null
          total_time_played: number | null
          updated_at: string
          user_id: string
          username: string | null
          win_percentage: number | null
        }
        Insert: {
          avatar_url?: string | null
          average_response_time?: number | null
          average_score?: number | null
          best_streak?: number | null
          categories_mastered?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          favorite_category?: string | null
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          longest_streak?: number | null
          multiplayer_losses?: number | null
          multiplayer_wins?: number | null
          normal_games_played?: number | null
          speed_games_played?: number | null
          total_score?: number | null
          total_time_played?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          win_percentage?: number | null
        }
        Update: {
          avatar_url?: string | null
          average_response_time?: number | null
          average_score?: number | null
          best_streak?: number | null
          categories_mastered?: number | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          favorite_category?: string | null
          games_lost?: number | null
          games_played?: number | null
          games_won?: number | null
          id?: string
          longest_streak?: number | null
          multiplayer_losses?: number | null
          multiplayer_wins?: number | null
          normal_games_played?: number | null
          speed_games_played?: number | null
          total_score?: number | null
          total_time_played?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          win_percentage?: number | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          is_completed: boolean
          progress: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          is_completed?: boolean
          progress?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          progress?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_characters: {
        Row: {
          character_id: string
          created_at: string
          id: string
          is_favorite: boolean
          unlocked_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          unlocked_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      global_rankings: {
        Row: {
          avatar_url: string | null
          average_response_time: number | null
          average_score: number | null
          best_streak: number | null
          categories_mastered: number | null
          created_at: string | null
          display_name: string | null
          email: string | null
          favorite_category: string | null
          games_lost: number | null
          games_played: number | null
          games_won: number | null
          global_rank: number | null
          id: string | null
          longest_streak: number | null
          multiplayer_losses: number | null
          multiplayer_wins: number | null
          normal_games_played: number | null
          speed_games_played: number | null
          streak_rank: number | null
          total_score: number | null
          total_time_played: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          win_percentage: number | null
          win_rate_rank: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_achievements: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      check_character_unlocks: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      expire_old_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_users: {
        Args: { search_term: string }
        Returns: {
          avatar_url: string
          display_name: string
          email: string
          games_played: number
          id: string
          total_score: number
          username: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
