import { View, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface FeatureGateModalProps {
  visible: boolean;
  onClose: () => void;
  featureLabel: string;
  featureIcon?: string | null;
  requiredLevel: number;
  currentLevel: number;
  pointsNeeded: number;
  onViewProgress?: () => void;
}

const LEVEL_INFO: Record<number, { name: string; icon: string; color: string }> = {
  1: { name: "Seedling", icon: "🌱", color: "#8BC34A" },
  2: { name: "Sprout",   icon: "🌿", color: "#4CAF50" },
  3: { name: "Bloom",    icon: "🌸", color: "#E91E63" },
  4: { name: "Tree",     icon: "🌳", color: "#795548" },
  5: { name: "Grove",    icon: "🌲", color: "#2E7D32" },
  6: { name: "Forest",   icon: "🏔️", color: "#1B5E20" },
  7: { name: "Eternal",  icon: "✨", color: "#FFD700" },
};

const EARN_TIPS = [
  { label: "Create a page",      points: 50, icon: "add-circle" as const },
  { label: "Write a tribute",    points: 20, icon: "heart" as const },
  { label: "Complete a quest",   points: 25, icon: "trophy" as const },
  { label: "Upload photos",      points: 10, icon: "camera" as const },
  { label: "Invite a friend",    points: 15, icon: "person-add" as const },
  { label: "Daily login",        points: 5,  icon: "calendar" as const },
];

export function FeatureGateModal({
  visible,
  onClose,
  featureLabel,
  featureIcon,
  requiredLevel,
  currentLevel,
  pointsNeeded,
  onViewProgress,
}: FeatureGateModalProps) {
  const current = LEVEL_INFO[currentLevel] ?? LEVEL_INFO[1]!;
  const required = LEVEL_INFO[requiredLevel] ?? LEVEL_INFO[1]!;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onClose}>
        <Pressable className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
          {/* Header with level badges */}
          <View className="items-center mb-4">
            <View className="flex-row items-center justify-center gap-3 mb-3">
              {/* Current level */}
              <View className="items-center">
                <View
                  className="h-14 w-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${current.color}20` }}
                >
                  <Text className="text-2xl">{current.icon}</Text>
                </View>
                <Text className="text-[10px] font-sans-medium text-gray-500 mt-1">
                  {current.name}
                </Text>
              </View>

              {/* Lock icon */}
              <View className="items-center px-2">
                <Ionicons name="lock-closed" size={24} color="#4A2D7A" />
              </View>

              {/* Required level */}
              <View className="items-center">
                <View
                  className="h-14 w-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${required.color}20` }}
                >
                  <Text className="text-2xl">{required.icon}</Text>
                </View>
                <Text className="text-[10px] font-sans-medium text-gray-500 mt-1">
                  {required.name}
                </Text>
              </View>
            </View>

            {/* Feature name */}
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
              {featureLabel}
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mt-1">
              Reach Level {requiredLevel} ({required.name}) to unlock
            </Text>
          </View>

          {/* Points needed */}
          <View className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 mb-4">
            <Text className="text-center text-sm font-sans-medium text-brand-700 dark:text-brand-300">
              {pointsNeeded.toLocaleString()} more Core Points needed
            </Text>
            {/* Progress bar */}
            <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  backgroundColor: "#4A2D7A",
                  width: `${Math.min(100, Math.max(5, ((1 - pointsNeeded / Math.max(1, pointsNeeded + 1)) * 100)))}%`,
                }}
              />
            </View>
          </View>

          {/* How to earn */}
          <Text className="text-xs font-sans-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
            Earn points by:
          </Text>
          <View className="mb-4">
            {EARN_TIPS.map((tip) => (
              <View key={tip.label} className="flex-row items-center py-1.5">
                <Ionicons name={tip.icon} size={16} color="#7C3AED" />
                <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 ml-2 flex-1">
                  {tip.label}
                </Text>
                <Text className="text-xs font-sans-bold text-brand-600 dark:text-brand-400">
                  +{tip.points}
                </Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <Pressable
            className="bg-brand-700 rounded-xl py-3 items-center mb-2"
            onPress={onClose}
          >
            <Text className="text-white font-sans-bold text-base">Keep Going!</Text>
          </Pressable>

          {onViewProgress && (
            <Pressable
              className="py-2 items-center"
              onPress={() => { onClose(); onViewProgress(); }}
            >
              <Text className="text-brand-600 dark:text-brand-400 font-sans-medium text-sm">
                View My Progress
              </Text>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
