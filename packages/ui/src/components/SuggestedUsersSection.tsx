import React from "react";
import { View, ScrollView, Image, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SuggestedUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string | null;
}

interface SuggestedUsersSectionProps {
  users: SuggestedUser[];
  onUserPress: (userId: string) => void;
  onFollowPress: (userId: string) => void;
}

export function SuggestedUsersSection({
  users,
  onUserPress,
  onFollowPress,
}: SuggestedUsersSectionProps) {
  if (users.length === 0) return null;

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
          Suggested for You
        </Text>
        <Ionicons name="people-outline" size={18} color="#9ca3af" />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {users.map((user) => (
          <Pressable
            key={user.id}
            onPress={() => onUserPress(user.id)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 items-center"
            style={{ width: 140 }}
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} className="w-14 h-14 rounded-full mb-2" />
            ) : (
              <View className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-2">
                <Ionicons name="person" size={24} color="#7C3AED" />
              </View>
            )}
            <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white text-center" numberOfLines={1}>
              {user.displayName}
            </Text>
            <Text className="text-[10px] font-sans text-gray-400 text-center mb-2" numberOfLines={1}>
              @{user.username}
            </Text>
            <Pressable
              onPress={() => onFollowPress(user.id)}
              className="bg-brand-700 rounded-full px-4 py-1.5"
            >
              <Text className="text-[10px] font-sans-medium text-white">Follow</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
