import { View, ScrollView, Pressable, ActivityIndicator, Share, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemorial, useTributes, useAuth, useIsFollowing, useToggleFollow } from "@foreverr/core";
import { Text } from "@foreverr/ui";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function CelebrityProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: memorial, isLoading } = useMemorial(id);
  const { data: tributeData } = useTributes(id);
  const { data: isFollowing } = useIsFollowing(id, user?.id);
  const toggleFollow = useToggleFollow();
  const tributes = tributeData?.pages?.flatMap((p: any) => p.data ?? p) ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!memorial) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 px-6">
        <Ionicons name="star-outline" size={48} color="#d1d5db" />
        <Text className="text-sm font-sans text-gray-400 mt-3">Celebrity profile not found</Text>
      </View>
    );
  }

  const m = memorial as any;
  const fullName = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Celebrity";
  const tributeCount = tributes.length;
  const followerCount = m.follower_count ?? 0;
  const isPassed = !!m.death_date;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${fullName} — Celebrate their life and legacy on ǝterrn`,
        url: `https://eterrn.app/celebrity/${id}`,
      });
    } catch {}
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <View className="bg-gradient-to-b from-brand-900 to-brand-700 items-center pt-8 pb-6 px-4 bg-brand-700">
        {/* Avatar */}
        <View className="h-28 w-28 rounded-full bg-white/20 items-center justify-center mb-4 border-2 border-white/40">
          <Ionicons name="star" size={48} color="#fff" />
        </View>

        {/* Name + Verified */}
        <View className="flex-row items-center gap-2">
          <Text className="text-2xl font-sans-bold text-white">{fullName}</Text>
          {m.celebrity_verified && (
            <Ionicons name="checkmark-circle" size={22} color="#fbbf24" />
          )}
        </View>

        {/* Dates */}
        <Text className="text-sm font-sans text-white/70 mt-1">
          {formatDate(m.birth_date)}
          {isPassed ? ` — ${formatDate(m.death_date)}` : ""}
        </Text>

        {/* Celebrity Badge */}
        <View className="bg-yellow-400/20 rounded-full px-4 py-1 mt-3 flex-row items-center gap-1.5">
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text className="text-xs font-sans-semibold text-yellow-300">Celebrity Memorial</Text>
        </View>

        {/* Stats */}
        <View className="flex-row gap-8 mt-5">
          <View className="items-center">
            <Text className="text-xl font-sans-bold text-white">{formatCount(followerCount)}</Text>
            <Text className="text-[10px] font-sans text-white/60">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-sans-bold text-white">{formatCount(tributeCount)}</Text>
            <Text className="text-[10px] font-sans text-white/60">Tributes</Text>
          </View>
          <View className="items-center">
            <Text className="text-xl font-sans-bold text-white">{formatCount(m.candle_count ?? 0)}</Text>
            <Text className="text-[10px] font-sans text-white/60">Candles</Text>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mt-5 w-full">
          <Pressable
            className={`flex-1 rounded-xl py-3 items-center ${isFollowing ? "bg-white/20" : "bg-white"}`}
            onPress={() => user?.id && toggleFollow.mutate({ memorialId: id, userId: user.id, isFollowing: !!isFollowing })}
          >
            <Text className={`text-sm font-sans-semibold ${isFollowing ? "text-white" : "text-brand-700"}`}>
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
          <Pressable className="bg-white/20 rounded-xl py-3 px-5 items-center" onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color="#fff" />
          </Pressable>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-3 mx-4 mt-4">
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push(`/lifecycle/${id}` as any)}
        >
          <Ionicons name="book-outline" size={22} color="#4A2D7A" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Full Profile</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push(`/lifecycle/${id}/tributes` as any)}
        >
          <Ionicons name="heart-outline" size={22} color="#ec4899" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Tributes</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl py-4 items-center"
          onPress={() => router.push(`/lifecycle/${id}/timeline` as any)}
        >
          <Ionicons name="time-outline" size={22} color="#3b82f6" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white mt-1">Timeline</Text>
        </Pressable>
      </View>

      {/* Biography */}
      {(m.biography || m.description) && (
        <View className="bg-white dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">About</Text>
          <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 leading-5" numberOfLines={8}>
            {m.biography || m.description}
          </Text>
          <Pressable className="mt-2" onPress={() => router.push(`/lifecycle/${id}` as any)}>
            <Text className="text-xs font-sans-semibold text-brand-700">Read full biography →</Text>
          </Pressable>
        </View>
      )}

      {/* Cause of Legacy (for living celebrities) / Legacy (for passed) */}
      {m.cause_of_death && (
        <View className="bg-gray-50 dark:bg-gray-800 mx-4 mt-3 rounded-2xl p-4">
          <Text className="text-xs font-sans text-gray-500">
            {isPassed ? "Remembered for" : "Known for"}: {m.cause_of_death}
          </Text>
        </View>
      )}

      {/* Recent Tributes */}
      {tributes.length > 0 && (
        <View className="mx-4 mt-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Recent Tributes</Text>
            <Pressable onPress={() => router.push(`/lifecycle/${id}/tributes` as any)}>
              <Text className="text-xs font-sans-semibold text-brand-700">See All</Text>
            </Pressable>
          </View>
          {tributes.slice(0, 3).map((tribute: any) => (
            <View key={tribute.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-2">
              <Text className="text-xs font-sans text-gray-600 dark:text-gray-400" numberOfLines={3}>
                {tribute.content}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Ionicons name="person-circle-outline" size={14} color="#9ca3af" />
                <Text className="text-[10px] font-sans text-gray-400">
                  {tribute.author?.display_name ?? "Anonymous"}
                </Text>
                <Text className="text-[10px] font-sans text-gray-300">·</Text>
                <Text className="text-[10px] font-sans text-gray-400">
                  {new Date(tribute.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* View Full Lifecycle Profile CTA */}
      <Pressable
        className="bg-brand-700 mx-4 mt-4 rounded-2xl py-4 items-center flex-row justify-center gap-2"
        onPress={() => router.push(`/lifecycle/${id}` as any)}
      >
        <Ionicons name="sparkles" size={18} color="#fff" />
        <Text className="text-sm font-sans-bold text-white">View Full Lifecycle Profile</Text>
      </Pressable>

      {/* Honor Actions */}
      <View className="flex-row gap-3 mx-4 mt-3 mb-4">
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-xl py-3 items-center flex-row justify-center gap-1.5"
          onPress={() => router.push(`/honor-day?memorialId=${id}&memorialName=${encodeURIComponent(fullName)}` as any)}
        >
          <Ionicons name="sunny-outline" size={16} color="#0891b2" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">Honor a Day</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-white dark:bg-gray-800 rounded-xl py-3 items-center flex-row justify-center gap-1.5"
          onPress={() => router.push(`/gifts/memorial/${id}` as any)}
        >
          <Ionicons name="gift-outline" size={16} color="#ec4899" />
          <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">Send Gift</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
