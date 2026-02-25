export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          ribbon_balance: number;
          is_verified: boolean;
          notification_preferences: Json;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          ribbon_balance?: number;
          is_verified?: boolean;
          notification_preferences?: Json;
          onboarding_completed?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          ribbon_balance?: number;
          is_verified?: boolean;
          notification_preferences?: Json;
          onboarding_completed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      memorials: {
        Row: {
          id: string;
          created_by: string;
          first_name: string;
          last_name: string;
          middle_name: string | null;
          nickname: string | null;
          date_of_birth: string | null;
          date_of_death: string | null;
          place_of_birth: string | null;
          place_of_death: string | null;
          profile_photo_url: string | null;
          cover_photo_url: string | null;
          obituary: string | null;
          biography: string | null;
          obituary_is_ai_generated: boolean;
          biography_is_ai_generated: boolean;
          privacy: string;
          status: string;
          follower_count: number;
          tribute_count: number;
          slug: string;
          last_interaction_at: string;
          purge_after_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          first_name: string;
          last_name: string;
          middle_name?: string | null;
          nickname?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          place_of_birth?: string | null;
          place_of_death?: string | null;
          profile_photo_url?: string | null;
          cover_photo_url?: string | null;
          obituary?: string | null;
          biography?: string | null;
          obituary_is_ai_generated?: boolean;
          biography_is_ai_generated?: boolean;
          privacy?: string;
          status?: string;
          slug?: string;
          purge_after_days?: number;
        };
        Update: {
          id?: string;
          created_by?: string;
          first_name?: string;
          last_name?: string;
          middle_name?: string | null;
          nickname?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          place_of_birth?: string | null;
          place_of_death?: string | null;
          profile_photo_url?: string | null;
          cover_photo_url?: string | null;
          obituary?: string | null;
          biography?: string | null;
          obituary_is_ai_generated?: boolean;
          biography_is_ai_generated?: boolean;
          privacy?: string;
          status?: string;
          slug?: string;
          purge_after_days?: number;
        };
        Relationships: [
          {
            foreignKeyName: "memorials_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      memorial_hosts: {
        Row: {
          id: string;
          memorial_id: string;
          user_id: string;
          role: string;
          relationship: string;
          relationship_detail: string | null;
          invited_by: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          user_id: string;
          role: string;
          relationship: string;
          relationship_detail?: string | null;
          invited_by?: string | null;
        };
        Update: {
          memorial_id?: string;
          user_id?: string;
          role?: string;
          relationship?: string;
          relationship_detail?: string | null;
          invited_by?: string | null;
        };
        Relationships: [];
      };
      followers: {
        Row: {
          id: string;
          memorial_id: string;
          user_id: string;
          notify_on_new_tribute: boolean;
          notify_on_events: boolean;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          user_id: string;
          notify_on_new_tribute?: boolean;
          notify_on_events?: boolean;
        };
        Update: {
          memorial_id?: string;
          user_id?: string;
          notify_on_new_tribute?: boolean;
          notify_on_events?: boolean;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          memorial_id: string;
          uploaded_by: string;
          type: string;
          storage_path: string;
          url: string;
          thumbnail_url: string | null;
          caption: string | null;
          date_taken: string | null;
          location: string | null;
          is_profile_photo: boolean;
          is_cover_photo: boolean;
          ai_restored: boolean;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          uploaded_by: string;
          type: string;
          storage_path: string;
          url: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          date_taken?: string | null;
          location?: string | null;
          is_profile_photo?: boolean;
          is_cover_photo?: boolean;
          ai_restored?: boolean;
        };
        Update: {
          memorial_id?: string;
          uploaded_by?: string;
          type?: string;
          storage_path?: string;
          url?: string;
          thumbnail_url?: string | null;
          caption?: string | null;
          date_taken?: string | null;
          location?: string | null;
          is_profile_photo?: boolean;
          is_cover_photo?: boolean;
          ai_restored?: boolean;
        };
        Relationships: [];
      };
      tributes: {
        Row: {
          id: string;
          memorial_id: string;
          author_id: string;
          type: string;
          content: string | null;
          media_url: string | null;
          is_ai_generated: boolean;
          like_count: number;
          comment_count: number;
          ribbon_type: string;
          ribbon_count: number;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          author_id: string;
          type: string;
          content?: string | null;
          media_url?: string | null;
          is_ai_generated?: boolean;
          ribbon_type: string;
          ribbon_count?: number;
          is_pinned?: boolean;
        };
        Update: {
          memorial_id?: string;
          author_id?: string;
          type?: string;
          content?: string | null;
          media_url?: string | null;
          is_ai_generated?: boolean;
          ribbon_type?: string;
          ribbon_count?: number;
          is_pinned?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "tributes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tributes_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
      };
      tribute_comments: {
        Row: {
          id: string;
          tribute_id: string;
          author_id: string;
          content: string;
          parent_comment_id: string | null;
          like_count: number;
          created_at: string;
        };
        Insert: {
          tribute_id: string;
          author_id: string;
          content: string;
          parent_comment_id?: string | null;
        };
        Update: {
          tribute_id?: string;
          author_id?: string;
          content?: string;
          parent_comment_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tribute_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reactions: {
        Row: {
          id: string;
          user_id: string;
          target_type: string;
          target_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          target_type: string;
          target_id: string;
          reaction_type: string;
        };
        Update: {
          user_id?: string;
          target_type?: string;
          target_id?: string;
          reaction_type?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string;
          data: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          title: string;
          body: string;
          data?: Json;
          is_read?: boolean;
        };
        Update: {
          user_id?: string;
          type?: string;
          title?: string;
          body?: string;
          data?: Json;
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
