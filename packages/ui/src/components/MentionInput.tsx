import React, { useState, useCallback } from "react";
import { View, TextInput, FlatList, Pressable, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MentionUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  users?: MentionUser[];
  multiline?: boolean;
  numberOfLines?: number;
}

export function MentionInput({
  value,
  onChangeText,
  placeholder,
  users = [],
  multiline,
  numberOfLines,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleTextChange = useCallback(
    (text: string) => {
      onChangeText(text);

      // Check if user is typing a mention
      const mentionMatch = text.match(/@(\w*)$/);
      if (mentionMatch) {
        setSearchTerm(mentionMatch[1].toLowerCase());
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setSearchTerm("");
      }
    },
    [onChangeText]
  );

  const handleSelectUser = useCallback(
    (username: string) => {
      // Replace the partial @mention with the full username
      const newText = value.replace(/@\w*$/, `@${username} `);
      onChangeText(newText);
      setShowSuggestions(false);
      setSearchTerm("");
    },
    [value, onChangeText]
  );

  const filteredUsers = searchTerm
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(searchTerm) ||
          u.displayName.toLowerCase().includes(searchTerm)
      )
    : users;

  return (
    <View>
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder ?? "Type @ to mention someone..."}
        placeholderTextColor="#9ca3af"
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm"
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredUsers.length > 0 && (
        <View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-1 max-h-40 overflow-hidden shadow-sm">
          <FlatList
            data={filteredUsers.slice(0, 5)}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectUser(item.username)}
                className="flex-row items-center px-3 py-2.5 border-b border-gray-50 dark:border-gray-700"
              >
                {item.avatarUrl ? (
                  <Image source={{ uri: item.avatarUrl }} className="w-7 h-7 rounded-full" />
                ) : (
                  <View className="w-7 h-7 rounded-full bg-brand-100 items-center justify-center">
                    <Ionicons name="person" size={14} color="#7C3AED" />
                  </View>
                )}
                <View className="ml-2">
                  <Text className="text-xs font-sans-medium text-gray-900 dark:text-white">
                    {item.displayName}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400">
                    @{item.username}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
