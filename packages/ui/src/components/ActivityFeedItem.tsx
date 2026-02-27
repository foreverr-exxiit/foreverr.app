import React from "react";
import { View, Image, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ACTIVITY_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  tribute_posted: { icon: "heart", label: "posted a tribute", color: "#DC2626" },
  memorial_followed: { icon: "bookmark", label: "followed a memorial", color: "#7C3AED" },
  candle_lit: { icon: "flame", label: "lit a candle", color: "#D97706" },
  comment_posted: { icon: "chatbubble", label: "posted a comment", color: "#2563EB" },
  reaction_given: { icon: "happy", label: "sent a reaction", color: "#EC4899" },
  streak_achieved: { icon: "trophy", label: "achieved a streak", color: "#059669" },
  badge_earned: { icon: "ribbon", label: "earned a badge", color: "#8B5CF6" },
  vault_item_added: { icon: "archive", label: "added to vault", color: "#0891B2" },
  capsule_created: { icon: "time", label: "created a time capsule", color: "#D97706" },
  photo_uploaded: { icon: "image", label: "uploaded a photo", color: "#059669" },
  event_created: { icon: "calendar", label: "created an event", color: "#2563EB" },
  donation_made: { icon: "gift", label: "made a donation", color: "#DC2626" },
  nft_minted: { icon: "diamond", label: "minted an NFT", color: "#8B5CF6" },
  live_room_created: { icon: "videocam", label: "started a live room", color: "#DC2626" },
  scrapbook_published: { icon: "book", label: "published a scrapbook page", color: "#D97706" },
  user_followed: { icon: "person-add", label: "followed someone", color: "#7C3AED" },
};

interface ActivityFeedItemProps {
  activityType: string;
  userName: string;
  userAvatarUrl?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
  onPress?: () => void;
  onUserPress?: () => void;
}

export function ActivityFeedItem({
  activityType,
  userName,
  userAvatarUrl,
  createdAt,
  metadata,
  onPress,
  onUserPress,
}: ActivityFeedItemProps) {
  const config = ACTIVITY_CONFIG[activityType] ?? {
    icon: "ellipse",
    label: activityType.replace(/_/g, " "),
    color: "#6B7280",
  };

  const timeAgo = getTimeAgo(createdAt);
  const targetName = (metadata as any)?.targetName as string | undefined;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700 flex-row"
    >
      {/* Avatar */}
      <Pressable onPress={onUserPress}>
        {userAvatarUrl ? (
          <Image source={{ uri: userAvatarUrl }} className="w-10 h-10 rounded-full" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
            <Ionicons name="person" size={18} color="#7C3AED" />
          </View>
        )}
      </Pressable>

      {/* Content */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center flex-wrap">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
            {userName}
          </Text>
          <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 ml-1">
            {config.label}
          </Text>
        </View>
        {targetName && (
          <Text className="text-xs font-sans text-gray-400 mt-0.5" numberOfLines={1}>
            {targetName}
          </Text>
        )}
        <Text className="text-xs font-sans text-gray-400 mt-1">{timeAgo}</Text>
      </View>

      {/* Activity Icon */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center"
        style={{ backgroundColor: `${config.color}15` }}
      >
        <Ionicons name={config.icon as any} size={16} color={config.color} />
      </View>
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
