import React from "react";
import { View, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  owner: { bg: "#fef3c7", text: "#d97706" },
  family_admin: { bg: "#ede9fe", text: "#7c3aed" },
  contributor: { bg: "#dbeafe", text: "#2563eb" },
  moderator: { bg: "#dcfce7", text: "#16a34a" },
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  family_admin: "Family Admin",
  contributor: "Contributor",
  moderator: "Moderator",
};

interface Manager {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: string;
}

interface MemorialManagerListProps {
  managers: Manager[];
  isOwner: boolean;
  onAddManager: () => void;
  onRemoveManager: (id: string) => void;
}

export function MemorialManagerList({
  managers,
  isOwner,
  onAddManager,
  onRemoveManager,
}: MemorialManagerListProps) {
  const renderManager = ({ item }: { item: Manager }) => {
    const roleStyle = ROLE_COLORS[item.role] ?? ROLE_COLORS.contributor;
    const roleLabel = ROLE_LABELS[item.role] ?? item.role;

    return (
      <View className="flex-row items-center py-3 border-b border-gray-50 dark:border-gray-800">
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center">
          <Ionicons name="person" size={18} color="#4A2D7A" />
        </View>

        {/* Info */}
        <View className="flex-1 ml-3">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
            {item.displayName}
          </Text>
          <View
            className="self-start rounded-full px-2 py-0.5 mt-1"
            style={{ backgroundColor: roleStyle.bg }}
          >
            <Text className="text-[10px] font-sans-semibold" style={{ color: roleStyle.text }}>
              {roleLabel}
            </Text>
          </View>
        </View>

        {/* Remove button (only shown to owner, and not for owner themselves) */}
        {isOwner && item.role !== "owner" && (
          <Pressable
            className="p-2 rounded-full bg-red-50 dark:bg-red-900/20"
            onPress={() => onRemoveManager(item.id)}
          >
            <Ionicons name="close-circle" size={18} color="#ef4444" />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
          Memorial Managers
        </Text>
        {isOwner && (
          <Pressable
            className="flex-row items-center rounded-full bg-brand-700 px-3 py-1.5"
            onPress={onAddManager}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-xs font-sans-semibold text-white ml-1">Add</Text>
          </Pressable>
        )}
      </View>

      {/* Manager List */}
      <FlatList
        data={managers}
        keyExtractor={(item) => item.id}
        renderItem={renderManager}
        scrollEnabled={false}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <Ionicons name="people-outline" size={32} color="#d1d5db" />
            <Text className="text-sm font-sans text-gray-400 mt-2">No managers yet</Text>
          </View>
        }
      />

      {/* Info */}
      <View className="flex-row bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mt-3">
        <Ionicons name="information-circle-outline" size={16} color="#9ca3af" style={{ marginTop: 1 }} />
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 ml-2 flex-1 leading-4">
          Managers can edit memorial content based on their role. Only owners and family admins can add or remove managers.
        </Text>
      </View>
    </View>
  );
}
