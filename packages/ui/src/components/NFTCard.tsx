import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface NFTCardProps {
  title: string;
  mediaUrl: string;
  creatorName: string;
  creatorAvatar?: string | null;
  priceCents?: number;
  editionNumber?: number;
  totalEditions?: number;
  status?: string;
  chain?: string;
  onPress?: () => void;
}

export function NFTCard({
  title,
  mediaUrl,
  creatorName,
  creatorAvatar,
  priceCents = 0,
  editionNumber = 1,
  totalEditions = 1,
  status = "minted",
  chain = "polygon",
  onPress,
}: NFTCardProps) {
  const formattedPrice = priceCents > 0
    ? `$${(priceCents / 100).toFixed(2)}`
    : "Not for sale";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-3"
    >
      {/* Image */}
      <View className="relative">
        <Image source={{ uri: mediaUrl }} className="w-full h-48" resizeMode="cover" />

        {/* Chain badge */}
        <View className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-0.5 flex-row items-center gap-1">
          <Feather name="hexagon" size={10} color="#8B5CF6" />
          <Text className="text-xs text-white font-medium capitalize">{chain}</Text>
        </View>

        {/* Status badge */}
        {status === "listed" && (
          <View className="absolute top-2 right-2 bg-green-500 rounded-full px-2 py-0.5">
            <Text className="text-xs text-white font-medium">For Sale</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white" numberOfLines={1}>{title}</Text>

        <View className="flex-row items-center justify-between mt-2">
          {/* Creator */}
          <View className="flex-row items-center gap-1.5">
            {creatorAvatar ? (
              <Image source={{ uri: creatorAvatar }} className="w-5 h-5 rounded-full" />
            ) : (
              <View className="w-5 h-5 rounded-full bg-purple-100 items-center justify-center">
                <Feather name="user" size={10} color="#7C3AED" />
              </View>
            )}
            <Text className="text-xs text-gray-500">{creatorName}</Text>
          </View>

          {/* Edition */}
          <Text className="text-xs text-gray-400">
            #{editionNumber}/{totalEditions}
          </Text>
        </View>

        {/* Price */}
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-xs text-gray-500">Price</Text>
          <Text className="text-sm font-bold text-purple-600">{formattedPrice}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
