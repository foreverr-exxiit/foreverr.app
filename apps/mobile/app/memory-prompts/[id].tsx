import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import {
  useMemoryPrompts,
  usePromptResponses,
  useRespondToPrompt,
} from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const typeIcons: Record<string, string> = {
  memory: "💭",
  story: "📖",
  photo: "📷",
  recipe: "🍳",
  song: "🎵",
  lesson: "🎓",
};

export default function PromptDetailScreen() {
  const { id, memorialId } = useLocalSearchParams<{
    id: string;
    memorialId?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const { data: prompts } = useMemoryPrompts(memorialId);
  const prompt = prompts?.find((p) => p.id === id);
  const { data: responses } = usePromptResponses(id);
  const respondToPrompt = useRespondToPrompt();

  const [responseText, setResponseText] = useState("");
  const [showResponseForm, setShowResponseForm] = useState(false);

  const handleRespond = async () => {
    if (!responseText.trim() || !user?.id || !id) return;

    await respondToPrompt.mutateAsync({
      promptId: id,
      userId: user.id,
      content: responseText.trim(),
    });

    setResponseText("");
    setShowResponseForm(false);
  };

  if (!prompt) {
    return (
      <ScreenWrapper>
        <Stack.Screen options={{ title: "Loading..." }} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">Loading prompt...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const icon = typeIcons[prompt.prompt_type] || "💭";

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Memory Prompt" }} />

      {/* Prompt Header */}
      <View className="px-4 py-5 bg-indigo-50 border-b border-indigo-100">
        <View className="flex-row items-start">
          <View className="w-12 h-12 rounded-xl bg-indigo-100 items-center justify-center mr-3">
            <Text className="text-2xl">{icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 leading-6">
              {prompt.prompt_text}
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              {prompt.response_count}{" "}
              {prompt.response_count === 1 ? "response" : "responses"}
            </Text>
          </View>
        </View>
      </View>

      {/* Response Form */}
      {showResponseForm && (
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-indigo-200 shadow-sm">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            Share Your Memory
          </Text>
          <Input
            value={responseText}
            onChangeText={setResponseText}
            placeholder="Write your response..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View className="flex-row mt-2">
            <View className="flex-1 mr-2">
              <Button
                title="Submit"
                onPress={handleRespond}
                loading={respondToPrompt.isPending}
                disabled={!responseText.trim() || respondToPrompt.isPending}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowResponseForm(false)}
              className="px-4 py-3 bg-gray-100 rounded-xl justify-center"
            >
              <Text className="text-sm text-gray-600">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Responses List */}
      <FlatList
        data={responses ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-3"
        renderItem={({ item }) => (
          <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                <Text className="text-sm">
                  {(item as any).user?.display_name?.[0]?.toUpperCase() || "?"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">
                  {(item as any).user?.display_name || "Anonymous"}
                </Text>
                <Text className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text className="text-sm text-gray-800 leading-5">
              {item.content}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center py-12">
            <Text className="text-4xl mb-3">🤫</Text>
            <Text className="text-gray-500 mb-1">No responses yet</Text>
            <Text className="text-xs text-gray-400 text-center px-8">
              Be the first to share a memory!
            </Text>
          </View>
        }
      />

      {/* FAB - Respond */}
      {!showResponseForm && (
        <TouchableOpacity
          onPress={() => setShowResponseForm(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-lg">💬</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
