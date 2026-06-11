import { View, Pressable, ScrollView, ActivityIndicator, Platform, Alert, Appearance, useColorScheme as useRNColorScheme, useWindowDimensions, Modal, StatusBar } from "react-native";
import { useLocalSearchParams, useRouter, usePathname, Slot } from "expo-router";
import { useMemo, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemorial, useIsFollowing, useToggleFollow, useAuth, useRequireAuth, useShareContent, useGenerateShareCard, useFlowerWall, useMemorialHosts, useTributes, useCreateDM, useToggleReaction, useMemorialReactionCounts } from "@foreverr/core";
import { Text, ShareSheet, TrustLevelBadge, getLifecycleConfig, ErrorBoundary, HostSection, StoriesCarousel, ReactionBar, AmbientReactions } from "@foreverr/ui";
import * as Clipboard from "expo-clipboard";

export default function MemorialDetailLayout() {
  return (
    <ErrorBoundary>
      <MemorialDetailContent />
    </ErrorBoundary>
  );
}

function MemorialDetailContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const pathname = usePathname();
  const systemScheme = useRNColorScheme();
  const [themeOverride, setThemeOverride] = useState<"light" | "dark" | null>(null);
  const isDark = themeOverride ? themeOverride === "dark" : systemScheme === "dark";
  const { height: windowHeight } = useWindowDimensions();

  const [shareVisible, setShareVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [profileImageVisible, setProfileImageVisible] = useState(false);

  const { data: memorial, isLoading } = useMemorial(id);
  const { data: isFollowing } = useIsFollowing(id, user?.id);
  const toggleFollow = useToggleFollow();
  const shareContent = useShareContent();
  const { data: shareCard } = useGenerateShareCard("memorial", id);
  const { data: flowerWall } = useFlowerWall("memorial", id);
  const { data: hosts } = useMemorialHosts(id, (memorial as any)?.created_by);
  const { data: tributePages } = useTributes(id, user?.id);
  const createDM = useCreateDM();
  const toggleReaction = useToggleReaction();
  const { data: reactionData } = useMemorialReactionCounts(id, user?.id);

  // ── Lifecycle config ────────────────────────────────────────────
  const config = useMemo(
    () => getLifecycleConfig((memorial as any)?.lifecycle_stage),
    [(memorial as any)?.lifecycle_stage],
  );

  // Derive active tab from the current route pathname
  const activeTab = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (lastSegment === id || segments.length <= 2) return "index";
    return lastSegment;
  }, [pathname, id]);

  const navigateToTab = (tabKey: string) => {
    if (tabKey === "index") {
      router.replace(`/lifecycle/${id}` as any);
    } else {
      router.replace(`/lifecycle/${id}/${tabKey}` as any);
    }
  };

  const handleToggleFollow = () => {
    requireAuth(() => {
      if (!id || !user?.id) return;
      toggleFollow.mutate({ memorialId: id, userId: user.id, isFollowing: !!isFollowing });
    });
  };

  // ── Quick action handler ────────────────────────────────────────
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "wall":
        navigateToTab("wall");
        break;
      case "donate":
        requireAuth(() => router.push("/donate"));
        break;
      case "gifts":
        requireAuth(() => router.push(`/gifts/memorial/${id}` as any));
        break;
      case "share":
        setShareVisible(true);
        break;
      case "honor-day":
        requireAuth(() => {
          const name = memorial ? `${(memorial as any).first_name ?? ""} ${(memorial as any).last_name ?? ""}`.trim() : undefined;
          router.push(`/honor-day?memorialId=${id}${name ? `&memorialName=${encodeURIComponent(name)}` : ""}` as any);
        });
        break;
    }
  };

  // ── Profile reaction handler ─────────────────────────────────────
  const handleProfileReaction = useCallback((type: string) => {
    requireAuth(() => {
      if (!id || !user?.id) return;
      toggleReaction.mutate({
        targetType: "tribute",
        targetId: id,
        userId: user.id,
        reactionType: type,
      });
    });
  }, [id, user?.id, requireAuth, toggleReaction]);

  // ── Message host handler ─────────────────────────────────────────
  const handleMessageHost = useCallback((hostUserId: string, hostDisplayName: string) => {
    requireAuth(async () => {
      if (!user?.id) return;
      if (user.id === hostUserId) {
        if (Platform.OS === "web") {
          window.alert("That's you! Other visitors will be able to message you directly from this page.");
        } else {
          Alert.alert("That's you!", "Other visitors will be able to message you directly from this page.");
        }
        return;
      }
      try {
        const room = await createDM.mutateAsync({
          userId: user.id,
          otherUserId: hostUserId,
          otherUserName: hostDisplayName,
        });
        if (room?.id) {
          router.push(`/chat/${room.id}` as any);
        }
      } catch {
        Alert.alert("Unable to start chat", "Please try again later.");
      }
    });
  }, [user?.id, createDM, requireAuth, router]);

  // ── Navigation helper ─────────────────────────────────────────────
  const goHome = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)" as any);
    }
  }, [router]);

  // ── 3-dots menu actions ─────────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    await Clipboard.setStringAsync(`https://eterrn.app/lifecycle/${id}`);
    setMenuVisible(false);
    Alert.alert("Copied!", "Memorial link copied to clipboard.");
  }, [id]);

  const handleToggleTheme = useCallback(() => {
    const next = isDark ? "light" : "dark";
    setThemeOverride(next);
    try { Appearance.setColorScheme(next); } catch (_e) { /* older RN */ }
    if (Platform.OS === "web" && typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    setMenuVisible(false);
  }, [isDark]);

  const handleReport = useCallback(() => {
    setMenuVisible(false);
    Alert.alert("Report", "Thank you. Our team will review this memorial.");
  }, []);

  // ── Host display — always show a host, fallback to current user or "ǝterrn" ──
  // IMPORTANT: This useMemo MUST be above the early return to avoid Error #310
  const m = memorial as any;
  const displayHosts = useMemo(() => {
    const realHosts = (hosts as any[]) ?? [];
    if (realHosts.length > 0) return realHosts;

    // Fallback: use current logged-in user as the host if they might be the creator
    if (user) {
      return [
        {
          id: `self-${user.id}`,
          role: "owner",
          relationship: m?.relationship ?? "immediate_family",
          relationship_detail: null,
          user: {
            id: user.id,
            display_name: (user as any).display_name || (user as any).user_metadata?.display_name || "You",
            username: (user as any).username || null,
            avatar_url: (user as any).avatar_url || (user as any).user_metadata?.avatar_url || null,
          },
        },
      ];
    }

    // No user logged in — show a community placeholder
    return [
      {
        id: "foreverr-community",
        role: "owner",
        relationship: m?.relationship ?? "community",
        relationship_detail: null,
        user: {
          id: "community",
          display_name: "ǝterrn Community",
          username: null,
          avatar_url: null,
        },
      },
    ];
  }, [hosts, user, m?.relationship]);

  // ── Loading state (after all hooks) ───────────────────────────────
  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  // Build display name — include nickname when available
  const nickname = m?.nickname;
  const fullName = memorial && (memorial.first_name || memorial.last_name)
    ? nickname
      ? `${memorial.first_name ?? ""}${nickname ? ` "${nickname}"` : ""} ${memorial.last_name ?? ""}`.trim()
      : `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim()
    : config.label;

  // Format dates
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return dateStr; }
  };

  const birthDate = formatDate(memorial?.date_of_birth);
  const deathDate = formatDate(memorial?.date_of_death);

  // ── Dynamic date display based on lifecycle config ──────────────
  let dateDisplay: string | null = null;
  if (config.mode === "memorial") {
    if (birthDate && deathDate) {
      dateDisplay = `${birthDate} \u2014 ${deathDate}`;
    } else if (birthDate) {
      dateDisplay = `${config.dateLabels.birth} ${birthDate}`;
    } else if (deathDate) {
      dateDisplay = `${config.dateLabels.death} ${deathDate}`;
    }
  } else {
    if (birthDate) {
      dateDisplay = `${config.dateLabels.birth} ${birthDate}`;
    }
  }

  // Bio text — use actual bio or a demo placeholder so profile looks full
  const bioText = memorial?.biography
    || (config.mode === "memorial"
      ? `${fullName} was a beloved member of the community whose warmth and kindness touched everyone around them. Their legacy of love, compassion, and strength continues to inspire all who knew them. This memorial is a place to celebrate their life, share memories, and keep their spirit alive.`
      : `${fullName} is celebrated for their incredible achievements and the joy they bring to everyone around them. This page honors their turning points, memories, and the moments that make them special.`);
  const isPlaceholderBio = !memorial?.biography;

  // Personality traits — context-aware defaults based on lifecycle mode
  const traits: string[] = Array.isArray(m?.personality_traits) ? m.personality_traits : [];
  const demoTraits = traits.length > 0
    ? traits
    : config.mode === "celebration"
      ? ["Joyful", "Celebrated", "Loved", "Cherished", "Special"]
      : ["Kind", "Compassionate", "Generous", "Warm-hearted", "Inspiring"];

  // Location info
  const birthPlace = m?.birth_place || null;
  const restingPlace = m?.resting_place || null;
  const occupation = m?.occupation || null;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ═══ CHILD 0: Full Profile Header (scrolls away) ═══ */}
        <View>
          {/* Cover Photo + Navigation */}
          <View className="relative h-48 bg-brand-900">
            {memorial?.cover_photo_url ? (
              <Image source={{ uri: memorial.cover_photo_url }} style={{ width: "100%", height: 192 }} contentFit="cover" />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image-outline" size={40} color="rgba(255,255,255,0.15)" />
              </View>
            )}
            <View className="absolute inset-0 bg-brand-900/50" />

            {/* Top nav */}
            <View className="absolute top-12 left-4 right-4 z-10 flex-row items-center justify-between">
              <Pressable onPress={goHome} className="h-9 w-9 items-center justify-center rounded-full bg-black/40">
                <Ionicons name="chevron-back" size={20} color="white" />
              </Pressable>
              <View className="flex-row gap-2">
                <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-black/40" onPress={() => setShareVisible(true)}>
                  <Ionicons name="share-outline" size={18} color="white" />
                </Pressable>
                <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-black/40" onPress={() => setMenuVisible(true)}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Profile photo — overlapping bottom, tappable */}
            <Pressable className="absolute -bottom-12 left-4 z-10" onPress={() => {
              if (memorial?.profile_photo_url) {
                setProfileImageVisible(true);
              } else if (user?.id && user.id === (memorial as any)?.created_by) {
                router.push(`/lifecycle/${id}/gallery` as any);
              }
            }}>
              <View className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-white dark:border-gray-900 bg-brand-700 items-center justify-center shadow-lg">
                {memorial?.profile_photo_url ? (
                  <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={40} color="white" />
                )}
              </View>
            </Pressable>
          </View>

          {/* Name + Follow */}
          <View className="px-4 pt-14 pb-1 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {fullName}
                </Text>
                {m?.is_claimed && (
                  <TrustLevelBadge level={3} levelName="Verified" isVerified compact />
                )}
              </View>
              {(occupation || birthPlace) && (
                <Text className="text-xs font-sans text-gray-500 mt-0.5">
                  {[occupation, birthPlace].filter(Boolean).join(" · ")}
                </Text>
              )}
              {dateDisplay && (
                <Text className="text-[11px] font-sans text-gray-500 dark:text-gray-400 mt-0.5">
                  {dateDisplay}
                </Text>
              )}
              <Text className="text-[11px] font-sans text-gray-400 mt-0.5">
                {memorial?.follower_count ?? 0} followers {"\u00B7"} {memorial?.tribute_count ?? 0} tributes
                {(() => {
                  const totalReactions = reactionData?.counts
                    ? Object.values(reactionData.counts).reduce((a, b) => a + b, 0)
                    : 0;
                  return totalReactions > 0 ? ` \u00B7 ${totalReactions} reactions` : "";
                })()}
                {(flowerWall as any)?.total_flowers > 0 ? ` \u00B7 ${(flowerWall as any).total_flowers} flowers` : ""}
              </Text>
              {/* Celebrity Badge */}
              {(memorial as any)?.is_celebrity && (
                <Pressable
                  className="flex-row items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full px-2.5 py-0.5 mt-1 self-start"
                  onPress={() => router.push(`/celebrity/${id}` as any)}
                >
                  <Ionicons name="star" size={10} color="#d97706" />
                  <Text className="text-[10px] font-sans-semibold text-yellow-700">Celebrity Profile →</Text>
                </Pressable>
              )}
            </View>
            <Pressable
              className={`rounded-full px-4 py-2 mt-0.5 ${isFollowing ? "bg-gray-200 dark:bg-gray-700" : "bg-brand-700"}`}
              onPress={handleToggleFollow}
              disabled={toggleFollow.isPending}
            >
              <Text className={`text-xs font-sans-semibold ${isFollowing ? "text-gray-700 dark:text-gray-200" : "text-white"}`}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>

          {/* Host / Maintainer — strategic placement right below name for credibility + easy DM */}
          <HostSection
            hosts={displayHosts}
            mode={config.mode}
            onPressHost={(userId) => router.push(`/user/${userId}` as any)}
            onMessageHost={handleMessageHost}
            currentUserId={user?.id}
            isCreatingDM={createDM.isPending}
          />

          {/* ── Bio Section — always visible, expandable ── */}
          <View className="px-4 pt-2 pb-1">
            <Text
              className={`text-sm font-sans leading-5 ${isPlaceholderBio ? "text-gray-400 dark:text-gray-500 italic" : "text-gray-700 dark:text-gray-300"}`}
              numberOfLines={bioExpanded ? undefined : 3}
            >
              {bioText}
            </Text>
            {bioText.length > 120 && (
              <Pressable onPress={() => setBioExpanded(!bioExpanded)} className="mt-1">
                <Text className="text-xs font-sans-semibold text-brand-700">
                  {bioExpanded ? "Show less" : "Read more"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* ── Personality Traits ── */}
          <View className="px-4 pt-2 pb-1">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-1.5">
                {demoTraits.map((trait, i) => (
                  <View key={i} className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1">
                    <Text className={`text-[10px] font-sans-medium ${traits.length > 0 ? "text-brand-700 dark:text-brand-400" : "text-gray-400 italic"}`}>
                      {trait}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* ── Key Details Row ── */}
          {(birthPlace || restingPlace) && (
            <View className="px-4 pt-2 pb-1 flex-row flex-wrap gap-x-4 gap-y-1">
              {birthPlace && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="location-outline" size={12} color="#9ca3af" />
                  <Text className="text-[11px] font-sans text-gray-500">{birthPlace}</Text>
                </View>
              )}
              {restingPlace && (
                <View className="flex-row items-center gap-1">
                  <Ionicons name="flower-outline" size={12} color="#9ca3af" />
                  <Text className="text-[11px] font-sans text-gray-500">{restingPlace}</Text>
                </View>
              )}
            </View>
          )}

          {/* Reaction Row — send love, candle, dove, etc. with counts */}
          <View className="px-4 pt-2 pb-1 relative">
            <AmbientReactions
              mode={config.mode}
              counts={reactionData?.counts}
              intervalMs={7000}
            />
            <ReactionBar
              mode={config.mode}
              memorialName={fullName}
              onReact={handleProfileReaction}
              counts={reactionData?.counts ?? {}}
              userReactions={reactionData?.userReactions ?? []}
              onGiftPress={() => router.push(`/gifts/memorial/${id}` as any)}
            />
          </View>

          {/* Quick Action Buttons — config-driven */}
          <View className="flex-row px-4 py-2 gap-2">
            {config.quickActions.map((qa) => (
              <Pressable
                key={qa.key}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-full ${qa.bgClass} py-2.5`}
                onPress={() => handleQuickAction(qa.action)}
              >
                <Ionicons name={qa.icon as any} size={15} color={qa.color} />
                <Text className={`text-xs font-sans-semibold ${qa.textClass}`}>{qa.label}</Text>
              </Pressable>
            ))}
            <Pressable className="flex-row items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2.5" onPress={() => setShareVisible(true)}>
              <Ionicons name="share-social-outline" size={15} color="#6b7280" />
            </Pressable>
          </View>

          {/* Stories Carousel */}
          {tributePages?.pages?.[0]?.data && tributePages.pages[0].data.length > 0 && (
            <StoriesCarousel
              tributes={(tributePages.pages[0].data as any[]).map((t: any) => ({
                id: t.id,
                author: {
                  display_name: t.author?.display_name ?? "User",
                  avatar_url: t.author?.avatar_url ?? null,
                },
              }))}
              onPressStory={(index) => router.push(`/stories?memorialId=${id}&startIndex=${index}` as any)}
              onPressAdd={() => navigateToTab("wall")}
              onPressSeeAll={() => router.push(`/stories?memorialId=${id}` as any)}
            />
          )}
        </View>

        {/* ═══ CHILD 1: Sticky Tab Bar ═══ */}
        <View
          className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row px-2">
              {config.tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  className={`flex-row items-center gap-1 px-3.5 py-2.5 ${
                    activeTab === tab.key ? "border-b-2 border-brand-700" : ""
                  }`}
                  onPress={() => navigateToTab(tab.key)}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={14}
                    color={activeTab === tab.key ? "#4A2D7A" : "#9ca3af"}
                  />
                  <Text
                    className={`text-xs font-sans-medium ${
                      activeTab === tab.key ? "text-brand-700" : "text-gray-500"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ═══ CHILD 2: Tab Content ═══ */}
        <View style={{ minHeight: windowHeight - 120 }}>
          <Slot />
        </View>
      </ScrollView>

      {/* === DROPDOWN MENU === */}
      {menuVisible && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}>
          <Pressable
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setMenuVisible(false)}
          />
          <View
            style={{
              position: "absolute",
              top: 90,
              right: 16,
              zIndex: 51,
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              borderRadius: 16,
              minWidth: 200,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 10,
              overflow: "hidden",
            }}
          >
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#f3f4f6" }}
              onPress={handleCopyLink}
            >
              <Ionicons name="link-outline" size={18} color={isDark ? "#d1d5db" : "#374151"} />
              <Text style={{ marginLeft: 12, fontSize: 14, color: isDark ? "#e5e7eb" : "#1f2937" }}>Copy Link</Text>
            </Pressable>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#f3f4f6" }}
              onPress={handleToggleTheme}
            >
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={isDark ? "#F59E0B" : "#374151"} />
              <Text style={{ marginLeft: 12, fontSize: 14, color: isDark ? "#e5e7eb" : "#1f2937" }}>{isDark ? "Light Mode" : "Dark Mode"}</Text>
            </Pressable>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? "#374151" : "#f3f4f6" }}
              onPress={() => { setMenuVisible(false); router.replace("/(tabs)" as any); }}
            >
              <Ionicons name="home-outline" size={18} color={isDark ? "#d1d5db" : "#374151"} />
              <Text style={{ marginLeft: 12, fontSize: 14, color: isDark ? "#e5e7eb" : "#1f2937" }}>Go Home</Text>
            </Pressable>
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 }}
              onPress={handleReport}
            >
              <Ionicons name="flag-outline" size={18} color="#EF4444" />
              <Text style={{ marginLeft: 12, fontSize: 14, color: "#EF4444" }}>Report</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Profile Image Full-Screen Viewer */}
      <Modal visible={profileImageVisible} transparent animationType="fade" onRequestClose={() => setProfileImageVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setProfileImageVisible(false)}
        >
          {/* Close button */}
          <Pressable
            style={{ position: "absolute", top: Platform.OS === "ios" ? 56 : 40, right: 20, zIndex: 10, height: 36, width: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}
            onPress={() => setProfileImageVisible(false)}
          >
            <Ionicons name="close" size={22} color="white" />
          </Pressable>

          {/* Full-size profile image */}
          {memorial?.profile_photo_url && (
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={{ width: 280, height: 280, borderRadius: 140, overflow: "hidden", borderWidth: 3, borderColor: "rgba(255,255,255,0.2)" }}>
                <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 280, height: 280 }} contentFit="cover" />
              </View>
              {/* Name label */}
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <Text className="text-white text-lg font-sans-bold">{fullName}</Text>
                {dateDisplay && (
                  <Text className="text-white/50 text-sm font-sans mt-1">{dateDisplay}</Text>
                )}
              </View>
              {/* Action buttons */}
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 20 }}>
                {user?.id && user.id === (memorial as any)?.created_by && (
                  <Pressable
                    style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                    onPress={() => { setProfileImageVisible(false); router.push(`/lifecycle/${id}/gallery` as any); }}
                  >
                    <Ionicons name="camera-outline" size={16} color="white" />
                    <Text className="text-white text-xs font-sans-semibold ml-1.5">Change Photo</Text>
                  </Pressable>
                )}
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 }}
                  onPress={() => { setProfileImageVisible(false); setShareVisible(true); }}
                >
                  <Ionicons name="share-outline" size={16} color="white" />
                  <Text className="text-white text-xs font-sans-semibold ml-1.5">Share</Text>
                </Pressable>
              </View>
            </Pressable>
          )}
        </Pressable>
      </Modal>

      {/* Share Sheet */}
      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        targetType="memorial"
        targetId={id ?? ""}
        title={shareCard?.ogTitle ?? `${fullName} \u2014 ${config.shareText}`}
        description={shareCard?.ogDescription}
        imageUrl={memorial?.profile_photo_url ?? null}
        onShare={async (platform: string) => {
          if (!id) return;
          await shareContent.mutateAsync({
            userId: user?.id,
            targetType: "memorial",
            targetId: id,
            title: shareCard?.ogTitle ?? fullName,
            message: shareCard?.ogDescription ?? `${config.shareMessage} ${fullName} on ǝterrn`,
            url: shareCard?.shareUrl ?? `https://eterrn.app/lifecycle/${id}`,
            platform,
          });
        }}
        onCopyLink={async () => {
          const url = shareCard?.shareUrl ?? `https://eterrn.app/lifecycle/${id}`;
          await Clipboard.setStringAsync(url);
        }}
      />
    </View>
  );
}
