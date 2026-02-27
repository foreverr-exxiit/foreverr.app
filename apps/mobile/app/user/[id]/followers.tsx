import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper, UserCard } from "@foreverr/ui";
import {
  useUserFollowers,
  useUserFollowing,
  useAuthStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

export default function FollowersScreen() {
  const router = useRouter();
  const { id: userId, tab } = useLocalSearchParams<{
    id: string;
    tab?: string;
  }>();
  const currentUser = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    (tab as "followers" | "following") || "followers"
  );

  const followers = useUserFollowers(activeTab === "followers" ? userId : undefined);
  const following = useUserFollowing(activeTab === "following" ? userId : undefined);

  const followersList = followers.data?.pages?.flatMap((p) => p.data) ?? [];
  const followingList = following.data?.pages?.flatMap((p) => p.data) ?? [];

  const data = activeTab === "followers" ? followersList : followingList;

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: activeTab === "followers" ? "Followers" : "Following",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Tab Toggle */}
      <View className="flex-row mx-4 mt-3 mb-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <TouchableOpacity
          onPress={() => setActiveTab("followers")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            activeTab === "followers" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-sm font-sans-medium ${
              activeTab === "followers"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500"
            }`}
          >
            Followers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("following")}
          className={`flex-1 py-2.5 rounded-lg items-center ${
            activeTab === "following" ? "bg-white dark:bg-gray-700 shadow-sm" : ""
          }`}
        >
          <Text
            className={`text-sm font-sans-medium ${
              activeTab === "following"
                ? "text-gray-900 dark:text-white"
                : "text-gray-500"
            }`}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-2"
        onEndReached={() => {
          if (activeTab === "followers" && followers.hasNextPage) followers.fetchNextPage();
          if (activeTab === "following" && following.hasNextPage) following.fetchNextPage();
        }}
        renderItem={({ item }) => {
          const profile = item.profile;
          if (!profile) return null;
          return (
            <UserCard
              userId={profile.id}
              username={profile.username}
              displayName={profile.display_name}
              avatarUrl={profile.avatar_url}
              bio={profile.bio}
              showFollowButton={profile.id !== currentUser?.id}
              onPress={() => router.push(`/user/${profile.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-500 font-sans mt-3">
              {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
