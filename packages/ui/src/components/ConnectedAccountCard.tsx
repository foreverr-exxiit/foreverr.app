import React from "react";
import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E4405F",
  twitter: "#1DA1F2",
  tiktok: "#000000",
  google: "#4285F4",
  apple: "#000000",
};

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "logo-facebook",
  instagram: "logo-instagram",
  twitter: "logo-twitter",
  tiktok: "logo-tiktok",
  google: "logo-google",
  apple: "logo-apple",
};

interface ConnectedAccountCardProps {
  platform: string;
  displayName: string;
  avatarUrl?: string | null;
  lastSyncAt?: string;
  isActive: boolean;
  onDisconnect: () => void;
  onSync: () => void;
}

export function ConnectedAccountCard({
  platform,
  displayName,
  avatarUrl,
  lastSyncAt,
  isActive,
  onDisconnect,
  onSync,
}: ConnectedAccountCardProps) {
  const color = PLATFORM_COLORS[platform] ?? "#7C3AED";
  const iconName = PLATFORM_ICONS[platform] ?? "link";
  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  const formatSyncTime = (isoDate: string) => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <View
      className={`rounded-2xl p-4 border ${
        isActive
          ? "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
          : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        opacity: isActive ? 1 : 0.6,
      }}
    >
      <View className="flex-row items-center">
        {/* Avatar / Platform Icon */}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-11 h-11 rounded-full"
          />
        ) : (
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Ionicons name={iconName as any} size={22} color={color} />
          </View>
        )}

        {/* Account Info */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white" numberOfLines={1}>
              {displayName}
            </Text>
            {isActive && (
              <View className="ml-2 w-2 h-2 rounded-full bg-green-500" />
            )}
          </View>
          <View className="flex-row items-center mt-0.5">
            <Ionicons name={iconName as any} size={12} color={color} />
            <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 ml-1">
              {platformLabel}
            </Text>
            {lastSyncAt && (
              <Text className="text-xs font-sans text-gray-400 dark:text-gray-500 ml-2">
                Synced {formatSyncTime(lastSyncAt)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {isActive && (
        <View className="flex-row mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 gap-2">
          <Pressable
            onPress={onSync}
            className="flex-1 flex-row items-center justify-center bg-brand-50 dark:bg-brand-900/20 rounded-xl py-2.5"
          >
            <Ionicons name="sync" size={16} color="#7C3AED" />
            <Text className="text-sm font-sans-medium text-brand-700 ml-2">
              Sync Now
            </Text>
          </Pressable>
          <Pressable
            onPress={onDisconnect}
            className="flex-1 flex-row items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-xl py-2.5"
          >
            <Ionicons name="unlink" size={16} color="#6B7280" />
            <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-400 ml-2">
              Disconnect
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
