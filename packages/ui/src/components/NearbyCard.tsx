import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Text } from "../primitives/Text";

export interface NearbyCardProps {
  type: "event" | "marketplace" | "directory";
  title: string;
  subtitle: string;
  distanceKm: number;
  imageUrl?: string | null;
  accentColor: string;
  iconName: string;
  onPress?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  event: "Event",
  marketplace: "Sale",
  directory: "Business",
};

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

export function NearbyCard({
  type,
  title,
  subtitle,
  distanceKm,
  imageUrl,
  accentColor,
  iconName,
  onPress,
}: NearbyCardProps) {
  return (
    <Pressable
      className="w-44 rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm"
      onPress={onPress}
    >
      {/* Image or icon header */}
      <View className="h-24 items-center justify-center" style={{ backgroundColor: `${accentColor}12` }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: "100%", height: 96 }} contentFit="cover" />
        ) : (
          <View
            className="h-14 w-14 rounded-full items-center justify-center"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Ionicons name={iconName as any} size={28} color={accentColor} />
          </View>
        )}
        {/* Type badge */}
        <View
          className="absolute top-2 left-2 rounded-full px-2.5 py-1"
          style={{ backgroundColor: accentColor }}
        >
          <Text className="text-[10px] font-sans-bold text-white">
            {TYPE_LABELS[type] ?? type}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-3 py-2.5">
        <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
        {/* Distance */}
        <View className="flex-row items-center mt-1.5 gap-1">
          <Ionicons name="location-outline" size={12} color={accentColor} />
          <Text className="text-[11px] font-sans-semibold" style={{ color: accentColor }}>
            {formatDistance(distanceKm)} away
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
