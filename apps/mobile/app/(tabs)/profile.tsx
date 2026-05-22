import { View, ScrollView, Pressable, ActivityIndicator, Switch, Platform, Appearance, useColorScheme as useRNColorScheme, useWindowDimensions } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useHostedMemorials, useProfileStats, useGuestStore, useUserBadges, useLegacyLink, useUserShareStats, useMyEngagementStreak, useHonoredTributes, useMyPointBalance, useMyTrustLevel, usePremium, useGiftsSent, useUserActivities, usePhotosOfPerson, useTrendingTributes, useEngagementSummary, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "@foreverr/core";
import type { EngagementCategory } from "@foreverr/core";
import { Text, Button, EternLogo, BadgeDisplay, LegacyLinkCard, LegacyProfileSection, EngagementStreakBanner, LegacyPointsBadge, TrustLevelBadge, CollapsibleSection, StoriesCarousel } from "@foreverr/ui";
import * as Clipboard from "expo-clipboard";
import { Share, Alert } from "react-native";

const PROFILE_TABS = ["Tribute", "Gifts", "Tags", "Interaction"] as const;

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Tribute: "heart",
  Gifts: "flower",
  Tags: "pricetag",
  Interaction: "pulse",
};

const MY_STUFF_CATEGORIES = [
  {
    title: "Create & Share",
    icon: "create" as const,
    iconColor: "#7C3AED",
    items: [
      { icon: "book", label: "Scrapbook", route: "/scrapbook", bg: "bg-pink-50 dark:bg-pink-900/20", color: "#EC4899" },
      { icon: "mail", label: "Letters", route: "/legacy-letters", bg: "bg-red-50 dark:bg-red-900/20", color: "#DC2626" },
      { icon: "mail-open", label: "Appreciation", route: "/appreciation", bg: "bg-purple-50 dark:bg-purple-900/20", color: "#8B5CF6" },
      { icon: "gift", label: "Tributes", route: "/living-tribute", bg: "bg-green-50 dark:bg-green-900/20", color: "#059669" },
      { icon: "person-add", label: "Invite", route: "/invite", bg: "bg-rose-50 dark:bg-rose-900/20", color: "#E11D48" },
    ],
  },
  {
    title: "Personal",
    icon: "person" as const,
    iconColor: "#4A2D7A",
    items: [
      { icon: "lock-closed", label: "The Core", route: "/memory-vault", bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "#4f46e5" },
      { icon: "git-merge", label: "Family Tree", route: "/family-tree", bg: "bg-green-50 dark:bg-green-900/20", color: "#059669" },
      { icon: "help-circle", label: "Prompts", route: "/memory-prompts", bg: "bg-orange-50 dark:bg-orange-900/20", color: "#EA580C" },
      { icon: "bulb", label: "Daily Prompts", route: "/daily-prompt", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#F59E0B" },
      { icon: "alarm", label: "Reminders", route: "/reminders", bg: "bg-blue-50 dark:bg-blue-900/20", color: "#2563EB" },
    ],
  },
  {
    title: "Social",
    icon: "people" as const,
    iconColor: "#EC4899",
    items: [
      { icon: "flower", label: "Send Gifts", route: "/gifts", bg: "bg-rose-50 dark:bg-rose-900/20", color: "#ec4899" },
      { icon: "flame", label: "Streaks", route: "/streaks", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#D97706" },
      { icon: "link", label: "Core Link", route: "/legacy-link", bg: "bg-brand-50 dark:bg-brand-900/20", color: "#7C3AED" },
      { icon: "sparkles", label: "Decorations", route: "/seasonal-decorations", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", color: "#A855F7" },
    ],
  },
  {
    title: "The Core",
    icon: "ribbon" as const,
    iconColor: "#D97706",
    items: [
      { icon: "star", label: "Points", route: "/points", bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "#059669" },
      { icon: "shield-checkmark", label: "Trust", route: "/trust", bg: "bg-sky-50 dark:bg-sky-900/20", color: "#0284c7" },
      { icon: "swap-horizontal", label: "Stewardship", route: "/stewardship", bg: "bg-purple-50 dark:bg-purple-900/20", color: "#4A2D7A" },
      { icon: "qr-code", label: "QR Codes", route: "/qr-codes", bg: "bg-cyan-50 dark:bg-cyan-900/20", color: "#06B6D4" },
      { icon: "earth", label: "Virtual Space", route: "/virtual-space", bg: "bg-teal-50 dark:bg-teal-900/20", color: "#0D9488" },
      { icon: "cloud-upload", label: "Import", route: "/import", bg: "bg-slate-50 dark:bg-slate-900/20", color: "#64748b" },
      { icon: "happy", label: "Little Arcs", route: "/baby", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#F59E0B" },
      { icon: "heart-half", label: "Relationships", route: "/relationship/history", bg: "bg-pink-50 dark:bg-pink-900/20", color: "#EC4899" },
    ],
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Tribute");
  const systemScheme = useRNColorScheme();
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const isDark = themeOverride ? themeOverride === "dark" : systemScheme === "dark";
  const { height: windowHeight } = useWindowDimensions();

  const handleToggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setThemeOverride(next);
    try { Appearance.setColorScheme(next); } catch (_e) { /* older RN */ }
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  }, [isDark]);

  const { data: hostedMemorials, isLoading: hostedLoading } = useHostedMemorials(user?.id);
  const { data: stats } = useProfileStats(user?.id);
  const { data: earnedBadges } = useUserBadges(user?.id);
  const { data: legacyLink } = useLegacyLink(user?.id);
  const { data: shareStats } = useUserShareStats(user?.id);
  const { data: streak } = useMyEngagementStreak(user?.id);
  const { data: honoredTributes } = useHonoredTributes(user?.id);
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const { data: trustLevel } = useMyTrustLevel(user?.id);
  const { tier, isPremium, isElite, isFree } = usePremium();
  const { data: engagementSummary } = useEngagementSummary(user?.id);

  // Tab data hooks
  const { data: giftsSentData } = useGiftsSent(user?.id);
  const { data: activitiesData } = useUserActivities(user?.id);
  const { data: taggedPhotos } = usePhotosOfPerson({
    profileId: user?.id,
  });
  const { data: trendingTributes } = useTrendingTributes(20);

  const giftsSent = giftsSentData?.pages?.flatMap((p) => p.data) ?? [];
  const activities = activitiesData?.pages?.flatMap((p) => p.data) ?? [];
  const photoTags = taggedPhotos ?? [];

  // Guest view — sign-in prompt
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="bg-brand-900 px-4 pb-4 pt-14">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.push("/settings" as any)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Ionicons name="settings-outline" size={20} color="#ffffff" />
            </Pressable>
            <Pressable className="flex-1 items-center mx-2" onPress={() => router.push("/(tabs)")}>
              <EternLogo width={400} variant="full" />
            </Pressable>
            <Pressable
              onPress={handleToggleTheme}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <Ionicons name={isDark ? "sunny" : "moon"} size={20} color="#ffffff" />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-brand-100">
            <Ionicons name="person" size={44} color="#4A2D7A" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
            Your Profile
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6 px-4">
            Sign in to honor loved ones, share tributes, send flowers, and connect with a community that celebrates and remembers.
          </Text>
          <Button
            title="Sign In"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/login")}
          />
          <Pressable
            className="mt-4 py-3"
            onPress={() => router.push("/(auth)/register")}
          >
            <Text className="text-sm font-sans-medium text-brand-700">Create an Account</Text>
          </Pressable>
          <Pressable
            className="mt-6 flex-row items-center py-3"
            onPress={() => {
              useGuestStore.getState().setHasSeenOnboarding(false);
              router.push("/onboarding");
            }}
          >
            <Ionicons name="play-circle-outline" size={18} color="#9ca3af" />
            <Text className="ml-2 text-sm font-sans-medium text-gray-500">Replay Onboarding</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Authenticated View — Instagram-style continuous scroll ─────────
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* ═══ Fixed top header bar (always visible, like Instagram) ═══ */}
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.push("/settings" as any)}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Ionicons name="settings-outline" size={20} color="#ffffff" />
          </Pressable>
          <Pressable className="flex-1 items-center mx-2" onPress={() => router.push("/(tabs)")}>
            <EternLogo width={400} variant="full" />
          </Pressable>
          <Pressable
            onPress={handleToggleTheme}
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* ═══ Single continuous scroll — pull up / pull down naturally ═══ */}
      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        bounces
      >
        {/* ═══ CHILD 0: Profile Section (scrolls away like Instagram) ═══ */}
        <View>
          {/* Stories Carousel */}
          {(trendingTributes ?? []).length > 0 && (
            <StoriesCarousel
              tributes={(trendingTributes as any[]).map((t: any) => ({
                id: t.id,
                author: {
                  display_name: t.user?.display_name ?? "User",
                  avatar_url: t.user?.avatar_url ?? null,
                },
              }))}
              onPressStory={(index) => router.push(`/stories?startIndex=${index}` as any)}
              onPressAdd={() => router.push("/(tabs)/create")}
              onPressSeeAll={() => router.push("/stories" as any)}
            />
          )}

          {/* Profile Info */}
          <View className="items-center px-4 pb-1">
            {/* Avatar */}
            <View className="mb-2 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 border-2 border-brand-300">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={44} color="#4A2D7A" />
              )}
            </View>

            {/* Name + Trust */}
            <View className="items-center">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                {profile?.display_name ?? "User"}
              </Text>
              {trustLevel && (
                <TrustLevelBadge
                  level={(trustLevel as any).level ?? 1}
                  levelName={(trustLevel as any).name ?? "Community"}
                  isVerified={(trustLevel as any).level >= 3}
                  compact
                />
              )}
            </View>
            <Text className="text-sm font-sans text-gray-500">
              @{profile?.username ?? "user"}
            </Text>

            {/* Premium Badge */}
            {!isFree && (
              <Pressable
                className="mt-1.5 flex-row items-center rounded-full px-3 py-1"
                style={{ backgroundColor: isElite ? "#FFFBEB" : "#F5F3FF" }}
                onPress={() => router.push("/billing" as any)}
              >
                <Ionicons
                  name={isElite ? "star" : "diamond"}
                  size={12}
                  color={isElite ? "#D97706" : "#7C3AED"}
                />
                <Text
                  className="ml-1 text-[10px] font-sans-bold"
                  style={{ color: isElite ? "#D97706" : "#7C3AED" }}
                >
                  {isElite ? "Elite" : "Premium"} Member
                </Text>
              </Pressable>
            )}

            {/* Stats — Instagram-style 3-column top row */}
            <View className="mt-3 w-full">
              <View className="flex-row justify-around">
                <Pressable className="items-center flex-1" onPress={() => user?.id && router.push(`/user/${user.id}/followers?tab=followers`)}>
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.followerCount ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-gray-500">Followers</Text>
                </Pressable>
                <Pressable className="items-center flex-1" onPress={() => user?.id && router.push(`/user/${user.id}/followers?tab=following`)}>
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{(profile as any)?.following_count ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-gray-500">Following</Text>
                </Pressable>
                <View className="items-center flex-1">
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.tributesWritten ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-gray-500">Tributes</Text>
                </View>
              </View>
              <View className="flex-row justify-around mt-1.5">
                <View className="items-center flex-1">
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.ribbonBalance ?? profile?.ribbon_balance ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-gray-500">Spirit</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.memorialsHosted ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-gray-500">Memorials</Text>
                </View>
                <Pressable className="items-center flex-1" onPress={() => router.push("/badges" as any)}>
                  <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{(profile as any)?.badge_count ?? 0}</Text>
                  <Text className="text-[11px] font-sans text-brand-700">Badges</Text>
                </Pressable>
              </View>
            </View>

            {/* Bio */}
            <Text className="mt-2 text-sm font-sans text-gray-600 dark:text-gray-400 text-center px-2">
              {profile?.bio ?? "Start honoring the people who matter most — living and remembered."}
            </Text>

            {/* Instagram-style action buttons */}
            <View className="flex-row gap-2 mt-3 w-full">
              <Pressable
                className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 items-center"
                onPress={() => router.push("/settings" as any)}
              >
                <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">Edit Profile</Text>
              </Pressable>
              <Pressable
                className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 items-center"
                onPress={async () => {
                  const slug = legacyLink?.slug ?? profile?.username;
                  if (slug) {
                    await Share.share({ message: `Check out my profile on ǝterrn: https://eterrn.app/${slug}` });
                  }
                }}
              >
                <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">Share Profile</Text>
              </Pressable>
              <Pressable
                className="w-10 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center"
                onPress={() => router.push("/explore" as any)}
              >
                <Ionicons name="person-add-outline" size={16} color={isDark ? "#d1d5db" : "#374151"} />
              </Pressable>
            </View>
          </View>

          {/* Badge Showcase */}
          {(earnedBadges ?? []).length > 0 && (
            <View className="mt-2 px-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Badges</Text>
                <Pressable onPress={() => router.push("/badges" as any)}>
                  <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
                </Pressable>
              </View>
              <BadgeDisplay
                badges={(earnedBadges ?? []).filter((b: any) => b.is_displayed).slice(0, 6).map((b: any) => ({
                  id: b.id,
                  badgeType: b.badge_type,
                  badgeTier: b.badge_tier,
                  icon: b.definition?.icon ?? "ribbon",
                  name: b.definition?.name ?? b.badge_type,
                }))}
              />
            </View>
          )}

          {/* Core Points */}
          {pointBalance && (
            <View className="mt-2 px-4">
              <LegacyPointsBadge
                currentBalance={(pointBalance as any).current_balance ?? 0}
                level={(pointBalance as any).level ?? 1}
                levelName={(pointBalance as any).level_name ?? "Seedling"}
                levelIcon={(pointBalance as any).level_icon ?? "leaf"}
                onPress={() => router.push("/points" as any)}
              />
            </View>
          )}

          {/* Engagement Streak */}
          {streak && (
            <View className="px-4 mt-2 mb-1">
              <EngagementStreakBanner
                currentStreak={streak.current_streak ?? 0}
                longestStreak={streak.longest_streak ?? 0}
                totalDaysActive={streak.total_days_active ?? 0}
                onShare={async () => {
                  await Share.share({
                    message: `I'm on a ${streak.current_streak}-day streak on ǝterrn! Building my legacy every day.`,
                  });
                }}
                onViewDetails={() => router.push("/streaks" as any)}
              />
            </View>
          )}

          {/* Engagement Impact */}
          {engagementSummary && engagementSummary.totalPoints > 0 && (
            <View className="px-4 mt-2 mb-1">
              <Pressable
                className="rounded-2xl bg-gradient-to-r p-4"
                style={{ backgroundColor: "#F5F3FF" }}
                onPress={() => router.push("/points" as any)}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={16} color="#7C3AED" />
                    <Text className="ml-1.5 text-sm font-sans-bold" style={{ color: "#4A2D7A" }}>
                      Engagement Impact
                    </Text>
                  </View>
                  <View className="flex-row items-center rounded-full px-2.5 py-0.5" style={{ backgroundColor: "#EDE9FE" }}>
                    <Text className="text-xs font-sans-bold" style={{ color: "#7C3AED" }}>
                      {engagementSummary.totalPoints} pts
                    </Text>
                  </View>
                </View>
                <View className="flex-row flex-wrap gap-1.5">
                  {(Object.entries(engagementSummary.breakdown) as [EngagementCategory, number][])
                    .filter(([, pts]) => pts > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, pts]) => (
                      <View
                        key={cat}
                        className="flex-row items-center rounded-full px-2.5 py-1"
                        style={{ backgroundColor: `${CATEGORY_COLORS[cat]}15` }}
                      >
                        <Ionicons
                          name={CATEGORY_ICONS[cat] as any}
                          size={12}
                          color={CATEGORY_COLORS[cat]}
                        />
                        <Text
                          className="ml-1 text-[10px] font-sans-semibold"
                          style={{ color: CATEGORY_COLORS[cat] }}
                        >
                          {CATEGORY_LABELS[cat]}: {pts}
                        </Text>
                      </View>
                    ))}
                </View>
                {engagementSummary.recentActions.length > 0 && (
                  <View className="mt-2.5 pt-2.5 border-t" style={{ borderTopColor: "#E9D5FF" }}>
                    <Text className="text-[10px] font-sans text-gray-500 mb-1">Recent Activity</Text>
                    {engagementSummary.recentActions.slice(0, 3).map((action) => (
                      <View key={action.id} className="flex-row items-center justify-between py-0.5">
                        <Text className="text-[11px] font-sans text-gray-700 flex-1" numberOfLines={1}>
                          {action.label}
                        </Text>
                        <Text className="text-[10px] font-sans-medium" style={{ color: "#7C3AED" }}>
                          +{action.points}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            </View>
          )}

          {/* Tributes Honoring Me */}
          {(honoredTributes ?? []).length > 0 && (
            <View className="mt-2 mb-2">
              <View className="flex-row items-center justify-between px-4 mb-2">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Tributes Honoring Me</Text>
                <Pressable onPress={() => router.push("/living-tribute" as any)}>
                  <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                <View className="flex-row gap-2">
                  {(honoredTributes as any[]).slice(0, 5).map((tribute: any) => (
                    <Pressable
                      key={tribute.id}
                      className="w-32 rounded-2xl bg-green-50 dark:bg-green-900/20 p-3 items-center"
                      onPress={() => router.push(`/living-tribute/${tribute.id}` as any)}
                    >
                      <Ionicons name="gift" size={24} color="#059669" />
                      <Text className="mt-1 text-xs font-sans-semibold text-gray-900 dark:text-white text-center" numberOfLines={1}>
                        {tribute.title}
                      </Text>
                      <Text className="text-[9px] font-sans text-gray-500 mt-0.5">
                        {tribute.message_count ?? 0} messages
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* ═══ CHILD 1: Sticky Tab Bar (sticks at top when scrolled) ═══ */}
        <View
          className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 }}
        >
          <View className="flex-row">
            {PROFILE_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  className="flex-1 items-center py-3"
                  onPress={() => setActiveTab(tab)}
                >
                  <Ionicons
                    name={isActive ? TAB_ICONS[tab] : (`${TAB_ICONS[tab]}-outline` as any)}
                    size={22}
                    color={isActive ? "#4A2D7A" : "#9ca3af"}
                  />
                  {isActive && (
                    <View
                      className="absolute bottom-0 h-[2px] rounded-full bg-brand-700"
                      style={{ left: "20%", right: "20%" }}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ═══ CHILD 2: All content below tabs (one continuous scroll) ═══ */}
        <View style={{ minHeight: windowHeight - 160 }}>
          {/* Active tab content */}
          <View className="px-4 pt-4 pb-2">
            {activeTab === "Tribute" && (
              (honoredTributes ?? []).length > 0 ? (
                <View className="gap-3">
                  {(honoredTributes as any[]).slice(0, 10).map((tribute: any) => (
                    <Pressable
                      key={tribute.id}
                      className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                      onPress={() => router.push(`/living-tribute/${tribute.id}` as any)}
                    >
                      <View className="h-10 w-10 rounded-full bg-green-100 items-center justify-center mr-3">
                        <Ionicons name="gift" size={20} color="#059669" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                          {tribute.title}
                        </Text>
                        <Text className="text-xs font-sans text-gray-500 mt-0.5">
                          {tribute.message_count ?? 0} messages
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="heart-outline" size={32} color="#d1d5db" />
                  <Text className="text-sm font-sans text-gray-500 mt-2">No tributes yet.</Text>
                  <Pressable className="mt-3" onPress={() => router.push("/living-tribute/create" as any)}>
                    <Text className="text-sm font-sans-medium text-brand-700">Create a tribute</Text>
                  </Pressable>
                </View>
              )
            )}

            {activeTab === "Gifts" && (
              giftsSent.length > 0 ? (
                <View className="gap-3">
                  {giftsSent.slice(0, 10).map((gift: any) => (
                    <View
                      key={gift.id}
                      className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <View className="h-10 w-10 rounded-full bg-rose-100 items-center justify-center mr-3">
                        <Ionicons name="flower" size={20} color="#ec4899" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                          {gift.gift?.name ?? "Gift"}
                        </Text>
                        <Text className="text-xs font-sans text-gray-500 mt-0.5">
                          {gift.message ? gift.message.slice(0, 50) : "Sent with love"}
                        </Text>
                      </View>
                      <Text className="text-[10px] font-sans text-gray-400">
                        {new Date(gift.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="flower-outline" size={32} color="#d1d5db" />
                  <Text className="text-sm font-sans text-gray-500 mt-2">No gifts sent yet.</Text>
                  <Pressable className="mt-3" onPress={() => router.push("/gifts" as any)}>
                    <Text className="text-sm font-sans-medium text-brand-700">Send a gift</Text>
                  </Pressable>
                </View>
              )
            )}

            {activeTab === "Tags" && (
              photoTags.length > 0 ? (
                <View className="gap-3">
                  {(photoTags as any[]).slice(0, 10).map((tag: any) => (
                    <View
                      key={tag.id}
                      className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <View className="h-10 w-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
                        <Ionicons name="pricetag" size={20} color="#4f46e5" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                          {tag.tagged_name ?? "Tagged photo"}
                        </Text>
                        <Text className="text-xs font-sans text-gray-500 mt-0.5">
                          {tag.is_verified ? "Verified" : "Pending"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="pricetag-outline" size={32} color="#d1d5db" />
                  <Text className="text-sm font-sans text-gray-500 mt-2">No photo tags yet.</Text>
                  <Pressable className="mt-3" onPress={() => router.push("/photo-tags" as any)}>
                    <Text className="text-sm font-sans-medium text-brand-700">Tag photos</Text>
                  </Pressable>
                </View>
              )
            )}

            {activeTab === "Interaction" && (
              activities.length > 0 ? (
                <View className="gap-3">
                  {activities.slice(0, 10).map((activity: any) => (
                    <View
                      key={activity.id}
                      className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <View className="h-10 w-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Ionicons
                          name={
                            activity.activity_type === "tribute_created" ? "create" :
                            activity.activity_type === "reaction_added" ? "heart" :
                            activity.activity_type === "comment_added" ? "chatbubble" :
                            activity.activity_type === "gift_sent" ? "gift" :
                            "pulse"
                          }
                          size={20}
                          color="#2563eb"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                          {(activity.activity_type ?? "activity").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </Text>
                        <Text className="text-xs font-sans text-gray-500 mt-0.5">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="items-center py-8">
                  <Ionicons name="pulse-outline" size={32} color="#d1d5db" />
                  <Text className="text-sm font-sans text-gray-500 mt-2">No interactions yet.</Text>
                  <Text className="text-xs font-sans text-gray-400 mt-1 text-center px-6">
                    Your tributes, reactions, and comments will appear here.
                  </Text>
                </View>
              )
            )}
          </View>

          {/* ── Divider ── */}
          <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-2" />

          {/* People You Honor */}
          <View className="mt-4 px-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">People You Honor</Text>
              <Pressable onPress={() => router.push("/(tabs)/search")}>
                <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
              </Pressable>
            </View>
            {hostedLoading ? (
              <ActivityIndicator size="small" color="#4A2D7A" />
            ) : (hostedMemorials ?? []).length === 0 ? (
              <Pressable
                className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                onPress={() => router.push("/(tabs)/create")}
              >
                <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
                  <Ionicons name="add" size={20} color="#4A2D7A" />
                </View>
                <Text className="ml-3 text-sm font-sans-medium text-gray-700 dark:text-gray-300">Honor someone special</Text>
              </Pressable>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {(hostedMemorials as any[]).map((m: any) => (
                    <Pressable
                      key={m.id}
                      className="items-center"
                      onPress={() => router.push(`/lifecycle/${m.id}`)}
                    >
                      <View className="h-14 w-14 rounded-full border-2 border-brand-200 bg-brand-100 items-center justify-center overflow-hidden">
                        {m.profile_photo_url ? (
                          <Image source={{ uri: m.profile_photo_url }} style={{ width: 56, height: 56 }} contentFit="cover" />
                        ) : (
                          <Ionicons name="person" size={24} color="#4A2D7A" />
                        )}
                      </View>
                      <Text className="mt-1 text-[10px] font-sans text-gray-600 dark:text-gray-400 text-center w-16" numberOfLines={1}>
                        {m.first_name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* ── Divider ── */}
          <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-4" />

          {/* My Stuff — Categorized & Collapsible */}
          <View className="mt-4 px-4">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">My Stuff</Text>
            {MY_STUFF_CATEGORIES.map((category, idx) => (
              <CollapsibleSection
                key={category.title}
                title={category.title}
                icon={category.icon as any}
                iconColor={category.iconColor}
                count={category.items.length}
                defaultExpanded={idx === 0}
              >
                <View className="flex-row flex-wrap gap-2 pb-3">
                  {category.items.map((item) => (
                    <Pressable
                      key={item.label}
                      className={`w-[31%] rounded-2xl ${item.bg} p-3 items-center`}
                      onPress={() => router.push(item.route as any)}
                    >
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                      <Text className="mt-1 text-[10px] font-sans-medium text-gray-700 dark:text-gray-300 text-center">{item.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </CollapsibleSection>
            ))}
          </View>

          {/* ── Divider ── */}
          <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-2" />

          {/* Quick Links */}
          <View className="mt-4 px-4">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Quick Links</Text>
            <View className="flex-row flex-wrap gap-2">
              {[
                { icon: "pulse" as const, label: "Activity", route: "/activity", color: "#7C3AED" },
                { icon: "ribbon" as const, label: "Badges", route: "/badges", color: "#D97706" },
                { icon: "compass" as const, label: "Explore", route: "/explore", color: "#4A2D7A" },
                { icon: "storefront" as const, label: "Shop", route: "/marketplace", color: "#be185d" },
                { icon: "chatbubbles" as const, label: "Chat", route: "/chat", color: "#2563eb" },
                { icon: "calendar" as const, label: "Events", route: "/events", color: "#d97706" },
              ].map((item) => (
                <Pressable
                  key={item.label}
                  className="flex-row items-center rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-2"
                  onPress={() => router.push(item.route as any)}
                >
                  <Ionicons name={item.icon} size={16} color={item.color} />
                  <Text className="ml-1.5 text-xs font-sans-medium text-gray-700 dark:text-gray-300">{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Core Link */}
          <View className="px-4 mt-4">
            <LegacyLinkCard
              slug={legacyLink?.slug ?? null}
              onEdit={() => router.push("/legacy-link" as any)}
              onCopy={async () => {
                if (legacyLink?.slug) {
                  await Clipboard.setStringAsync(`https://eterrn.app/${legacyLink.slug}`);
                  Alert.alert("Copied!", "Your Core Link has been copied to clipboard.");
                }
              }}
              onShare={async () => {
                if (legacyLink?.slug) {
                  await Share.share({
                    message: `Check out my profile on ǝterrn: https://eterrn.app/${legacyLink.slug}`,
                    url: `https://eterrn.app/${legacyLink.slug}`,
                  });
                }
              }}
            />
          </View>

          {/* Legacy Profile Section */}
          <View className="px-4 mt-3">
            <LegacyProfileSection
              legacyMessage={(profile as any)?.legacy_message ?? null}
              legacyLinkSlug={(profile as any)?.legacy_link_slug ?? null}
              shareStats={
                shareStats
                  ? {
                      totalShares: shareStats.total_shares ?? 0,
                      totalInvitesSent: shareStats.total_invites_sent ?? 0,
                      totalConversions: shareStats.total_conversions ?? 0,
                      totalPromptsAnswered: shareStats.total_prompts_answered ?? 0,
                    }
                  : null
              }
              isOwnProfile={true}
              onEditMessage={() => router.push("/profile/edit-legacy" as any)}
              onShareProfile={async () => {
                if ((profile as any)?.legacy_link_slug) {
                  await Share.share({
                    message: `Check out my legacy profile on ǝterrn: https://eterrn.app/${(profile as any).legacy_link_slug}`,
                  });
                }
              }}
            />
          </View>

          {/* ── Divider ── */}
          <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-4" />

          {/* Settings & Preferences */}
          <View className="px-4 mt-4 pb-4">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">Settings & Preferences</Text>

            {/* Theme Toggle */}
            <View className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-2.5">
              <Ionicons name={isDark ? "moon" : "sunny"} size={20} color="#F59E0B" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
              <Switch
                value={isDark}
                onValueChange={handleToggleTheme}
                trackColor={{ false: "#d1d5db", true: "#7C3AED" }}
                thumbColor="#ffffff"
              />
            </View>

            <Pressable
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-2.5"
              onPress={() => router.push("/billing" as any)}
            >
              <Ionicons name="card-outline" size={20} color="#7C3AED" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">
                {isFree ? "Upgrade to Premium" : "Subscription & Billing"}
              </Text>
              {isFree && (
                <View className="bg-brand-100 rounded-full px-2 py-0.5 mr-2">
                  <Text className="text-[10px] font-sans-bold text-brand-700">PRO</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-xl bg-green-50 dark:bg-green-900/20 p-4 mb-2.5"
              onPress={() => router.push("/creator" as any)}
            >
              <Ionicons name="cash-outline" size={20} color="#059669" />
              <Text className="ml-3 text-sm font-sans-semibold text-green-800 dark:text-green-300 flex-1">Creator Hub — Earn Money</Text>
              <View className="bg-green-200 dark:bg-green-800 rounded-full px-2 py-0.5 mr-2">
                <Text className="text-[10px] font-sans-bold text-green-700 dark:text-green-300">NEW</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#059669" />
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-2.5"
              onPress={() => router.push("/services" as any)}
            >
              <Ionicons name="storefront-outline" size={20} color="#4A2D7A" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">Service Marketplace</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-2.5"
              onPress={() => router.push("/settings" as any)}
            >
              <Ionicons name="settings-outline" size={20} color="#6b7280" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-2.5"
              onPress={() => router.push("/explore" as any)}
            >
              <Ionicons name="compass-outline" size={20} color="#4A2D7A" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">Explore All Features</Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </Pressable>

            <Pressable
              className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-4"
              onPress={() => {
                useGuestStore.getState().setHasSeenOnboarding(false);
                router.push("/onboarding");
              }}
            >
              <Ionicons name="play-circle-outline" size={20} color="#6b7280" />
              <Text className="ml-3 text-sm font-sans text-gray-700 dark:text-gray-300 flex-1">Replay Onboarding</Text>
            </Pressable>

            <Button title="Sign Out" variant="outline" fullWidth onPress={signOut} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
