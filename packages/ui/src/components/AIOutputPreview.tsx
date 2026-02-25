import { View, Pressable, ActivityIndicator, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface AIOutputPreviewProps {
  text: string | null;
  isGenerating: boolean;
  error?: string | null;
  label?: string;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onAccept?: () => void;
}

export function AIOutputPreview({
  text,
  isGenerating,
  error,
  label = "Generated Content",
  onEdit,
  onRegenerate,
  onAccept,
}: AIOutputPreviewProps) {
  if (isGenerating) {
    return (
      <View className="items-center py-12 px-4">
        <ActivityIndicator size="large" color="#4A2D7A" />
        <Text className="mt-4 text-sm font-sans-medium text-brand-700">
          Generating {label.toLowerCase()}...
        </Text>
        <Text className="mt-1 text-xs font-sans text-gray-500 text-center">
          This may take a few seconds
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center py-8 px-4">
        <Ionicons name="alert-circle" size={32} color="#ef4444" />
        <Text className="mt-2 text-sm font-sans text-red-500 text-center">
          {error}
        </Text>
        {onRegenerate && (
          <Pressable
            className="mt-4 rounded-full bg-brand-700 px-5 py-2"
            onPress={onRegenerate}
          >
            <Text className="text-sm font-sans-semibold text-white">Try Again</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (!text) return null;

  return (
    <View className="mt-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={16} color="#4A2D7A" />
          <Text className="ml-1.5 text-sm font-sans-semibold text-brand-700">
            {label}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {onEdit && (
            <Pressable
              className="flex-row items-center rounded-full bg-gray-100 px-3 py-1.5"
              onPress={onEdit}
            >
              <Ionicons name="create-outline" size={14} color="#4b5563" />
              <Text className="ml-1 text-xs font-sans-medium text-gray-600">Edit</Text>
            </Pressable>
          )}
          {onRegenerate && (
            <Pressable
              className="flex-row items-center rounded-full bg-gray-100 px-3 py-1.5"
              onPress={onRegenerate}
            >
              <Ionicons name="refresh" size={14} color="#4b5563" />
              <Text className="ml-1 text-xs font-sans-medium text-gray-600">Regenerate</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      <View className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
        <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 leading-5">
          {text}
        </Text>
      </View>

      {/* AI badge */}
      <View className="flex-row items-center mt-2">
        <Ionicons name="sparkles" size={10} color="#9ca3af" />
        <Text className="ml-1 text-[10px] font-sans text-gray-400">
          Generated with AI — review and edit before publishing
        </Text>
      </View>

      {/* Accept button */}
      {onAccept && (
        <Pressable
          className="mt-4 h-12 items-center justify-center rounded-full bg-brand-700"
          onPress={onAccept}
        >
          <Text className="text-base font-sans-semibold text-white">
            Use This {label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
