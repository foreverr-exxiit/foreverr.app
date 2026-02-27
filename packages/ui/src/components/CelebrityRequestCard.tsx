import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface CelebrityRequestCardProps {
  celebrityName: string;
  knownFor?: string;
  status: string;
  onApprove?: () => void;
  onReject?: () => void;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pending" },
  approved: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Approved" },
  created: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", label: "Created" },
  rejected: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Rejected" },
};

export function CelebrityRequestCard({
  celebrityName,
  knownFor,
  status,
  onApprove,
  onReject,
}: CelebrityRequestCardProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;

  return (
    <View className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800">
      {/* Header row */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-neutral-900 dark:text-white flex-1 mr-2" numberOfLines={1}>
          {celebrityName}
        </Text>
        <View className={`px-3 py-1 rounded-full ${s.bg}`}>
          <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
        </View>
      </View>

      {/* Known for */}
      {knownFor ? (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400 mb-3" numberOfLines={2}>
          {knownFor}
        </Text>
      ) : null}

      {/* Action buttons (admin only) */}
      {(onApprove || onReject) && status === "pending" ? (
        <View className="flex-row gap-3 mt-1">
          {onApprove ? (
            <TouchableOpacity
              onPress={onApprove}
              activeOpacity={0.7}
              className="flex-1 bg-green-600 rounded-xl py-2.5 items-center"
            >
              <Text className="text-white font-semibold text-sm">Approve</Text>
            </TouchableOpacity>
          ) : null}
          {onReject ? (
            <TouchableOpacity
              onPress={onReject}
              activeOpacity={0.7}
              className="flex-1 bg-red-600 rounded-xl py-2.5 items-center"
            >
              <Text className="text-white font-semibold text-sm">Reject</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
