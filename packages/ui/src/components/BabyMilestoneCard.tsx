import { View, Image, Pressable } from "react-native";
import { Text } from "../primitives/Text";

interface BabyMilestoneCardProps {
  title: string;
  emoji?: string | null;
  stage: string;
  stageColor: string;
  milestoneDate?: string | null;
  ageAtMilestone?: string | null;
  photoUrl?: string | null;
  description?: string | null;
  onPress?: () => void;
}

export function BabyMilestoneCard({
  title,
  emoji,
  stage,
  stageColor,
  milestoneDate,
  ageAtMilestone,
  photoUrl,
  description,
  onPress,
}: BabyMilestoneCardProps) {
  return (
    <Pressable
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 mb-2"
      onPress={onPress}
    >
      <View className="flex-row items-start">
        {/* Emoji / photo */}
        <View className="mr-3">
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} className="h-12 w-12 rounded-lg" />
          ) : (
            <View
              className="h-12 w-12 rounded-lg items-center justify-center"
              style={{ backgroundColor: `${stageColor}15` }}
            >
              <Text className="text-xl">{emoji ?? "⭐"}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
            {title}
          </Text>
          <View className="flex-row items-center gap-2 mt-0.5">
            {ageAtMilestone && (
              <Text className="text-xs font-sans text-gray-500">{ageAtMilestone}</Text>
            )}
            {milestoneDate && (
              <Text className="text-xs font-sans text-gray-400">
                {new Date(milestoneDate).toLocaleDateString()}
              </Text>
            )}
          </View>
          {description && (
            <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-1" numberOfLines={2}>
              {description}
            </Text>
          )}
        </View>

        {/* Stage tag */}
        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stageColor}15` }}>
          <Text className="text-[10px] font-sans-medium" style={{ color: stageColor }}>
            {stage}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
