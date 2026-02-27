import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface Stage {
  id: number;
  name: string;
  icon: string;
  color: string;
  description: string;
}

interface LifecycleStagePickerProps {
  currentStage: string | null;
  stages: Stage[];
  onSelect: (stage: string) => void;
}

const ICON_MAP: Record<string, string> = {
  sparkles: "\u2728",
  camera: "\uD83D\uDCF7",
  heart: "\u2764\uFE0F",
  flame: "\uD83D\uDD25",
  star: "\u2B50",
};

export function LifecycleStagePicker({
  currentStage,
  stages,
  onSelect,
}: LifecycleStagePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
    >
      {stages.map((stage) => {
        const isActive =
          currentStage?.toLowerCase() === stage.name.toLowerCase();
        const emoji = ICON_MAP[stage.icon] ?? stage.icon;

        return (
          <TouchableOpacity
            key={stage.id}
            onPress={() => onSelect(stage.name.toLowerCase())}
            activeOpacity={0.7}
            className={`flex-row items-center rounded-full px-4 py-2.5 border ${
              isActive ? "border-transparent" : "border-neutral-200 dark:border-neutral-700"
            }`}
            style={
              isActive
                ? { backgroundColor: stage.color }
                : { backgroundColor: "transparent" }
            }
          >
            <Text className={`text-base mr-1.5 ${isActive ? "text-white" : ""}`}>
              {emoji}
            </Text>
            <Text
              className={`text-sm font-semibold ${
                isActive
                  ? "text-white"
                  : "text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {stage.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
