import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface RelationshipTimelineCardProps {
  title: string;
  emoji: string;
  color: string;
  eventDate: string;
  description?: string | null;
  emotionalTag?: { emoji: string; label: string; color: string } | null;
  chapter?: number | null;
  partnerNames?: string | null;
  isPrivate?: boolean;
  onPress?: () => void;
}

export function RelationshipTimelineCard({
  title,
  emoji,
  color,
  eventDate,
  description,
  emotionalTag,
  chapter,
  partnerNames,
  isPrivate,
  onPress,
}: RelationshipTimelineCardProps) {
  return (
    <Pressable
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 mb-2"
      onPress={onPress}
    >
      <View className="flex-row items-start">
        {/* Event emoji */}
        <View
          className="h-10 w-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${color}15` }}
        >
          <Text className="text-lg">{emoji}</Text>
        </View>

        <View className="flex-1">
          {/* Title row */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white flex-1">
              {title}
            </Text>
            {isPrivate && (
              <Ionicons name="lock-closed" size={12} color="#9CA3AF" />
            )}
          </View>

          {/* Meta row */}
          <View className="flex-row items-center gap-2 mt-0.5">
            <Text className="text-xs font-sans text-gray-500">
              {new Date(eventDate).toLocaleDateString()}
            </Text>
            {chapter && (
              <View className="bg-brand-50 dark:bg-brand-900/20 px-1.5 py-0.5 rounded">
                <Text className="text-[10px] font-sans-bold text-brand-600">Ch. {chapter}</Text>
              </View>
            )}
          </View>

          {/* Partner names */}
          {partnerNames && (
            <Text className="text-xs font-sans text-gray-400 mt-0.5">{partnerNames}</Text>
          )}

          {/* Description */}
          {description && (
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}

          {/* Emotional tag */}
          {emotionalTag && (
            <View className="flex-row mt-2">
              <View
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${emotionalTag.color}15` }}
              >
                <Text className="text-[10px] font-sans-medium" style={{ color: emotionalTag.color }}>
                  {emotionalTag.emoji} {emotionalTag.label}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
