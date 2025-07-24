export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      communities: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          member_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          member_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          ai_analysis_scores: Json | null
          collaboration: number | null
          communication: number | null
          community_id: string | null
          created_at: string
          detailed_feedback: string | null
          expertise: number | null
          id: string
          innovation: number | null
          integrity: number | null
          leadership: number | null
          location: string
          my_name: string
          other_name: string
          rating: number
          trustworthiness: number | null
          user_id: string
          visibility_level: string | null
        }
        Insert: {
          ai_analysis_scores?: Json | null
          collaboration?: number | null
          communication?: number | null
          community_id?: string | null
          created_at?: string
          detailed_feedback?: string | null
          expertise?: number | null
          id?: string
          innovation?: number | null
          integrity?: number | null
          leadership?: number | null
          location: string
          my_name: string
          other_name: string
          rating: number
          trustworthiness?: number | null
          user_id: string
          visibility_level?: string | null
        }
        Update: {
          ai_analysis_scores?: Json | null
          collaboration?: number | null
          communication?: number | null
          community_id?: string | null
          created_at?: string
          detailed_feedback?: string | null
          expertise?: number | null
          id?: string
          innovation?: number | null
          integrity?: number | null
          leadership?: number | null
          location?: string
          my_name?: string
          other_name?: string
          rating?: number
          trustworthiness?: number | null
          user_id?: string
          visibility_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      network_analysis: {
        Row: {
          analyzed_at: string
          bridge_score: number | null
          centrality_score: number | null
          community_cluster: string | null
          id: string
          influence_score: number | null
          network_reach: number | null
          person_id: string
        }
        Insert: {
          analyzed_at?: string
          bridge_score?: number | null
          centrality_score?: number | null
          community_cluster?: string | null
          id?: string
          influence_score?: number | null
          network_reach?: number | null
          person_id: string
        }
        Update: {
          analyzed_at?: string
          bridge_score?: number | null
          centrality_score?: number | null
          community_cluster?: string | null
          id?: string
          influence_score?: number | null
          network_reach?: number | null
          person_id?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string
          github_username: string | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string
          position: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          github_username?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          position?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          github_username?: string | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          position?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          allow_friend_recommendations: boolean | null
          created_at: string
          id: string
          show_connections_to_others: boolean | null
          show_meeting_history: boolean | null
          show_trust_scores: boolean | null
          updated_at: string
          user_id: string
          visibility_level: string | null
        }
        Insert: {
          allow_friend_recommendations?: boolean | null
          created_at?: string
          id?: string
          show_connections_to_others?: boolean | null
          show_meeting_history?: boolean | null
          show_trust_scores?: boolean | null
          updated_at?: string
          user_id: string
          visibility_level?: string | null
        }
        Update: {
          allow_friend_recommendations?: boolean | null
          created_at?: string
          id?: string
          show_connections_to_others?: boolean | null
          show_meeting_history?: boolean | null
          show_trust_scores?: boolean | null
          updated_at?: string
          user_id?: string
          visibility_level?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          analysis_details: Json | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          fraud_risk_level: string | null
          github_score: number | null
          github_username: string | null
          id: string
          last_analyzed_at: string | null
          linkedin_score: number | null
          linkedin_url: string | null
          portfolio_score: number | null
          portfolio_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_details?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          fraud_risk_level?: string | null
          github_score?: number | null
          github_username?: string | null
          id?: string
          last_analyzed_at?: string | null
          linkedin_score?: number | null
          linkedin_url?: string | null
          portfolio_score?: number | null
          portfolio_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_details?: Json | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          fraud_risk_level?: string | null
          github_score?: number | null
          github_username?: string | null
          id?: string
          last_analyzed_at?: string | null
          linkedin_score?: number | null
          linkedin_url?: string | null
          portfolio_score?: number | null
          portfolio_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_timeline: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          meeting_id: string | null
          person1_id: string
          person2_id: string
          relationship_type: string
          trust_change: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          meeting_id?: string | null
          person1_id: string
          person2_id: string
          relationship_type: string
          trust_change?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          meeting_id?: string | null
          person1_id?: string
          person2_id?: string
          relationship_type?: string
          trust_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "relationship_timeline_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string
          id: string
          is_mutual: boolean | null
          last_interaction: string | null
          person1_id: string
          person2_id: string
          relationship_status: string | null
          relationship_strength: number | null
          total_meetings: number | null
          trust_score: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          last_interaction?: string | null
          person1_id: string
          person2_id: string
          relationship_status?: string | null
          relationship_strength?: number | null
          total_meetings?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mutual?: boolean | null
          last_interaction?: string | null
          person1_id?: string
          person2_id?: string
          relationship_status?: string | null
          relationship_strength?: number | null
          total_meetings?: number | null
          trust_score?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_overall_trust_score: {
        Args: {
          p_trustworthiness: number
          p_expertise: number
          p_communication: number
          p_collaboration: number
          p_leadership: number
          p_innovation: number
          p_integrity: number
        }
        Returns: number
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
