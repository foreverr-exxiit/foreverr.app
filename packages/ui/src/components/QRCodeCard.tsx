import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "../primitives/Text";

interface QRCodeCardProps {
  code: string;
  label?: string | null;
  locationName?: string | null;
  scanCount: number;
  isActive: boolean;
  lastScannedAt?: string | null;
  onPress?: () => void;
}

export function QRCodeCard({
  code,
  label,
  locationName,
  scanCount,
  isActive,
  lastScannedAt,
  onPress,
}: QRCodeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm border ${
        isActive ? "border-gray-100 dark:border-gray-700" : "border-red-100 opacity-60"
      }`}
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-xl bg-gray-900 items-center justify-center mr-3">
          <Text className="text-3xl">📱</Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
            {label || "QR Code"}
          </Text>
          <Text className="text-xs text-gray-500 font-mono mb-1">{code}</Text>
          {locationName && (
            <Text className="text-xs text-gray-500 mb-1">📍 {locationName}</Text>
          )}
          <View className="flex-row items-center mt-1">
            <View className={`rounded-full px-2 py-0.5 mr-2 ${isActive ? "bg-green-100" : "bg-red-100"}`}>
              <Text className={`text-xs font-medium ${isActive ? "text-green-700" : "text-red-700"}`}>
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">{scanCount} scans</Text>
            {lastScannedAt && (
              <Text className="text-xs text-gray-400 ml-2">
                Last: {new Date(lastScannedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
