import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper, MemoryPromptCard } from "@foreverr/ui";
import {
  useMemoryPrompts,
  useCreateMemoryPrompt,
  usePromptCategories,
  usePromptsByCategory,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const PROMPT_TYPES = [
  { value: "memory", label: "Memory", icon: "bulb" },
  { value: "story", label: "Story", icon: "book" },
  { value: "photo", label: "Photo", icon: "camera" },
  { value: "recipe", label: "Recipe", icon: "restaurant" },
  { value: "song", label: "Song", icon: "musical-notes" },
  { value: "lesson", label: "Lesson", icon: "school" },
];

const CATEGORY_ICONS: Record<string, string> = {
  childhood: "happy",
  career: "briefcase",
  relationships: "heart",
  favorites: "star",
  milestones: "flag",
  traditions: "gift",
  personality: "person",
  travel: "airplane",
};

export default function MemoryPromptsScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { data: prompts } = useMemoryPrompts(memorialId);
  const createPrompt = useCreateMemoryPrompt();

  // Categories
  const { data: categories } = usePromptCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: categoryPrompts } = usePromptsByCategory(
    selectedCategoryId ?? undefined,
    memorialId
  );

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [promptType, setPromptType] = useState("memory");

  const handleCreate = async () => {
    if (!promptText.trim() || !memorialId) return;

    await createPrompt.mutateAsync({
      memorialId,
      promptText: promptText.trim(),
      promptType,
    });

    setPromptText("");
    setPromptType("memory");
    setShowCreateForm(false);
  };

  // Show category-filtered prompts if a category is selected, otherwise all prompts
  const displayPrompts = selectedCategoryId ? (categoryPrompts ?? []) : (prompts ?? []);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Memory Prompts",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Intro */}
      <View className="mx-4 mt-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 mb-3 border border-indigo-100 dark:border-indigo-800">
        <View className="flex-row items-center">
          <Ionicons name="bulb" size={18} color="#4F46E5" />
          <Text className="text-sm font-sans text-indigo-800 dark:text-indigo-300 leading-5 ml-2 flex-1">
            Memory prompts invite friends and family to share their favorite
            memories, stories, and moments about your loved one.
          </Text>
        </View>
      </View>

      {/* Category Filter Chips */}
      {(categories?.length ?? 0) > 0 && (
        <View className="mb-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            {/* All chip */}
            <TouchableOpacity
              onPress={() => setSelectedCategoryId(null)}
              className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                selectedCategoryId === null
                  ? "bg-indigo-600 border-indigo-600"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}
            >
              <Ionicons
                name="albums"
                size={14}
                color={selectedCategoryId === null ? "#fff" : "#6B7280"}
              />
              <Text
                className={`text-xs font-sans-medium ml-1.5 ${
                  selectedCategoryId === null
                    ? "text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Category chips */}
            {(categories ?? []).map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              const iconName = CATEGORY_ICONS[cat.slug ?? ""] || "pricetag";
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() =>
                    setSelectedCategoryId(isActive ? null : cat.id)
                  }
                  className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                    isActive
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Ionicons
                    name={iconName as any}
                    size={14}
                    color={isActive ? "#fff" : "#6B7280"}
                  />
                  <Text
                    className={`text-xs font-sans-medium ml-1.5 ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <View className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-brand-200 dark:border-brand-800">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
              New Prompt
            </Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Input
            label="Prompt Question"
            value={promptText}
            onChangeText={setPromptText}
            placeholder="e.g., What's your favorite memory with them?"
            multiline
            numberOfLines={3}
          />

          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Prompt Type
          </Text>
          <View className="flex-row flex-wrap mb-4 gap-2">
            {PROMPT_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                onPress={() => setPromptType(pt.value)}
                className={`px-3 py-2 rounded-xl flex-row items-center ${
                  promptType === pt.value
                    ? "bg-indigo-600"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Ionicons
                  name={pt.icon as any}
                  size={14}
                  color={promptType === pt.value ? "#fff" : "#6B7280"}
                />
                <Text
                  className={`text-sm ml-1.5 ${
                    promptType === pt.value
                      ? "text-white font-sans-medium"
                      : "text-gray-700 dark:text-gray-300 font-sans"
                  }`}
                >
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Create Prompt"
            onPress={handleCreate}
            loading={createPrompt.isPending}
            disabled={!promptText.trim() || createPrompt.isPending}
          />
        </View>
      )}

      {/* Prompts List */}
      <FlatList
        data={displayPrompts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-2"
        renderItem={({ item }) => (
          <MemoryPromptCard
            promptText={item.prompt_text}
            promptType={item.prompt_type}
            responseCount={item.response_count}
            triggerDate={item.trigger_date}
            createdAt={item.created_at}
            onPress={() =>
              router.push(
                `/memory-prompts/${item.id}?memorialId=${memorialId}`
              )
            }
          />
        )}
        ListEmptyComponent={
          !showCreateForm ? (
            <View className="items-center py-16">
              <Ionicons name="bulb-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 font-sans mt-3 mb-1">
                {selectedCategoryId ? "No prompts in this category" : "No prompts yet"}
              </Text>
              <Text className="text-xs text-gray-400 font-sans text-center px-8 mb-4">
                {selectedCategoryId
                  ? "Try selecting a different category or create a new prompt."
                  : "Create a prompt to invite others to share their memories."}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                className="bg-indigo-100 dark:bg-indigo-900/20 rounded-xl px-5 py-2.5"
              >
                <Text className="text-sm font-sans-medium text-indigo-700">
                  Create First Prompt
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      {!showCreateForm && (
        <TouchableOpacity
          onPress={() => setShowCreateForm(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
