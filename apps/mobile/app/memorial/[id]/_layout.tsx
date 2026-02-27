import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, usePathname, Slot } from "expo-router";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemorial, useIsFollowing, useToggleFollow, useAuth, useRequireAuth, useShareContent, useGenerateShareCard, useFlowerWall } from "@foreverr/core";
import { Text, ShareSheet, TrustLevelBadge } from "@foreverr/ui";
import * as Clipboard from "expo-clipboard";

const TABS = [
  { key: "index", label: "Biography", icon: "book-outline" as const },
  { key: "timeline", label: "Timeline", icon: "time-outline" as const },
  { key: "gallery", label: "Gallery", icon: "images-outline" as const },
  { key: "events", label: "Events", icon: "calendar-outline" as const },
  { key: "ai-obituary", label: "AI Obit", icon: "sparkles-outline" as const },
  { key: "obituary", label: "Support", icon: "heart-outline" as const },
  { key: "wall", label: "Wall", icon: "chatbubbles-outline" as const },
  { key: "fundraiser", label: "Fundraiser", icon: "heart-outline" as const },
] as const;

export default function MemorialDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const pathname = usePathname();

  // Derive active tab from the current route pathname
  const activeTab = useMemo(() => {
    // pathname is like /memorial/abc123 or /memorial/abc123/gallery
    const segments = pathname.split("/").filter(Boolean);
    // segments: ["memorial", "abc123"] or ["memorial", "abc123", "gallery"]
    const lastSegment = segments[segments.length - 1];
    // If the last segment matches the id, we're on the index tab
    if (lastSegment === id || segments.length <= 2) return "index";
    return lastSegment;
  }, [pathname, id]);

  const navigateToTab = (tabKey: string) => {
    if (tabKey === "index") {
      router.replace(`/memorial/${id}` as any);
    } else {
      router.replace(`/memorial/${id}/${tabKey}` as any);
    }
  };

  const [shareVisible, setShareVisible] = useState(false);

  const { data: memorial, isLoading } = useMemorial(id);
  const { data: isFollowing } = useIsFollowing(id, user?.id);
  const toggleFollow = useToggleFollow();
  const shareContent = useShareContent();
  const { data: shareCard } = useGenerateShareCard("memorial", id);
  const { data: flowerWall } = useFlowerWall("memorial", id);

  const handleToggleFollow = () => {
    requireAuth(() => {
      if (!id || !user?.id) return;
      toggleFollow.mutate({ memorialId: id, userId: user.id, isFollowing: !!isFollowing });
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  const fullName = memorial ? `${memorial.first_name} ${memorial.last_name}` : "Memorial";

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
  const dateDisplay = birthDate && deathDate ? `${birthDate} — ${deathDate}` : birthDate ? `Born ${birthDate}` : deathDate ? `Passed ${deathDate}` : null;

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Cover Photo + Header */}
      <View className="relative h-56 bg-brand-900">
        {memorial?.cover_photo_url ? (
          <Image source={{ uri: memorial.cover_photo_url }} style={{ width: "100%", height: 224 }} contentFit="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="image-outline" size={48} color="rgba(255,255,255,0.2)" />
          </View>
        )}
        <View className="absolute inset-0 bg-brand-900/60" />

        {/* Top nav */}
        <View className="absolute top-14 left-4 right-4 z-10 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>
          <View className="flex-row gap-3">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/40" onPress={() => setShareVisible(true)}>
              <Ionicons name="share-outline" size={20} color="white" />
            </Pressable>
            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-black/40">
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Profile photo overlapping */}
        <View className="absolute -bottom-14 left-4 z-10">
          <View className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-brand-700 items-center justify-center shadow-lg">
            {memorial?.profile_photo_url ? (
              <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 112, height: 112 }} contentFit="cover" />
            ) : (
              <Ionicons name="person" size={48} color="white" />
            )}
          </View>
        </View>
      </View>

      {/* Name + Follow + Dates */}
      <View className="px-4 pt-16 pb-1 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              {fullName}
            </Text>
            {(memorial as any)?.is_claimed && (
              <TrustLevelBadge level={3} levelName="Verified" isVerified compact />
            )}
          </View>
          {dateDisplay && (
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-0.5">
              {dateDisplay}
            </Text>
          )}
          <Text className="text-xs font-sans text-gray-500 mt-1">
            {memorial?.follower_count ?? 0} followers · {memorial?.tribute_count ?? 0} tributes
            {(flowerWall as any)?.total_flowers > 0 ? ` · ${(flowerWall as any).total_flowers} flowers` : ""}
          </Text>
        </View>
        <Pressable
          className={`rounded-full px-5 py-2.5 mt-1 ${isFollowing ? "bg-gray-200 dark:bg-gray-700" : "bg-brand-700"}`}
          onPress={handleToggleFollow}
          disabled={toggleFollow.isPending}
        >
          <Text className={`text-sm font-sans-semibold ${isFollowing ? "text-gray-700 dark:text-gray-200" : "text-white"}`}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      </View>

      {/* Quick Action Buttons */}
      <View className="flex-row px-4 py-3 gap-2">
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 py-2.5"
          onPress={() => navigateToTab("wall")}
        >
          <Ionicons name="chatbubble-outline" size={16} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-brand-700">Tribute</Text>
        </Pressable>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 py-2.5"
          onPress={() => requireAuth(() => router.push("/donate"))}
        >
          <Ionicons name="flame" size={16} color="#d97706" />
          <Text className="text-xs font-sans-semibold text-amber-700">Candle</Text>
        </Pressable>
        <Pressable
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 py-2.5"
          onPress={() => requireAuth(() => router.push(`/gifts/memorial/${id}` as any))}
        >
          <Ionicons name="flower" size={16} color="#ec4899" />
          <Text className="text-xs font-sans-semibold text-rose-700">Flowers</Text>
        </Pressable>
        <Pressable className="flex-row items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-2.5" onPress={() => setShareVisible(true)}>
          <Ionicons name="share-social-outline" size={16} color="#6b7280" />
        </Pressable>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row px-2">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              className={`flex-row items-center gap-1.5 px-4 py-3 ${
                activeTab === tab.key ? "border-b-2 border-brand-700" : ""
              }`}
              onPress={() => navigateToTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={activeTab === tab.key ? "#4A2D7A" : "#9ca3af"}
              />
              <Text
                className={`text-sm font-sans-medium ${
                  activeTab === tab.key ? "text-brand-700" : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Content */}
      <Slot />

      {/* Share Sheet */}
      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        targetType="memorial"
        targetId={id ?? ""}
        title={shareCard?.ogTitle ?? `${fullName} — Memorial on Foreverr`}
        description={shareCard?.ogDescription}
        imageUrl={memorial?.profile_photo_url ?? null}
        onShare={async (platform: string) => {
          if (!id) return;
          await shareContent.mutateAsync({
            userId: user?.id,
            targetType: "memorial",
            targetId: id,
            title: shareCard?.ogTitle ?? fullName,
            message: shareCard?.ogDescription ?? `Remember ${fullName} on Foreverr`,
            url: shareCard?.shareUrl ?? `https://foreverr.app/memorial/${id}`,
            platform,
          });
        }}
        onCopyLink={async () => {
          const url = shareCard?.shareUrl ?? `https://foreverr.app/memorial/${id}`;
          await Clipboard.setStringAsync(url);
        }}
      />
    </View>
  );
}
