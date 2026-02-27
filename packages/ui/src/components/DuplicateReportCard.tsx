import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fef3c7", text: "#d97706", label: "Pending Review" },
  confirmed: { bg: "#fee2e2", text: "#dc2626", label: "Confirmed Duplicate" },
  rejected: { bg: "#f3f4f6", text: "#6b7280", label: "Rejected" },
  merged: { bg: "#dcfce7", text: "#16a34a", label: "Merged" },
};

interface DuplicateReportCardProps {
  memorialNameA: string;
  memorialNameB: string;
  status: string;
  onMerge?: () => void;
  onDismiss?: () => void;
}

export function DuplicateReportCard({
  memorialNameA,
  memorialNameB,
  status,
  onMerge,
  onDismiss,
}: DuplicateReportCardProps) {
  const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <View className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 mb-3">
      {/* Status Badge */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="copy-outline" size={16} color="#f59e0b" />
          <Text className="text-xs font-sans-semibold text-gray-500 dark:text-gray-400 ml-1.5">
            Potential Duplicate
          </Text>
        </View>
        <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: statusStyle.bg }}>
          <Text className="text-[10px] font-sans-semibold" style={{ color: statusStyle.text }}>
            {statusStyle.label}
          </Text>
        </View>
      </View>

      {/* Memorial Names */}
      <View className="flex-row items-center">
        <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <Text className="text-xs font-sans text-gray-400 mb-0.5">Memorial A</Text>
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
            {memorialNameA}
          </Text>
        </View>
        <View className="mx-2">
          <Ionicons name="swap-horizontal" size={18} color="#d1d5db" />
        </View>
        <View className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <Text className="text-xs font-sans text-gray-400 mb-0.5">Memorial B</Text>
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
            {memorialNameB}
          </Text>
        </View>
      </View>

      {/* Info */}
      <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-3 leading-4">
        These memorials might refer to the same person. Review and take action below.
      </Text>

      {/* Actions */}
      {(onMerge || onDismiss) && status === "pending" && (
        <View className="flex-row gap-2 mt-4">
          {onDismiss && (
            <Pressable
              className="flex-1 rounded-full py-2.5 items-center border border-gray-200 dark:border-gray-600"
              onPress={onDismiss}
            >
              <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-300">Dismiss</Text>
            </Pressable>
          )}
          {onMerge && (
            <Pressable
              className="flex-1 rounded-full py-2.5 items-center bg-brand-700"
              onPress={onMerge}
            >
              <Text className="text-sm font-sans-semibold text-white">Merge</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
