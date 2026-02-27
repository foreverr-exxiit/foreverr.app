import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import { useCreateFamilyTree } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

export default function CreateFamilyTreeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createTree = useCreateFamilyTree();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !user?.id) return;

    const tree = await createTree.mutateAsync({
      name: name.trim(),
      createdBy: user.id,
      description: description.trim() || undefined,
    });

    router.replace(`/family-tree/${tree.id}`);
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Create Family Tree" }} />
      <ScrollView className="flex-1 px-4 py-6">
        <View className="items-center mb-8">
          <Text className="text-5xl mb-3">🌳</Text>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">New Family Tree</Text>
          <Text className="text-sm text-gray-500 text-center mt-1">
            Connect memorials and living family members into a visual lineage.
          </Text>
        </View>

        <Input
          label="Tree Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., The Smith Family"
        />

        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="A brief description of this family tree..."
          multiline
          numberOfLines={3}
        />

        <Button
          title="Create Tree"
          onPress={handleSubmit}
          loading={createTree.isPending}
          disabled={!name.trim() || createTree.isPending}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
