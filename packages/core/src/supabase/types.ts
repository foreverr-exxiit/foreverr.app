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
          follower_count: number;
          following_count: number;
          badge_count: number;
          legacy_link_slug: string | null;
          legacy_message: string | null;
          is_living_tribute_enabled: boolean;
          prompt_streak: number;
          trust_level: number;
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
          legacy_link_slug?: string | null;
          legacy_message?: string | null;
          is_living_tribute_enabled?: boolean;
          prompt_streak?: number;
          trust_level?: number;
          notification_preferences?: Json;
          onboarding_completed?: boolean;
          follower_count?: number;
          following_count?: number;
          badge_count?: number;
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
          follower_count?: number;
          following_count?: number;
          badge_count?: number;
          legacy_link_slug?: string | null;
          legacy_message?: string | null;
          is_living_tribute_enabled?: boolean;
          prompt_streak?: number;
          trust_level?: number;
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
          converted_from_living_tribute_id: string | null;
          page_type: string;
          is_claimed: boolean;
          claimed_by: string | null;
          is_celebrity: boolean;
          celebrity_verified: boolean;
          lifecycle_stage: string;
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
          converted_from_living_tribute_id?: string | null;
          page_type?: string;
          is_claimed?: boolean;
          claimed_by?: string | null;
          is_celebrity?: boolean;
          celebrity_verified?: boolean;
          lifecycle_stage?: string;
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
          converted_from_living_tribute_id?: string | null;
          page_type?: string;
          is_claimed?: boolean;
          claimed_by?: string | null;
          is_celebrity?: boolean;
          celebrity_verified?: boolean;
          lifecycle_stage?: string;
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
          name: string;
          description: string | null;
          category: string;
          icon: string;
          image_url: string | null;
          price_cents: number;
          is_premium: boolean;
          is_physical: boolean;
          physical_partner_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          icon?: string;
          image_url?: string | null;
          price_cents?: number;
          is_premium?: boolean;
          is_physical?: boolean;
          physical_partner_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          icon?: string;
          image_url?: string | null;
          price_cents?: number;
          is_premium?: boolean;
          is_physical?: boolean;
          physical_partner_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
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
      marketplace_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          icon_name: string | null;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          slug: string;
          name: string;
          description?: string | null;
          icon_name?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          icon_name?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      marketplace_listings: {
        Row: {
          id: string;
          seller_id: string;
          category_id: string;
          title: string;
          description: string | null;
          price_cents: number;
          currency: string;
          listing_type: string;
          condition: string | null;
          images: string[];
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          shipping_available: boolean;
          shipping_price_cents: number | null;
          is_featured: boolean;
          is_promoted: boolean;
          promoted_until: string | null;
          status: string;
          view_count: number;
          inquiry_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          seller_id: string;
          category_id: string;
          title: string;
          price_cents: number;
          description?: string | null;
          currency?: string;
          listing_type?: string;
          condition?: string | null;
          images?: string[];
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          shipping_available?: boolean;
          shipping_price_cents?: number | null;
          status?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          price_cents?: number;
          category_id?: string;
          listing_type?: string;
          condition?: string | null;
          images?: string[];
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          shipping_available?: boolean;
          shipping_price_cents?: number | null;
          is_featured?: boolean;
          is_promoted?: boolean;
          promoted_until?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "marketplace_listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "marketplace_listings_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "marketplace_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      listing_inquiries: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          message: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          buyer_id: string;
          message: string;
          status?: string;
        };
        Update: {
          message?: string;
          status?: string;
        };
        Relationships: [];
      };
      inquiry_messages: {
        Row: {
          id: string;
          inquiry_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          inquiry_id: string;
          sender_id: string;
          content: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [];
      };
      saved_listings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
        };
        Update: {};
        Relationships: [];
      };
      seller_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string | null;
          business_description: string | null;
          business_type: string | null;
          website_url: string | null;
          phone: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          is_verified: boolean;
          rating_avg: number;
          rating_count: number;
          total_sales: number;
          response_time_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          business_name?: string | null;
          business_description?: string | null;
          business_type?: string | null;
          website_url?: string | null;
          phone?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          business_name?: string | null;
          business_description?: string | null;
          business_type?: string | null;
          website_url?: string | null;
          phone?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          is_verified?: boolean;
          rating_avg?: number;
          rating_count?: number;
          total_sales?: number;
          response_time_hours?: number | null;
        };
        Relationships: [];
      };
      seller_reviews: {
        Row: {
          id: string;
          seller_id: string;
          reviewer_id: string;
          listing_id: string | null;
          rating: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          seller_id: string;
          reviewer_id: string;
          rating: number;
          listing_id?: string | null;
          review_text?: string | null;
        };
        Update: {
          rating?: number;
          review_text?: string | null;
        };
        Relationships: [];
      };
      directory_listings: {
        Row: {
          id: string;
          owner_id: string;
          business_name: string;
          business_type: string;
          description: string | null;
          services: string[];
          price_range: string | null;
          phone: string | null;
          email: string | null;
          website_url: string | null;
          address: string;
          city: string;
          state: string | null;
          zip_code: string | null;
          country: string;
          latitude: number | null;
          longitude: number | null;
          cover_image_url: string | null;
          gallery_images: string[];
          hours_of_operation: Json | null;
          is_verified: boolean;
          is_featured: boolean;
          rating_avg: number;
          rating_count: number;
          review_count: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          owner_id: string;
          business_name: string;
          business_type: string;
          address: string;
          city: string;
          country?: string;
          description?: string | null;
          services?: string[];
          price_range?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          state?: string | null;
          zip_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          cover_image_url?: string | null;
          gallery_images?: string[];
          hours_of_operation?: Json | null;
          status?: string;
        };
        Update: {
          business_name?: string;
          business_type?: string;
          description?: string | null;
          services?: string[];
          price_range?: string | null;
          phone?: string | null;
          email?: string | null;
          website_url?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          zip_code?: string | null;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          cover_image_url?: string | null;
          gallery_images?: string[];
          hours_of_operation?: Json | null;
          is_verified?: boolean;
          is_featured?: boolean;
          status?: string;
        };
        Relationships: [];
      };
      directory_reviews: {
        Row: {
          id: string;
          listing_id: string;
          reviewer_id: string;
          rating: number;
          title: string | null;
          review_text: string | null;
          visit_date: string | null;
          is_verified_visit: boolean;
          helpful_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          reviewer_id: string;
          rating: number;
          title?: string | null;
          review_text?: string | null;
          visit_date?: string | null;
        };
        Update: {
          rating?: number;
          title?: string | null;
          review_text?: string | null;
          visit_date?: string | null;
        };
        Relationships: [];
      };
      directory_leads: {
        Row: {
          id: string;
          listing_id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          service_type: string | null;
          preferred_date: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          listing_id: string;
          name: string;
          email: string;
          message: string;
          user_id?: string | null;
          phone?: string | null;
          service_type?: string | null;
          preferred_date?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
          phone?: string | null;
        };
        Relationships: [];
      };
      nfts: {
        Row: {
          id: string;
          memorial_id: string;
          creator_id: string;
          owner_id: string;
          title: string;
          description: string | null;
          media_url: string;
          thumbnail_url: string | null;
          token_id: string | null;
          contract_address: string | null;
          chain: string;
          price_cents: number;
          royalty_percentage: number;
          edition_number: number;
          total_editions: number;
          status: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          creator_id: string;
          owner_id: string;
          title: string;
          media_url: string;
          description?: string | null;
          thumbnail_url?: string | null;
          token_id?: string | null;
          contract_address?: string | null;
          chain?: string;
          price_cents?: number;
          royalty_percentage?: number;
          edition_number?: number;
          total_editions?: number;
          status?: string;
          metadata?: Json | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          media_url?: string;
          thumbnail_url?: string | null;
          token_id?: string | null;
          contract_address?: string | null;
          price_cents?: number;
          royalty_percentage?: number;
          owner_id?: string;
          status?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "nfts_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nfts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nfts_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      nft_transactions: {
        Row: {
          id: string;
          nft_id: string;
          from_user_id: string | null;
          to_user_id: string | null;
          transaction_type: string;
          price_cents: number | null;
          transaction_hash: string | null;
          created_at: string;
        };
        Insert: {
          nft_id: string;
          transaction_type: string;
          from_user_id?: string | null;
          to_user_id?: string | null;
          price_cents?: number | null;
          transaction_hash?: string | null;
        };
        Update: {
          transaction_hash?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "nft_transactions_nft_id_fkey";
            columns: ["nft_id"];
            isOneToOne: false;
            referencedRelation: "nfts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nft_transactions_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nft_transactions_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      live_rooms: {
        Row: {
          id: string;
          host_id: string;
          memorial_id: string;
          title: string;
          description: string | null;
          room_type: string;
          status: string;
          scheduled_at: string;
          started_at: string | null;
          ended_at: string | null;
          max_participants: number | null;
          participant_count: number;
          recording_url: string | null;
          is_recorded: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          host_id: string;
          memorial_id: string;
          title: string;
          description?: string | null;
          room_type?: string;
          status?: string;
          scheduled_at?: string;
          max_participants?: number | null;
          is_recorded?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          room_type?: string;
          status?: string;
          started_at?: string | null;
          ended_at?: string | null;
          participant_count?: number;
          recording_url?: string | null;
          is_recorded?: boolean;
        };
        Relationships: [];
      };
      live_room_participants: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          role: string;
          is_speaking: boolean;
          is_muted: boolean;
          hand_raised: boolean;
          is_active: boolean;
          joined_at: string;
          left_at: string | null;
        };
        Insert: {
          room_id: string;
          user_id: string;
          role?: string;
          is_speaking?: boolean;
          is_muted?: boolean;
          hand_raised?: boolean;
          is_active?: boolean;
          joined_at?: string;
        };
        Update: {
          role?: string;
          is_speaking?: boolean;
          is_muted?: boolean;
          hand_raised?: boolean;
          is_active?: boolean;
          left_at?: string | null;
        };
        Relationships: [];
      };
      memory_vault_items: {
        Row: {
          id: string;
          memorial_id: string;
          uploaded_by: string;
          item_type: string;
          title: string;
          description: string | null;
          content: string | null;
          media_url: string | null;
          thumbnail_url: string | null;
          metadata: Json;
          is_private: boolean;
          folder_id: string | null;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          uploaded_by: string;
          item_type: string;
          title: string;
          description?: string | null;
          content?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Json;
          is_private?: boolean;
          folder_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          content?: string | null;
          media_url?: string | null;
          thumbnail_url?: string | null;
          metadata?: Json;
          is_private?: boolean;
          folder_id?: string | null;
        };
        Relationships: [];
      };
      time_capsules: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          title: string;
          description: string | null;
          content: string | null;
          media_url: string | null;
          unlock_date: string;
          is_unlocked: boolean;
          unlocked_at: string | null;
          recipient_ids: string[];
          notify_on_unlock: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          title: string;
          description?: string | null;
          content?: string | null;
          media_url?: string | null;
          unlock_date: string;
          recipient_ids?: string[];
          notify_on_unlock?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          content?: string | null;
          media_url?: string | null;
          unlock_date?: string;
          recipient_ids?: string[];
          notify_on_unlock?: boolean;
          is_unlocked?: boolean;
          unlocked_at?: string | null;
        };
        Relationships: [];
      };
      legacy_letters: {
        Row: {
          id: string;
          author_id: string;
          memorial_id: string | null;
          recipient_name: string;
          recipient_email: string | null;
          recipient_user_id: string | null;
          subject: string;
          content: string;
          media_url: string | null;
          delivery_date: string;
          delivery_type: string;
          is_delivered: boolean;
          delivered_at: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          memorial_id?: string | null;
          recipient_name: string;
          recipient_email?: string | null;
          recipient_user_id?: string | null;
          subject: string;
          content: string;
          media_url?: string | null;
          delivery_date: string;
          delivery_type?: string;
        };
        Update: {
          recipient_name?: string;
          recipient_email?: string | null;
          recipient_user_id?: string | null;
          subject?: string;
          content?: string;
          media_url?: string | null;
          delivery_date?: string;
          delivery_type?: string;
          is_delivered?: boolean;
          delivered_at?: string | null;
          is_read?: boolean;
          read_at?: string | null;
        };
        Relationships: [];
      };
      scrapbook_pages: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          title: string;
          page_number: number;
          layout_data: Json;
          background_color: string;
          background_image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          title: string;
          page_number?: number;
          layout_data?: Json;
          background_color?: string;
          background_image_url?: string | null;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          page_number?: number;
          layout_data?: Json;
          background_color?: string;
          background_image_url?: string | null;
          is_published?: boolean;
        };
        Relationships: [];
      };
      memorial_qr_codes: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          code: string;
          label: string | null;
          location_name: string | null;
          latitude: number | null;
          longitude: number | null;
          scan_count: number;
          is_active: boolean;
          last_scanned_at: string | null;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          code: string;
          label?: string | null;
          location_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: {
          label?: string | null;
          location_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          scan_count?: number;
          is_active?: boolean;
          last_scanned_at?: string | null;
        };
        Relationships: [];
      };
      family_trees: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          cover_image_url: string | null;
          is_public: boolean;
          member_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          created_by: string;
          description?: string | null;
          cover_image_url?: string | null;
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          cover_image_url?: string | null;
          is_public?: boolean;
        };
        Relationships: [];
      };
      family_tree_members: {
        Row: {
          id: string;
          tree_id: string;
          memorial_id: string | null;
          profile_id: string | null;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          date_of_death: string | null;
          photo_url: string | null;
          gender: string | null;
          bio: string | null;
          is_living: boolean;
          position_x: number;
          position_y: number;
          generation_level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          tree_id: string;
          first_name: string;
          last_name: string;
          memorial_id?: string | null;
          profile_id?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          photo_url?: string | null;
          gender?: string | null;
          bio?: string | null;
          is_living?: boolean;
          position_x?: number;
          position_y?: number;
          generation_level?: number;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          memorial_id?: string | null;
          profile_id?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          photo_url?: string | null;
          gender?: string | null;
          bio?: string | null;
          is_living?: boolean;
          position_x?: number;
          position_y?: number;
          generation_level?: number;
        };
        Relationships: [];
      };
      family_tree_connections: {
        Row: {
          id: string;
          tree_id: string;
          from_member_id: string;
          to_member_id: string;
          relationship_type: string;
          relationship_label: string | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          tree_id: string;
          from_member_id: string;
          to_member_id: string;
          relationship_type: string;
          relationship_label?: string | null;
          start_date?: string | null;
          end_date?: string | null;
        };
        Update: {
          relationship_type?: string;
          relationship_label?: string | null;
          start_date?: string | null;
          end_date?: string | null;
        };
        Relationships: [];
      };
      memory_prompts: {
        Row: {
          id: string;
          memorial_id: string;
          prompt_text: string;
          prompt_type: string;
          trigger_date: string | null;
          is_active: boolean;
          response_count: number;
          category_id: string | null;
          is_ai_suggested: boolean;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          prompt_text: string;
          prompt_type: string;
          trigger_date?: string | null;
          is_active?: boolean;
          category_id?: string | null;
          is_ai_suggested?: boolean;
        };
        Update: {
          prompt_text?: string;
          prompt_type?: string;
          trigger_date?: string | null;
          is_active?: boolean;
          category_id?: string | null;
          is_ai_suggested?: boolean;
        };
        Relationships: [];
      };
      memory_prompt_responses: {
        Row: {
          id: string;
          prompt_id: string;
          user_id: string;
          content: string;
          media_url: string | null;
          created_at: string;
        };
        Insert: {
          prompt_id: string;
          user_id: string;
          content: string;
          media_url?: string | null;
        };
        Update: {
          content?: string;
          media_url?: string | null;
        };
        Relationships: [];
      };
      virtual_spaces: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          name: string;
          description: string | null;
          space_type: string;
          theme_data: Json;
          background_music_url: string | null;
          is_public: boolean;
          visitor_count: number;
          item_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          name: string;
          description?: string | null;
          space_type?: string;
          theme_data?: Json;
          background_music_url?: string | null;
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          space_type?: string;
          theme_data?: Json;
          background_music_url?: string | null;
          is_public?: boolean;
        };
        Relationships: [];
      };
      virtual_space_items: {
        Row: {
          id: string;
          space_id: string;
          placed_by: string;
          item_type: string;
          position_x: number;
          position_y: number;
          position_z: number;
          rotation_x: number;
          rotation_y: number;
          rotation_z: number;
          scale: number;
          media_url: string | null;
          text_content: string | null;
          message: string | null;
          color: string | null;
          animation: string | null;
          is_permanent: boolean;
          expires_at: string | null;
          ribbon_cost: number;
          created_at: string;
        };
        Insert: {
          space_id: string;
          placed_by: string;
          item_type: string;
          position_x?: number;
          position_y?: number;
          position_z?: number;
          rotation_x?: number;
          rotation_y?: number;
          rotation_z?: number;
          scale?: number;
          media_url?: string | null;
          text_content?: string | null;
          message?: string | null;
          color?: string | null;
          animation?: string | null;
          is_permanent?: boolean;
          expires_at?: string | null;
          ribbon_cost?: number;
        };
        Update: {
          position_x?: number;
          position_y?: number;
          position_z?: number;
          rotation_x?: number;
          rotation_y?: number;
          rotation_z?: number;
          scale?: number;
          media_url?: string | null;
          text_content?: string | null;
          message?: string | null;
          color?: string | null;
          animation?: string | null;
          is_permanent?: boolean;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      memory_streaks: {
        Row: {
          id: string;
          user_id: string;
          memorial_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          total_visits: number;
          total_candles_lit: number;
          total_memories_shared: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          memorial_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          total_visits?: number;
          total_candles_lit?: number;
          total_memories_shared?: number;
        };
        Relationships: [];
      };
      seasonal_decorations: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          decoration_type: string;
          image_url: string;
          preview_url: string | null;
          ribbon_cost: number;
          is_premium: boolean;
          available_from: string;
          available_until: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          name: string;
          decoration_type: string;
          image_url: string;
          description?: string | null;
          preview_url?: string | null;
          ribbon_cost?: number;
          is_premium?: boolean;
          available_from: string;
          available_until: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          decoration_type?: string;
          image_url?: string;
          preview_url?: string | null;
          ribbon_cost?: number;
          is_premium?: boolean;
          available_from?: string;
          available_until?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      applied_decorations: {
        Row: {
          id: string;
          memorial_id: string;
          decoration_id: string;
          applied_by: string;
          applied_at: string;
          expires_at: string | null;
        };
        Insert: {
          memorial_id: string;
          decoration_id: string;
          applied_by: string;
          expires_at?: string | null;
        };
        Update: {
          expires_at?: string | null;
        };
        Relationships: [];
      };
      celebrity_memorials: {
        Row: {
          id: string;
          full_name: string;
          first_name: string;
          last_name: string;
          date_of_birth: string | null;
          date_of_death: string | null;
          age_at_death: number | null;
          cause_of_death: string | null;
          nationality: string | null;
          occupation: string | null;
          biography_summary: string | null;
          photo_url: string | null;
          source_url: string | null;
          source: string | null;
          category: string;
          death_month: number | null;
          death_day: number | null;
          memorial_id: string | null;
          view_count: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          full_name: string;
          first_name: string;
          last_name: string;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          age_at_death?: number | null;
          cause_of_death?: string | null;
          nationality?: string | null;
          occupation?: string | null;
          biography_summary?: string | null;
          photo_url?: string | null;
          source_url?: string | null;
          source?: string | null;
          category?: string;
          death_month?: number | null;
          death_day?: number | null;
          memorial_id?: string | null;
          is_featured?: boolean;
        };
        Update: {
          full_name?: string;
          first_name?: string;
          last_name?: string;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          age_at_death?: number | null;
          cause_of_death?: string | null;
          nationality?: string | null;
          occupation?: string | null;
          biography_summary?: string | null;
          photo_url?: string | null;
          source_url?: string | null;
          source?: string | null;
          category?: string;
          death_month?: number | null;
          death_day?: number | null;
          memorial_id?: string | null;
          view_count?: number;
          is_featured?: boolean;
          is_active?: boolean;
        };
        Relationships: [];
      };
      news_items: {
        Row: {
          id: string;
          title: string;
          summary: string | null;
          content: string | null;
          image_url: string | null;
          source_url: string | null;
          source_name: string | null;
          category: string;
          celebrity_memorial_id: string | null;
          is_featured: boolean;
          is_active: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          summary?: string | null;
          content?: string | null;
          image_url?: string | null;
          source_url?: string | null;
          source_name?: string | null;
          category?: string;
          celebrity_memorial_id?: string | null;
          is_featured?: boolean;
          published_at?: string;
        };
        Update: {
          title?: string;
          summary?: string | null;
          content?: string | null;
          image_url?: string | null;
          source_url?: string | null;
          source_name?: string | null;
          category?: string;
          celebrity_memorial_id?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          published_at?: string;
        };
        Relationships: [];
      };
      vault_folders: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          parent_folder_id: string | null;
          item_count: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          memorial_id: string;
          created_by: string;
          name: string;
          description?: string | null;
          icon?: string;
          color?: string;
          parent_folder_id?: string | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          parent_folder_id?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      vault_item_tags: {
        Row: {
          id: string;
          memorial_id: string;
          item_id: string;
          tag: string;
          created_at: string;
        };
        Insert: {
          memorial_id: string;
          item_id: string;
          tag: string;
        };
        Update: {
          tag?: string;
        };
        Relationships: [];
      };
      vault_item_folders: {
        Row: {
          id: string;
          item_id: string;
          folder_id: string;
          created_at: string;
        };
        Insert: {
          item_id: string;
          folder_id: string;
        };
        Update: {};
        Relationships: [];
      };
      scrapbook_elements: {
        Row: {
          id: string;
          page_id: string;
          element_type: string;
          content: string | null;
          media_url: string | null;
          position_x: number;
          position_y: number;
          width: number;
          height: number;
          rotation: number;
          z_index: number;
          style_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          page_id: string;
          element_type: string;
          content?: string | null;
          media_url?: string | null;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          z_index?: number;
          style_data?: Json;
        };
        Update: {
          element_type?: string;
          content?: string | null;
          media_url?: string | null;
          position_x?: number;
          position_y?: number;
          width?: number;
          height?: number;
          rotation?: number;
          z_index?: number;
          style_data?: Json;
        };
        Relationships: [];
      };
      prompt_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string;
          sort_order: number;
          is_active: boolean;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      // ── Advanced Social ──────────────────────────────

      user_follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      user_activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          activity_type: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          is_public?: boolean;
        };
        Update: {
          user_id?: string;
          activity_type?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          is_public?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      badge_definitions: {
        Row: {
          id: string;
          badge_type: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          requirement_count: number;
          tier_thresholds: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          badge_type: string;
          name: string;
          description: string;
          icon?: string;
          category: string;
          requirement_count?: number;
          tier_thresholds?: Json;
          is_active?: boolean;
        };
        Update: {
          badge_type?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          requirement_count?: number;
          tier_thresholds?: Json;
          is_active?: boolean;
        };
        Relationships: [];
      };

      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_type: string;
          badge_tier: string;
          progress: number;
          is_displayed: boolean;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_type: string;
          badge_tier?: string;
          progress?: number;
          is_displayed?: boolean;
        };
        Update: {
          user_id?: string;
          badge_type?: string;
          badge_tier?: string;
          progress?: number;
          is_displayed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_badges_badge_type_fkey";
            columns: ["badge_type"];
            isOneToOne: false;
            referencedRelation: "badge_definitions";
            referencedColumns: ["badge_type"];
          }
        ];
      };

      mentions: {
        Row: {
          id: string;
          mentioned_user_id: string;
          mentioned_by: string;
          context_type: string;
          context_id: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          mentioned_user_id: string;
          mentioned_by: string;
          context_type: string;
          context_id: string;
          is_read?: boolean;
        };
        Update: {
          mentioned_user_id?: string;
          mentioned_by?: string;
          context_type?: string;
          context_id?: string;
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "mentions_mentioned_user_id_fkey";
            columns: ["mentioned_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mentions_mentioned_by_fkey";
            columns: ["mentioned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      share_cards: {
        Row: {
          id: string;
          user_id: string | null;
          target_type: string;
          target_id: string;
          share_platform: string | null;
          share_url: string;
          og_title: string | null;
          og_description: string | null;
          og_image_url: string | null;
          click_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          target_type: string;
          target_id: string;
          share_platform?: string | null;
          share_url: string;
          og_title?: string | null;
          og_description?: string | null;
          og_image_url?: string | null;
          click_count?: number;
        };
        Update: {
          user_id?: string | null;
          target_type?: string;
          target_id?: string;
          share_platform?: string | null;
          share_url?: string;
          og_title?: string | null;
          og_description?: string | null;
          og_image_url?: string | null;
          click_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "share_cards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      legacy_links: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          is_active: boolean;
          click_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          is_active?: boolean;
          click_count?: number;
        };
        Update: {
          user_id?: string;
          slug?: string;
          is_active?: boolean;
          click_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "legacy_links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      living_tributes: {
        Row: {
          id: string;
          created_by: string;
          honoree_user_id: string | null;
          honoree_name: string;
          honoree_email: string | null;
          honoree_photo_url: string | null;
          cover_photo_url: string | null;
          title: string;
          description: string | null;
          occasion: string | null;
          occasion_date: string | null;
          privacy: string;
          status: string;
          memorial_id: string | null;
          slug: string;
          contributor_count: number;
          message_count: number;
          view_count: number;
          is_surprise: boolean;
          reveal_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          honoree_user_id?: string | null;
          honoree_name: string;
          honoree_email?: string | null;
          honoree_photo_url?: string | null;
          cover_photo_url?: string | null;
          title: string;
          description?: string | null;
          occasion?: string | null;
          occasion_date?: string | null;
          privacy?: string;
          status?: string;
          memorial_id?: string | null;
          slug?: string;
          is_surprise?: boolean;
          reveal_at?: string | null;
        };
        Update: {
          honoree_user_id?: string | null;
          honoree_name?: string;
          honoree_email?: string | null;
          honoree_photo_url?: string | null;
          cover_photo_url?: string | null;
          title?: string;
          description?: string | null;
          occasion?: string | null;
          occasion_date?: string | null;
          privacy?: string;
          status?: string;
          memorial_id?: string | null;
          slug?: string;
          is_surprise?: boolean;
          reveal_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "living_tributes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "living_tributes_honoree_user_id_fkey";
            columns: ["honoree_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "living_tributes_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
      };
      living_tribute_messages: {
        Row: {
          id: string;
          tribute_id: string;
          author_id: string;
          content: string | null;
          media_url: string | null;
          media_type: string | null;
          reaction_count: number;
          is_anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tribute_id: string;
          author_id: string;
          content?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          is_anonymous?: boolean;
        };
        Update: {
          content?: string | null;
          media_url?: string | null;
          media_type?: string | null;
          is_anonymous?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "living_tribute_messages_tribute_id_fkey";
            columns: ["tribute_id"];
            isOneToOne: false;
            referencedRelation: "living_tributes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "living_tribute_messages_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      living_tribute_invites: {
        Row: {
          id: string;
          tribute_id: string;
          invited_by: string;
          invited_email: string | null;
          invited_user_id: string | null;
          invite_code: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tribute_id: string;
          invited_by: string;
          invited_email?: string | null;
          invited_user_id?: string | null;
          invite_code?: string;
          status?: string;
        };
        Update: {
          invited_email?: string | null;
          invited_user_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "living_tribute_invites_tribute_id_fkey";
            columns: ["tribute_id"];
            isOneToOne: false;
            referencedRelation: "living_tributes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "living_tribute_invites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      appreciation_letters: {
        Row: {
          id: string;
          author_id: string;
          recipient_user_id: string | null;
          recipient_name: string;
          recipient_email: string | null;
          subject: string;
          content: string;
          media_url: string | null;
          delivery_type: string;
          delivery_date: string | null;
          occasion: string | null;
          is_delivered: boolean;
          delivered_at: string | null;
          is_read: boolean;
          read_at: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          recipient_user_id?: string | null;
          recipient_name: string;
          recipient_email?: string | null;
          subject: string;
          content: string;
          media_url?: string | null;
          delivery_type?: string;
          delivery_date?: string | null;
          occasion?: string | null;
          is_public?: boolean;
        };
        Update: {
          recipient_user_id?: string | null;
          recipient_name?: string;
          recipient_email?: string | null;
          subject?: string;
          content?: string;
          media_url?: string | null;
          delivery_type?: string;
          delivery_date?: string | null;
          occasion?: string | null;
          is_delivered?: boolean;
          delivered_at?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          is_public?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "appreciation_letters_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appreciation_letters_recipient_user_id_fkey";
            columns: ["recipient_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_prompts: {
        Row: {
          id: string;
          prompt_text: string;
          prompt_category: string;
          icon: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_text: string;
          prompt_category: string;
          icon?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          prompt_text?: string;
          prompt_category?: string;
          icon?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_prompt_responses: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          content: string;
          media_url: string | null;
          is_public: boolean;
          tagged_memorial_id: string | null;
          tagged_user_id: string | null;
          reaction_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          content: string;
          media_url?: string | null;
          is_public?: boolean;
          tagged_memorial_id?: string | null;
          tagged_user_id?: string | null;
        };
        Update: {
          content?: string;
          media_url?: string | null;
          is_public?: boolean;
          tagged_memorial_id?: string | null;
          tagged_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_prompt_responses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_prompt_responses_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "daily_prompts";
            referencedColumns: ["id"];
          }
        ];
      };
      smart_reminders: {
        Row: {
          id: string;
          user_id: string;
          reminder_type: string;
          title: string;
          description: string | null;
          memorial_id: string | null;
          recurrence: string;
          reminder_date: string;
          reminder_time: string;
          days_before: number;
          is_enabled: boolean;
          last_triggered: string | null;
          notification_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reminder_type: string;
          title: string;
          description?: string | null;
          memorial_id?: string | null;
          recurrence?: string;
          reminder_date: string;
          reminder_time?: string;
          days_before?: number;
          is_enabled?: boolean;
        };
        Update: {
          reminder_type?: string;
          title?: string;
          description?: string | null;
          memorial_id?: string | null;
          recurrence?: string;
          reminder_date?: string;
          reminder_time?: string;
          days_before?: number;
          is_enabled?: boolean;
          last_triggered?: string | null;
          notification_sent?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "smart_reminders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      engagement_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          total_days_active: number;
          total_prompts_answered: number;
          total_shares: number;
          streak_shared_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          total_days_active?: number;
          total_prompts_answered?: number;
          total_shares?: number;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          total_days_active?: number;
          total_prompts_answered?: number;
          total_shares?: number;
          streak_shared_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "engagement_streaks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      invite_links: {
        Row: {
          id: string;
          creator_id: string;
          invite_type: string;
          target_id: string | null;
          invite_code: string;
          message: string | null;
          max_uses: number | null;
          use_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          invite_type: string;
          target_id?: string | null;
          invite_code?: string;
          message?: string | null;
          max_uses?: number | null;
          is_active?: boolean;
        };
        Update: {
          invite_type?: string;
          target_id?: string | null;
          message?: string | null;
          max_uses?: number | null;
          use_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "invite_links_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      invite_conversions: {
        Row: {
          id: string;
          invite_link_id: string;
          converted_user_id: string | null;
          conversion_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invite_link_id: string;
          converted_user_id?: string | null;
          conversion_type: string;
        };
        Update: {
          converted_user_id?: string | null;
          conversion_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invite_conversions_invite_link_id_fkey";
            columns: ["invite_link_id"];
            isOneToOne: false;
            referencedRelation: "invite_links";
            referencedColumns: ["id"];
          }
        ];
      };
      share_card_templates: {
        Row: {
          id: string;
          name: string;
          template_type: string;
          background_color: string;
          text_color: string;
          layout: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          template_type: string;
          background_color?: string;
          text_color?: string;
          layout?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Update: {
          name?: string;
          template_type?: string;
          background_color?: string;
          text_color?: string;
          layout?: string;
          is_active?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          campaign_type: string;
          start_date: string;
          end_date: string;
          cover_image_url: string | null;
          cta_text: string;
          cta_route: string;
          is_active: boolean;
          participant_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          campaign_type: string;
          start_date: string;
          end_date: string;
          cover_image_url?: string | null;
          cta_text?: string;
          cta_route?: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          campaign_type?: string;
          start_date?: string;
          end_date?: string;
          cover_image_url?: string | null;
          cta_text?: string;
          cta_route?: string;
          is_active?: boolean;
          participant_count?: number;
        };
        Relationships: [];
      };
      user_share_stats: {
        Row: {
          id: string;
          user_id: string;
          total_shares: number;
          total_invites_sent: number;
          total_conversions: number;
          total_prompts_answered: number;
          most_shared_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_shares?: number;
          total_invites_sent?: number;
          total_conversions?: number;
          total_prompts_answered?: number;
          most_shared_type?: string | null;
        };
        Update: {
          total_shares?: number;
          total_invites_sent?: number;
          total_conversions?: number;
          total_prompts_answered?: number;
          most_shared_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_share_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      gift_transactions: {
        Row: {
          id: string;
          sender_id: string;
          recipient_type: string;
          recipient_id: string;
          recipient_user_id: string | null;
          gift_id: string;
          quantity: number;
          message: string | null;
          is_anonymous: boolean;
          amount_cents: number;
          currency: string;
          payment_status: string;
          payment_intent_id: string | null;
          is_physical: boolean;
          shipping_address: unknown | null;
          delivery_status: string | null;
          tracking_number: string | null;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_type: string;
          recipient_id: string;
          recipient_user_id?: string | null;
          gift_id: string;
          quantity?: number;
          message?: string | null;
          is_anonymous?: boolean;
          amount_cents?: number;
          currency?: string;
          payment_status?: string;
          payment_intent_id?: string | null;
          is_physical?: boolean;
          shipping_address?: unknown | null;
          delivery_status?: string | null;
          tracking_number?: string | null;
          points_earned?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_type?: string;
          recipient_id?: string;
          recipient_user_id?: string | null;
          gift_id?: string;
          quantity?: number;
          message?: string | null;
          is_anonymous?: boolean;
          amount_cents?: number;
          currency?: string;
          payment_status?: string;
          payment_intent_id?: string | null;
          is_physical?: boolean;
          shipping_address?: unknown | null;
          delivery_status?: string | null;
          tracking_number?: string | null;
          points_earned?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gift_transactions_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gift_transactions_gift_id_fkey";
            columns: ["gift_id"];
            isOneToOne: false;
            referencedRelation: "gift_catalog";
            referencedColumns: ["id"];
          }
        ];
      };
      flower_walls: {
        Row: {
          id: string;
          target_type: string;
          target_id: string;
          total_flowers: number;
          total_candles: number;
          total_gifts: number;
          total_amount_cents: number;
          last_gift_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          target_type: string;
          target_id: string;
          total_flowers?: number;
          total_candles?: number;
          total_gifts?: number;
          total_amount_cents?: number;
          last_gift_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          target_type?: string;
          target_id?: string;
          total_flowers?: number;
          total_candles?: number;
          total_gifts?: number;
          total_amount_cents?: number;
          last_gift_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      gift_reactions: {
        Row: {
          id: string;
          gift_transaction_id: string;
          user_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          gift_transaction_id: string;
          user_id: string;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          gift_transaction_id?: string;
          user_id?: string;
          reaction_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gift_reactions_gift_transaction_id_fkey";
            columns: ["gift_transaction_id"];
            isOneToOne: false;
            referencedRelation: "gift_transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gift_reactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      legacy_points: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          action_type: string;
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points: number;
          action_type: string;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points?: number;
          action_type?: string;
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      legacy_point_balances: {
        Row: {
          id: string;
          user_id: string;
          total_earned: number;
          total_spent: number;
          current_balance: number;
          level: number;
          level_name: string;
          next_level_at: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_earned?: number;
          total_spent?: number;
          current_balance?: number;
          level?: number;
          level_name?: string;
          next_level_at?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_earned?: number;
          total_spent?: number;
          current_balance?: number;
          level?: number;
          level_name?: string;
          next_level_at?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      legacy_levels: {
        Row: {
          id: number;
          level_name: string;
          min_points: number;
          icon: string;
          color: string;
          perks: string[] | null;
        };
        Insert: {
          id?: number;
          level_name: string;
          min_points: number;
          icon: string;
          color: string;
          perks?: string[] | null;
        };
        Update: {
          id?: number;
          level_name?: string;
          min_points?: number;
          icon?: string;
          color?: string;
          perks?: string[] | null;
        };
        Relationships: [];
      };
      point_redemptions: {
        Row: {
          id: string;
          user_id: string;
          points_spent: number;
          redemption_type: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points_spent: number;
          redemption_type: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points_spent?: number;
          redemption_type?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      trust_levels: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          can_create_memorial: boolean;
          can_fundraise: boolean;
          can_claim_memorial: boolean;
          can_moderate: boolean;
          max_fundraise_amount_cents: number;
          verification_required: boolean;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          can_create_memorial?: boolean;
          can_fundraise?: boolean;
          can_claim_memorial?: boolean;
          can_moderate?: boolean;
          max_fundraise_amount_cents?: number;
          verification_required?: boolean;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          can_create_memorial?: boolean;
          can_fundraise?: boolean;
          can_claim_memorial?: boolean;
          can_moderate?: boolean;
          max_fundraise_amount_cents?: number;
          verification_required?: boolean;
        };
        Relationships: [];
      };
      memorial_claims: {
        Row: {
          id: string;
          memorial_id: string;
          claimer_id: string;
          relationship: string;
          evidence_type: string | null;
          evidence_url: string | null;
          evidence_note: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          claimer_id: string;
          relationship: string;
          evidence_type?: string | null;
          evidence_url?: string | null;
          evidence_note?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          memorial_id?: string;
          claimer_id?: string;
          relationship?: string;
          evidence_type?: string | null;
          evidence_url?: string | null;
          evidence_note?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memorial_managers: {
        Row: {
          id: string;
          memorial_id: string;
          user_id: string;
          role: string;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          user_id: string;
          role: string;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          memorial_id?: string;
          user_id?: string;
          role?: string;
          granted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      duplicate_reports: {
        Row: {
          id: string;
          reporter_id: string;
          memorial_id_a: string;
          memorial_id_b: string;
          status: string;
          merged_into_id: string | null;
          notes: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          memorial_id_a: string;
          memorial_id_b: string;
          status?: string;
          merged_into_id?: string | null;
          notes?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          memorial_id_a?: string;
          memorial_id_b?: string;
          status?: string;
          merged_into_id?: string | null;
          notes?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fundraise_campaigns_v2: {
        Row: {
          id: string;
          memorial_id: string;
          creator_id: string;
          title: string;
          description: string | null;
          goal_cents: number;
          raised_cents: number;
          donor_count: number;
          beneficiary_name: string | null;
          beneficiary_relation: string | null;
          is_verified: boolean;
          trust_level: number;
          platform_fee_pct: number;
          status: string;
          expires_at: string | null;
          payout_method: string | null;
          payout_details: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          creator_id: string;
          title: string;
          description?: string | null;
          goal_cents: number;
          raised_cents?: number;
          donor_count?: number;
          beneficiary_name?: string | null;
          beneficiary_relation?: string | null;
          is_verified?: boolean;
          trust_level?: number;
          platform_fee_pct?: number;
          status?: string;
          expires_at?: string | null;
          payout_method?: string | null;
          payout_details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          memorial_id?: string;
          creator_id?: string;
          title?: string;
          description?: string | null;
          goal_cents?: number;
          raised_cents?: number;
          donor_count?: number;
          beneficiary_name?: string | null;
          beneficiary_relation?: string | null;
          is_verified?: boolean;
          trust_level?: number;
          platform_fee_pct?: number;
          status?: string;
          expires_at?: string | null;
          payout_method?: string | null;
          payout_details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      import_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_type: string;
          target_type: string;
          target_id: string | null;
          status: string;
          total_items: number;
          imported_items: number;
          failed_items: number;
          error_log: Json | null;
          source_metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_type: string;
          target_type: string;
          target_id?: string | null;
          status?: string;
          total_items?: number;
          imported_items?: number;
          failed_items?: number;
          error_log?: Json | null;
          source_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_type?: string;
          target_type?: string;
          target_id?: string | null;
          status?: string;
          total_items?: number;
          imported_items?: number;
          failed_items?: number;
          error_log?: Json | null;
          source_metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      import_items: {
        Row: {
          id: string;
          import_job_id: string;
          source_url: string | null;
          source_id: string | null;
          content_type: string;
          content: string | null;
          media_url: string | null;
          metadata: Json | null;
          status: string;
          target_item_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          import_job_id: string;
          source_url?: string | null;
          source_id?: string | null;
          content_type: string;
          content?: string | null;
          media_url?: string | null;
          metadata?: Json | null;
          status?: string;
          target_item_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          import_job_id?: string;
          source_url?: string | null;
          source_id?: string | null;
          content_type?: string;
          content?: string | null;
          media_url?: string | null;
          metadata?: Json | null;
          status?: string;
          target_item_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      connected_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          platform_user_id: string | null;
          access_token_encrypted: string | null;
          refresh_token_encrypted: string | null;
          token_expires_at: string | null;
          display_name: string | null;
          avatar_url: string | null;
          is_active: boolean;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          platform_user_id?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          platform_user_id?: string | null;
          access_token_encrypted?: string | null;
          refresh_token_encrypted?: string | null;
          token_expires_at?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      directory_import_batches: {
        Row: {
          id: string;
          source: string;
          category: string;
          region: string | null;
          total_listings: number;
          imported_count: number;
          status: string;
          imported_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source: string;
          category: string;
          region?: string | null;
          total_listings?: number;
          imported_count?: number;
          status?: string;
          imported_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source?: string;
          category?: string;
          region?: string | null;
          total_listings?: number;
          imported_count?: number;
          status?: string;
          imported_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      celebrity_memorial_requests: {
        Row: {
          id: string;
          requested_by: string;
          celebrity_name: string;
          wikipedia_url: string | null;
          known_for: string | null;
          date_of_birth: string | null;
          date_of_death: string | null;
          status: string;
          memorial_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          requested_by: string;
          celebrity_name: string;
          wikipedia_url?: string | null;
          known_for?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          status?: string;
          memorial_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          requested_by?: string;
          celebrity_name?: string;
          wikipedia_url?: string | null;
          known_for?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          status?: string;
          memorial_id?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      lifecycle_stages: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          icon: string;
          color: string;
          features: string[] | null;
          sort_order: number | null;
        };
        Insert: {
          id: number;
          name: string;
          description?: string | null;
          icon: string;
          color: string;
          features?: string[] | null;
          sort_order?: number | null;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          features?: string[] | null;
          sort_order?: number | null;
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
