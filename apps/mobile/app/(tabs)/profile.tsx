import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useHostedMemorials, useProfileStats, useGuestStore, useUserBadges, useLegacyLink, useUserShareStats, useMyEngagementStreak, useHonoredTributes, useMyPointBalance, useMyTrustLevel } from "@foreverr/core";
import { Text, Button, ForeverrLogo, BadgeDisplay, LegacyLinkCard, LegacyProfileSection, EngagementStreakBanner, LegacyPointsBadge, TrustLevelBadge } from "@foreverr/ui";
import * as Clipboard from "expo-clipboard";
import { Share, Alert } from "react-native";

const PROFILE_TABS = ["Tribute", "Memorial Gift", "Tags", "Interaction"] as const;

const MY_STUFF_ITEMS = [
  { icon: "lock-closed", label: "Memory Vault", route: "/memory-vault", bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "#4f46e5" },
  { icon: "git-merge", label: "Family Tree", route: "/family-tree", bg: "bg-green-50 dark:bg-green-900/20", color: "#059669" },
  { icon: "mail", label: "Letters", route: "/legacy-letters", bg: "bg-red-50 dark:bg-red-900/20", color: "#DC2626" },
  { icon: "book", label: "Scrapbook", route: "/scrapbook", bg: "bg-pink-50 dark:bg-pink-900/20", color: "#EC4899" },
  { icon: "flame", label: "Streaks", route: "/streaks", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#D97706" },
  { icon: "qr-code", label: "QR Codes", route: "/qr-codes", bg: "bg-cyan-50 dark:bg-cyan-900/20", color: "#06B6D4" },
  { icon: "sparkles", label: "Decorations", route: "/seasonal-decorations", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", color: "#A855F7" },
  { icon: "earth", label: "Virtual Space", route: "/virtual-space", bg: "bg-teal-50 dark:bg-teal-900/20", color: "#0D9488" },
  { icon: "help-circle", label: "Prompts", route: "/memory-prompts", bg: "bg-orange-50 dark:bg-orange-900/20", color: "#EA580C" },
  { icon: "link", label: "Legacy Link", route: "/legacy-link", bg: "bg-brand-50 dark:bg-brand-900/20", color: "#7C3AED" },
  { icon: "gift", label: "Tributes", route: "/living-tribute", bg: "bg-green-50 dark:bg-green-900/20", color: "#059669" },
  { icon: "mail-open", label: "Appreciation", route: "/appreciation", bg: "bg-purple-50 dark:bg-purple-900/20", color: "#8B5CF6" },
  { icon: "alarm", label: "Reminders", route: "/reminders", bg: "bg-blue-50 dark:bg-blue-900/20", color: "#2563EB" },
  { icon: "bulb", label: "Daily Prompts", route: "/daily-prompt", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#F59E0B" },
  { icon: "person-add", label: "Invite", route: "/invite", bg: "bg-rose-50 dark:bg-rose-900/20", color: "#E11D48" },
  { icon: "flower", label: "Send Gifts", route: "/gifts", bg: "bg-rose-50 dark:bg-rose-900/20", color: "#ec4899" },
  { icon: "star", label: "Points", route: "/points", bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "#059669" },
  { icon: "shield-checkmark", label: "Trust", route: "/trust", bg: "bg-sky-50 dark:bg-sky-900/20", color: "#0284c7" },
  { icon: "cloud-upload", label: "Import", route: "/import", bg: "bg-slate-50 dark:bg-slate-900/20", color: "#64748b" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, signOut, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Tribute");

  const { data: hostedMemorials, isLoading: hostedLoading } = useHostedMemorials(user?.id);
  const { data: stats } = useProfileStats(user?.id);
  const { data: earnedBadges } = useUserBadges(user?.id);
  const { data: legacyLink } = useLegacyLink(user?.id);
  const { data: shareStats } = useUserShareStats(user?.id);
  const { data: streak } = useMyEngagementStreak(user?.id);
  const { data: honoredTributes } = useHonoredTributes(user?.id);
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const { data: trustLevel } = useMyTrustLevel(user?.id);

  // Guest view — sign-in prompt
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
          <Pressable onPress={() => router.push("/(tabs)")}>
            <ForeverrLogo width={550} variant="full" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-brand-100">
            <Ionicons name="person" size={44} color="#4A2D7A" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
            Your Profile
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6 px-4">
            Sign in to create memorials, share tributes, track your streaks, and connect with others who remember.
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

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Branded header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")}>
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
      </View>
      <View className="items-center px-4 pb-4">
        {/* Avatar */}
        <View className="mb-3 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 border-2 border-brand-300">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={44} color="#4A2D7A" />
          )}
        </View>

        <View className="flex-row items-center gap-2">
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

        {/* Stats Grid - matches Figma 2x3 grid */}
        <View className="mt-4 w-full">
          <View className="flex-row justify-around">
            <Pressable className="items-center px-2" onPress={() => user?.id && router.push(`/user/${user.id}/followers?tab=followers`)}>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.followerCount ?? 0}</Text>
              <Text className="text-[11px] font-sans text-brand-700">Followers</Text>
            </Pressable>
            <Pressable className="items-center px-2" onPress={() => user?.id && router.push(`/user/${user.id}/followers?tab=following`)}>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{(profile as any)?.following_count ?? 0}</Text>
              <Text className="text-[11px] font-sans text-brand-700">Following</Text>
            </Pressable>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.tributesWritten ?? 0}</Text>
              <Text className="text-[11px] font-sans text-gray-500">Tributes</Text>
            </View>
          </View>
          <View className="flex-row justify-around mt-2">
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.ribbonBalance ?? profile?.ribbon_balance ?? 0}</Text>
              <Text className="text-[11px] font-sans text-gray-500">Spirit</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{stats?.memorialsHosted ?? 0}</Text>
              <Text className="text-[11px] font-sans text-gray-500">Memorials</Text>
            </View>
            <Pressable className="items-center px-2" onPress={() => router.push("/badges" as any)}>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{(profile as any)?.badge_count ?? 0}</Text>
              <Text className="text-[11px] font-sans text-brand-700">Badges</Text>
            </Pressable>
          </View>
        </View>

        {/* Badge Showcase */}
        {(earnedBadges ?? []).length > 0 && (
          <View className="mt-4 w-full">
            <View className="flex-row justify-between px-2 mb-2">
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

        {/* Legacy Points */}
        {pointBalance && (
          <View className="mt-4 w-full px-2">
            <LegacyPointsBadge
              currentBalance={(pointBalance as any).current_balance ?? 0}
              level={(pointBalance as any).level ?? 1}
              levelName={(pointBalance as any).level_name ?? "Seedling"}
              levelIcon={(pointBalance as any).level_icon ?? "leaf"}
              onPress={() => router.push("/points" as any)}
            />
          </View>
        )}

        {/* Bio */}
        <Text className="mt-4 text-sm font-sans text-gray-600 dark:text-gray-400 text-center px-4">
          {profile?.bio ?? "Create your first memorial and start honoring loved ones."}
        </Text>

        {/* Legacy Link */}
        <View className="w-full">
          <LegacyLinkCard
            slug={legacyLink?.slug ?? null}
            onEdit={() => router.push("/legacy-link" as any)}
            onCopy={async () => {
              if (legacyLink?.slug) {
                await Clipboard.setStringAsync(`https://foreverr.app/${legacyLink.slug}`);
                Alert.alert("Copied!", "Your Legacy Link has been copied to clipboard.");
              }
            }}
            onShare={async () => {
              if (legacyLink?.slug) {
                await Share.share({
                  message: `Check out my legacy profile on Foreverr: https://foreverr.app/${legacyLink.slug}`,
                  url: `https://foreverr.app/${legacyLink.slug}`,
                });
              }
            }}
          />
        </View>

        {/* Legacy Profile Section */}
        <View className="w-full mt-3">
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
                  message: `Check out my legacy profile on Foreverr: https://foreverr.app/${(profile as any).legacy_link_slug}`,
                });
              }
            }}
          />
        </View>

        {/* Engagement Streak */}
        {streak && (
          <View className="w-full px-4 mb-3">
            <EngagementStreakBanner
              currentStreak={streak.current_streak ?? 0}
              longestStreak={streak.longest_streak ?? 0}
              totalDaysActive={streak.total_days_active ?? 0}
              onShare={async () => {
                await Share.share({
                  message: `I'm on a ${streak.current_streak}-day streak on Foreverr! Building my legacy every day.`,
                });
              }}
              onViewDetails={() => router.push("/streaks" as any)}
            />
          </View>
        )}

        {/* Living Tributes Honoring Me */}
        {(honoredTributes ?? []).length > 0 && (
          <View className="w-full mt-2 mb-3">
            <View className="flex-row items-center justify-between px-6 mb-2">
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

        {/* My Stuff */}
        <View className="mt-5 w-full px-2">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">My Stuff</Text>
          <View className="flex-row flex-wrap gap-2">
            {MY_STUFF_ITEMS.map((item) => (
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
        </View>

        {/* Hosted Memorials */}
        <View className="mt-5 w-full">
          <View className="flex-row justify-between px-2 mb-2">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Hosted Memorials</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
            </Pressable>
          </View>
          {hostedLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (hostedMemorials ?? []).length === 0 ? (
            <View className="px-2">
              <Pressable
                className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                onPress={() => router.push("/(tabs)/create")}
              >
                <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
                  <Ionicons name="add" size={20} color="#4A2D7A" />
                </View>
                <Text className="ml-3 text-sm font-sans-medium text-gray-700 dark:text-gray-300">Create your first memorial</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
              <View className="flex-row gap-2">
                {(hostedMemorials as any[]).map((m: any) => (
                  <Pressable
                    key={m.id}
                    className="items-center"
                    onPress={() => router.push(`/memorial/${m.id}`)}
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
      </View>

      {/* Profile Tabs */}
      <View className="border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
          <View className="flex-row">
            {PROFILE_TABS.map((tab) => (
              <Pressable
                key={tab}
                className={`px-4 py-3 ${activeTab === tab ? "border-b-2 border-brand-700" : ""}`}
                onPress={() => setActiveTab(tab)}
              >
                <Text className={`text-sm font-sans-medium ${activeTab === tab ? "text-brand-700" : "text-gray-500"}`}>
                  {tab}
                </Text>
              </Pressable>
            ))}
            <Pressable className="px-3 py-3">
              <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="p-4">
        <View className="items-center py-8">
          <Text className="text-sm font-sans text-gray-500">No {activeTab.toLowerCase()} activity yet.</Text>
        </View>
      </View>

      {/* Quick Links */}
      <View className="px-4 pb-4">
        <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2 px-1">Quick Links</Text>
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

      {/* Settings / Sign Out */}
      <View className="px-4 pb-8">
        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 p-4 mb-3 dark:bg-gray-800"
          onPress={() => router.push("/explore" as any)}
        >
          <Ionicons name="compass-outline" size={22} color="#4A2D7A" />
          <Text className="ml-3 text-base font-sans text-gray-700 dark:text-gray-300">Explore All Features</Text>
          <View className="flex-1" />
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>
        <Pressable className="flex-row items-center rounded-xl bg-gray-50 p-4 mb-3 dark:bg-gray-800">
          <Ionicons name="settings-outline" size={22} color="#6b7280" />
          <Text className="ml-3 text-base font-sans text-gray-700 dark:text-gray-300">Settings</Text>
        </Pressable>
        <Pressable
          className="flex-row items-center rounded-xl bg-gray-50 p-4 mb-3 dark:bg-gray-800"
          onPress={() => {
            useGuestStore.getState().setHasSeenOnboarding(false);
            router.push("/onboarding");
          }}
        >
          <Ionicons name="play-circle-outline" size={22} color="#6b7280" />
          <Text className="ml-3 text-base font-sans text-gray-700 dark:text-gray-300">Replay Onboarding</Text>
        </Pressable>
        <Button title="Sign Out" variant="outline" fullWidth onPress={signOut} />
      </View>
    </ScrollView>
  );
}
