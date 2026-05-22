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
          premium_tier: number;
          role: string;
          city: string | null;
          region: string | null;
          country: string | null;
          latitude: number | null;
          longitude: number | null;
          stewardship_score: number;
          is_guardian_subscriber: boolean;
          max_managed_pages: number;
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
          premium_tier?: number;
          role?: string;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          stewardship_score?: number;
          is_guardian_subscriber?: boolean;
          max_managed_pages?: number;
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
          premium_tier?: number;
          role?: string;
          city?: string | null;
          region?: string | null;
          country?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          stewardship_score?: number;
          is_guardian_subscriber?: boolean;
          max_managed_pages?: number;
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
        Relationships: [
          {
            foreignKeyName: "memory_vault_items_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "time_capsules_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "legacy_letters_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "memorial_qr_codes_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "family_trees_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "memory_prompt_responses_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "virtual_spaces_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "virtual_spaces_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "virtual_space_items_placed_by_fkey";
            columns: ["placed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "memory_streaks_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "applied_decorations_decoration_id_fkey";
            columns: ["decoration_id"];
            isOneToOne: false;
            referencedRelation: "seasonal_decorations";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "fundraise_campaigns_v2_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fundraise_campaigns_v2_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
      // ── Migration 00028: Premium Subscriptions ──
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price_cents: number;
          annual_price_cents: number;
          currency: string;
          tier: number;
          features: Json;
          limits: Json;
          badge_icon: string | null;
          badge_color: string | null;
          is_active: boolean;
          sort_order: number;
          store_product_id_monthly: string | null;
          store_product_id_annual: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price_cents?: number;
          annual_price_cents?: number;
          currency?: string;
          tier?: number;
          features?: Json;
          limits?: Json;
          badge_icon?: string | null;
          badge_color?: string | null;
          is_active?: boolean;
          sort_order?: number;
          store_product_id_monthly?: string | null;
          store_product_id_annual?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          price_cents?: number;
          annual_price_cents?: number;
          currency?: string;
          tier?: number;
          features?: Json;
          limits?: Json;
          badge_icon?: string | null;
          badge_color?: string | null;
          is_active?: boolean;
          sort_order?: number;
          store_product_id_monthly?: string | null;
          store_product_id_annual?: string | null;
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: string;
          billing_period: string;
          current_period_start: string;
          current_period_end: string | null;
          trial_start: string | null;
          trial_end: string | null;
          cancel_at_period_end: boolean;
          cancelled_at: string | null;
          provider: string;
          provider_subscription_id: string | null;
          provider_customer_id: string | null;
          points_multiplier: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          status?: string;
          billing_period?: string;
          current_period_start?: string;
          current_period_end?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          provider?: string;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          points_multiplier?: number;
          metadata?: Json;
        };
        Update: {
          user_id?: string;
          plan_id?: string;
          status?: string;
          billing_period?: string;
          current_period_start?: string;
          current_period_end?: string | null;
          trial_start?: string | null;
          trial_end?: string | null;
          cancel_at_period_end?: boolean;
          cancelled_at?: string | null;
          provider?: string;
          provider_subscription_id?: string | null;
          provider_customer_id?: string | null;
          points_multiplier?: number;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      premium_entitlements: {
        Row: {
          id: string;
          plan_id: string;
          feature_key: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          feature_key: string;
          description?: string | null;
        };
        Update: {
          plan_id?: string;
          feature_key?: string;
          description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "premium_entitlements_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "subscription_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      billing_history: {
        Row: {
          id: string;
          user_id: string;
          subscription_id: string | null;
          amount_cents: number;
          currency: string;
          description: string | null;
          status: string;
          provider: string | null;
          provider_payment_id: string | null;
          invoice_url: string | null;
          receipt_url: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subscription_id?: string | null;
          amount_cents: number;
          currency?: string;
          description?: string | null;
          status?: string;
          provider?: string | null;
          provider_payment_id?: string | null;
          invoice_url?: string | null;
          receipt_url?: string | null;
          metadata?: Json;
        };
        Update: {
          user_id?: string;
          subscription_id?: string | null;
          amount_cents?: number;
          currency?: string;
          description?: string | null;
          status?: string;
          provider?: string | null;
          provider_payment_id?: string | null;
          invoice_url?: string | null;
          receipt_url?: string | null;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "billing_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "billing_history_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "user_subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      premium_feature_gates: {
        Row: {
          id: string;
          feature_key: string;
          label: string;
          description: string | null;
          required_tier: number;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          feature_key: string;
          label: string;
          description?: string | null;
          required_tier?: number;
          category?: string;
          is_active?: boolean;
        };
        Update: {
          feature_key?: string;
          label?: string;
          description?: string | null;
          required_tier?: number;
          category?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      // ── Migration 00029: Life Timeline & Photos ──
      life_milestones: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string;
          milestone_type: string;
          title: string;
          description: string | null;
          milestone_date: string | null;
          age_at_milestone: number | null;
          location: string | null;
          photo_url: string | null;
          media_urls: string[];
          is_verified: boolean;
          verified_by: string | null;
          emoji: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          created_by: string;
          milestone_type: string;
          title: string;
          description?: string | null;
          milestone_date?: string | null;
          age_at_milestone?: number | null;
          location?: string | null;
          photo_url?: string | null;
          media_urls?: string[];
          is_verified?: boolean;
          verified_by?: string | null;
          emoji?: string | null;
          sort_order?: number;
        };
        Update: {
          memorial_id?: string;
          created_by?: string;
          milestone_type?: string;
          title?: string;
          description?: string | null;
          milestone_date?: string | null;
          age_at_milestone?: number | null;
          location?: string | null;
          photo_url?: string | null;
          media_urls?: string[];
          is_verified?: boolean;
          verified_by?: string | null;
          emoji?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "life_milestones_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "life_milestones_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      life_timeline_events: {
        Row: {
          id: string;
          memorial_id: string;
          created_by: string | null;
          event_type: string;
          source_type: string | null;
          source_id: string | null;
          title: string;
          description: string | null;
          event_date: string | null;
          event_end_date: string | null;
          location: string | null;
          photo_url: string | null;
          media_urls: string[];
          icon: string;
          color: string;
          is_highlight: boolean;
          is_private: boolean;
          sort_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          created_by?: string | null;
          event_type: string;
          source_type?: string | null;
          source_id?: string | null;
          title: string;
          description?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          location?: string | null;
          photo_url?: string | null;
          media_urls?: string[];
          icon?: string;
          color?: string;
          is_highlight?: boolean;
          is_private?: boolean;
          sort_date?: string | null;
        };
        Update: {
          memorial_id?: string;
          created_by?: string | null;
          event_type?: string;
          source_type?: string | null;
          source_id?: string | null;
          title?: string;
          description?: string | null;
          event_date?: string | null;
          event_end_date?: string | null;
          location?: string | null;
          photo_url?: string | null;
          media_urls?: string[];
          icon?: string;
          color?: string;
          is_highlight?: boolean;
          is_private?: boolean;
          sort_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "life_timeline_events_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
      };
      milestone_templates: {
        Row: {
          id: number;
          milestone_type: string;
          label: string;
          emoji: string;
          category: string;
          typical_age_range: string | null;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id?: number;
          milestone_type: string;
          label: string;
          emoji: string;
          category: string;
          typical_age_range?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          milestone_type?: string;
          label?: string;
          emoji?: string;
          category?: string;
          typical_age_range?: string | null;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      photo_face_tags: {
        Row: {
          id: string;
          photo_url: string;
          memorial_id: string | null;
          tagged_memorial_id: string | null;
          tagged_profile_id: string | null;
          tagged_name: string | null;
          face_x: number | null;
          face_y: number | null;
          face_width: number | null;
          face_height: number | null;
          confidence: number | null;
          is_verified: boolean;
          is_auto_detected: boolean;
          tagged_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          photo_url: string;
          memorial_id?: string | null;
          tagged_memorial_id?: string | null;
          tagged_profile_id?: string | null;
          tagged_name?: string | null;
          face_x?: number | null;
          face_y?: number | null;
          face_width?: number | null;
          face_height?: number | null;
          confidence?: number | null;
          is_verified?: boolean;
          is_auto_detected?: boolean;
          tagged_by?: string | null;
        };
        Update: {
          photo_url?: string;
          memorial_id?: string | null;
          tagged_memorial_id?: string | null;
          tagged_profile_id?: string | null;
          tagged_name?: string | null;
          face_x?: number | null;
          face_y?: number | null;
          face_width?: number | null;
          face_height?: number | null;
          confidence?: number | null;
          is_verified?: boolean;
          is_auto_detected?: boolean;
          tagged_by?: string | null;
        };
        Relationships: [];
      };
      face_embeddings: {
        Row: {
          id: string;
          memorial_id: string | null;
          profile_id: string | null;
          source_photo_url: string;
          embedding: Json;
          embedding_model: string;
          quality_score: number;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          memorial_id?: string | null;
          profile_id?: string | null;
          source_photo_url: string;
          embedding: Json;
          embedding_model?: string;
          quality_score?: number;
          is_primary?: boolean;
        };
        Update: {
          memorial_id?: string | null;
          profile_id?: string | null;
          source_photo_url?: string;
          embedding?: Json;
          embedding_model?: string;
          quality_score?: number;
          is_primary?: boolean;
        };
        Relationships: [];
      };
      auto_reminder_rules: {
        Row: {
          id: string;
          user_id: string;
          memorial_id: string | null;
          rule_type: string;
          title_template: string;
          days_before: number;
          is_recurring: boolean;
          is_enabled: boolean;
          recurring_month: number | null;
          recurring_day: number | null;
          last_triggered_at: string | null;
          next_trigger_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          memorial_id?: string | null;
          rule_type: string;
          title_template: string;
          days_before?: number;
          is_recurring?: boolean;
          is_enabled?: boolean;
          recurring_month?: number | null;
          recurring_day?: number | null;
          last_triggered_at?: string | null;
          next_trigger_date?: string | null;
        };
        Update: {
          user_id?: string;
          memorial_id?: string | null;
          rule_type?: string;
          title_template?: string;
          days_before?: number;
          is_recurring?: boolean;
          is_enabled?: boolean;
          recurring_month?: number | null;
          recurring_day?: number | null;
          last_triggered_at?: string | null;
          next_trigger_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "auto_reminder_rules_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration 00040: Creator Economy ──
      creator_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          tagline: string;
          bio: string;
          avatar_url: string | null;
          cover_image_url: string | null;
          portfolio_urls: string[];
          specialties: string[];
          tier: string;
          tier_points: number;
          total_earned_cents: number;
          pending_balance_cents: number;
          lifetime_orders: number;
          stripe_connect_id: string | null;
          stripe_onboarding_complete: boolean;
          is_verified: boolean;
          is_accepting_orders: boolean;
          application_status: string;
          rating_avg: number;
          rating_count: number;
          response_time_hours: number;
          completion_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          display_name?: string;
          tagline?: string;
          bio?: string;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          portfolio_urls?: string[];
          specialties?: string[];
          tier?: string;
          tier_points?: number;
          total_earned_cents?: number;
          pending_balance_cents?: number;
          lifetime_orders?: number;
          stripe_connect_id?: string | null;
          stripe_onboarding_complete?: boolean;
          is_verified?: boolean;
          is_accepting_orders?: boolean;
          application_status?: string;
          rating_avg?: number;
          rating_count?: number;
          response_time_hours?: number;
          completion_rate?: number;
        };
        Update: {
          display_name?: string;
          tagline?: string;
          bio?: string;
          avatar_url?: string | null;
          cover_image_url?: string | null;
          portfolio_urls?: string[];
          specialties?: string[];
          tier?: string;
          tier_points?: number;
          total_earned_cents?: number;
          pending_balance_cents?: number;
          lifetime_orders?: number;
          stripe_connect_id?: string | null;
          stripe_onboarding_complete?: boolean;
          is_verified?: boolean;
          is_accepting_orders?: boolean;
          application_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      creator_tiers: {
        Row: {
          id: string;
          name: string;
          min_points: number;
          icon: string;
          color: string;
          platform_fee_pct: number;
          perks: string[];
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          min_points?: number;
          icon?: string;
          color?: string;
          platform_fee_pct?: number;
          perks?: string[];
          sort_order?: number;
        };
        Update: {
          name?: string;
          min_points?: number;
          icon?: string;
          color?: string;
          platform_fee_pct?: number;
          perks?: string[];
          sort_order?: number;
        };
        Relationships: [];
      };
      service_listings: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          pricing_type: string;
          price_cents: number;
          packages: Json;
          cover_image_url: string | null;
          sample_images: string[];
          delivery_days: number;
          max_revisions: number;
          is_active: boolean;
          is_featured: boolean;
          order_count: number;
          rating_avg: number;
          rating_count: number;
          view_count: number;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string;
          category: string;
          pricing_type?: string;
          price_cents?: number;
          packages?: Json;
          cover_image_url?: string | null;
          sample_images?: string[];
          delivery_days?: number;
          max_revisions?: number;
          is_active?: boolean;
          is_featured?: boolean;
          tags?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          pricing_type?: string;
          price_cents?: number;
          packages?: Json;
          cover_image_url?: string | null;
          sample_images?: string[];
          delivery_days?: number;
          max_revisions?: number;
          is_active?: boolean;
          is_featured?: boolean;
          tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "service_listings_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      service_orders: {
        Row: {
          id: string;
          service_id: string;
          creator_id: string;
          buyer_id: string;
          title: string;
          description: string | null;
          package_name: string | null;
          amount_cents: number;
          platform_fee_cents: number;
          creator_payout_cents: number;
          payment_status: string;
          stripe_payment_intent_id: string | null;
          status: string;
          delivery_deadline: string | null;
          delivered_at: string | null;
          completed_at: string | null;
          deliverables: Json;
          messages_count: number;
          buyer_rating: number | null;
          buyer_review: string | null;
          memorial_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          creator_id: string;
          buyer_id: string;
          title: string;
          description?: string | null;
          package_name?: string | null;
          amount_cents: number;
          platform_fee_cents?: number;
          creator_payout_cents?: number;
          payment_status?: string;
          stripe_payment_intent_id?: string | null;
          status?: string;
          delivery_deadline?: string | null;
          deliverables?: Json;
          memorial_id?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          status?: string;
          payment_status?: string;
          delivery_deadline?: string | null;
          delivered_at?: string | null;
          completed_at?: string | null;
          deliverables?: Json;
          buyer_rating?: number | null;
          buyer_review?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_orders_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "service_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      service_order_messages: {
        Row: {
          id: string;
          order_id: string;
          sender_id: string;
          content: string;
          attachments: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender_id: string;
          content: string;
          attachments?: string[];
        };
        Update: {
          content?: string;
          attachments?: string[];
        };
        Relationships: [];
      };
      creator_earnings: {
        Row: {
          id: string;
          creator_id: string;
          type: string;
          amount_cents: number;
          platform_fee_cents: number;
          net_amount_cents: number;
          reference_type: string | null;
          reference_id: string | null;
          description: string;
          status: string;
          clears_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          type: string;
          amount_cents: number;
          platform_fee_cents?: number;
          net_amount_cents: number;
          reference_type?: string | null;
          reference_id?: string | null;
          description?: string;
          status?: string;
          clears_at?: string | null;
        };
        Update: {
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creator_earnings_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      creator_payouts: {
        Row: {
          id: string;
          creator_id: string;
          amount_cents: number;
          currency: string;
          stripe_transfer_id: string | null;
          stripe_payout_id: string | null;
          status: string;
          failure_reason: string | null;
          requested_at: string;
          processed_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          creator_id: string;
          amount_cents: number;
          currency?: string;
          status?: string;
        };
        Update: {
          status?: string;
          stripe_transfer_id?: string | null;
          stripe_payout_id?: string | null;
          failure_reason?: string | null;
          processed_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "creator_payouts_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      honor_fundraisers: {
        Row: {
          id: string;
          creator_id: string | null;
          organizer_id: string;
          honoree_name: string;
          honoree_image_url: string | null;
          memorial_id: string | null;
          title: string;
          description: string;
          story: string;
          cover_image_url: string | null;
          images: string[];
          goal_cents: number;
          raised_cents: number;
          donor_count: number;
          beneficiary_name: string;
          beneficiary_type: string;
          beneficiary_url: string | null;
          organizer_fee_pct: number;
          organizer_earned_cents: number;
          status: string;
          is_featured: boolean;
          end_date: string | null;
          share_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id?: string | null;
          organizer_id: string;
          honoree_name: string;
          honoree_image_url?: string | null;
          memorial_id?: string | null;
          title: string;
          description?: string;
          story?: string;
          cover_image_url?: string | null;
          images?: string[];
          goal_cents?: number;
          beneficiary_name?: string;
          beneficiary_type?: string;
          beneficiary_url?: string | null;
          organizer_fee_pct?: number;
          status?: string;
          end_date?: string | null;
        };
        Update: {
          honoree_name?: string;
          honoree_image_url?: string | null;
          title?: string;
          description?: string;
          story?: string;
          cover_image_url?: string | null;
          images?: string[];
          goal_cents?: number;
          beneficiary_name?: string;
          beneficiary_type?: string;
          beneficiary_url?: string | null;
          organizer_fee_pct?: number;
          status?: string;
          end_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "honor_fundraisers_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      honor_donations: {
        Row: {
          id: string;
          fundraiser_id: string;
          donor_id: string | null;
          amount_cents: number;
          organizer_fee_cents: number;
          platform_fee_cents: number;
          net_to_beneficiary_cents: number;
          stripe_payment_intent_id: string | null;
          payment_status: string;
          donor_name: string;
          message: string;
          is_anonymous: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          fundraiser_id: string;
          donor_id?: string | null;
          amount_cents: number;
          organizer_fee_cents?: number;
          platform_fee_cents?: number;
          net_to_beneficiary_cents: number;
          stripe_payment_intent_id?: string | null;
          payment_status?: string;
          donor_name?: string;
          message?: string;
          is_anonymous?: boolean;
        };
        Update: {
          payment_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "honor_donations_fundraiser_id_fkey";
            columns: ["fundraiser_id"];
            isOneToOne: false;
            referencedRelation: "honor_fundraisers";
            referencedColumns: ["id"];
          }
        ];
      };
      creator_reviews: {
        Row: {
          id: string;
          creator_id: string;
          reviewer_id: string;
          order_id: string | null;
          rating: number;
          review_text: string;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          reviewer_id: string;
          order_id?: string | null;
          rating: number;
          review_text?: string;
          is_featured?: boolean;
        };
        Update: {
          rating?: number;
          review_text?: string;
          is_featured?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "creator_reviews_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creator_reviews_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration 00041: Memorial Templates ──
      memorial_templates: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          category: string;
          price_cents: number;
          is_free: boolean;
          is_published: boolean;
          preview_images: string[];
          template_data: Json;
          tags: string[];
          download_count: number;
          rating_avg: number;
          rating_count: number;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string;
          category?: string;
          price_cents?: number;
          is_free?: boolean;
          is_published?: boolean;
          preview_images?: string[];
          template_data?: Json;
          tags?: string[];
        };
        Update: {
          title?: string;
          description?: string;
          category?: string;
          price_cents?: number;
          is_free?: boolean;
          is_published?: boolean;
          preview_images?: string[];
          template_data?: Json;
          tags?: string[];
          download_count?: number;
          rating_avg?: number;
          rating_count?: number;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "memorial_templates_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "creator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      template_downloads: {
        Row: {
          id: string;
          template_id: string;
          buyer_id: string;
          amount_paid_cents: number;
          payment_status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          buyer_id: string;
          amount_paid_cents?: number;
          payment_status?: string;
        };
        Update: {
          amount_paid_cents?: number;
          payment_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "template_downloads_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "memorial_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      template_reviews: {
        Row: {
          id: string;
          template_id: string;
          reviewer_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          reviewer_id: string;
          rating: number;
          review_text?: string | null;
        };
        Update: {
          rating?: number;
          review_text?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "template_reviews_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "memorial_templates";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration 00030: Email Log ──
      email_log: {
        Row: {
          id: string;
          recipient: string;
          email_type: string;
          subject: string | null;
          status: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient: string;
          email_type: string;
          subject?: string | null;
          status?: string;
          metadata?: Json;
        };
        Update: {
          recipient?: string;
          email_type?: string;
          subject?: string | null;
          status?: string;
          metadata?: Json;
        };
        Relationships: [];
      };
      // ── Migration: Event Tickets ──
      event_tickets: {
        Row: {
          id: string;
          event_id: string;
          buyer_id: string;
          amount_paid_cents: number;
          quantity: number;
          ticket_code: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          buyer_id: string;
          amount_paid_cents?: number;
          quantity?: number;
          ticket_code?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          buyer_id?: string;
          amount_paid_cents?: number;
          quantity?: number;
          ticket_code?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_tickets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration: Honor Day Sponsorships ──
      honor_day_sponsorships: {
        Row: {
          id: string;
          memorial_id: string;
          sponsor_id: string;
          sponsored_date: string;
          amount_cents: number;
          message: string | null;
          sponsor_name: string | null;
          is_anonymous: boolean;
          is_active: boolean;
          display_badge: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          memorial_id: string;
          sponsor_id: string;
          sponsored_date: string;
          amount_cents?: number;
          message?: string | null;
          sponsor_name?: string | null;
          is_anonymous?: boolean;
          is_active?: boolean;
          display_badge?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          memorial_id?: string;
          sponsor_id?: string;
          sponsored_date?: string;
          amount_cents?: number;
          message?: string | null;
          sponsor_name?: string | null;
          is_anonymous?: boolean;
          is_active?: boolean;
          display_badge?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "honor_day_sponsorships_memorial_id_fkey";
            columns: ["memorial_id"];
            isOneToOne: false;
            referencedRelation: "memorials";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration: Vault Preservation Orders ──
      vault_preservation_orders: {
        Row: {
          id: string;
          vault_id: string;
          owner_id: string;
          creator_id: string | null;
          preservation_type: string;
          status: string;
          amount_cents: number;
          items_count: number;
          notes: string | null;
          deliverables: Json;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vault_id: string;
          owner_id: string;
          creator_id?: string | null;
          preservation_type?: string;
          status?: string;
          amount_cents?: number;
          items_count?: number;
          notes?: string | null;
          deliverables?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vault_id?: string;
          owner_id?: string;
          creator_id?: string | null;
          preservation_type?: string;
          status?: string;
          amount_cents?: number;
          items_count?: number;
          notes?: string | null;
          deliverables?: Json;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vault_preservation_orders_vault_id_fkey";
            columns: ["vault_id"];
            isOneToOne: false;
            referencedRelation: "memory_vaults";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration: Content Licenses ──
      content_licenses: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string;
          content_type: string;
          license_type: string;
          price_cents: number;
          preview_url: string | null;
          content_url: string | null;
          tags: string[];
          download_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string;
          content_type?: string;
          license_type?: string;
          price_cents?: number;
          preview_url?: string | null;
          content_url?: string | null;
          tags?: string[];
          download_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string;
          content_type?: string;
          license_type?: string;
          price_cents?: number;
          preview_url?: string | null;
          content_url?: string | null;
          tags?: string[];
          download_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // ── Migration: Content License Purchases ──
      content_license_purchases: {
        Row: {
          id: string;
          license_id: string;
          buyer_id: string;
          amount_paid_cents: number;
          license_type: string;
          granted_at: string;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          license_id: string;
          buyer_id: string;
          amount_paid_cents?: number;
          license_type?: string;
          granted_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          license_id?: string;
          buyer_id?: string;
          amount_paid_cents?: number;
          license_type?: string;
          granted_at?: string;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_license_purchases_license_id_fkey";
            columns: ["license_id"];
            isOneToOne: false;
            referencedRelation: "content_licenses";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration: Channel Subscriptions ──
      channel_subscriptions: {
        Row: {
          id: string;
          channel_id: string;
          subscriber_id: string;
          tier: string;
          amount_cents: number;
          status: string;
          started_at: string;
          expires_at: string | null;
          auto_renew: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          channel_id: string;
          subscriber_id: string;
          tier?: string;
          amount_cents?: number;
          status?: string;
          started_at?: string;
          expires_at?: string | null;
          auto_renew?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          channel_id?: string;
          subscriber_id?: string;
          tier?: string;
          amount_cents?: number;
          status?: string;
          started_at?: string;
          expires_at?: string | null;
          auto_renew?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      // ── Migration: Universal Page Hosts (00035) ──
      page_hosts: {
        Row: {
          id: string;
          page_type: string;
          page_id: string;
          user_id: string;
          role: string;
          relationship: string | null;
          relationship_detail: string | null;
          permissions: Json;
          invited_by: string | null;
          invite_status: string;
          accepted_at: string | null;
          designated_successor_id: string | null;
          successor_trigger: string | null;
          successor_trigger_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_type: string;
          page_id: string;
          user_id: string;
          role?: string;
          relationship?: string | null;
          relationship_detail?: string | null;
          permissions?: Json;
          invited_by?: string | null;
          invite_status?: string;
          accepted_at?: string | null;
          designated_successor_id?: string | null;
          successor_trigger?: string | null;
          successor_trigger_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_type?: string;
          page_id?: string;
          user_id?: string;
          role?: string;
          relationship?: string | null;
          relationship_detail?: string | null;
          permissions?: Json;
          invited_by?: string | null;
          invite_status?: string;
          accepted_at?: string | null;
          designated_successor_id?: string | null;
          successor_trigger?: string | null;
          successor_trigger_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_hosts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_hosts_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_hosts_designated_successor_id_fkey";
            columns: ["designated_successor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── Migration: Page Stewardship (00043) ──
      page_transfers: {
        Row: {
          id: string;
          page_type: string;
          page_id: string;
          transfer_type: string;
          status: string;
          from_user_id: string;
          to_user_id: string;
          initiated_by: string;
          price_cents: number | null;
          platform_fee_cents: number | null;
          net_to_seller_cents: number | null;
          escrow_status: string | null;
          stripe_payment_intent_id: string | null;
          terms: Json | null;
          inheritance_trigger: string | null;
          inheritance_trigger_date: string | null;
          cooling_off_ends_at: string | null;
          valuation_snapshot: Json | null;
          reason: string | null;
          relationship_to_page: string | null;
          admin_notes: string | null;
          message_count: number;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_type: string;
          page_id: string;
          transfer_type: string;
          status?: string;
          from_user_id: string;
          to_user_id: string;
          initiated_by: string;
          price_cents?: number | null;
          platform_fee_cents?: number | null;
          net_to_seller_cents?: number | null;
          escrow_status?: string | null;
          stripe_payment_intent_id?: string | null;
          terms?: Json | null;
          inheritance_trigger?: string | null;
          inheritance_trigger_date?: string | null;
          cooling_off_ends_at?: string | null;
          valuation_snapshot?: Json | null;
          reason?: string | null;
          relationship_to_page?: string | null;
          admin_notes?: string | null;
          message_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_type?: string;
          page_id?: string;
          transfer_type?: string;
          status?: string;
          from_user_id?: string;
          to_user_id?: string;
          initiated_by?: string;
          price_cents?: number | null;
          platform_fee_cents?: number | null;
          net_to_seller_cents?: number | null;
          escrow_status?: string | null;
          stripe_payment_intent_id?: string | null;
          terms?: Json | null;
          inheritance_trigger?: string | null;
          inheritance_trigger_date?: string | null;
          cooling_off_ends_at?: string | null;
          valuation_snapshot?: Json | null;
          reason?: string | null;
          relationship_to_page?: string | null;
          admin_notes?: string | null;
          message_count?: number;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_transfers_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_transfers_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "page_transfers_initiated_by_fkey";
            columns: ["initiated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      transfer_messages: {
        Row: {
          id: string;
          transfer_id: string;
          sender_id: string;
          message_type: string;
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          transfer_id: string;
          sender_id: string;
          message_type?: string;
          content: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          transfer_id?: string;
          sender_id?: string;
          message_type?: string;
          content?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transfer_messages_transfer_id_fkey";
            columns: ["transfer_id"];
            isOneToOne: false;
            referencedRelation: "page_transfers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfer_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      stewardship_scores: {
        Row: {
          id: string;
          user_id: string;
          total_score: number;
          pages_managed: number;
          smooth_transfers: number;
          disputed_transfers: number;
          page_growth_score: number;
          avg_response_hours: number | null;
          tier: string;
          founding_steward_pages: string[];
          last_calculated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_score?: number;
          pages_managed?: number;
          smooth_transfers?: number;
          disputed_transfers?: number;
          page_growth_score?: number;
          avg_response_hours?: number | null;
          tier?: string;
          founding_steward_pages?: string[];
          last_calculated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_score?: number;
          pages_managed?: number;
          smooth_transfers?: number;
          disputed_transfers?: number;
          page_growth_score?: number;
          avg_response_hours?: number | null;
          tier?: string;
          founding_steward_pages?: string[];
          last_calculated_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stewardship_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      page_valuations: {
        Row: {
          id: string;
          page_type: string;
          page_id: string;
          tribute_count: number;
          follower_count: number;
          media_count: number;
          event_count: number;
          gift_count: number;
          page_age_days: number;
          last_activity_days: number;
          content_value_cents: number;
          engagement_value_cents: number;
          age_value_cents: number;
          inactivity_discount_pct: number;
          total_value_cents: number;
          value_tier: string;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          page_type: string;
          page_id: string;
          tribute_count?: number;
          follower_count?: number;
          media_count?: number;
          event_count?: number;
          gift_count?: number;
          page_age_days?: number;
          last_activity_days?: number;
          content_value_cents?: number;
          engagement_value_cents?: number;
          age_value_cents?: number;
          inactivity_discount_pct?: number;
          total_value_cents?: number;
          value_tier?: string;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          page_type?: string;
          page_id?: string;
          tribute_count?: number;
          follower_count?: number;
          media_count?: number;
          event_count?: number;
          gift_count?: number;
          page_age_days?: number;
          last_activity_days?: number;
          content_value_cents?: number;
          engagement_value_cents?: number;
          age_value_cents?: number;
          inactivity_discount_pct?: number;
          total_value_cents?: number;
          value_tier?: string;
          calculated_at?: string;
        };
        Relationships: [];
      };
      transfer_history: {
        Row: {
          id: string;
          page_type: string;
          page_id: string;
          sequence_number: number;
          action: string;
          from_user_id: string | null;
          to_user_id: string | null;
          transfer_id: string | null;
          metadata: Json | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          page_type: string;
          page_id: string;
          sequence_number: number;
          action: string;
          from_user_id?: string | null;
          to_user_id?: string | null;
          transfer_id?: string | null;
          metadata?: Json | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          page_type?: string;
          page_id?: string;
          sequence_number?: number;
          action?: string;
          from_user_id?: string | null;
          to_user_id?: string | null;
          transfer_id?: string | null;
          metadata?: Json | null;
          recorded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transfer_history_from_user_id_fkey";
            columns: ["from_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfer_history_to_user_id_fkey";
            columns: ["to_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transfer_history_transfer_id_fkey";
            columns: ["transfer_id"];
            isOneToOne: false;
            referencedRelation: "page_transfers";
            referencedColumns: ["id"];
          }
        ];
      };
      guardian_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          tier: string;
          amount_cents: number;
          status: string;
          stripe_subscription_id: string | null;
          max_managed_pages: number;
          fee_discount_pct: number;
          started_at: string;
          expires_at: string | null;
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: string;
          amount_cents?: number;
          status?: string;
          stripe_subscription_id?: string | null;
          max_managed_pages?: number;
          fee_discount_pct?: number;
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: string;
          amount_cents?: number;
          status?: string;
          stripe_subscription_id?: string | null;
          max_managed_pages?: number;
          fee_discount_pct?: number;
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "guardian_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_fundraiser_donation: {
        Args: {
          p_fundraiser_id: string;
          p_amount_cents: number;
        };
        Returns: Json;
      };
      search_all: {
        Args: {
          query: string;
          result_limit?: number;
        };
        Returns: {
          id: string;
          result_type: string;
          title: string;
          subtitle: string;
          image_url: string | null;
          rank: number;
        }[];
      };
      calculate_page_valuation: {
        Args: {
          p_page_type: string;
          p_page_id: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
