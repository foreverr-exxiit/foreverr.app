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
      ai_generations: {
        Row: {
          id: string;
          memorial_id: string;
          requested_by: string;
          type: string;
          provider: string;
          model: string;
          prompt_data: Json;
          output_text: string | null;
          tokens_used: number;
          cost_cents: number;
          status: string;
          style: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          requested_by: string;
          type: string;
          provider?: string;
          model?: string;
          prompt_data?: Json;
          output_text?: string | null;
          tokens_used?: number;
          cost_cents?: number;
          status?: string;
          style?: string | null;
        };
        Update: {
          memorial_id?: string;
          requested_by?: string;
          type?: string;
          provider?: string;
          model?: string;
          prompt_data?: Json;
          output_text?: string | null;
          tokens_used?: number;
          cost_cents?: number;
          status?: string;
          style?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ai_generations_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ai_generations_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      chat_rooms: {
        Row: {
          id: string;
          memorial_id: string | null;
          type: string;
          name: string | null;
          last_message_text: string | null;
          last_message_at: string | null;
          last_message_by: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id?: string | null;
          type?: string;
          name?: string | null;
          last_message_text?: string | null;
          last_message_at?: string | null;
          last_message_by?: string | null;
          is_archived?: boolean;
        };
        Update: {
          memorial_id?: string | null;
          type?: string;
          name?: string | null;
          last_message_text?: string | null;
          last_message_at?: string | null;
          last_message_by?: string | null;
          is_archived?: boolean;
        };
        Relationships: [];
      };
      chat_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          role: string;
          last_read_at: string;
          is_muted: boolean;
          joined_at: string;
        };
        Insert: {
          room_id: string;
          user_id: string;
          role?: string;
          last_read_at?: string;
          is_muted?: boolean;
        };
        Update: {
          room_id?: string;
          user_id?: string;
          role?: string;
          last_read_at?: string;
          is_muted?: boolean;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          room_id: string;
          sender_id: string;
          content: string | null;
          type: string;
          media_url: string | null;
          reply_to_id: string | null;
          poll_data: Json | null;
          is_edited: boolean;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          room_id: string;
          sender_id: string;
          content?: string | null;
          type?: string;
          media_url?: string | null;
          reply_to_id?: string | null;
          poll_data?: Json | null;
        };
        Update: {
          room_id?: string;
          sender_id?: string;
          content?: string | null;
          type?: string;
          media_url?: string | null;
          reply_to_id?: string | null;
          poll_data?: Json | null;
          is_edited?: boolean;
          is_deleted?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "messages_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "chat_rooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          title: string;
          description: string | null;
          type: string;
          location: string | null;
          location_url: string | null;
          is_virtual: boolean;
          virtual_link: string | null;
          start_date: string;
          end_date: string | null;
          cover_image_url: string | null;
          rsvp_count: number;
          max_attendees: number | null;
          is_public: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          type?: string;
          location?: string | null;
          location_url?: string | null;
          is_virtual?: boolean;
          virtual_link?: string | null;
          start_date: string;
          end_date?: string | null;
          cover_image_url?: string | null;
          max_attendees?: number | null;
          is_public?: boolean;
          status?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          type?: string;
          location?: string | null;
          location_url?: string | null;
          is_virtual?: boolean;
          virtual_link?: string | null;
          start_date?: string;
          end_date?: string | null;
          cover_image_url?: string | null;
          max_attendees?: number | null;
          is_public?: boolean;
          status?: string;
        };
        Relationships: [];
      };
      event_rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          status?: string;
          message?: string | null;
        };
        Update: {
          status?: string;
          message?: string | null;
        };
        Relationships: [];
      };
      important_dates: {
        Row: {
          id: string;
          memorial_id: string;
          type: string;
          title: string;
          date: string;
          recurs_annually: boolean;
          notify_followers: boolean;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          type: string;
          title: string;
          date: string;
          recurs_annually?: boolean;
          notify_followers?: boolean;
        };
        Update: {
          type?: string;
          title?: string;
          date?: string;
          recurs_annually?: boolean;
          notify_followers?: boolean;
        };
        Relationships: [];
      };
      fundraising_campaigns: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          title: string;
          description: string | null;
          goal_cents: number;
          raised_cents: number;
          currency: string;
          beneficiary_name: string | null;
          beneficiary_type: string | null;
          cover_image_url: string | null;
          is_active: boolean;
          donor_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          goal_cents?: number;
          currency?: string;
          beneficiary_name?: string | null;
          beneficiary_type?: string | null;
          cover_image_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          goal_cents?: number;
          beneficiary_name?: string | null;
          beneficiary_type?: string | null;
          cover_image_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          id: string;
          campaign_id: string;
          donor_id: string | null;
          amount_cents: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          message: string | null;
          is_anonymous: boolean;
          status: string;
          created_at: string;
        };
        Insert: {
          campaign_id: string;
          donor_id?: string | null;
          amount_cents: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          message?: string | null;
          is_anonymous?: boolean;
          status?: string;
        };
        Update: {
          status?: string;
          stripe_payment_intent_id?: string | null;
        };
        Relationships: [];
      };
      ribbon_packages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          ribbon_amount: number;
          price_cents: number;
          currency: string;
          store_product_id: string | null;
          is_active: boolean;
          is_popular: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          ribbon_amount: number;
          price_cents: number;
          description?: string | null;
          currency?: string;
          store_product_id?: string | null;
          is_popular?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          ribbon_amount?: number;
          price_cents?: number;
          description?: string | null;
          store_product_id?: string | null;
          is_active?: boolean;
          is_popular?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      daily_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_date: string;
          ribbons_earned: number;
          streak_day: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          reward_date?: string;
          ribbons_earned?: number;
          streak_day?: number;
        };
        Update: {
          ribbons_earned?: number;
          streak_day?: number;
        };
        Relationships: [];
      };
      gift_catalog: {
        Row: {
          id: string;
          category: string;
          name: string;
          description: string | null;
          image_url: string;
          ribbon_cost: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          category: string;
          name: string;
          image_url: string;
          ribbon_cost: number;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          category?: string;
          name?: string;
          description?: string | null;
          image_url?: string;
          ribbon_cost?: number;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      memorial_gifts: {
        Row: {
          id: string;
          memorial_id: string;
          sender_id: string;
          gift_id: string;
          message: string | null;
          ribbon_cost: number;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          sender_id: string;
          gift_id: string;
          ribbon_cost: number;
          message?: string | null;
          is_anonymous?: boolean;
        };
        Update: {
          message?: string | null;
          is_anonymous?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "memorial_gifts_gift_id_fkey";
            columns: ["gift_id"];
            isOneToOne: false;
            referencedRelation: "gift_catalog";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memorial_gifts_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "memorial_gifts_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      ribbon_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: string;
          reference_id: string | null;
          description: string | null;
          balance_after: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          type: string;
          balance_after: number;
          reference_id?: string | null;
          description?: string | null;
        };
        Update: {
          amount?: number;
          type?: string;
          reference_id?: string | null;
          description?: string | null;
          balance_after?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ribbon_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      memorial_invitations: {
        Row: {
          id: string;
          memorial_id: string;
          invited_by: string;
          invited_email: string | null;
          invited_user_id: string | null;
          invite_code: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          invited_by: string;
          invited_email?: string | null;
          invited_user_id?: string | null;
          invite_code?: string;
        };
        Update: {
          invited_email?: string | null;
          invited_user_id?: string | null;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          details?: string | null;
          status?: string;
        };
        Update: {
          reason?: string;
          details?: string | null;
          status?: string;
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
