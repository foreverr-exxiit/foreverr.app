import React from "react";
import { View, ScrollView, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  Text,
  ScreenWrapper,
  FollowButton,
  BadgeDisplay,
  ProfileActivityTimeline,
} from "@foreverr/ui";
import {
  usePublicProfile,
  useIsFollowingUser,
  useToggleUserFollow,
  useUserActivities,
  useAuthStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const { data: profileData, isLoading } = usePublicProfile(userId);
  const { data: isFollowing } = useIsFollowingUser(currentUser?.id, userId);
  const toggleFollow = useToggleUserFollow();
  const activities = useUserActivities(userId);

  const isOwnProfile = currentUser?.id === userId;

  const handleToggleFollow = () => {
    if (!currentUser?.id || !userId) return;
    toggleFollow.mutate({
      followerId: currentUser.id,
      followingId: userId,
      isCurrentlyFollowing: !!isFollowing,
    });
  };

  const activityData = activities.data?.pages?.flatMap((p) => p.data) ?? [];
  const timelineActivities = activityData.map((a) => ({
    id: a.id,
    activityType: a.activity_type,
    description: `${a.activity_type.replace(/_/g, " ")}`,
    createdAt: a.created_at,
  }));

  if (isLoading || !profileData) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: "Profile",
            headerStyle: { backgroundColor: "#2D1B4E" },
            headerTintColor: "#fff",
          }}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass-outline" size={24} color="#7C3AED" />
          <Text className="text-gray-400 font-sans mt-2">Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const { profile, hostedMemorials, displayedBadges, tributeCount } = profileData;

  const badgesForDisplay = displayedBadges.map((b) => ({
    id: b.id,
    badgeType: b.badge_type,
    badgeTier: b.badge_tier,
    icon: b.definition?.icon ?? "ribbon",
    name: b.definition?.name ?? b.badge_type,
  }));

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: profile.display_name,
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="items-center pt-6 pb-4 px-4">
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} className="w-24 h-24 rounded-full mb-3" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-3">
              <Ionicons name="person" size={40} color="#7C3AED" />
            </View>
          )}
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
            {profile.display_name}
          </Text>
          <Text className="text-sm font-sans text-gray-500 dark:text-gray-400">
            @{profile.username}
          </Text>
          {profile.bio && (
            <Text className="text-sm font-sans text-gray-600 dark:text-gray-300 text-center mt-2 px-8">
              {profile.bio}
            </Text>
          )}
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-center px-4 mb-4 gap-6">
          <TouchableOpacity
            onPress={() => router.push(`/user/${userId}/followers?tab=followers`)}
            className="items-center"
          >
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {profile.follower_count}
            </Text>
            <Text className="text-xs font-sans text-gray-500">Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/user/${userId}/followers?tab=following`)}
            className="items-center"
          >
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {profile.following_count}
            </Text>
            <Text className="text-xs font-sans text-gray-500">Following</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {tributeCount}
            </Text>
            <Text className="text-xs font-sans text-gray-500">Tributes</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {hostedMemorials.length}
            </Text>
            <Text className="text-xs font-sans text-gray-500">Memorials</Text>
          </View>
        </View>

        {/* Follow Button */}
        {!isOwnProfile && (
          <View className="items-center mb-4">
            <FollowButton
              isFollowing={!!isFollowing}
              onPress={handleToggleFollow}
              loading={toggleFollow.isPending}
            />
          </View>
        )}

        {/* Badges */}
        {badgesForDisplay.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white px-4 mb-2">
              Badges
            </Text>
            <BadgeDisplay badges={badgesForDisplay} />
          </View>
        )}

        {/* Hosted Memorials */}
        {hostedMemorials.length > 0 && (
          <View className="mb-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white px-4 mb-2">
              Memorials
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {hostedMemorials.map((mem) => (
                <TouchableOpacity
                  key={mem.id}
                  onPress={() => router.push(`/memorial/${mem.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
                  style={{ width: 160 }}
                >
                  {mem.cover_image_url ? (
                    <Image
                      source={{ uri: mem.cover_image_url }}
                      className="w-full h-20"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-20 bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                      <Ionicons name="flower" size={24} color="#7C3AED" />
                    </View>
                  )}
                  <View className="p-2">
                    <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
                      {mem.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Activity Timeline */}
        <View className="px-4 mb-8">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            Recent Activity
          </Text>
          <ProfileActivityTimeline activities={timelineActivities.slice(0, 20)} />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
