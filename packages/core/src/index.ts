// Supabase
export { supabase } from "./supabase/client";
export type { Database } from "./supabase/types";

// Hooks — Auth
export { useAuth } from "./hooks/useAuth";

// Hooks — Memorials
export {
  useMemorials,
  useTopMemorials,
  useFollowedMemorials,
  useMemorial,
  useHostedMemorials,
  useIsFollowing,
  useCreateMemorial,
  useToggleFollow,
} from "./hooks/useMemorials";

// Hooks — Tributes & Reactions
export {
  useTributes,
  useHomeFeed,
  useCreateTribute,
  useTributeComments,
  useAddComment,
  useToggleReaction,
} from "./hooks/useTributes";

// Hooks — AI
export {
  useAIGenerations,
  useGenerateObituary,
  useGenerateBiography,
  useGenerateTribute,
  useModerateContent,
} from "./hooks/useAI";

// Hooks — Chat
export {
  useChatRooms,
  useMessages,
  useSendMessage,
  useCreateDM,
  useMarkChatRead,
  useArchiveChat,
  useChatRealtime,
} from "./hooks/useChat";

// Hooks — Events
export {
  useMemorialEvents,
  useMyUpcomingEvents,
  useEvent,
  useCreateEvent,
  useRsvp,
  useEventRsvps,
  useMyRsvp,
  useImportantDates,
} from "./hooks/useEvents";

// Hooks — Donations
export {
  useMemorialCampaigns,
  useCreateCampaign,
  useCampaignDonations,
  useCreateDonation,
} from "./hooks/useDonations";

// Hooks — Ribbons
export {
  useRibbonPackages,
  useGiftCatalog,
  useRibbonHistory,
  useClaimDailyReward,
  useSendGift,
} from "./hooks/useRibbons";

// Hooks — Notifications
export {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
} from "./hooks/useNotifications";

// Stores
export { useAuthStore } from "./stores/authStore";
export { useUIStore } from "./stores/uiStore";
export { useWizardStore } from "./stores/wizardStore";
export { useChatStore } from "./stores/chatStore";

// Schemas
export { loginSchema, registerSchema, forgotPasswordSchema } from "./schemas/auth";
export { memorialStep1Schema, memorialStep2Schema, memorialStep3Schema } from "./schemas/memorial";

// Types
export type * from "./types/models";
