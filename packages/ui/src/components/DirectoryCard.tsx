import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface DirectoryCardProps {
  businessName: string;
  businessType: string;
  address: string;
  city: string;
  state?: string | null;
  coverImageUrl?: string | null;
  ratingAvg?: number;
  reviewCount?: number;
  priceRange?: string | null;
  isVerified?: boolean;
  isFeatured?: boolean;
  services?: string[];
  onPress?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  funeral_home: "Funeral Home",
  cemetery: "Cemetery",
  crematorium: "Crematorium",
  florist: "Florist",
  catering: "Catering",
  monument_maker: "Monuments",
  grief_counselor: "Grief Counselor",
  estate_planner: "Estate Planner",
  transport: "Transport",
  cleaning_service: "Cleaning",
  photographer: "Photographer",
  musician: "Musician",
  celebrant: "Celebrant",
  other: "Other",
};

export function DirectoryCard({
  businessName,
  businessType,
  address,
  city,
  state,
  coverImageUrl,
  ratingAvg = 0,
  reviewCount = 0,
  priceRange,
  isVerified,
  isFeatured,
  services = [],
  onPress,
}: DirectoryCardProps) {
  const typeLabel = TYPE_LABELS[businessType] ?? businessType;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-3"
    >
      {/* Cover image */}
      {coverImageUrl ? (
        <Image source={{ uri: coverImageUrl }} className="w-full h-36" resizeMode="cover" />
      ) : (
        <View className="w-full h-24 bg-gradient-to-r from-purple-100 to-purple-50 items-center justify-center">
          <Feather name="home" size={32} color="#7C3AED" />
        </View>
      )}

      {/* Featured badge */}
      {isFeatured && (
        <View className="absolute top-2 left-2 bg-yellow-400 rounded-full px-2 py-0.5 flex-row items-center gap-1">
          <Feather name="star" size={10} color="#92400E" />
          <Text className="text-xs font-bold text-yellow-900">Featured</Text>
        </View>
      )}

      <View className="p-3">
        {/* Name & verified */}
        <View className="flex-row items-center gap-1.5">
          <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {businessName}
          </Text>
          {isVerified && <Feather name="check-circle" size={16} color="#7C3AED" />}
        </View>

        {/* Type & price */}
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-xs text-purple-600 font-medium">{typeLabel}</Text>
          {priceRange && <Text className="text-xs text-gray-400">{priceRange}</Text>}
        </View>

        {/* Rating */}
        <View className="flex-row items-center gap-1 mt-1.5">
          <Feather name="star" size={12} color="#F59E0B" />
          <Text className="text-xs font-medium text-gray-700">
            {ratingAvg.toFixed(1)}
          </Text>
          <Text className="text-xs text-gray-400">({reviewCount} reviews)</Text>
        </View>

        {/* Location */}
        <View className="flex-row items-center gap-1 mt-1.5">
          <Feather name="map-pin" size={12} color="#9CA3AF" />
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {city}{state ? `, ${state}` : ""}
          </Text>
        </View>

        {/* Services preview */}
        {services.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {services.slice(0, 3).map((s, i) => (
              <View key={i} className="bg-gray-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-gray-600">{s}</Text>
              </View>
            ))}
            {services.length > 3 && (
              <Text className="text-xs text-gray-400 self-center">+{services.length - 3} more</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
