import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ListingCardProps {
  title: string;
  priceCents: number;
  currency?: string;
  images: string[];
  location?: string | null;
  sellerName: string;
  sellerAvatar?: string | null;
  isService?: boolean;
  condition?: string | null;
  isSaved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
}

export function ListingCard({
  title,
  priceCents,
  currency = "usd",
  images,
  location,
  sellerName,
  sellerAvatar,
  isService,
  condition,
  isSaved,
  onPress,
  onSave,
}: ListingCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 mb-3"
    >
      {/* Image */}
      <View className="relative">
        {images.length > 0 ? (
          <Image
            source={{ uri: images[0] }}
            className="w-full h-48"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-48 bg-gray-100 dark:bg-gray-700 items-center justify-center">
            <Feather name={isService ? "tool" : "package"} size={40} color="#9CA3AF" />
          </View>
        )}

        {/* Save button */}
        {onSave && (
          <TouchableOpacity
            onPress={onSave}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm"
          >
            <Feather
              name="heart"
              size={18}
              color={isSaved ? "#EF4444" : "#6B7280"}
              fill={isSaved ? "#EF4444" : "none"}
            />
          </TouchableOpacity>
        )}

        {/* Badges */}
        <View className="absolute bottom-2 left-2 flex-row gap-1">
          {isService && (
            <View className="bg-purple-600 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-medium">Service</Text>
            </View>
          )}
          {condition && condition !== "new" && (
            <View className="bg-gray-700 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-medium capitalize">
                {condition.replace("_", " ")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-lg font-bold text-gray-900 dark:text-white" numberOfLines={1}>
          {formattedPrice}
        </Text>
        <Text className="text-sm text-gray-700 dark:text-gray-300 mt-0.5" numberOfLines={2}>
          {title}
        </Text>

        {/* Seller & Location */}
        <View className="flex-row items-center mt-2 gap-2">
          {sellerAvatar ? (
            <Image source={{ uri: sellerAvatar }} className="w-5 h-5 rounded-full" />
          ) : (
            <View className="w-5 h-5 rounded-full bg-purple-100 items-center justify-center">
              <Feather name="user" size={10} color="#7C3AED" />
            </View>
          )}
          <Text className="text-xs text-gray-500 flex-1" numberOfLines={1}>
            {sellerName}
          </Text>
          {location && (
            <View className="flex-row items-center gap-0.5">
              <Feather name="map-pin" size={10} color="#9CA3AF" />
              <Text className="text-xs text-gray-400" numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
