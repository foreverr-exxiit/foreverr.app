import React, { useState } from "react";
import { View, Modal, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ConvertToMemorialModalProps {
  visible: boolean;
  onClose: () => void;
  honoreeName: string;
  messageCount: number;
  onConverted: (dateOfDeath?: string) => void;
  isConverting?: boolean;
}

export function ConvertToMemorialModal({
  visible,
  onClose,
  honoreeName,
  messageCount,
  onConverted,
  isConverting = false,
}: ConvertToMemorialModalProps) {
  const [dateOfDeath, setDateOfDeath] = useState("");

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 overflow-hidden">
          {/* Header */}
          <View className="items-center px-6 pt-6 pb-4">
            <View className="h-16 w-16 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mb-3">
              <Ionicons name="heart" size={32} color="#EF4444" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
              Convert to Memorial
            </Text>
            <Text className="text-sm font-sans text-gray-500 text-center mt-1">
              This will create a memorial page for {honoreeName} and preserve all {messageCount} tribute messages.
            </Text>
          </View>

          {/* Date of passing */}
          <View className="px-6 mb-4">
            <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Date of Passing (optional)
            </Text>
            <TextInput
              className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9ca3af"
              value={dateOfDeath}
              onChangeText={setDateOfDeath}
            />
          </View>

          {/* Info */}
          <View className="mx-6 mb-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={16} color="#D97706" />
              <Text className="ml-2 text-xs font-sans text-amber-800 dark:text-amber-300 flex-1">
                This action cannot be undone. The living tribute will be archived and a memorial will be created with all existing messages preserved.
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-gray-100 dark:border-gray-700">
            <Pressable
              className="flex-1 items-center py-3.5 border-r border-gray-100 dark:border-gray-700"
              onPress={onClose}
              disabled={isConverting}
            >
              <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-400">Cancel</Text>
            </Pressable>
            <Pressable
              className="flex-1 items-center py-3.5"
              onPress={() => onConverted(dateOfDeath.trim() || undefined)}
              disabled={isConverting}
            >
              {isConverting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text className="text-sm font-sans-semibold text-red-600">Convert</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
