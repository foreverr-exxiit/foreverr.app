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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
