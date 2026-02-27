import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VaultSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function VaultSearchBar({
  value,
  onChangeText,
  placeholder = "Search vault items...",
}: VaultSearchBarProps) {
  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl mx-4 mb-4 px-3 py-2.5">
      <Ionicons name="search" size={18} color="#9ca3af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 ml-2 text-sm font-sans text-gray-900 dark:text-white"
        returnKeyType="search"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
}
