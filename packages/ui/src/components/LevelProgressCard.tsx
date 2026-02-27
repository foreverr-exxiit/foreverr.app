import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const LEVEL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  leaf: "leaf",
  flower: "flower",
  tree: "leaf",
  forest: "leaf",
  mountain: "triangle",
  star: "star",
};

interface LevelProgressCardProps {
  currentLevel: number;
  levelName: string;
  totalEarned: number;
  nextLevelAt: number;
  nextLevelName: string;
  perks: string[];
}

export function LevelProgressCard({
  currentLevel,
  levelName,
  totalEarned,
  nextLevelAt,
  nextLevelName,
  perks,
}: LevelProgressCardProps) {
  const progressPct =
    nextLevelAt > 0 ? Math.min((totalEarned / nextLevelAt) * 100, 100) : 100;
  const pointsRemaining = Math.max(nextLevelAt - totalEarned, 0);
  const isMaxLevel = totalEarned >= nextLevelAt && currentLevel >= 7;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mr-3">
          <Ionicons name="trophy" size={24} color="#7C3AED" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
            Level {currentLevel} - {levelName}
          </Text>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
            {totalEarned.toLocaleString()} total points earned
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
            Progress
          </Text>
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300">
            {totalEarned.toLocaleString()} / {nextLevelAt.toLocaleString()}
          </Text>
        </View>
        <View className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full bg-brand-500"
            style={{ width: `${progressPct}%` }}
          />
        </View>
      </View>

      {/* Next Level */}
      {!isMaxLevel ? (
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mb-3">
          {pointsRemaining.toLocaleString()} more points to{" "}
          <Text className="font-sans-semibold text-brand-600 dark:text-brand-400">
            {nextLevelName}
          </Text>
        </Text>
      ) : (
        <Text className="text-xs font-sans-semibold text-amber-600 dark:text-amber-400 mb-3">
          Maximum level reached!
        </Text>
      )}

      {/* Perks */}
      {perks.length > 0 && (
        <View className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Current Perks
          </Text>
          {perks.map((perk, index) => (
            <View key={index} className="flex-row items-center mt-1">
              <Ionicons name="checkmark-circle" size={14} color="#7C3AED" />
              <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 ml-1.5">
                {perk}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
