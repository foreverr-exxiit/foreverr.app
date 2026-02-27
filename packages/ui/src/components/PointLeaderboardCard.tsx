import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const RANK_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "#FEF3C7", text: "#B45309", border: "#F59E0B" },
  2: { bg: "#F3F4F6", text: "#6B7280", border: "#C0C0C0" },
  3: { bg: "#FFF7ED", text: "#C2410C", border: "#CD7F32" },
};

interface PointLeaderboardCardProps {
  rank: number;
  userName: string;
  userAvatar: string | null;
  totalPoints: number;
  levelName: string;
}

export function PointLeaderboardCard({
  rank,
  userName,
  userAvatar,
  totalPoints,
  levelName,
}: PointLeaderboardCardProps) {
  const isTopThree = rank <= 3;
  const rankStyle = RANK_COLORS[rank];

  return (
    <View className="flex-row items-center bg-white dark:bg-gray-800 rounded-xl p-3 mb-2 border border-gray-100 dark:border-gray-700">
      {/* Rank Badge */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: isTopThree ? rankStyle?.bg : "#F3F4F6",
          borderWidth: isTopThree ? 1.5 : 1,
          borderColor: isTopThree ? rankStyle?.border : "#E5E7EB",
        }}
      >
        {isTopThree ? (
          <Text
            className="text-xs font-sans-bold"
            style={{ color: rankStyle?.text }}
          >
            {rank}
          </Text>
        ) : (
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400">
            {rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      {userAvatar ? (
        <Image
          source={{ uri: userAvatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
      ) : (
        <View className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mr-3">
          <Ionicons name="person" size={18} color="#7C3AED" />
        </View>
      )}

      {/* Name & Level */}
      <View className="flex-1">
        <Text
          className="text-sm font-sans-semibold text-gray-900 dark:text-white"
          numberOfLines={1}
        >
          {userName}
        </Text>
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
          {levelName}
        </Text>
      </View>

      {/* Points */}
      <View className="items-end">
        <Text className="text-sm font-sans-bold text-brand-600 dark:text-brand-400">
          {totalPoints.toLocaleString()}
        </Text>
        <Text className="text-[10px] font-sans text-gray-400">pts</Text>
      </View>
    </View>
  );
}
