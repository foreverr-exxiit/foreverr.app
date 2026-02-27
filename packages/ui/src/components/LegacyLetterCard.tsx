import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface LegacyLetterCardProps {
  subject: string;
  recipientName: string;
  deliveryDate: string;
  deliveryType: string;
  isDelivered: boolean;
  isRead?: boolean;
  authorName?: string;
  /** "sent" = user authored, "received" = user is recipient */
  mode: "sent" | "received";
  onPress?: () => void;
}

export function LegacyLetterCard({
  subject,
  recipientName,
  deliveryDate,
  deliveryType,
  isDelivered,
  isRead,
  authorName,
  mode,
  onPress,
}: LegacyLetterCardProps) {
  const deliveryDateObj = new Date(deliveryDate);
  const daysUntilDelivery = Math.ceil(
    (deliveryDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border ${
        isDelivered && !isRead ? "border-purple-300" : "border-gray-100 dark:border-gray-700"
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`w-12 h-12 rounded-xl items-center justify-center mr-3 ${
            isDelivered ? "bg-green-50" : "bg-amber-50"
          }`}
        >
          <Text className="text-2xl">{isDelivered ? "💌" : "✉️"}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-0.5" numberOfLines={1}>
            {subject}
          </Text>
          <Text className="text-xs text-gray-500 mb-1.5">
            {mode === "sent" ? `To: ${recipientName}` : `From: ${authorName ?? "Unknown"}`}
          </Text>
          <View className="flex-row items-center flex-wrap">
            {isDelivered ? (
              <View className="bg-green-100 rounded-full px-2 py-0.5 mr-2">
                <Text className="text-xs text-green-700 font-medium">
                  {isRead ? "Read" : "Delivered"}
                </Text>
              </View>
            ) : (
              <View className="bg-amber-100 rounded-full px-2 py-0.5 mr-2">
                <Text className="text-xs text-amber-700 font-medium">
                  {daysUntilDelivery > 0
                    ? `⏳ ${daysUntilDelivery}d until delivery`
                    : "Pending delivery"}
                </Text>
              </View>
            )}
            <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
              <Text className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                {deliveryType.replace("_", " ")}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400 mt-2">
            {isDelivered ? "Delivered" : "Delivers"}: {deliveryDateObj.toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
