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

// Hooks — Marketplace
export {
  useMarketplaceCategories,
  useListings,
  useListing,
  useMyListings,
  useCreateListing,
  useUpdateListing,
  useToggleSavedListing,
  useSavedListings,
  useCreateInquiry,
  useInquiries,
  useSellerProfile,
  useUpsertSellerProfile,
  useSellerReviews,
  useCreateReview,
} from "./hooks/useMarketplace";

// Hooks — Directory
export {
  useDirectoryListings,
  useDirectoryListing,
  useCreateDirectoryListing,
  useDirectoryReviews,
  useCreateDirectoryReview,
  useCreateDirectoryLead,
  useDirectoryLeads,
} from "./hooks/useDirectory";

// Hooks — NFT
export {
  useNFTGallery,
  useNFT,
  useMyNFTs,
  useMintNFT,
  useListNFT,
  usePurchaseNFT,
  useNFTTransactions,
} from "./hooks/useNFT";

// Hooks — Live Rooms
export {
  useLiveRooms,
  useLiveRoom,
  useLiveRoomParticipants,
  useCreateLiveRoom,
  useJoinLiveRoom,
  useLeaveLiveRoom,
  useToggleHand,
  useEndLiveRoom,
  useLiveRoomRealtime,
} from "./hooks/useLiveRooms";

// Hooks — Advanced AI
export {
  useGenerateVoice,
  usePhotoRestore,
  useGenerateMemorialVideo,
} from "./hooks/useAdvancedAI";

// Hooks — Memory Vault
export {
  useMemoryVaultItems,
  useCreateVaultItem,
  useDeleteVaultItem,
  useTimeCapsules,
  useCreateTimeCapsule,
  useMyLegacyLetters,
  useReceivedLetters,
  useCreateLegacyLetter,
  useMarkLetterRead,
  useScrapbookPages,
  useCreateScrapbookPage,
  useUpdateScrapbookPage,
  useMemorialQRCodes,
  useCreateQRCode,
  useQRCodeLookup,
} from "./hooks/useMemoryVault";

// Hooks — Family Tree
export {
  useMyFamilyTrees,
  useFamilyTree,
  useCreateFamilyTree,
  useUpdateFamilyTree,
  useFamilyTreeMembers,
  useAddTreeMember,
  useUpdateTreeMember,
  useRemoveTreeMember,
  useFamilyTreeConnections,
  useAddTreeConnection,
  useRemoveTreeConnection,
  useMemoryPrompts,
  useCreateMemoryPrompt,
  usePromptResponses,
  useRespondToPrompt,
} from "./hooks/useFamilyTree";

// Hooks — Virtual Spaces
export {
  useVirtualSpaces,
  useVirtualSpace,
  useCreateVirtualSpace,
  useUpdateVirtualSpace,
  useVirtualSpaceItems,
  usePlaceSpaceItem,
  useRemoveSpaceItem,
  useMyMemoryStreaks,
  useRecordStreakActivity,
  useSeasonalDecorations,
  useAppliedDecorations,
  useApplyDecoration,
} from "./hooks/useVirtualSpaces";

// Hooks — Vault Organization
export {
  useVaultFolders,
  useCreateVaultFolder,
  useDeleteVaultFolder,
  useAssignItemToFolder,
  useRemoveItemFromFolder,
  useVaultItemTags,
  useTagVaultItem,
  useUntagVaultItem,
  useSearchVaultItems,
  useVaultStats,
} from "./hooks/useVaultOrganization";

// Hooks — Scrapbook Elements
export {
  useScrapbookElements,
  useAddScrapbookElement,
  useUpdateScrapbookElement,
  useDeleteScrapbookElement,
} from "./hooks/useScrapbookElements";

// Hooks — Prompt Categories
export {
  usePromptCategories,
  usePromptsByCategory,
  useAISuggestedPrompts,
} from "./hooks/usePromptCategories";

// Hooks — Guest & Auth Gating
export { useRequireAuth } from "./hooks/useRequireAuth";

// Hooks — Profile Stats
export { useProfileStats } from "./hooks/useProfileStats";

// Hooks — Celebrity Content & News
export {
  useRecentObituaries,
  useTodayInHistory,
  useFeaturedCelebrities,
  useCelebrityMemorials,
  useNewsFeed,
  useFeaturedNews,
} from "./hooks/useCelebrityContent";

// Hooks — User Follows
export {
  useUserFollowers,
  useUserFollowing,
  useIsFollowingUser,
  useToggleUserFollow,
  useSuggestedUsers,
  useActiveContributors,
} from "./hooks/useUserFollows";

// Hooks — Activity Feed
export {
  useActivityFeed,
  useUserActivities,
  useLogActivity,
} from "./hooks/useActivityFeed";

// Hooks — User Badges
export {
  useUserBadges,
  useBadgeDefinitions,
  useCheckAndAwardBadges,
  useToggleBadgeDisplay,
} from "./hooks/useUserBadges";

// Hooks — Mentions
export {
  useMyMentions,
  useCreateMention,
  useMarkMentionRead,
  parseMentions,
} from "./hooks/useMentions";

// Hooks — Public Profile
export { usePublicProfile } from "./hooks/usePublicProfile";

// Hooks — Trending Tributes
export { useTrendingTributes } from "./hooks/useTrendingTributes";

// Hooks — Sharing & Legacy Links
export {
  useGenerateShareCard,
  useShareContent,
  useShareToStory,
  useLegacyLink,
  useCreateLegacyLink,
  useShareAnalytics,
} from "./hooks/useSharing";

// Hooks — Living Tributes
export {
  useLivingTributes,
  useLivingTribute,
  useMyLivingTributes,
  useHonoredTributes,
  useCreateLivingTribute,
  useUpdateLivingTribute,
  useLivingTributeMessages,
  useAddLivingTributeMessage,
  useInviteToContribute,
  useTributeInvites,
  useConvertToMemorial,
} from "./hooks/useLivingTributes";

// Hooks — Daily Prompts
export {
  useTodayPrompt,
  useDailyPrompts as useDailyPromptList,
  usePromptResponsesList,
  useMyPromptHistory,
  useRespondToPromptDaily,
  usePromptFeed,
} from "./hooks/useDailyPrompts";

// Hooks — Smart Reminders
export {
  useMyReminders,
  useUpcomingReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
  useToggleReminder,
} from "./hooks/useSmartReminders";

// Hooks — Engagement Streak
export {
  useMyEngagementStreak,
  useRecordEngagement,
} from "./hooks/useEngagementStreak";

// Hooks — Appreciation Letters
export {
  useMyAppreciationLetters,
  useReceivedAppreciationLetters,
  useCreateAppreciationLetter,
  useMarkAppreciationLetterRead,
} from "./hooks/useAppreciationLetters";

// Hooks — Invites & Viral Growth
export {
  useCreateInviteLink,
  useMyInviteLinks,
  useInviteLinkByCode,
  useRecordConversion,
  useInviteAnalytics,
} from "./hooks/useInvites";

// Hooks — Campaigns
export {
  useActiveCampaigns,
  useCampaign,
  useUpcomingCampaigns,
} from "./hooks/useCampaigns";

// Hooks — Share Card Templates
export {
  useShareCardTemplates,
  useGenerateShareImage,
} from "./hooks/useShareCards";

// Hooks — Legacy Profile
export {
  useLegacyProfile,
  useUpdateLegacyProfile,
  useUserShareStats,
  useLegacyProfileBySlug,
} from "./hooks/useLegacyProfile";

// Hooks — Convert Tribute
export { useConvertLivingTributeToMemorial } from "./hooks/useConvertTribute";

// Hooks — Gift Economy
export {
  useGiftCatalogItems,
  useSendGiftTransaction,
  useGiftsReceived,
  useGiftsSent,
  useFlowerWall,
  useReactToGift,
  useGiftLeaderboard,
} from "./hooks/useGiftEconomy";

// Hooks — Legacy Points
export {
  useMyPointBalance,
  usePointHistory,
  useAwardPoints,
  useLegacyLevels,
  useRedeemPoints,
  usePointLeaderboard,
} from "./hooks/useLegacyPoints";

// Hooks — Content Import
export {
  useMyImportJobs,
  useImportJob,
  useImportJobItems,
  useStartImport,
  useCancelImport,
  useRetryFailedItems,
  useConnectedAccounts,
  useConnectAccount,
  useDisconnectAccount,
} from "./hooks/useContentImport";

// Hooks — GEDCOM Import
export {
  useParseGedcom,
  useImportGedcomToTree,
} from "./hooks/useGedcomImport";
export type { GedcomIndividual, GedcomFamily, GedcomParseResult } from "./hooks/useGedcomImport";

// Stores
export { useAuthStore } from "./stores/authStore";
export { useUIStore } from "./stores/uiStore";
export { useWizardStore } from "./stores/wizardStore";
export { useChatStore } from "./stores/chatStore";
export { useGuestStore } from "./stores/guestStore";
export { useSocialStore } from "./stores/socialStore";
export { useLivingTributeWizardStore } from "./stores/livingTributeWizardStore";

// Schemas
export { loginSchema, registerSchema, forgotPasswordSchema } from "./schemas/auth";
export { memorialStep1Schema, memorialStep2Schema, memorialStep3Schema } from "./schemas/memorial";

// Utilities — Haptics
export {
  lightTap,
  mediumTap,
  heavyTap,
  successHaptic,
  warningHaptic,
  errorHaptic,
  selectionTick,
} from "./utils/haptics";

// Services — Push Notifications
export {
  registerForPushNotifications,
  savePushToken,
  parseNotificationRoute,
  getRouteUrl,
  setupNotificationListeners,
  setBadgeCount,
  clearBadgeCount,
} from "./services/pushNotifications";
export type { NotificationRoute } from "./services/pushNotifications";

// Hooks — Trust System
export {
  useMyTrustLevel,
  useSubmitClaim,
  useMemorialClaims,
  useMemorialManagers,
  useAddManager,
  useRemoveManager,
  useCanFundraise,
} from "./hooks/useTrustSystem";

// Hooks — Duplicate Reports
export {
  useReportDuplicate,
  usePotentialDuplicates,
  useMyDuplicateReports,
} from "./hooks/useDuplicates";

// Hooks — Fundraising V2
export {
  useCreateFundraiser,
  useMyFundraisers,
  useFundraiserDetails,
  useDonateToFundraiser,
} from "./hooks/useFundraisingV2";

// Hooks — App Tone & Polish
export {
  useWarmGreeting,
  useContextualCTA,
  useCelebrationMoment,
} from "./hooks/useAppTone";

// Hooks — Directory Import
export {
  useDirectoryImportBatches,
  useStartDirectoryImport,
  useDirectoryByRegion,
} from "./hooks/useDirectoryImport";

// Hooks — Lifecycle Stages
export {
  useLifecycleStages,
  useLifecycleContent,
  useCelebrityMemorialRequests,
  useRequestCelebrityMemorial,
} from "./hooks/useLifecycleStages";

// Types
export type * from "./types/models";
