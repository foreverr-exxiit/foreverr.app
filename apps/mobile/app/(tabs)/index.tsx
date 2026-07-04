import { View, ScrollView, RefreshControl, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useTopMemorials,
  useFollowedMemorials,
  useTodayInHistory,
  useRecentObituaries,
  useNewsFeed,
  useFeaturedCelebrities,
  useSuggestedUsers,
  useToggleUserFollow,
  useGuestStore,
  useActiveCampaigns,
  useTodayPrompt,
  useMyEngagementStreak,
  useMyPointBalance,
  useWarmGreeting,
  useUserLocation,
  useNearbyContent,
  flattenNearbyContent,
  useWelcomeJourney,
  useClaimWelcomeReward,
  useIsNewUser,
  useUpcomingAutoReminders,
} from "@foreverr/core";
import { Text, EternLogo, CelebrityCard, NewsCard, TodayInHistorySection, SuggestedUsersSection, CampaignBanner, DailyPromptCard, EngagementStreakBanner, Phase5HomeBanner, WarmGreetingHeader, NearbyCard, CollapsibleSection, WelcomeJourneyBanner, SectionErrorBoundary } from "@foreverr/ui";
import { features } from "@foreverr/config";

const FILTER_CHIPS = ["Orbit", "Celebrating", "Discovery", "News", "Highlights"] as const;

// ── Lifecycle moments — linked to real celebrity/demo profiles (migration 00031) ──
const TRENDING_MOMENTS = [
  { id: "c0000005-0000-0000-0000-000000000005", type: "Birth", typeIcon: "\uD83D\uDC76", typeColor: "#EC4899", name: "Baby Aria Rodriguez", subtitle: "Born December 3, 2024", imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=224&h=224&fit=crop" },
  { id: "c0000004-0000-0000-0000-000000000004", type: "Wedding", typeIcon: "\uD83D\uDC92", typeColor: "#F59E0B", name: "Sarah & James Chen", subtitle: "Married in Napa Valley", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=224&h=224&fit=crop" },
  { id: "c0000001-0000-0000-0000-000000000001", type: "Memorial", typeIcon: "\uD83D\uDD4A\uFE0F", typeColor: "#4A2D7A", name: "Chadwick Boseman", subtitle: "1976\u20132020 \u2014 Wakanda Forever", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=224&h=224&fit=crop" },
  { id: "c0000007-0000-0000-0000-000000000007", type: "Birthday", typeIcon: "\uD83C\uDF82", typeColor: "#7C3AED", name: "Grandma Rose's 90th", subtitle: "9 decades of love", imageUrl: "https://images.unsplash.com/photo-1581579438747-104c53d7fbc4?w=224&h=224&fit=crop" },
  { id: "c0000006-0000-0000-0000-000000000006", type: "Retirement", typeIcon: "\uD83C\uDF05", typeColor: "#059669", name: "Coach David Thompson", subtitle: "35 years inspiring athletes", imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=224&h=224&fit=crop" },
  { id: "c0000002-0000-0000-0000-000000000002", type: "Memorial", typeIcon: "\uD83D\uDD4A\uFE0F", typeColor: "#4A2D7A", name: "Kobe Bryant", subtitle: "1978\u20132020 \u2014 Mamba Forever", imageUrl: "https://images.unsplash.com/photo-1546961342-ea5f71b193f3?w=224&h=224&fit=crop" },
  { id: "c0000003-0000-0000-0000-000000000003", type: "The Core", typeIcon: "\u2B50", typeColor: "#F97316", name: "Queen Elizabeth II", subtitle: "1926\u20132022 \u2014 70 years of service", imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=224&h=224&fit=crop" },
  { id: "c0000008-0000-0000-0000-000000000008", type: "Graduation", typeIcon: "\uD83C\uDF93", typeColor: "#2563EB", name: "Dr. Maria Santos", subtitle: "First in family \u2014 Johns Hopkins MD", imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=224&h=224&fit=crop" },
];

/** Navigate to a celebrity/lifecycle profile — uses memorial_id when linked, falls back to celeb ID */
function getCelebRoute(celeb: any): string {
  return `/lifecycle/${celeb.memorial_id ?? celeb.id}`;
}

/** Navigate to a news item — linked memorial or fallback */
function getNewsRoute(item: any): string {
  if (item.celebrity_memorial_id) return `/lifecycle/${item.celebrity_memorial_id}`;
  if (item.memorial_id) return `/lifecycle/${item.memorial_id}`;
  if (item.url) return item.url;
  return "/explore";
}

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user, isAuthenticated } = useAuth();
  const [activeChip, setActiveChip] = useState<string>("Orbit");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: topMemorials, isLoading: topLoading, refetch: refetchTop } = useTopMemorials(10);
  const { data: followedMemorials, isLoading: followedLoading, refetch: refetchFollowed } = useFollowedMemorials(user?.id);

  // Celebrity content hooks
  const { data: todayInHistory } = useTodayInHistory();
  const { data: recentObituaries, isLoading: obituariesLoading } = useRecentObituaries(10);
  const { data: newsFeed, isLoading: newsLoading } = useNewsFeed(20);
  const { data: featuredCelebrities, isLoading: featuredLoading } = useFeaturedCelebrities(10);
  const { data: suggestedUsers } = useSuggestedUsers(user?.id);
  const toggleFollow = useToggleUserFollow();
  const { data: activeCampaigns } = useActiveCampaigns();
  const { data: todayPrompt } = useTodayPrompt();
  const { data: streak } = useMyEngagementStreak(user?.id);
  const { data: pointBalance } = useMyPointBalance(user?.id);
  const { data: greetingData } = useWarmGreeting(user?.id);

  // Welcome journey (new users)
  const { data: welcomeData } = useWelcomeJourney(user?.id);
  const { data: isNewUser } = useIsNewUser(user?.id);
  const claimWelcomeReward = useClaimWelcomeReward();

  // Upcoming remembrances — birthdays / anniversaries in the next 30 days
  const { data: upcomingReminders } = useUpcomingAutoReminders(user?.id, 30);

  // Proximity/location hooks
  const { location: userLocation, isLoading: locationLoading, requestLocation } = useUserLocation();
  const { data: nearbyContent } = useNearbyContent(
    userLocation?.latitude,
    userLocation?.longitude,
    50
  );
  const nearbyItems = useMemo(() => flattenNearbyContent(nearbyContent), [nearbyContent]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTop(), refetchFollowed()]);
    setRefreshing(false);
  }, [refetchTop, refetchFollowed]);

  // ──── Render helpers for each chip tab ────

  const renderHomeContent = () => (
    <>
      {/* Warm Greeting (authenticated) or Guest Sign-Up Banner */}
      {isAuthenticated && greetingData ? (
        <WarmGreetingHeader
          userName={profile?.display_name ?? "Friend"}
          greeting={(greetingData as any).greeting ?? `Welcome back, ${profile?.display_name ?? "Friend"}`}
          subtitle={(greetingData as any).subtitle ?? "Continue building your legacy today"}
          streakCount={(streak as any)?.current_streak ?? 0}
          pointBalance={(pointBalance as any)?.current_balance ?? 0}
          onPointsPress={() => router.push("/points" as any)}
        />
      ) : !isAuthenticated ? (
        <View className="mx-4 mt-3">
          <Pressable
            className="flex-row items-center rounded-2xl bg-brand-50 dark:bg-brand-900/20 p-4"
            onPress={() => router.push("/(auth)/register")}
          >
            <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center mr-3">
              <Ionicons name="heart" size={20} color="#4A2D7A" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                Join the ǝterrn Community
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Honor loved ones, share tributes, give flowers & more
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#4A2D7A" />
          </Pressable>
          <Pressable
            className="flex-row items-center justify-center mt-2 py-2"
            onPress={() => {
              useGuestStore.getState().setHasSeenOnboarding(false);
              router.push("/onboarding");
            }}
          >
            <Ionicons name="play-circle-outline" size={16} color="#9ca3af" />
            <Text className="ml-1.5 text-xs font-sans-medium text-gray-400">Replay Onboarding</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Welcome Journey Banner (new users) */}
      {isAuthenticated && isNewUser === true && welcomeData && (welcomeData as any).tasks?.length > 0 && (
        <SectionErrorBoundary>
          <View className="mx-4 mt-3">
            <WelcomeJourneyBanner
              tasks={(welcomeData as any).tasks ?? []}
              currentDay={(welcomeData as any).currentDay ?? 1}
              totalPointsEarned={(welcomeData as any).totalPointsEarned ?? 0}
              totalPointsAvailable={(welcomeData as any).totalPointsAvailable ?? 250}
              onClaimReward={(taskKey) => {
                if (user?.id) {
                  const wTasks = (welcomeData as any).tasks ?? [];
                  const task = wTasks.find((t: any) => t.task_key === taskKey);
                  if (task) {
                    claimWelcomeReward.mutate({
                      userId: user.id,
                      taskKey,
                      taskId: task.id,
                      pointsReward: task.points_reward,
                    });
                  }
                }
              }}
            />
          </View>
        </SectionErrorBoundary>
      )}

      {/* Active Campaign Banner */}
      {(activeCampaigns ?? []).length > 0 && (() => {
        const campaign = (activeCampaigns as any[])[0];
        const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return (
          <CampaignBanner
            title={campaign.title}
            ctaText={campaign.cta_text ?? "Join Now"}
            daysRemaining={daysLeft}
            participantCount={campaign.participant_count ?? 0}
            onPress={() => router.push((campaign.cta_route ?? "/living-tribute/create") as any)}
          />
        );
      })()}

      {/* Daily Prompt */}
      {isAuthenticated && todayPrompt && (
        <Phase5HomeBanner
          variant="daily_prompt"
          data={{
            title: (todayPrompt as any).prompt_text ?? "What are you grateful for today?",
            subtitle: (todayPrompt as any).prompt_category ?? "gratitude",
            ctaText: "Respond",
          }}
          onPress={() => router.push("/daily-prompt" as any)}
        />
      )}

      {/* Engagement Streak (compact) */}
      {isAuthenticated && streak && (streak as any).current_streak > 0 && (
        <Phase5HomeBanner
          variant="streak"
          data={{
            title: `${(streak as any).current_streak}-day streak!`,
            subtitle: `Longest: ${(streak as any).longest_streak} days`,
            ctaText: "View",
          }}
          onPress={() => router.push("/streaks" as any)}
        />
      )}

      {/* Quick Access Bar — Stories & Explore */}
      <View className="px-4 pt-4 pb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-row items-center rounded-full bg-gradient-to-r bg-brand-700 px-5 py-2.5"
              onPress={() => router.push("/stories")}
            >
              <Ionicons name="play-circle" size={18} color="white" />
              <Text className="ml-2 text-sm font-sans-semibold text-white">Stories</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-brand-100 dark:bg-brand-800 px-5 py-2.5"
              onPress={() => router.push("/explore")}
            >
              <Ionicons name="compass" size={18} color="#4A2D7A" />
              <Text className="ml-2 text-sm font-sans-semibold text-brand-700">Explore</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-green-50 dark:bg-green-900/20 px-5 py-2.5"
              onPress={() => router.push("/creator")}
            >
              <Ionicons name="cash" size={18} color="#059669" />
              <Text className="ml-2 text-sm font-sans-semibold text-green-700">Creator</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-pink-50 dark:bg-pink-900/20 px-5 py-2.5"
              onPress={() => router.push("/marketplace")}
            >
              <Ionicons name="storefront" size={18} color="#be185d" />
              <Text className="ml-2 text-sm font-sans-semibold text-pink-700">Shop</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-amber-50 dark:bg-amber-900/20 px-5 py-2.5"
              onPress={() => router.push("/events")}
            >
              <Ionicons name="calendar" size={18} color="#d97706" />
              <Text className="ml-2 text-sm font-sans-semibold text-amber-700">Events</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-blue-50 dark:bg-blue-900/20 px-5 py-2.5"
              onPress={() => router.push("/chat")}
            >
              <Ionicons name="chatbubbles" size={18} color="#2563eb" />
              <Text className="ml-2 text-sm font-sans-semibold text-blue-700">Chat</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-purple-50 dark:bg-purple-900/20 px-5 py-2.5"
              onPress={() => router.push("/activity")}
            >
              <Ionicons name="pulse" size={18} color="#7C3AED" />
              <Text className="ml-2 text-sm font-sans-semibold text-purple-700">Activity</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-indigo-50 dark:bg-indigo-900/20 px-5 py-2.5"
              onPress={() => router.push("/badges")}
            >
              <Ionicons name="ribbon" size={18} color="#4F46E5" />
              <Text className="ml-2 text-sm font-sans-semibold text-indigo-700">Badges</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-rose-50 dark:bg-rose-900/20 px-5 py-2.5"
              onPress={() => router.push("/gifts" as any)}
            >
              <Ionicons name="flower" size={18} color="#e11d48" />
              <Text className="ml-2 text-sm font-sans-semibold text-rose-700">Gifts</Text>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-5 py-2.5"
              onPress={() => router.push("/points" as any)}
            >
              <Ionicons name="star" size={18} color="#059669" />
              <Text className="ml-2 text-sm font-sans-semibold text-emerald-700">Points</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Upcoming Remembrances — birthdays & anniversaries ahead.
          Deliberately gentle framing (no streaks/counters) per the
          memorial context. */}
      {isAuthenticated && (upcomingReminders?.length ?? 0) > 0 && (
        <SectionErrorBoundary>
          <View className="pt-5">
            <View className="flex-row items-center px-4 mb-2">
              <Ionicons name="calendar-outline" size={18} color="#7C3AED" />
              <Text className="ml-2 text-base font-sans-bold text-gray-900 dark:text-white">
                Upcoming Remembrances
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {(upcomingReminders ?? []).map((rem) => {
                const eventDate = new Date(rem.next_trigger_date ?? Date.now());
                eventDate.setDate(eventDate.getDate() + (rem.days_before ?? 0));
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                eventDate.setHours(0, 0, 0, 0);
                const daysUntil = Math.max(
                  0,
                  Math.round((eventDate.getTime() - today.getTime()) / 86400000),
                );
                const when =
                  daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`;
                const isRemembrance = rem.rule_type === "death_anniversary";
                const icon = isRemembrance
                  ? "flame-outline"
                  : rem.rule_type === "wedding_anniversary"
                    ? "heart-outline"
                    : "gift-outline";
                const tint = isRemembrance ? "#7C3AED" : "#D97706";
                return (
                  <Pressable
                    key={rem.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${rem.title_template}, ${when.toLowerCase()}`}
                    className="w-56 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4"
                    onPress={() => {
                      if (rem.memorial_id) router.push(`/lifecycle/${rem.memorial_id}` as any);
                      else router.push("/reminders" as any);
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View
                        className="h-9 w-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: `${tint}1A` }}
                      >
                        <Ionicons name={icon as any} size={18} color={tint} />
                      </View>
                      <Text
                        className="text-xs font-sans-bold"
                        style={{ color: tint }}
                      >
                        {when}
                      </Text>
                    </View>
                    <Text
                      className="text-sm font-sans-semibold text-gray-900 dark:text-white"
                      numberOfLines={2}
                    >
                      {rem.title_template}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </SectionErrorBoundary>
      )}

      {/* Happening Near You — Proximity-based content */}
      {features.proximityFeedEnabled && (
        <View className="px-4 pt-4">
          <CollapsibleSection
            title="Near You"
            icon="location"
            iconColor="#7C3AED"
            count={nearbyItems.length}
            headerRight={
              !userLocation ? (
                <Pressable
                  className="flex-row items-center gap-1 rounded-full bg-brand-100 dark:bg-brand-900/30 px-3 py-1.5"
                  onPress={requestLocation}
                >
                  <Ionicons name="navigate-outline" size={14} color="#4A2D7A" />
                  <Text className="text-xs font-sans-semibold text-brand-700">
                    {locationLoading ? "Locating..." : "Enable"}
                  </Text>
                </Pressable>
              ) : userLocation?.city ? (
                <View className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-2.5 py-0.5">
                  <Text className="text-[11px] font-sans-semibold text-brand-700">
                    {userLocation.city}{userLocation.region ? `, ${userLocation.region}` : ""}
                  </Text>
                </View>
              ) : undefined
            }
          >
          {nearbyItems.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {nearbyItems.slice(0, 10).map((item) => (
                  <NearbyCard
                    key={`${item.type}-${item.id}`}
                    type={item.type}
                    title={item.title}
                    subtitle={item.subtitle}
                    distanceKm={item.distance_km}
                    imageUrl={item.imageUrl}
                    accentColor={item.accentColor}
                    iconName={item.iconName}
                    onPress={() => router.push(item.route as any)}
                  />
                ))}
              </View>
            </ScrollView>
          ) : userLocation ? (
            <View className="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 items-center">
              <Ionicons name="globe-outline" size={32} color="#9ca3af" />
              <Text className="text-sm font-sans text-gray-500 mt-2 text-center">
                No nearby events or listings yet.{"\n"}Content near {userLocation.city ?? "your area"} will appear here.
              </Text>
            </View>
          ) : (
            <Pressable
              className="rounded-2xl bg-brand-50 dark:bg-brand-900/10 p-6 items-center"
              onPress={requestLocation}
            >
              <View className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-900/20 items-center justify-center mb-3">
                <Ionicons name="location-outline" size={28} color="#4A2D7A" />
              </View>
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white text-center">
                Discover what's happening nearby
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-1 text-center">
                Events, sales, and services in your area
              </Text>
              <View className="mt-3 rounded-full bg-brand-700 px-5 py-2">
                <Text className="text-xs font-sans-semibold text-white">Share Location</Text>
              </View>
            </Pressable>
          )}
          </CollapsibleSection>
        </View>
      )}

      {/* Trending Moments — Lifecycle Mix */}
      <View className="px-4 pt-4">
        <CollapsibleSection
          title={isAuthenticated ? "Moments That Matter" : "Trending Moments"}
          icon="sparkles"
          iconColor="#4A2D7A"
        >
        {topLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {(() => {
                // Interleave real memorials with celebrity/demo lifecycle moments
                // De-duplicate by ID to avoid React key conflicts on web
                const realMoments = (topMemorials ?? []).slice(0, 3).map((m: any) => ({
                  id: m.id, type: "Memorial", typeIcon: "\uD83D\uDD4A\uFE0F", typeColor: "#4A2D7A",
                  name: `${m.first_name} ${m.last_name}`, subtitle: `${m.tribute_count ?? 0} tributes`,
                  imageUrl: m.profile_photo_url,
                }));
                const seenIds = new Set(realMoments.map((m: any) => m.id));
                const uniqueSamples = [...TRENDING_MOMENTS].filter(s => {
                  if (seenIds.has(s.id)) return false;
                  seenIds.add(s.id);
                  return true;
                });
                const combined: any[] = [];
                let ri = 0, si = 0;
                while (ri < realMoments.length || si < uniqueSamples.length) {
                  if (ri < realMoments.length) combined.push(realMoments[ri++]);
                  if (si < uniqueSamples.length) combined.push(uniqueSamples[si++]);
                }
                return combined.slice(0, 10);
              })().map((moment: any) => (
                <Pressable
                  key={moment.id}
                  className="w-32 items-center"
                  style={({ pressed }: { pressed: boolean }) => [pressed && { opacity: 0.85 }]}
                  onPress={() => router.push(`/lifecycle/${moment.id}` as any)}
                >
                  <View className="h-28 w-28 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                    {moment.imageUrl ? (
                      <Image source={{ uri: moment.imageUrl }} style={{ width: 112, height: 112 }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center" style={{ backgroundColor: moment.typeColor + "10" }}>
                        <Text style={{ fontSize: 36 }}>{moment.typeIcon}</Text>
                      </View>
                    )}
                  </View>
                  <View className="mt-1.5 rounded-full px-2 py-0.5" style={{ backgroundColor: moment.typeColor + "20" }}>
                    <Text className="text-[10px] font-sans-semibold text-center" style={{ color: moment.typeColor }}>
                      {moment.type}
                    </Text>
                  </View>
                  <Text className="mt-0.5 text-xs font-sans-medium text-gray-900 dark:text-white text-center" numberOfLines={1}>
                    {moment.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}
        </CollapsibleSection>
      </View>

      {/* Today in History / On This Day section */}
      <TodayInHistorySection
        celebrities={(todayInHistory ?? []) as any[]}
        onCelebrityPress={(celebId: string) => {
          const celeb = (todayInHistory as any[])?.find((c: any) => c.id === celebId);
          router.push((celeb?.memorial_id ? `/lifecycle/${celeb.memorial_id}` : `/lifecycle/${celebId}`) as any);
        }}
      />

      {/* Suggested Users (authenticated only) */}
      {isAuthenticated && (suggestedUsers ?? []).length > 0 && (
        <SuggestedUsersSection
          users={(suggestedUsers as any[]).map((u: any) => ({
            id: u.id,
            displayName: u.display_name ?? u.username ?? "User",
            username: u.username ?? u.id.slice(0, 8),
            avatarUrl: u.avatar_url,
          }))}
          onUserPress={(userId: string) => router.push(`/user/${userId}` as any)}
          onFollowPress={(userId: string) => user?.id && toggleFollow.mutate({ followerId: user.id, followingId: userId, isCurrentlyFollowing: false })}
        />
      )}

      {/* Creator Economy — Hire & Earn */}
      {isAuthenticated && (
        <View className="px-4 pt-4">
          <CollapsibleSection
            title="Earn on ǝterrn"
            icon="cash"
            iconColor="#059669"
          >
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 items-center"
                onPress={() => router.push("/creator")}
              >
                <Ionicons name="briefcase-outline" size={24} color="#059669" />
                <Text className="text-xs font-sans-bold text-green-800 dark:text-green-300 mt-2 text-center">Creator Hub</Text>
                <Text className="text-[10px] font-sans text-green-600 dark:text-green-400 mt-0.5 text-center">Earn money honoring people</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 items-center"
                onPress={() => router.push("/services")}
              >
                <Ionicons name="cart-outline" size={24} color="#4A2D7A" />
                <Text className="text-xs font-sans-bold text-brand-800 dark:text-brand-300 mt-2 text-center">Hire a Creator</Text>
                <Text className="text-[10px] font-sans text-brand-600 dark:text-brand-400 mt-0.5 text-center">Tributes, art & more</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 items-center"
                onPress={() => router.push("/honor-fundraiser" as any)}
              >
                <Ionicons name="ribbon-outline" size={24} color="#d97706" />
                <Text className="text-xs font-sans-bold text-amber-800 dark:text-amber-300 mt-2 text-center">Fundraisers</Text>
                <Text className="text-[10px] font-sans text-amber-600 dark:text-amber-400 mt-0.5 text-center">Raise in someone's honor</Text>
              </Pressable>
            </View>
          </CollapsibleSection>
        </View>
      )}

      {/* Followed Memorials (authenticated) / Discover (guests) — 3 per row, 2 rows */}
      <View className="px-4 pt-6 pb-4">
        <CollapsibleSection
          title={isAuthenticated ? "Your Moments" : "Discover Moments"}
          icon="heart"
          iconColor="#EC4899"
          headerRight={
            <Pressable onPress={() => router.push("/explore")}>
              <Text className="text-xs font-sans-medium text-brand-700">See All</Text>
            </Pressable>
          }
        >
        {isAuthenticated ? (
          followedLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (followedMemorials ?? []).length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="flower-outline" size={48} color="#e9d5ff" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                People you honor will appear here.{"\n"}Create a tribute or discover someone to honor.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {(followedMemorials as any[]).slice(0, 6).map((memorial: any) => {
                const stage = memorial.lifecycle_stage ?? "remember";
                const stageLabels: Record<string, string> = { celebrate: "Celebrating", preserve: "Preserving", support: "Supporting", legacy: "The Core" };
                return (
                  <Pressable
                    key={memorial.id}
                    className="w-[31.5%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                    onPress={() => router.push(`/lifecycle/${memorial.id}`)}
                  >
                    <View className="h-24 bg-brand-900">
                      {memorial.cover_photo_url ? (
                        <Image source={{ uri: memorial.cover_photo_url }} style={{ width: "100%", height: 96 }} contentFit="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="person" size={32} color="#e9d5ff" />
                        </View>
                      )}
                      {stage !== "remember" && stageLabels[stage] && (
                        <View className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                          <Text className="text-[8px] font-sans-bold text-white">{stageLabels[stage]}</Text>
                        </View>
                      )}
                    </View>
                    <View className="p-2">
                      <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                        {memorial.first_name} {memorial.last_name}
                      </Text>
                      <Text className="text-[10px] font-sans text-gray-500">
                        {memorial.tribute_count ?? 0} tributes
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        ) : (
          topLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (topMemorials ?? []).length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="flower-outline" size={48} color="#e9d5ff" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                Tributes will appear here soon.{"\n"}Check back for stories of love and celebration.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {(topMemorials ?? []).slice(0, 6).map((memorial: any) => {
                const stage = memorial.lifecycle_stage ?? "remember";
                const stageLabels: Record<string, string> = { celebrate: "Celebrating", preserve: "Preserving", support: "Supporting", legacy: "The Core" };
                return (
                  <Pressable
                    key={memorial.id}
                    className="w-[31.5%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                    onPress={() => router.push(`/lifecycle/${memorial.id}`)}
                  >
                    <View className="h-24 bg-brand-900">
                      {memorial.profile_photo_url ? (
                        <Image source={{ uri: memorial.profile_photo_url }} style={{ width: "100%", height: 96 }} contentFit="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="person" size={32} color="#e9d5ff" />
                        </View>
                      )}
                      {stage !== "remember" && stageLabels[stage] && (
                        <View className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                          <Text className="text-[8px] font-sans-bold text-white">{stageLabels[stage]}</Text>
                        </View>
                      )}
                    </View>
                    <View className="p-2">
                      <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                        {memorial.first_name} {memorial.last_name}
                      </Text>
                      <Text className="text-[10px] font-sans text-gray-500">
                        {memorial.tribute_count ?? 0} tributes
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )
        )}
        </CollapsibleSection>
      </View>

      {/* Explore Features Grid — collapsed by default to reduce scroll fatigue */}
      <View className="px-4 pb-8">
        <CollapsibleSection
          title="Explore"
          icon="compass"
          iconColor="#4A2D7A"
          count={15}
          defaultExpanded={false}
          headerRight={
            <Pressable onPress={() => router.push("/explore")}>
              <Text className="text-xs font-sans-medium text-brand-700">See All</Text>
            </Pressable>
          }
        >
        <View className="flex-row flex-wrap gap-3">
          {[
            { icon: "storefront" as const, label: "Marketplace", route: "/marketplace", bg: "bg-pink-50 dark:bg-pink-900/20", color: "#be185d" },
            { icon: "business" as const, label: "Directory", route: "/directory", bg: "bg-teal-50 dark:bg-teal-900/20", color: "#0d9488" },
            { icon: "calendar" as const, label: "Events", route: "/events", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#d97706" },
            { icon: "chatbubbles" as const, label: "Chat", route: "/chat", bg: "bg-blue-50 dark:bg-blue-900/20", color: "#2563eb" },
            { icon: "lock-closed" as const, label: "The Core", route: "/memory-vault", bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "#4f46e5" },
            { icon: "git-merge" as const, label: "Family Tree", route: "/family-tree", bg: "bg-green-50 dark:bg-green-900/20", color: "#059669" },
            { icon: "mail" as const, label: "Letters", route: "/legacy-letters", bg: "bg-red-50 dark:bg-red-900/20", color: "#dc2626" },
            { icon: "book" as const, label: "Scrapbook", route: "/scrapbook", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20", color: "#c026d3" },
            { icon: "flame" as const, label: "Streaks", route: "/streaks", bg: "bg-orange-50 dark:bg-orange-900/20", color: "#ea580c" },
            { icon: "qr-code" as const, label: "QR Codes", route: "/qr-codes", bg: "bg-cyan-50 dark:bg-cyan-900/20", color: "#0891b2" },
            { icon: "planet" as const, label: "Virtual Space", route: "/virtual-space", bg: "bg-violet-50 dark:bg-violet-900/20", color: "#7c3aed" },
            { icon: "bulb" as const, label: "Prompts", route: "/memory-prompts", bg: "bg-lime-50 dark:bg-lime-900/20", color: "#65a30d" },
            { icon: "flower" as const, label: "Send Gifts", route: "/gifts", bg: "bg-rose-50 dark:bg-rose-900/20", color: "#e11d48" },
            { icon: "star" as const, label: "Points", route: "/points", bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "#059669" },
            { icon: "shield-checkmark" as const, label: "Trust", route: "/trust", bg: "bg-sky-50 dark:bg-sky-900/20", color: "#0284c7" },
          ].map((item) => (
            <Pressable
              key={item.label}
              className={`w-[31%] rounded-2xl ${item.bg} p-3 items-center`}
              onPress={() => router.push(item.route as any)}
            >
              <Ionicons name={item.icon} size={24} color={item.color} />
              <Text className="mt-1.5 text-[11px] font-sans-medium text-gray-700 dark:text-gray-300 text-center">{item.label}</Text>
            </Pressable>
          ))}
        </View>
        </CollapsibleSection>
      </View>
    </>
  );

  const renderDiscoveryContent = () => {
    // Separate celebrities by lifecycle type for diverse sections
    const allCelebs = (recentObituaries ?? []) as any[];
    const celebrationCelebs = allCelebs.filter((c: any) => c.lifecycle_type && c.lifecycle_type !== "memorial");
    const memorialCelebs = allCelebs.filter((c: any) => !c.lifecycle_type || c.lifecycle_type === "memorial");

    return (
    <View className="px-4 pt-4 pb-8">
      {/* Browse by Lifecycle Category */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
        Browse by Moment
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
        <View className="flex-row gap-3">
          {[
            { icon: "🕊️", label: "Memorials", color: "#4A2D7A", bg: "#4A2D7A15" },
            { icon: "💒", label: "Weddings", color: "#EC4899", bg: "#EC489915" },
            { icon: "👶", label: "Births", color: "#F472B6", bg: "#F472B615" },
            { icon: "🎂", label: "Birthdays", color: "#7C3AED", bg: "#7C3AED15" },
            { icon: "🎓", label: "Graduations", color: "#2563EB", bg: "#2563EB15" },
            { icon: "🌅", label: "Retirements", color: "#059669", bg: "#05966915" },
            { icon: "⭐", label: "Legacies", color: "#F97316", bg: "#F9731615" },
          ].map((cat) => (
            <Pressable
              key={cat.label}
              className="items-center w-20"
              onPress={() => router.push("/explore" as any)}
            >
              <View className="h-14 w-14 rounded-full items-center justify-center mb-1.5" style={{ backgroundColor: cat.bg }}>
                <Text style={{ fontSize: 24 }}>{cat.icon}</Text>
              </View>
              <Text className="text-[11px] font-sans-semibold text-center" style={{ color: cat.color }}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* All Lifecycle Moments — full grid of TRENDING_MOMENTS */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
        Life Moments
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {TRENDING_MOMENTS.map((moment) => (
          <Pressable
            key={moment.id}
            className="w-[31.5%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
            style={({ pressed }: { pressed: boolean }) => [pressed && { opacity: 0.85 }]}
            onPress={() => router.push(`/lifecycle/${moment.id}` as any)}
          >
            <View className="h-20 overflow-hidden">
              {moment.imageUrl ? (
                <Image source={{ uri: moment.imageUrl }} style={{ width: "100%", height: 80 }} contentFit="cover" />
              ) : (
                <View className="flex-1 items-center justify-center" style={{ backgroundColor: moment.typeColor + "10" }}>
                  <Text style={{ fontSize: 28 }}>{moment.typeIcon}</Text>
                </View>
              )}
            </View>
            <View className="p-2">
              <View className="flex-row items-center gap-1 mb-0.5">
                <Text style={{ fontSize: 10 }}>{moment.typeIcon}</Text>
                <Text className="text-[9px] font-sans-semibold" style={{ color: moment.typeColor }}>
                  {moment.type}
                </Text>
              </View>
              <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                {moment.name}
              </Text>
              <Text className="text-[10px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
                {moment.subtitle}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Celebrations — weddings, births, graduations, retirements, birthdays */}
      {celebrationCelebs.length > 0 && (
        <>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1 mt-2">
            🎉 Celebrations
          </Text>
          <Text className="text-xs font-sans text-gray-500 mb-3">
            Weddings, births, graduations & milestones
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {celebrationCelebs.map((celeb: any) => (
              <CelebrityCard
                key={celeb.id}
                celebrity={celeb}
                variant="compact"
                onPress={() => router.push(getCelebRoute(celeb) as any)}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* Memorials & Legacies */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1 mt-2">
        🕊️ Memorials & Legacies
      </Text>
      <Text className="text-xs font-sans text-gray-500 mb-3">
        Honoring those who shaped our world
      </Text>
      {featuredLoading ? (
        <ActivityIndicator size="small" color="#4A2D7A" />
      ) : (
        memorialCelebs.slice(0, 8).map((celeb: any) => (
          <CelebrityCard
            key={celeb.id}
            celebrity={celeb}
            variant="full"
            onPress={() => router.push(getCelebRoute(celeb) as any)}
          />
        ))
      )}

      {/* Trending Profiles — top memorials grid */}
      {(topMemorials ?? []).length > 0 && (
        <>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3 mt-6">
            Trending Profiles
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {(topMemorials ?? []).slice(0, 6).map((memorial: any) => {
              const stage = (memorial as any).lifecycle_stage ?? "remember";
              const stageLabels: Record<string, string> = { celebrate: "Celebrating", preserve: "Preserving", support: "Supporting", legacy: "The Core" };
              return (
                <Pressable
                  key={memorial.id}
                  className="w-[31.5%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                  onPress={() => router.push(`/lifecycle/${memorial.id}`)}
                >
                  <View className="h-24 bg-brand-900">
                    {memorial.profile_photo_url ? (
                      <Image source={{ uri: memorial.profile_photo_url }} style={{ width: "100%", height: 96 }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={32} color="#e9d5ff" />
                      </View>
                    )}
                    {stage !== "remember" && stageLabels[stage] && (
                      <View className="absolute top-1.5 left-1.5 rounded-full px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                        <Text className="text-[8px] font-sans-bold text-white">{stageLabels[stage]}</Text>
                      </View>
                    )}
                  </View>
                  <View className="p-2">
                    <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {memorial.first_name} {memorial.last_name}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-500">
                      {memorial.tribute_count ?? 0} tributes
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
    );
  };

  const renderNewsContent = () => (
    <View className="px-4 pt-4 pb-8">
      {/* Recent Moments — lifecycle mix */}
      {(recentObituaries ?? []).length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Recent Moments
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(recentObituaries ?? []).slice(0, 8).map((celeb: any) => (
              <CelebrityCard
                key={celeb.id}
                celebrity={celeb}
                variant="compact"
                onPress={() => router.push(getCelebRoute(celeb) as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* News feed — clickable */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
        News & Updates
      </Text>
      {newsLoading ? (
        <ActivityIndicator size="small" color="#4A2D7A" />
      ) : (newsFeed ?? []).length === 0 ? (
        <View className="items-center py-8">
          <Ionicons name="newspaper-outline" size={40} color="#e9d5ff" />
          <Text className="mt-3 text-sm font-sans text-gray-500 text-center">
            No news articles yet.{"\n"}Check back soon for updates.
          </Text>
        </View>
      ) : (
        (newsFeed ?? []).map((item: any) => (
          <NewsCard
            key={item.id}
            item={item}
            onPress={() => router.push(getNewsRoute(item) as any)}
          />
        ))
      )}
    </View>
  );

  const renderHighlightsContent = () => {
    const allHighlightCelebs = (recentObituaries ?? []) as any[];
    const highlightCelebrations = allHighlightCelebs.filter((c: any) => c.lifecycle_type && c.lifecycle_type !== "memorial");
    const highlightMemorials = allHighlightCelebs.filter((c: any) => !c.lifecycle_type || c.lifecycle_type === "memorial");

    return (
    <View className="pt-4 pb-8">
      {/* Today in History / On This Day */}
      <TodayInHistorySection
        celebrities={(todayInHistory ?? []) as any[]}
        onCelebrityPress={(celebId: string) => {
          const celeb = (todayInHistory as any[])?.find((c: any) => c.id === celebId);
          router.push((celeb?.memorial_id ? `/lifecycle/${celeb.memorial_id}` : `/lifecycle/${celebId}`) as any);
        }}
      />

      {/* Lifecycle Highlights — All TRENDING_MOMENTS */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">
          Lifecycle Highlights
        </Text>
        <Text className="text-xs font-sans text-gray-500 mb-3">
          Births, weddings, milestones & memorials
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {TRENDING_MOMENTS.map((moment) => (
              <Pressable
                key={moment.id}
                className="w-36 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
                style={({ pressed }: { pressed: boolean }) => [pressed && { opacity: 0.85 }]}
                onPress={() => router.push(`/lifecycle/${moment.id}` as any)}
              >
                <View className="h-20 overflow-hidden">
                  {moment.imageUrl ? (
                    <Image source={{ uri: moment.imageUrl }} style={{ width: 144, height: 80 }} contentFit="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center" style={{ backgroundColor: moment.typeColor + "10" }}>
                      <Text style={{ fontSize: 32 }}>{moment.typeIcon}</Text>
                    </View>
                  )}
                </View>
                <View className="p-2.5">
                  <View className="rounded-full px-1.5 py-0.5 self-start mb-1" style={{ backgroundColor: moment.typeColor + "20" }}>
                    <Text className="text-[9px] font-sans-semibold" style={{ color: moment.typeColor }}>
                      {moment.typeIcon} {moment.type}
                    </Text>
                  </View>
                  <Text className="text-xs font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
                    {moment.name}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
                    {moment.subtitle}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Celebrations — weddings, births, graduations, retirements */}
      {highlightCelebrations.length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">
            🎉 Celebrating Life
          </Text>
          <Text className="text-xs font-sans text-gray-500 mb-3">
            Weddings, births, graduations & milestones
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {highlightCelebrations.map((celeb: any) => (
              <CelebrityCard
                key={celeb.id}
                celebrity={celeb}
                variant="compact"
                onPress={() => router.push(getCelebRoute(celeb) as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Memorials & Legacies */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">
          🕊️ Featured Memorials
        </Text>
        <Text className="text-xs font-sans text-gray-500 mb-3">
          Honoring those who shaped our world
        </Text>
        {obituariesLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          highlightMemorials.slice(0, 6).map((celeb: any) => (
            <CelebrityCard
              key={celeb.id}
              celebrity={celeb}
              variant="full"
              onPress={() => router.push(getCelebRoute(celeb) as any)}
            />
          ))
        )}
      </View>

      {/* Trending profiles — mixed lifecycle */}
      {(topMemorials ?? []).length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Trending Profiles
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {(topMemorials ?? []).map((memorial: any) => {
                const stage = (memorial as any).lifecycle_stage ?? "remember";
                const stageLabels: Record<string, string> = { celebrate: "Celebrating", preserve: "Preserving", support: "Supporting", legacy: "The Core" };
                return (
                  <Pressable
                    key={memorial.id}
                    className="w-28 items-center"
                    onPress={() => router.push(`/lifecycle/${memorial.id}`)}
                  >
                    <View className="h-24 w-24 overflow-hidden rounded-2xl bg-brand-900">
                      {memorial.profile_photo_url ? (
                        <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="person" size={40} color="#e9d5ff" />
                        </View>
                      )}
                      {stage !== "remember" && stageLabels[stage] && (
                        <View className="absolute bottom-1 left-1 rounded-full px-1.5 py-0.5" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                          <Text className="text-[8px] font-sans-bold text-white">{stageLabels[stage]}</Text>
                        </View>
                      )}
                    </View>
                    <Text className="mt-1.5 text-xs font-sans-medium text-gray-900 dark:text-white text-center" numberOfLines={1}>
                      {memorial.first_name} {memorial.last_name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
    );
  };

  const renderCelebratingContent = () => (
    <View className="px-4 pt-4 pb-8">
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-1">
        Celebrating Today
      </Text>
      <Text className="text-sm font-sans text-gray-500 mb-4">
        Honor the living. Give them their flowers while they can still smell them.
      </Text>

      {/* Give Flowers CTA */}
      <Pressable
        className="flex-row items-center rounded-2xl bg-rose-50 dark:bg-rose-900/20 p-4 mb-4"
        onPress={() => router.push("/gifts" as any)}
      >
        <View className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-800/30 items-center justify-center mr-3">
          <Ionicons name="flower" size={24} color="#e11d48" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Give Someone Their Flowers</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">Send flowers, candles, or a heartfelt gift</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#e11d48" />
      </Pressable>

      {/* Living Tribute CTA */}
      <Pressable
        className="flex-row items-center rounded-2xl bg-green-50 dark:bg-green-900/20 p-4 mb-4"
        onPress={() => router.push("/living-tribute/create" as any)}
      >
        <View className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800/30 items-center justify-center mr-3">
          <Ionicons name="gift" size={24} color="#059669" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Create a Living Tribute</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">Honor someone alive — a birthday, retirement, or just because</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#059669" />
      </Pressable>

      {/* Appreciation Letter CTA */}
      <Pressable
        className="flex-row items-center rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-4 mb-4"
        onPress={() => router.push("/appreciation/compose" as any)}
      >
        <View className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-800/30 items-center justify-center mr-3">
          <Ionicons name="mail" size={24} color="#8B5CF6" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Write an Appreciation Letter</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">Tell someone what they mean to you</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
      </Pressable>

      {/* Announce & Share CTA */}
      <Pressable
        className="flex-row items-center rounded-2xl bg-blue-50 dark:bg-blue-900/20 p-4 mb-6"
        onPress={() => router.push("/announce" as any)}
      >
        <View className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-800/30 items-center justify-center mr-3">
          <Ionicons name="megaphone" size={24} color="#2563EB" />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Create & Share a Card</Text>
          <Text className="text-xs font-sans text-gray-500 mt-0.5">Beautiful cards for birthdays, events & milestones</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#2563EB" />
      </Pressable>

      {/* Celebrating Today — Lifecycle moments */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3 mt-2">
        Celebrating Today
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-3">
          {TRENDING_MOMENTS.filter(m => m.type !== "Memorial" && m.type !== "The Core").map((moment) => (
            <Pressable
              key={moment.id}
              className="w-36 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden"
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/lifecycle/${moment.id}` as any)}
            >
              <View className="h-20 overflow-hidden">
                {moment.imageUrl ? (
                  <Image source={{ uri: moment.imageUrl }} style={{ width: 144, height: 80 }} contentFit="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center" style={{ backgroundColor: moment.typeColor + "10" }}>
                    <Text style={{ fontSize: 32 }}>{moment.typeIcon}</Text>
                  </View>
                )}
              </View>
              <View className="p-2.5">
                <View className="rounded-full px-1.5 py-0.5 self-start mb-1" style={{ backgroundColor: moment.typeColor + "20" }}>
                  <Text className="text-[9px] font-sans-semibold" style={{ color: moment.typeColor }}>
                    {moment.type}
                  </Text>
                </View>
                <Text className="text-xs font-sans-bold text-gray-900 dark:text-white" numberOfLines={1}>
                  {moment.name}
                </Text>
                <Text className="text-[10px] font-sans text-gray-500 mt-0.5" numberOfLines={1}>
                  {moment.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Celebration Stories — from celebrity data */}
      {(() => {
        const celebrationCelebs = (recentObituaries ?? []).filter((c: any) => c.lifecycle_type && c.lifecycle_type !== "memorial");
        if (celebrationCelebs.length === 0) return null;
        return (
          <>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3 mt-2">
              Celebration Stories
            </Text>
            {celebrationCelebs.slice(0, 5).map((celeb: any) => (
              <CelebrityCard
                key={celeb.id}
                celebrity={celeb}
                variant="full"
                onPress={() => router.push(getCelebRoute(celeb) as any)}
              />
            ))}
          </>
        );
      })()}

      {/* Celebration News */}
      {(() => {
        const celebrationNews = (newsFeed ?? []).filter((n: any) => n.category === "celebration");
        if (celebrationNews.length === 0) return null;
        return (
          <>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3 mt-4">
              Celebration News
            </Text>
            {celebrationNews.slice(0, 5).map((item: any) => (
              <NewsCard
                key={item.id}
                item={item}
                onPress={() => router.push(getNewsRoute(item) as any)}
              />
            ))}
          </>
        );
      })()}

      {/* Suggested Users */}
      {isAuthenticated && (suggestedUsers ?? []).length > 0 && (
        <SuggestedUsersSection
          users={(suggestedUsers as any[]).map((u: any) => ({
            id: u.id,
            displayName: u.display_name ?? u.username ?? "User",
            username: u.username ?? u.id.slice(0, 8),
            avatarUrl: u.avatar_url,
          }))}
          onUserPress={(userId: string) => router.push(`/user/${userId}` as any)}
          onFollowPress={(userId: string) => user?.id && toggleFollow.mutate({ followerId: user.id, followingId: userId, isCurrentlyFollowing: false })}
        />
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Branded header bar */}
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        {/* Centered logo */}
        <View className="items-center mb-3">
          <EternLogo width={960} variant="full" />
        </View>

        {/* Row: Avatar + Search bar */}
        <View className="flex-row items-center gap-2 mb-2">
          <Pressable
            className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/20"
            onPress={() => router.push("/(tabs)/profile")}
          >
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
            ) : (
              <Ionicons name="person" size={18} color="white" />
            )}
          </Pressable>

          <View className="flex-1 flex-row items-center rounded-full bg-white/15 px-3.5 py-2">
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              className="ml-2 flex-1 text-sm font-sans text-white"
              placeholder="Search people & tributes"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }}
            />
          </View>

          <Pressable
            className="rounded-full bg-white px-4 py-2"
            onPress={() => router.push("/donate")}
          >
            <Text className="text-xs font-sans-semibold text-brand-900">Donate</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(tabs)/profile")}>
            <Ionicons name="menu" size={24} color="white" />
          </Pressable>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {FILTER_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                className="rounded-full px-4 py-1.5 border"
                style={{
                  backgroundColor: activeChip === chip ? "#FFFFFF" : "rgba(255,255,255,0.1)",
                  borderColor: activeChip === chip ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                }}
                onPress={() => setActiveChip(chip)}
              >
                <Text
                  className="text-xs font-sans-medium"
                  style={{ color: activeChip === chip ? "#111111" : "rgba(255,255,255,0.8)" }}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4A2D7A" />}
      >
        {activeChip === "Orbit" && renderHomeContent()}
        {activeChip === "Celebrating" && renderCelebratingContent()}
        {activeChip === "Discovery" && renderDiscoveryContent()}
        {activeChip === "News" && renderNewsContent()}
        {activeChip === "Highlights" && renderHighlightsContent()}
      </ScrollView>
    </View>
  );
}
