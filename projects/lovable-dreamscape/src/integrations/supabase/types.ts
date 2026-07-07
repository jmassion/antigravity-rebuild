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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          condition_type: string
          condition_value: string | null
          created_at: string
          description_en: string
          description_es: string
          icon: string
          id: string
          slug: string
          title_en: string
          title_es: string
          xp_reward: number
        }
        Insert: {
          condition_type?: string
          condition_value?: string | null
          created_at?: string
          description_en?: string
          description_es?: string
          icon?: string
          id?: string
          slug: string
          title_en: string
          title_es: string
          xp_reward?: number
        }
        Update: {
          condition_type?: string
          condition_value?: string | null
          created_at?: string
          description_en?: string
          description_es?: string
          icon?: string
          id?: string
          slug?: string
          title_en?: string
          title_es?: string
          xp_reward?: number
        }
        Relationships: []
      }
      lessons: {
        Row: {
          character_guide: string | null
          content_en: string
          content_es: string
          created_at: string
          id: string
          is_free: boolean
          lesson_type: string
          order_index: number
          slug: string
          stage_id: number
          title_en: string
          title_es: string
          xp_reward: number
        }
        Insert: {
          character_guide?: string | null
          content_en?: string
          content_es?: string
          created_at?: string
          id?: string
          is_free?: boolean
          lesson_type?: string
          order_index: number
          slug: string
          stage_id: number
          title_en: string
          title_es: string
          xp_reward?: number
        }
        Update: {
          character_guide?: string | null
          content_en?: string
          content_es?: string
          created_at?: string
          id?: string
          is_free?: boolean
          lesson_type?: string
          order_index?: number
          slug?: string
          stage_id?: number
          title_en?: string
          title_es?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "lessons_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          created_at: string
          description_en: string
          description_es: string
          icon: string
          id: number
          is_free: boolean
          order_index: number
          slug: string
          title_en: string
          title_es: string
          xp_reward: number
        }
        Insert: {
          created_at?: string
          description_en?: string
          description_es?: string
          icon?: string
          id?: number
          is_free?: boolean
          order_index: number
          slug: string
          title_en: string
          title_es: string
          xp_reward?: number
        }
        Update: {
          created_at?: string
          description_en?: string
          description_es?: string
          icon?: string
          id?: number
          is_free?: boolean
          order_index?: number
          slug?: string
          title_en?: string
          title_es?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_stage: number
          display_name: string
          id: string
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_stage?: number
          display_name?: string
          id?: string
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_stage?: number
          display_name?: string
          id?: string
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_index: number
          explanation_en: string | null
          explanation_es: string | null
          id: string
          lesson_id: string
          options_en: Json
          options_es: Json
          order_index: number
          question_en: string
          question_es: string
          xp_reward: number
        }
        Insert: {
          correct_index?: number
          explanation_en?: string | null
          explanation_es?: string | null
          id?: string
          lesson_id: string
          options_en?: Json
          options_es?: Json
          order_index?: number
          question_en: string
          question_es: string
          xp_reward?: number
        }
        Update: {
          correct_index?: number
          explanation_en?: string | null
          explanation_es?: string | null
          id?: string
          lesson_id?: string
          options_en?: Json
          options_es?: Json
          order_index?: number
          question_en?: string
          question_es?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      roleplay_scenarios: {
        Row: {
          choices: Json
          id: string
          lesson_id: string
          order_index: number
          outcome_xp: number
          role_title_en: string
          role_title_es: string
          scenario_en: string
          scenario_es: string
        }
        Insert: {
          choices?: Json
          id?: string
          lesson_id: string
          order_index?: number
          outcome_xp?: number
          role_title_en?: string
          role_title_es?: string
          scenario_en: string
          scenario_es: string
        }
        Update: {
          choices?: Json
          id?: string
          lesson_id?: string
          order_index?: number
          outcome_xp?: number
          role_title_en?: string
          role_title_es?: string
          scenario_en?: string
          scenario_es?: string
        }
        Relationships: [
          {
            foreignKeyName: "roleplay_scenarios_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
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
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
