import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  google_photos: "#4285F4",
  apple_photos: "#000000",
  gedcom: "#7C3AED",
  csv: "#059669",
  legacy_com: "#8B5CF6",
  findagrave: "#6B7280",
  ancestry: "#9D3B1A",
  manual: "#4A2D7A",
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "logo-facebook",
  instagram: "logo-instagram",
  twitter: "logo-twitter",
  tiktok: "logo-tiktok",
  google_photos: "logo-google",
  apple_photos: "logo-apple",
  gedcom: "git-branch",
  csv: "document-text",
  legacy_com: "flower",
  findagrave: "location",
  ancestry: "people",
  manual: "create",
};

interface ImportSourceCardProps {
  platform: string;
  icon?: string;
  isConnected: boolean;
  itemCount?: number;
  onConnect: () => void;
  onImport: () => void;
}

export function ImportSourceCard({
  platform,
  icon,
  isConnected,
  itemCount,
  onConnect,
  onImport,
}: ImportSourceCardProps) {
  const color = PLATFORM_COLORS[platform] ?? "#7C3AED";
  const iconName = icon ?? PLATFORM_ICONS[platform] ?? "cloud-upload";
  const displayName = platform
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Pressable
      className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
      onPress={isConnected ? onImport : onConnect}
    >
      <View className="flex-row items-center">
        {/* Platform Icon */}
        <View
          className="w-12 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={iconName as any} size={24} color={color} />
        </View>

        {/* Info */}
        <View className="flex-1 ml-3">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
            {displayName}
          </Text>
          {isConnected && itemCount !== undefined && (
            <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-0.5">
              {itemCount} {itemCount === 1 ? "item" : "items"} available
            </Text>
          )}
        </View>

        {/* Status / Action */}
        <View className="ml-2">
          {isConnected ? (
            <View className="flex-row items-center">
              <View className="bg-green-100 dark:bg-green-900/30 rounded-full px-2.5 py-1 flex-row items-center mr-2">
                <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
                <Text className="text-[10px] font-sans-medium text-green-700 dark:text-green-400">
                  Connected
                </Text>
              </View>
              <Pressable
                onPress={onImport}
                className="bg-brand-700 rounded-lg px-3 py-1.5"
              >
                <Text className="text-xs font-sans-semibold text-white">
                  Import
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={onConnect}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5"
            >
              <Text className="text-xs font-sans-medium text-gray-700 dark:text-gray-300">
                Connect
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}
