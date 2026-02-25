import type { Database } from "../supabase/types";

// Convenience type aliases
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Memorial = Database["public"]["Tables"]["memorials"]["Row"];
export type MemorialInsert = Database["public"]["Tables"]["memorials"]["Insert"];
export type MemorialUpdate = Database["public"]["Tables"]["memorials"]["Update"];

export type MemorialHost = Database["public"]["Tables"]["memorial_hosts"]["Row"];
export type Follower = Database["public"]["Tables"]["followers"]["Row"];
export type Media = Database["public"]["Tables"]["media"]["Row"];

export type Tribute = Database["public"]["Tables"]["tributes"]["Row"];
export type TributeInsert = Database["public"]["Tables"]["tributes"]["Insert"];

export type TributeComment = Database["public"]["Tables"]["tribute_comments"]["Row"];
export type Reaction = Database["public"]["Tables"]["reactions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export type AIGeneration = Database["public"]["Tables"]["ai_generations"]["Row"];
export type AIGenerationInsert = Database["public"]["Tables"]["ai_generations"]["Insert"];

export type AIGenerationType = "obituary" | "biography" | "tribute" | "comment" | "moderation";
export type AIObituaryStyle = "formal" | "warm" | "celebratory";
export type AIBiographyStyle = "chronological" | "thematic";

// Joined types for UI
export type TributeWithAuthor = Tribute & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type MemorialWithHost = Memorial & {
  host: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type CommentWithAuthor = TributeComment & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

// Chat types
export type ChatRoom = Database["public"]["Tables"]["chat_rooms"]["Row"];
export type ChatRoomInsert = Database["public"]["Tables"]["chat_rooms"]["Insert"];
export type ChatMember = Database["public"]["Tables"]["chat_members"]["Row"];
export type ChatMemberInsert = Database["public"]["Tables"]["chat_members"]["Insert"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export type MessageType = "text" | "image" | "voice" | "system" | "poll";
export type ChatRoomType = "memorial" | "direct";

export type MessageWithSender = Message & {
  sender: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  reply_to?: Pick<Message, "id" | "content" | "sender_id"> | null;
};

export type ChatRoomWithDetails = ChatRoom & {
  members: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">[];
  unread_count: number;
};

// Event types
export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventRsvp = Database["public"]["Tables"]["event_rsvps"]["Row"];
export type EventRsvpInsert = Database["public"]["Tables"]["event_rsvps"]["Insert"];
export type ImportantDate = Database["public"]["Tables"]["important_dates"]["Row"];

export type EventType = "ceremony" | "celebration" | "gathering" | "vigil" | "anniversary" | "birthday" | "fundraiser" | "other";
export type RsvpStatus = "going" | "maybe" | "not_going";

// Donation & Ribbon types
export type FundraisingCampaign = Database["public"]["Tables"]["fundraising_campaigns"]["Row"];
export type CampaignInsert = Database["public"]["Tables"]["fundraising_campaigns"]["Insert"];
export type Donation = Database["public"]["Tables"]["donations"]["Row"];
export type DonationInsert = Database["public"]["Tables"]["donations"]["Insert"];
export type RibbonPackage = Database["public"]["Tables"]["ribbon_packages"]["Row"];
export type DailyReward = Database["public"]["Tables"]["daily_rewards"]["Row"];
export type GiftCatalogItem = Database["public"]["Tables"]["gift_catalog"]["Row"];

export type BeneficiaryType = "charity" | "family" | "funeral_costs" | "scholarship" | "other";
