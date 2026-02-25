import { View, ScrollView, RefreshControl, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useTopMemorials, useFollowedMemorials } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const FILTER_CHIPS = ["Home", "Discovery", "News", "Highlights"] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [activeChip, setActiveChip] = useState<string>("Home");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: topMemorials, isLoading: topLoading, refetch: refetchTop } = useTopMemorials(10);
  const { data: followedMemorials, isLoading: followedLoading, refetch: refetchFollowed } = useFollowedMemorials(user?.id);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTop(), refetchFollowed()]);
    setRefreshing(false);
  }, [refetchTop, refetchFollowed]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white px-4 pb-3 pt-14 dark:bg-gray-900">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100">
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={{ width: 40, height: 40 }} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={20} color="#4A2D7A" />
              )}
            </View>
            <View className="ml-3">
              <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
                Hi, {profile?.display_name?.split(" ")[0] ?? "there"}
              </Text>
              <Text className="text-xs font-sans text-gray-500">Welcome</Text>
            </View>
          </View>
          <Pressable>
            <Ionicons name="menu" size={28} color="#374151" />
          </Pressable>
        </View>

        {/* Search Bar + Donate */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
            <Ionicons name="search" size={18} color="#9ca3af" />
            <TextInput
              className="ml-2 flex-1 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="Search items"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) router.push(`/(tabs)/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }}
            />
          </View>
          <Pressable className="rounded-full bg-brand-700 px-5 py-2.5">
            <Text className="text-sm font-sans-semibold text-white">Donate</Text>
          </Pressable>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2">
            {FILTER_CHIPS.map((chip) => (
              <Pressable
                key={chip}
                className={`rounded-full px-4 py-1.5 border ${
                  activeChip === chip
                    ? "border-brand-700 bg-brand-700"
                    : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
                }`}
                onPress={() => setActiveChip(chip)}
              >
                <Text
                  className={`text-xs font-sans-medium ${
                    activeChip === chip ? "text-white" : "text-gray-600 dark:text-gray-300"
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
        {/* Top Search Memorial */}
        <View className="px-4 pt-4">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            Top Search Memorial
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
                            <Ionicons name="person" size={40} color="#b89def" />
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

        {/* All Memorial (followed) */}
        <View className="px-4 pt-6 pb-8">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-3">
            All Memorial
          </Text>
          {followedLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (followedMemorials ?? []).length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="flower-outline" size={48} color="#b89def" />
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
                        <Ionicons name="person" size={36} color="#b89def" />
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
          )}
        </View>
      </ScrollView>
    </View>
  );
}
