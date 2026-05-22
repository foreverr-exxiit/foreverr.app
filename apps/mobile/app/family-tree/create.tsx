import React, { useState, useCallback } from "react";
import { View, ScrollView, Alert, Pressable } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, Input } from "@foreverr/ui";
import { useCreateFamilyTree, useAuth } from "@foreverr/core";

export default function CreateFamilyTreeScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/family-tree" as any);
  }, [router]);
  const { user } = useAuth();
  const createTree = useCreateFamilyTree();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = name.trim().length > 0 && !createTree.isPending;

  const handleSubmit = async () => {
    // Always show login prompt first if not authenticated
    if (!user?.id) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to create a family tree.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/(auth)/login" as any) },
        ]
      );
      return;
    }

    if (!name.trim()) {
      Alert.alert("Name Required", "Please enter a name for your family tree.");
      return;
    }

    try {
      const tree = await createTree.mutateAsync({
        name: name.trim(),
        createdBy: user.id,
        description: description.trim() || undefined,
      });

      Alert.alert(
        "Family Tree Created! 🌳",
        `"${name.trim()}" is ready. Start adding family members.`,
        [{ text: "OK", onPress: () => router.replace(`/family-tree/${tree.id}` as any) }]
      );
    } catch (err: any) {
      Alert.alert(
        "Could Not Create Tree",
        err?.message ?? "Something went wrong. Please try again."
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-5 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              New Family Tree
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Connect family members into a visual lineage
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="items-center py-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Text style={{ fontSize: 40 }}>{"\u{1F333}"}</Text>
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
            Create Your Family Tree
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Build a visual family tree connecting memorials and living family members.
          </Text>
        </View>

        {/* Not signed in banner */}
        {!user?.id && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-5 mb-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to create a tree
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        {/* Form */}
        <View className="px-5 gap-5">
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
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          {/* Create Button - ALWAYS tappable, shows alerts for validation */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center mt-2 ${
              canSubmit
                ? "bg-brand-700 active:bg-brand-800"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
            style={({ pressed }) => [
              canSubmit && pressed && { opacity: 0.85 },
            ]}
          >
            <Text
              className={`text-base font-sans-bold ${
                canSubmit ? "text-white" : "text-gray-500"
              }`}
            >
              {createTree.isPending ? "Creating..." : "Create Family Tree"}
            </Text>
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              After creating, you can add family members and define relationships between them.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
