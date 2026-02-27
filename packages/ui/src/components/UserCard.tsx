import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UserCardProps {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  isFollowing?: boolean;
  onPress?: () => void;
  onFollowPress?: () => void;
  followLoading?: boolean;
  showFollowButton?: boolean;
}

export function UserCard({
  username,
  displayName,
  avatarUrl,
  bio,
  isFollowing,
  onPress,
  onFollowPress,
  followLoading,
  showFollowButton = true,
}: UserCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700 flex-row items-center"
    >
      {/* Avatar */}
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-12 h-12 rounded-full"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          <Ionicons name="person" size={22} color="#7C3AED" />
        </View>
      )}

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
          {displayName}
        </Text>
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400" numberOfLines={1}>
          @{username}
        </Text>
        {bio ? (
          <Text className="text-xs font-sans text-gray-400 mt-0.5" numberOfLines={1}>
            {bio}
          </Text>
        ) : null}
      </View>

      {/* Follow Button */}
      {showFollowButton && onFollowPress && (
        <Pressable
          onPress={onFollowPress}
          disabled={followLoading}
          className={`rounded-full px-4 py-2 ml-2 ${
            isFollowing
              ? "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              : "bg-brand-700"
          }`}
        >
          <Text
            className={`text-xs font-sans-medium ${
              isFollowing
                ? "text-gray-700 dark:text-gray-300"
                : "text-white"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}
