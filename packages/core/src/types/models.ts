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

// Marketplace types
export type MarketplaceCategory = Database["public"]["Tables"]["marketplace_categories"]["Row"];
export type MarketplaceListing = Database["public"]["Tables"]["marketplace_listings"]["Row"];
export type MarketplaceListingInsert = Database["public"]["Tables"]["marketplace_listings"]["Insert"];
export type ListingInquiry = Database["public"]["Tables"]["listing_inquiries"]["Row"];
export type ListingInquiryInsert = Database["public"]["Tables"]["listing_inquiries"]["Insert"];
export type InquiryMessage = Database["public"]["Tables"]["inquiry_messages"]["Row"];
export type SavedListing = Database["public"]["Tables"]["saved_listings"]["Row"];
export type SellerProfile = Database["public"]["Tables"]["seller_profiles"]["Row"];
export type SellerProfileInsert = Database["public"]["Tables"]["seller_profiles"]["Insert"];
export type SellerReview = Database["public"]["Tables"]["seller_reviews"]["Row"];

export type ListingType = "product" | "service";
export type ListingCondition = "new" | "like_new" | "good" | "fair";
export type ListingStatus = "draft" | "active" | "sold" | "paused" | "removed";
export type BusinessType = "individual" | "business" | "nonprofit";

export type ListingWithSeller = MarketplaceListing & {
  seller: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  category: Pick<MarketplaceCategory, "id" | "name" | "slug" | "icon_name">;
};

export type SellerProfileWithUser = SellerProfile & {
  user: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

// Directory types
export type DirectoryListing = Database["public"]["Tables"]["directory_listings"]["Row"];
export type DirectoryListingInsert = Database["public"]["Tables"]["directory_listings"]["Insert"];
export type DirectoryReview = Database["public"]["Tables"]["directory_reviews"]["Row"];
export type DirectoryReviewInsert = Database["public"]["Tables"]["directory_reviews"]["Insert"];
export type DirectoryLead = Database["public"]["Tables"]["directory_leads"]["Row"];
export type DirectoryLeadInsert = Database["public"]["Tables"]["directory_leads"]["Insert"];

export type DirectoryBusinessType =
  | "funeral_home" | "cemetery" | "crematorium" | "florist" | "catering"
  | "monument_maker" | "grief_counselor" | "estate_planner" | "transport"
  | "cleaning_service" | "photographer" | "musician" | "celebrant" | "other";

export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type LeadStatus = "new" | "contacted" | "quoted" | "booked" | "completed" | "cancelled";

// Memory Vault types
export type MemoryVaultItem = Database["public"]["Tables"]["memory_vault_items"]["Row"];
export type MemoryVaultItemInsert = Database["public"]["Tables"]["memory_vault_items"]["Insert"];
export type TimeCapsule = Database["public"]["Tables"]["time_capsules"]["Row"];
export type TimeCapsuleInsert = Database["public"]["Tables"]["time_capsules"]["Insert"];
export type LegacyLetter = Database["public"]["Tables"]["legacy_letters"]["Row"];
export type LegacyLetterInsert = Database["public"]["Tables"]["legacy_letters"]["Insert"];
export type ScrapbookPage = Database["public"]["Tables"]["scrapbook_pages"]["Row"];
export type ScrapbookPageInsert = Database["public"]["Tables"]["scrapbook_pages"]["Insert"];
export type MemorialQRCode = Database["public"]["Tables"]["memorial_qr_codes"]["Row"];
export type MemorialQRCodeInsert = Database["public"]["Tables"]["memorial_qr_codes"]["Insert"];

export type VaultItemType = "document" | "recipe" | "letter" | "audio_playlist" | "quote" | "photo_album" | "video" | "other";
export type TimeCapsuleStatus = "locked" | "unlocked";

// Family Tree types
export type FamilyTree = Database["public"]["Tables"]["family_trees"]["Row"];
export type FamilyTreeInsert = Database["public"]["Tables"]["family_trees"]["Insert"];
export type FamilyTreeMember = Database["public"]["Tables"]["family_tree_members"]["Row"];
export type FamilyTreeMemberInsert = Database["public"]["Tables"]["family_tree_members"]["Insert"];
export type FamilyTreeConnection = Database["public"]["Tables"]["family_tree_connections"]["Row"];
export type FamilyTreeConnectionInsert = Database["public"]["Tables"]["family_tree_connections"]["Insert"];
export type MemoryPrompt = Database["public"]["Tables"]["memory_prompts"]["Row"];
export type MemoryPromptInsert = Database["public"]["Tables"]["memory_prompts"]["Insert"];
export type MemoryPromptResponse = Database["public"]["Tables"]["memory_prompt_responses"]["Row"];

export type RelationshipType =
  | "parent" | "child" | "spouse" | "sibling" | "grandparent" | "grandchild"
  | "aunt_uncle" | "niece_nephew" | "cousin" | "in_law" | "step_parent"
  | "step_child" | "step_sibling" | "adopted" | "guardian" | "other";

export type PromptType = "remember_when" | "on_this_day" | "seasonal" | "milestone" | "random" | "custom";

// Virtual Space types
export type VirtualSpace = Database["public"]["Tables"]["virtual_spaces"]["Row"];
export type VirtualSpaceInsert = Database["public"]["Tables"]["virtual_spaces"]["Insert"];
export type VirtualSpaceItem = Database["public"]["Tables"]["virtual_space_items"]["Row"];
export type VirtualSpaceItemInsert = Database["public"]["Tables"]["virtual_space_items"]["Insert"];
export type MemoryStreak = Database["public"]["Tables"]["memory_streaks"]["Row"];
export type SeasonalDecoration = Database["public"]["Tables"]["seasonal_decorations"]["Row"];
export type AppliedDecoration = Database["public"]["Tables"]["applied_decorations"]["Row"];

export type SpaceType = "memorial_room" | "garden" | "chapel" | "gravesite" | "beach" | "forest" | "custom";
export type VirtualItemType =
  | "candle" | "flower" | "photo" | "wreath" | "plant" | "teddy_bear"
  | "cross" | "star_of_david" | "crescent" | "dove" | "butterfly"
  | "custom_3d" | "text_plaque" | "audio_clip" | "video_frame";
export type DecorationType =
  | "christmas" | "easter" | "valentines" | "mothers_day" | "fathers_day"
  | "memorial_day" | "veterans_day" | "halloween" | "thanksgiving"
  | "new_year" | "birthday" | "anniversary" | "custom";

// Celebrity Content types
export type CelebrityMemorial = Database["public"]["Tables"]["celebrity_memorials"]["Row"];
export type CelebrityMemorialInsert = Database["public"]["Tables"]["celebrity_memorials"]["Insert"];
export type NewsItem = Database["public"]["Tables"]["news_items"]["Row"];
export type NewsItemInsert = Database["public"]["Tables"]["news_items"]["Insert"];

export type CelebrityCategory = "recent_death" | "anniversary" | "historical" | "featured";
export type NewsCategory = "obituary" | "anniversary" | "memorial_news" | "platform_update" | "general";
