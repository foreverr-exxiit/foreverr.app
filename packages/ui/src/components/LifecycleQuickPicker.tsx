import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface LifecycleStage {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

interface LifecycleQuickPickerProps {
  stages: LifecycleStage[];
  selectedStage: string | null;
  onSelect: (stage: string) => void;
}

export function LifecycleQuickPicker({
  stages,
  selectedStage,
  onSelect,
}: LifecycleQuickPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      className="py-2"
    >
      {stages.map((stage) => {
        const isSelected = selectedStage === stage.id;
        return (
          <Pressable
            key={stage.id}
            className="items-center"
            onPress={() => onSelect(stage.id)}
          >
            {/* Circle */}
            <View
              className={`w-14 h-14 rounded-full items-center justify-center mb-1.5 ${
                isSelected
                  ? "border-2 border-brand-500 dark:border-brand-400"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
              style={{
                backgroundColor: isSelected ? stage.color + "20" : "transparent",
              }}
            >
              <Ionicons
                name={stage.icon}
                size={22}
                color={isSelected ? stage.color : "#9CA3AF"}
              />
            </View>

            {/* Label (shown when selected) */}
            {isSelected && (
              <Text
                className="text-[10px] font-sans-semibold text-brand-600 dark:text-brand-400 text-center"
                numberOfLines={1}
              >
                {stage.name}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
