import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import { useCreateVirtualSpace } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const SPACE_TYPES = [
  { value: "memorial_room", label: "Memorial Room", icon: "🏛️" },
  { value: "garden", label: "Garden", icon: "🌸" },
  { value: "chapel", label: "Chapel", icon: "⛪" },
  { value: "gravesite", label: "Gravesite", icon: "🪦" },
  { value: "beach", label: "Beach", icon: "🏖️" },
  { value: "forest", label: "Forest", icon: "🌲" },
  { value: "custom", label: "Custom", icon: "✨" },
];

export default function CreateVirtualSpaceScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const createSpace = useCreateVirtualSpace();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spaceType, setSpaceType] = useState("memorial_room");

  const handleSubmit = async () => {
    if (!name.trim() || !user?.id || !memorialId) return;

    const space = await createSpace.mutateAsync({
      memorialId,
      createdBy: user.id,
      name: name.trim(),
      description: description.trim() || undefined,
      spaceType,
    });

    router.replace(`/virtual-space/${space.id}`);
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Create Virtual Space" }} />
      <ScrollView className="flex-1 px-4 py-6">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">🏛️</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">New Virtual Space</Text>
          <Text className="text-sm text-gray-500 text-center mt-1">
            Create an immersive 3D memorial space where visitors can place tributes.
          </Text>
        </View>

        <Input
          label="Space Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., Dad's Memorial Garden"
        />

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe this space..."
          multiline
          numberOfLines={3}
        />

        {/* Space Type Selection */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Space Type</Text>
        <View className="flex-row flex-wrap mb-6">
          {SPACE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setSpaceType(t.value)}
              className={`px-4 py-3 rounded-xl mr-2 mb-2 items-center ${
                spaceType === t.value ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
              }`}
              style={{ minWidth: 100 }}
            >
              <Text className="text-2xl mb-1">{t.icon}</Text>
              <Text className={`text-xs font-medium ${
                spaceType === t.value ? "text-white" : "text-gray-700 dark:text-gray-300"
              }`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Create Space"
          onPress={handleSubmit}
          loading={createSpace.isPending}
          disabled={!name.trim() || createSpace.isPending}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
