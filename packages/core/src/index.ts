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
  useSoleOwnedMemorialCount,
  useMemorialHosts,
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
  useMemorialReactionCounts,
} from "./hooks/useTributes";

// Hooks — AI
export {
  useAIGenerations,
  useGenerateObituary,
  useGenerateBiography,
  useGenerateTribute,
  useAIRewrite,
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

// Hooks — Live Broadcast (Simple "Go Live" Experience)
export { useLiveBroadcast, broadcastPresets, REACTION_MAP } from "./hooks/useLiveBroadcast";
export type {
  BroadcastConfig,
  BroadcastStatus,
  BroadcastRole,
  LiveReaction,
  LiveChatMessage,
  LiveReactionEvent,
} from "./hooks/useLiveBroadcast";

// Hooks — Advanced AI
export {
  useGenerateVoice,
  usePhotoRestore,
  useGenerateMemorialVideo,
} from "./hooks/useAdvancedAI";

// Hooks — The Core
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

// Hooks — Echoes
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

// Hooks — Sharing & Core Links
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
  useRecordGiftToWall,
  getGiftEmoji,
  GIFT_EMOJI_MAP,
  BUILT_IN_GIFTS,
} from "./hooks/useGiftEconomy";
export type { GiftCatalogItem } from "./hooks/useGiftEconomy";

// Hooks — Core Points
export {
  useMyPointBalance,
  usePointHistory,
  useAwardPoints,
  useLegacyLevels,
  useRedeemPoints,
  usePointLeaderboard,
  useEngagementSummary,
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

// Hooks — Premium & Subscriptions
export {
  usePremium,
  useSubscriptionPlans,
  useMySubscription,
  useFeatureGates,
  useBillingHistory,
  useActivateSubscription,
  useCancelSubscription,
  useRestoreSubscription,
} from "./hooks/usePremium";
export type {
  SubscriptionPlan,
  UserSubscription,
  PremiumFeatureGate,
  BillingEntry,
  PremiumTier,
  PlanSlug,
  PremiumFeatureKey,
} from "./hooks/usePremium";

// Hooks — RevenueCat (Payments)
export { useRevenueCat } from "./hooks/useRevenueCat";

// Hooks — Premium Gating Convenience
export { useRequirePremium } from "./hooks/useRequirePremium";

// Hooks — Life Timeline
export {
  useLifeTimeline,
  useTimelineByYear,
  useCreateTimelineEvent,
  useUpdateTimelineEvent,
  useDeleteTimelineEvent,
  useTimelineStats,
} from "./hooks/useLifeTimeline";
export type {
  TimelineEvent,
  TimelineEventType,
  TimelineSourceType,
} from "./hooks/useLifeTimeline";

// Hooks — Turning Points
export {
  useMilestoneTemplates,
  useMilestonesByCategory,
  useMemorialMilestones,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useMilestoneCompletion,
} from "./hooks/useMilestones";
export type {
  Milestone,
  MilestoneTemplate,
  MilestoneType,
  MilestoneCategory,
} from "./hooks/useMilestones";

// Hooks — Photo Face Tags
export {
  usePhotoFaceTags,
  useMemorialPhotoTags,
  usePhotosOfPerson,
  useCreatePhotoTag,
  useVerifyPhotoTag,
  useDeletePhotoTag,
  useFaceEmbeddings,
  useTagSuggestions,
} from "./hooks/usePhotoTags";
export type {
  PhotoFaceTag,
  FaceEmbedding,
} from "./hooks/usePhotoTags";

// Hooks — Auto Reminders
export {
  useMyAutoReminders,
  useUpcomingAutoReminders,
  useCreateAutoReminder,
  useToggleAutoReminder,
  useDeleteAutoReminder,
  useAutoSetupReminders,
} from "./hooks/useAutoReminders";
export type {
  AutoReminderRule,
  ReminderRuleType,
} from "./hooks/useAutoReminders";

// Hooks — Search
export {
  useGlobalSearch,
  useSearchMemorials,
  useSearchDirectory,
  useSearchUsers,
  useDebounceSearch,
} from "./hooks/useSearch";

// Hooks — Image Upload
export { useImageUpload } from "./hooks/useImageUpload";

// Services — Engagement Points
export {
  awardEngagementPoints,
  POINT_VALUES,
  ACTION_CATEGORIES,
  ACTION_LABELS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
} from "./services/engagement";
export type { EngagementCategory } from "./services/engagement";

// Services — Analytics
export { analytics } from "./services/analytics";

// Services — Error reporting (Sentry wrapper, no-op until DSN provided)
export {
  errorReporting,
  initErrorReporting,
  setUser as setErrorReportingUser,
  captureException,
  captureMessage,
} from "./services/errorReporting";

// Services — Deep Links
export { handleDeepLink, generateDeepLink } from "./services/deepLinks";

// Services — i18n
export {
  t,
  setLocale,
  getLocale,
  getSupportedLocales,
  initI18n,
} from "./services/i18n";
export type { SupportedLocale } from "./services/i18n";

// Services — Offline Cache Persistence
export { persistQueryClient, clearQueryCache } from "./services/queryPersistence";

// Services — Accessibility
export {
  a11y,
  announce,
  useAccessibility,
  useA11yFocus,
  memorialCardLabel,
  tributeLabel,
  timelineEventLabel,
} from "./services/accessibility";

// Hooks — User Location & Proximity
export { useUserLocation } from "./hooks/useUserLocation";
export type { UserLocation } from "./hooks/useUserLocation";
export {
  useNearbyContent,
  flattenNearbyContent,
} from "./hooks/useNearbyContent";
export type {
  NearbyEvent,
  NearbyListing,
  NearbyBusiness,
  NearbyContentResult,
  NearbyItem,
  NearbyItemType,
} from "./hooks/useNearbyContent";

// Services — Real-time Collaboration
export {
  usePresence,
  useRealtimeUpdates,
  useRealtimeTributes,
  useRealtimeGifts,
  useRealtimeNotifications,
  useTypingIndicator,
  useLiveCount,
} from "./services/realtime";
export type { PresenceUser } from "./services/realtime";

// Hooks — Page Hosts (Universal Host System)
export {
  usePageHosts,
  usePagePermissions,
  useAddPageHost,
  useRemovePageHost,
  useUpdatePageHostRole,
  usePageInvitations,
  useMyPendingInvitations,
  useCreatePageInvitation,
  useRespondToInvitation,
} from "./hooks/usePageHosts";
export type {
  PageType,
  HostRole,
  PageHostRelationship,
  PageHost,
  PageInvitation,
} from "./hooks/usePageHosts";

// Hooks — Welcome Journey
export {
  useWelcomeJourney,
  useClaimWelcomeReward,
  useCompleteWelcomeTask,
  useIsNewUser,
} from "./hooks/useWelcomeJourney";
export type {
  WelcomeTask,
  WelcomeJourneyResult,
} from "./hooks/useWelcomeJourney";

// Hooks — Creator Economy
export {
  useMyCreatorProfile,
  useCreatorProfile,
  useCreatorByUserId,
  useUpsertCreatorProfile,
  useCreatorTiers,
  useServiceListings,
  useServiceListing,
  useMyServiceListings,
  useCreateServiceListing,
  useUpdateServiceListing,
  useServiceOrders,
  useCreateServiceOrder,
  useUpdateServiceOrder,
  useCreatorEarnings,
  useEarningsSummary,
  useCreatorPayouts,
  useRequestPayout,
  useHonorFundraisers,
  useHonorFundraiser,
  useCreateHonorFundraiser,
  useHonorDonations,
  useCreatorReviews,
  useCreateReview as useCreateCreatorReview,
  useFeaturedCreators,
  useSendCreatorTip,
  useTemplates,
  useTemplate,
  useMyTemplates,
  useCreateTemplate,
  usePurchaseTemplate,
  // Event Ticketing
  usePurchaseEventTicket,
  useEventTickets,
  useMyEventTickets,
  // Honor-a-Day Sponsorships
  useHonorDaySponsorships,
  useAvailableHonorDays,
  useSponsorDay,
  useMyHonorDays,
  // Vault Preservation
  useVaultPreservationOrders,
  useCreateVaultPreservation,
  // Content Licensing
  useContentLicenses,
  useContentLicense,
  useMyContentLicenses,
  useCreateContentLicense,
  usePurchaseContentLicense,
  // Channel Subscriptions
  useChannelSubscription,
  useChannelSubscribers,
  useSubscribeToChannel,
  useMySubscriptions,
  // Constants
  SERVICE_CATEGORIES,
  TIER_INFO,
  TEMPLATE_CATEGORIES,
  HONOR_DAY_BADGES,
  PRESERVATION_TYPES,
  CONTENT_TYPES,
  LICENSE_TYPES,
  SUBSCRIPTION_TIERS,
} from "./hooks/useCreatorEconomy";
export type {
  CreatorTier,
  ServiceCategory,
  EarningType,
  TemplateCategory,
} from "./hooks/useCreatorEconomy";

// Hooks — Page Stewardship & Transfers
export {
  // Transfer lifecycle
  useInitiateTransfer,
  useRespondToTransfer,
  useUpdateTransferStatus,
  useCancelTransfer,
  // Transfer queries
  useMyTransfers,
  usePageTransfers,
  useTransferDetail,
  usePendingTransfers,
  // Negotiation
  useTransferMessages,
  useSendTransferMessage,
  // Valuation
  usePageValuation,
  useRecalculateValuation,
  // Stewardship scores
  useStewardshipScore,
  useMyStewardshipScore,
  useStewardshipLeaderboard,
  // Transfer history
  useTransferHistory,
  // Inheritance & succession
  useSetSuccessor,
  useMySuccessorDesignations,
  // Guardian subscriptions
  useGuardianSubscription,
  useUpgradeGuardian,
  // Marketplace (Phase 3)
  useStewardshipListings,
  useCreateStewardshipListing,
  useApplyForStewardship,
  // Analytics
  usePageAnalyticsSummary,
  useFeaturedStewards,
  // Constants
  STEWARDSHIP_TIERS,
  VALUATION_TIERS,
  TRANSFER_FEES,
  COOLING_OFF_HOURS,
  GUARDIAN_TIERS,
} from "./hooks/useStewardship";
export type {
  TransferType,
  TransferStatus,
  StewardshipTier,
  ValuationTier,
} from "./hooks/useStewardship";

// Hooks — Feature Access (Progressive Unlocking)
export {
  useFeatureCatalog,
  useMyUnlockedFeatures,
  useFeatureAccess,
  useFeatureUnlockNotifications,
  useMarkUnlockSeen,
  useMarkAllUnlocksSeen,
  useNextUnlocks,
  useRequireFeatureAccess,
  useFeaturesByLevel,
  LEVEL_TIERS,
  FEATURE_CATEGORIES,
} from "./hooks/useFeatureAccess";
export type {
  FeatureUnlock,
  UserFeatureUnlock,
  FeatureAccessResult,
} from "./hooks/useFeatureAccess";

// Hooks — Baby Journey ("Little Arcs")
export {
  useMyBabyPages,
  useBabyPage,
  useCreateBabyPage,
  useUpdateBabyPage,
  useBabyMilestones,
  useCreateBabyMilestone,
  useMilestoneChecklist,
  useNextMilestones,
  useBabyUpdates,
  useCreateBabyUpdate,
  useBabyGrowthChart,
  BABY_STAGES,
  STAGE_MILESTONES,
  MOOD_OPTIONS,
} from "./hooks/useBabyJourney";
export type {
  BabyPage,
  BabyMilestone,
  BabyUpdate,
  BabyStage,
  BabyMilestoneType,
  BabyMood,
} from "./hooks/useBabyJourney";

// Hooks — Relationship Lifecycle
export {
  useRelationshipEvents,
  useCreateRelationshipEvent,
  useUpdateRelationshipStatus,
  useArchiveWeddingPage,
  useLinkWeddingPages,
  useWeddingPageChapters,
  useRelationshipTimeline,
  useRelationshipHistory,
  RELATIONSHIP_EVENT_TYPES,
  RELATIONSHIP_STATUSES,
  EMOTIONAL_TAGS,
} from "./hooks/useRelationshipLifecycle";
export type {
  RelationshipEvent,
  RelationshipEventType,
  RelationshipStatus,
  WeddingRelationshipStatus,
  EmotionalTag,
  WeddingPageChapter,
} from "./hooks/useRelationshipLifecycle";

// Types
export type * from "./types/models";
