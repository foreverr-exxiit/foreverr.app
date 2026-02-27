import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VaultDashboardStatsProps {
  totalItems: number;
  capsulesPending: number;
  folderCount: number;
}

const STATS = [
  { key: "items", icon: "albums" as const, label: "Items", color: "#7C3AED" },
  { key: "capsules", icon: "time" as const, label: "Capsules", color: "#D97706" },
  { key: "folders", icon: "folder" as const, label: "Folders", color: "#059669" },
];

export function VaultDashboardStats({
  totalItems,
  capsulesPending,
  folderCount,
}: VaultDashboardStatsProps) {
  const values: Record<string, number> = {
    items: totalItems,
    capsules: capsulesPending,
    folders: folderCount,
  };

  return (
    <View className="flex-row mx-4 mb-4 gap-3">
      {STATS.map((stat) => (
        <View
          key={stat.key}
          className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 items-center border border-gray-100 dark:border-gray-700"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 }}
        >
          <View
            className="w-10 h-10 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <Ionicons name={stat.icon} size={20} color={stat.color} />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
            {values[stat.key]}
          </Text>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
