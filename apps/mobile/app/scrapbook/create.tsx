import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import { useCreateScrapbookPage } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const BG_COLORS = [
  { value: "#F3E8FF", label: "Lavender" },
  { value: "#FFF7ED", label: "Cream" },
  { value: "#F0FDF4", label: "Mint" },
  { value: "#FEF2F2", label: "Rose" },
  { value: "#F0F9FF", label: "Sky" },
  { value: "#FFFBEB", label: "Gold" },
  { value: "#F5F5F4", label: "Stone" },
  { value: "#1E1B4B", label: "Midnight" },
];

export default function CreateScrapbookPageScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const createPage = useCreateScrapbookPage();

  const [title, setTitle] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#F3E8FF");

  const handleSubmit = async () => {
    if (!title.trim() || !user?.id || !memorialId) return;

    await createPage.mutateAsync({
      memorialId,
      createdBy: user.id,
      title: title.trim(),
      pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
      backgroundColor,
    });

    router.back();
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "New Scrapbook Page" }} />
      <ScrollView className="flex-1 px-4 py-4">
        <Input
          label="Page Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Give this page a title..."
        />

        <Input
          label="Page Number (optional)"
          value={pageNumber}
          onChangeText={setPageNumber}
          placeholder="1"
          keyboardType="numeric"
        />

        {/* Background Color */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Background Color
        </Text>
        <View className="flex-row flex-wrap mb-5">
          {BG_COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => setBackgroundColor(c.value)}
              className={`mr-3 mb-3 items-center ${
                backgroundColor === c.value ? "opacity-100" : "opacity-60"
              }`}
            >
              <View
                className={`w-12 h-12 rounded-xl border-2 ${
                  backgroundColor === c.value
                    ? "border-purple-700"
                    : "border-gray-200 dark:border-gray-600"
                }`}
                style={{ backgroundColor: c.value }}
              />
              <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</Text>
        <View
          className="h-48 rounded-2xl mb-5 items-center justify-center border border-gray-200 dark:border-gray-600"
          style={{ backgroundColor }}
        >
          <Text className="text-3xl mb-2">📔</Text>
          <Text
            className={`text-sm font-medium ${
              backgroundColor === "#1E1B4B" ? "text-white" : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {title || "Your Page Title"}
          </Text>
        </View>

        <Button
          title="Create Page"
          onPress={handleSubmit}
          loading={createPage.isPending}
          disabled={!title.trim() || createPage.isPending}
        />

        <View className="h-8" />
      </ScrollView>
    </ScreenWrapper>
  );
}
