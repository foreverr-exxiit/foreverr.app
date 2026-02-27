import { View, ScrollView, RefreshControl, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
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
} from "@foreverr/core";
import { Text, ForeverrLogo, CelebrityCard, NewsCard, TodayInHistorySection, SuggestedUsersSection, CampaignBanner, DailyPromptCard, EngagementStreakBanner, Phase5HomeBanner, WarmGreetingHeader } from "@foreverr/ui";

const FILTER_CHIPS = ["Home", "Discovery", "News", "Highlights"] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user, isAuthenticated } = useAuth();
  const [activeChip, setActiveChip] = useState<string>("Home");
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
  const greeting = useWarmGreeting(user?.id);

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
      {isAuthenticated && greeting ? (
        <WarmGreetingHeader
          userName={profile?.display_name ?? "Friend"}
          greeting={(greeting as any).greeting ?? `Welcome back, ${profile?.display_name ?? "Friend"}`}
          subtitle={(greeting as any).subtitle ?? "Continue building your legacy today"}
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
                Join the Foreverr Community
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Create memorials, share tributes, light candles & more
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

      {/* Trending Memorials */}
      <View className="px-4 pt-4">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
          {isAuthenticated ? "Top Search Memorial" : "Trending Memorials"}
        </Text>
        {topLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {(topMemorials ?? []).length === 0 ? (
                <Text className="text-sm font-sans text-gray-400 py-4">No memorials yet. Be the first to create one.</Text>
              ) : (
                (topMemorials ?? []).map((memorial: any) => (
                  <Pressable
                    key={memorial.id}
                    className="w-28 items-center"
                    onPress={() => router.push(`/memorial/${memorial.id}`)}
                  >
                    <View className="h-24 w-24 overflow-hidden rounded-2xl bg-brand-900">
                      {memorial.profile_photo_url ? (
                        <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons name="person" size={40} color="#e9d5ff" />
                        </View>
                      )}
                    </View>
                    <Text className="mt-1.5 text-xs font-sans-medium text-gray-900 dark:text-white text-center" numberOfLines={1}>
                      {memorial.first_name} {memorial.last_name}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-500 text-center">
                      In Memoriam
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Today in History section */}
      <TodayInHistorySection
        celebrities={(todayInHistory ?? []) as any[]}
        onCelebrityPress={(celebId: string) => router.push(`/memorial/${celebId}` as any)}
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

      {/* Followed Memorials (authenticated) / Discover (guests) */}
      <View className="px-4 pt-6 pb-8">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
          {isAuthenticated ? "Your Memorials" : "Discover Memorials"}
        </Text>
        {isAuthenticated ? (
          followedLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (followedMemorials ?? []).length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="flower-outline" size={48} color="#e9d5ff" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                Memorials you follow will appear here.{"\n"}Create or discover memorials to get started.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {(followedMemorials as any[]).map((memorial: any) => (
                <Pressable
                  key={memorial.id}
                  className="w-[48%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                  onPress={() => router.push(`/memorial/${memorial.id}`)}
                >
                  <View className="h-28 bg-brand-900">
                    {memorial.cover_photo_url ? (
                      <Image source={{ uri: memorial.cover_photo_url }} style={{ width: "100%", height: 112 }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={36} color="#e9d5ff" />
                      </View>
                    )}
                  </View>
                  <View className="p-2.5">
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {memorial.first_name} {memorial.last_name}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-500">
                      {memorial.tribute_count ?? 0} tributes
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )
        ) : (
          topLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (topMemorials ?? []).length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="flower-outline" size={48} color="#e9d5ff" />
              <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
                Memorials will appear here soon.{"\n"}Check back for stories of love and remembrance.
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              {(topMemorials ?? []).slice(0, 6).map((memorial: any) => (
                <Pressable
                  key={memorial.id}
                  className="w-[48%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                  onPress={() => router.push(`/memorial/${memorial.id}`)}
                >
                  <View className="h-28 bg-brand-900">
                    {memorial.profile_photo_url ? (
                      <Image source={{ uri: memorial.profile_photo_url }} style={{ width: "100%", height: 112 }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={36} color="#e9d5ff" />
                      </View>
                    )}
                  </View>
                  <View className="p-2.5">
                    <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {memorial.first_name} {memorial.last_name}
                    </Text>
                    <Text className="text-[10px] font-sans text-gray-500">
                      {memorial.tribute_count ?? 0} tributes
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )
        )}
      </View>

      {/* Explore Features Grid */}
      <View className="px-4 pb-8">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Explore</Text>
          <Pressable onPress={() => router.push("/explore")}>
            <Text className="text-xs font-sans-medium text-brand-700">See All →</Text>
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-3">
          {[
            { icon: "storefront" as const, label: "Marketplace", route: "/marketplace", bg: "bg-pink-50 dark:bg-pink-900/20", color: "#be185d" },
            { icon: "business" as const, label: "Directory", route: "/directory", bg: "bg-teal-50 dark:bg-teal-900/20", color: "#0d9488" },
            { icon: "calendar" as const, label: "Events", route: "/events", bg: "bg-amber-50 dark:bg-amber-900/20", color: "#d97706" },
            { icon: "chatbubbles" as const, label: "Chat", route: "/chat", bg: "bg-blue-50 dark:bg-blue-900/20", color: "#2563eb" },
            { icon: "lock-closed" as const, label: "Memory Vault", route: "/memory-vault", bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "#4f46e5" },
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
      </View>
    </>
  );

  const renderDiscoveryContent = () => (
    <View className="px-4 pt-4 pb-8">
      {/* Top memorials for discovery */}
      {(topMemorials ?? []).length > 0 && (
        <>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Top Memorials
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            {(topMemorials ?? []).slice(0, 4).map((memorial: any) => (
              <Pressable
                key={memorial.id}
                className="w-[48%] rounded-2xl bg-gray-50 dark:bg-gray-800 overflow-hidden"
                onPress={() => router.push(`/memorial/${memorial.id}`)}
              >
                <View className="h-28 bg-brand-900">
                  {memorial.profile_photo_url ? (
                    <Image source={{ uri: memorial.profile_photo_url }} style={{ width: "100%", height: 112 }} contentFit="cover" />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Ionicons name="person" size={36} color="#e9d5ff" />
                    </View>
                  )}
                </View>
                <View className="p-2.5">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                    {memorial.first_name} {memorial.last_name}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-500">
                    {memorial.tribute_count ?? 0} tributes
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Notable celebrity memorials */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
        Notable Memorials
      </Text>
      {featuredLoading ? (
        <ActivityIndicator size="small" color="#4A2D7A" />
      ) : (
        (recentObituaries ?? []).slice(0, 8).map((celeb: any) => (
          <CelebrityCard key={celeb.id} celebrity={celeb} variant="full" />
        ))
      )}
    </View>
  );

  const renderNewsContent = () => (
    <View className="px-4 pt-4 pb-8">
      {/* Recent obituaries horizontal scroll */}
      {(recentObituaries ?? []).length > 0 && (
        <View className="mb-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Recent Obituaries
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(recentObituaries ?? []).slice(0, 8).map((celeb: any) => (
              <CelebrityCard key={celeb.id} celebrity={celeb} variant="compact" />
            ))}
          </ScrollView>
        </View>
      )}

      {/* News feed */}
      <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
        News & Updates
      </Text>
      {newsLoading ? (
        <ActivityIndicator size="small" color="#4A2D7A" />
      ) : (
        (newsFeed ?? []).map((item: any) => (
          <NewsCard key={item.id} item={item} />
        ))
      )}
    </View>
  );

  const renderHighlightsContent = () => (
    <View className="pt-4 pb-8">
      {/* Today in History */}
      <TodayInHistorySection
        celebrities={(todayInHistory ?? []) as any[]}
        onCelebrityPress={(celebId: string) => router.push(`/memorial/${celebId}` as any)}
      />

      {/* Featured celebrities */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
          Featured Memorials
        </Text>
        {obituariesLoading ? (
          <ActivityIndicator size="small" color="#4A2D7A" />
        ) : (
          (recentObituaries ?? []).slice(0, 10).map((celeb: any) => (
            <CelebrityCard key={celeb.id} celebrity={celeb} variant="full" />
          ))
        )}
      </View>

      {/* Trending user memorials */}
      {(topMemorials ?? []).length > 0 && (
        <View className="px-4 mt-6">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Trending Memorials
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {(topMemorials ?? []).map((memorial: any) => (
                <Pressable
                  key={memorial.id}
                  className="w-28 items-center"
                  onPress={() => router.push(`/memorial/${memorial.id}`)}
                >
                  <View className="h-24 w-24 overflow-hidden rounded-2xl bg-brand-900">
                    {memorial.profile_photo_url ? (
                      <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={40} color="#e9d5ff" />
                      </View>
                    )}
                  </View>
                  <Text className="mt-1.5 text-xs font-sans-medium text-gray-900 dark:text-white text-center" numberOfLines={1}>
                    {memorial.first_name} {memorial.last_name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Branded header bar */}
      <View className="bg-brand-900 px-4 pb-3 pt-14">
        {/* Large centered logo */}
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center mb-4">
          <ForeverrLogo width={550} variant="full" />
        </Pressable>

        {/* Search Bar + Donate + Avatar/Menu */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-full bg-white/15 px-4 py-2.5">
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
            <TextInput
              className="ml-2 flex-1 text-sm font-sans text-white"
              placeholder="Search memorials"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }}
            />
          </View>
          <Pressable
            className="rounded-full bg-white px-5 py-2.5"
            onPress={() => router.push("/donate")}
          >
            <Text className="text-sm font-sans-semibold text-brand-900">Donate</Text>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/20">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={18} color="white" />
              )}
            </View>
            <Pressable onPress={() => router.push("/(tabs)/profile")}>
              <Ionicons name="menu" size={26} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {FILTER_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                className={`rounded-full px-4 py-1.5 border ${
                  activeChip === chip
                    ? "border-white bg-white"
                    : "border-white/30 bg-white/10"
                }`}
                onPress={() => setActiveChip(chip)}
              >
                <Text
                  className={`text-xs font-sans-medium ${
                    activeChip === chip ? "text-brand-900" : "text-white/80"
                  }`}
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
        {activeChip === "Home" && renderHomeContent()}
        {activeChip === "Discovery" && renderDiscoveryContent()}
        {activeChip === "News" && renderNewsContent()}
        {activeChip === "Highlights" && renderHighlightsContent()}
      </ScrollView>
    </View>
  );
}
