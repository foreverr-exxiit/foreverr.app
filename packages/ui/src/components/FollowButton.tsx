import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { mediumTap } from "@foreverr/core";

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
  loading?: boolean;
  compact?: boolean;
}

export function FollowButton({
  isFollowing,
  onPress,
  loading,
  compact,
}: FollowButtonProps) {
  const handlePress = () => {
    mediumTap();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={loading}
      className={`rounded-full items-center justify-center flex-row ${
        compact ? "px-3 py-1.5" : "px-5 py-2.5"
      } ${
        isFollowing
          ? "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
          : "bg-brand-700"
      }`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? "#6B7280" : "#fff"} />
      ) : (
        <Text
          className={`font-sans-medium ${compact ? "text-xs" : "text-sm"} ${
            isFollowing
              ? "text-gray-700 dark:text-gray-300"
              : "text-white"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
    </Pressable>
  );
}
