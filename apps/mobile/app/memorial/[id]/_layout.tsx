import { View, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Slot } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemorial, useIsFollowing, useToggleFollow, useAuth } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const TABS = [
  { key: "index", label: "Biography" },
  { key: "events", label: "Event" },
  { key: "obituary", label: "Support" },
  { key: "wall", label: "Sympathy Wall" },
] as const;

export default function MemorialDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("index");

  const { data: memorial, isLoading } = useMemorial(id);
  const { data: isFollowing } = useIsFollowing(id, user?.id);
  const toggleFollow = useToggleFollow();

  const handleToggleFollow = () => {
    if (!id || !user?.id) return;
    toggleFollow.mutate({ memorialId: id, userId: user.id, isFollowing: !!isFollowing });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  const fullName = memorial ? `${memorial.first_name} ${memorial.last_name}` : "Memorial";

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Cover Photo + Header */}
      <View className="relative h-56 bg-brand-900">
        {memorial?.cover_photo_url ? (
          <Image source={{ uri: memorial.cover_photo_url }} style={{ width: "100%", height: 224 }} contentFit="cover" />
        ) : null}
        <View className="absolute inset-0 bg-brand-900/70" />

        {/* Top nav */}
        <View className="absolute top-14 left-4 right-4 z-10 flex-row items-center justify-between">
          <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center rounded-full bg-black/30">
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>
          <View className="flex-row gap-3">
            <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-black/30">
              <Ionicons name="share-outline" size={20} color="white" />
            </Pressable>
            <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-black/30">
              <Ionicons name="ellipsis-horizontal" size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Profile photo overlapping */}
        <View className="absolute -bottom-12 left-4 z-10">
          <View className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-brand-700 items-center justify-center">
            {memorial?.profile_photo_url ? (
              <Image source={{ uri: memorial.profile_photo_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <Ionicons name="person" size={44} color="white" />
            )}
          </View>
        </View>
      </View>

      {/* Name + Follow */}
      <View className="px-4 pt-14 pb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
            {fullName}
          </Text>
          <Text className="text-xs font-sans text-gray-500">
            {memorial?.follower_count ?? 0} followers · {memorial?.tribute_count ?? 0} tributes
          </Text>
        </View>
        <Pressable
          className={`rounded-full px-5 py-2 ${isFollowing ? "bg-gray-200" : "bg-brand-700"}`}
          onPress={handleToggleFollow}
          disabled={toggleFollow.isPending}
        >
          <Text className={`text-sm font-sans-semibold ${isFollowing ? "text-gray-700" : "text-white"}`}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-100">
        <View className="flex-row px-2">
          {TABS.map((tab) => (
            <Pressable
              key={tab.key}
              className={`px-4 py-3 ${
                activeTab === tab.key ? "border-b-2 border-brand-700" : ""
              }`}
              onPress={() => setActiveTab(tab.key)}
            >
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
    </View>
  );
}
