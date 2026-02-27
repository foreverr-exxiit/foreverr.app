import React from "react";
import { View, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  type: "level_up" | "milestone" | "streak";
  title: string;
  description: string;
  pointsEarned: number;
}

const TYPE_CONFIG: Record<
  CelebrationModalProps["type"],
  { emoji: string; color: string; bgClass: string }
> = {
  level_up: { emoji: "\u{1F3C6}", color: "#7C3AED", bgClass: "bg-brand-50 dark:bg-brand-900/20" },
  milestone: { emoji: "\u{2B50}", color: "#D97706", bgClass: "bg-amber-50 dark:bg-amber-900/20" },
  streak: { emoji: "\u{1F525}", color: "#EA580C", bgClass: "bg-orange-50 dark:bg-orange-900/20" },
};

export function CelebrationModal({
  visible,
  onClose,
  type,
  title,
  description,
  pointsEarned,
}: CelebrationModalProps) {
  const config = TYPE_CONFIG[type];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-8">
        <View className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm overflow-hidden">
          {/* Confetti-like decoration header */}
          <View className={`${config.bgClass} items-center pt-8 pb-4 px-6`}>
            {/* Star decorations */}
            <View className="absolute top-3 left-6">
              <Ionicons name="star" size={16} color={config.color} />
            </View>
            <View className="absolute top-5 right-8">
              <Ionicons name="star" size={12} color={config.color} />
            </View>
            <View className="absolute top-2 right-16">
              <Ionicons name="sparkles" size={14} color={config.color} />
            </View>
            <View className="absolute top-6 left-16">
              <Ionicons name="sparkles" size={10} color={config.color} />
            </View>

            {/* Large emoji */}
            <Text className="text-5xl mb-3">{config.emoji}</Text>

            {/* Title */}
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
              {title}
            </Text>
          </View>

          {/* Content */}
          <View className="px-6 pt-4 pb-6 items-center">
            <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 text-center mb-4 leading-5">
              {description}
            </Text>

            {/* Points badge */}
            {pointsEarned > 0 && (
              <View className="flex-row items-center bg-amber-50 dark:bg-amber-900/20 rounded-full px-4 py-2 mb-5">
                <Ionicons name="star" size={16} color="#D97706" />
                <Text className="text-sm font-sans-bold text-amber-700 dark:text-amber-400 ml-1.5">
                  +{pointsEarned} points
                </Text>
              </View>
            )}

            {/* Dismiss button */}
            <Pressable
              className="w-full bg-brand-600 dark:bg-brand-500 rounded-xl py-3.5 items-center"
              onPress={onClose}
            >
              <Text className="text-base font-sans-bold text-white">
                Awesome!
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
