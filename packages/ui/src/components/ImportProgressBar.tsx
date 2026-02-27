import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ImportProgressBarProps {
  totalItems: number;
  importedItems: number;
  failedItems: number;
  status: string;
  onRetry?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "Waiting to start...", color: "#6B7280", icon: "hourglass-outline" },
  processing: { label: "Importing...", color: "#7C3AED", icon: "sync-outline" },
  completed: { label: "Import complete", color: "#059669", icon: "checkmark-circle" },
  failed: { label: "Import failed", color: "#DC2626", icon: "close-circle" },
  partial: { label: "Partially imported", color: "#D97706", icon: "warning" },
};

export function ImportProgressBar({
  totalItems,
  importedItems,
  failedItems,
  status,
  onRetry,
}: ImportProgressBarProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const progressPct = totalItems > 0 ? Math.min((importedItems / totalItems) * 100, 100) : 0;
  const failedPct = totalItems > 0 ? Math.min((failedItems / totalItems) * 100, 100) : 0;

  return (
    <View className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
      {/* Status Header */}
      <View className="flex-row items-center mb-3">
        <Ionicons name={config.icon as any} size={18} color={config.color} />
        <Text
          className="text-sm font-sans-semibold ml-2 flex-1"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400">
          {importedItems}/{totalItems}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-row">
        {/* Success portion */}
        <View
          className="h-full rounded-full bg-green-500"
          style={{ width: `${progressPct}%` }}
        />
        {/* Failed portion */}
        {failedPct > 0 && (
          <View
            className="h-full bg-red-500"
            style={{ width: `${failedPct}%` }}
          />
        )}
      </View>

      {/* Stats Row */}
      <View className="flex-row mt-3 gap-4">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
          <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-400">
            {importedItems} imported
          </Text>
        </View>
        {failedItems > 0 && (
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
            <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-400">
              {failedItems} failed
            </Text>
          </View>
        )}
        {totalItems - importedItems - failedItems > 0 && status === "processing" && (
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-gray-400 mr-1.5" />
            <Text className="text-[11px] font-sans text-gray-600 dark:text-gray-400">
              {totalItems - importedItems - failedItems} remaining
            </Text>
          </View>
        )}
      </View>

      {/* Retry Button */}
      {failedItems > 0 && onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-3 flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-xl py-2.5"
        >
          <Ionicons name="refresh" size={16} color="#DC2626" />
          <Text className="text-sm font-sans-medium text-red-600 dark:text-red-400 ml-2">
            Retry {failedItems} failed {failedItems === 1 ? "item" : "items"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
