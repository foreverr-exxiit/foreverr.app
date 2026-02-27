import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SellerCardProps {
  businessName?: string | null;
  userName: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  ratingAvg?: number;
  ratingCount?: number;
  totalSales?: number;
  responseTimeHours?: number | null;
  onPress?: () => void;
}

export function SellerCard({
  businessName,
  userName,
  avatarUrl,
  isVerified,
  ratingAvg = 0,
  ratingCount = 0,
  totalSales = 0,
  responseTimeHours,
  onPress,
}: SellerCardProps) {
  const displayName = businessName || userName;

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Feather
          key={i}
          name="star"
          size={12}
          color={i <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="w-12 h-12 rounded-full" />
        ) : (
          <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center">
            <Feather name="user" size={20} color="#7C3AED" />
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {displayName}
            </Text>
            {isVerified && (
              <Feather name="check-circle" size={14} color="#7C3AED" />
            )}
          </View>

          {/* Stars */}
          <View className="flex-row items-center gap-1 mt-0.5">
            <View className="flex-row">{renderStars(ratingAvg)}</View>
            <Text className="text-xs text-gray-500">
              {ratingAvg.toFixed(1)} ({ratingCount})
            </Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 gap-4">
        <View className="items-center flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{totalSales}</Text>
          <Text className="text-xs text-gray-500">Sales</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            {responseTimeHours ? `${responseTimeHours}h` : "N/A"}
          </Text>
          <Text className="text-xs text-gray-500">Response</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">{ratingCount}</Text>
          <Text className="text-xs text-gray-500">Reviews</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
