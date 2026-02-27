import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import { useCreateVaultItem, useCreateTimeCapsule } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const ITEM_TYPES = [
  { value: "document", label: "Document", icon: "📄" },
  { value: "recipe", label: "Recipe", icon: "🍳" },
  { value: "letter", label: "Letter", icon: "✉️" },
  { value: "audio_playlist", label: "Playlist", icon: "🎵" },
  { value: "quote", label: "Quote", icon: "💬" },
  { value: "photo_album", label: "Photo Album", icon: "📸" },
  { value: "video", label: "Video", icon: "🎬" },
  { value: "time_capsule", label: "Time Capsule", icon: "🔮" },
];

export default function CreateVaultItemScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const createItem = useCreateVaultItem();
  const createCapsule = useCreateTimeCapsule();

  const [itemType, setItemType] = useState("document");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const isTimeCapsule = itemType === "time_capsule";
  const isLoading = createItem.isPending || createCapsule.isPending;

  const handleSubmit = async () => {
    if (!title.trim() || !user?.id || !memorialId) return;

    if (isTimeCapsule) {
      if (!unlockDate.trim()) return;
      await createCapsule.mutateAsync({
        memorialId,
        createdBy: user.id,
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
        unlockDate: new Date(unlockDate).toISOString(),
      });
    } else {
      await createItem.mutateAsync({
        memorialId,
        uploadedBy: user.id,
        itemType,
        title: title.trim(),
        description: description.trim() || undefined,
        content: content.trim() || undefined,
        isPrivate,
      });
    }

    router.back();
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: isTimeCapsule ? "Create Time Capsule" : "Add to Vault" }} />
      <ScrollView className="flex-1 px-4 py-4">
        {/* Type Selection */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</Text>
        <View className="flex-row flex-wrap mb-4">
          {ITEM_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              onPress={() => setItemType(t.value)}
              className={`px-3 py-2 rounded-xl mr-2 mb-2 flex-row items-center ${
                itemType === t.value ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Text className="mr-1">{t.icon}</Text>
              <Text className={`text-sm ${itemType === t.value ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title..."
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Brief description..."
          multiline
          numberOfLines={2}
        />

        <Input
          label={isTimeCapsule ? "Hidden Message" : "Content"}
          value={content}
          onChangeText={setContent}
          placeholder={isTimeCapsule ? "Write the message to be revealed..." : "Text content..."}
          multiline
          numberOfLines={4}
        />

        {isTimeCapsule && (
          <Input
            label="Unlock Date (YYYY-MM-DD)"
            value={unlockDate}
            onChangeText={setUnlockDate}
            placeholder="2027-01-01"
          />
        )}

        {!isTimeCapsule && (
          <TouchableOpacity
            onPress={() => setIsPrivate(!isPrivate)}
            className="flex-row items-center mb-4"
          >
            <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
              isPrivate ? "bg-purple-700 border-purple-700" : "border-gray-300"
            }`}>
              {isPrivate && <Text className="text-white text-xs">✓</Text>}
            </View>
            <Text className="text-sm text-gray-700 dark:text-gray-300">Private (hosts only)</Text>
          </TouchableOpacity>
        )}

        <Button
          title={isTimeCapsule ? "Create Time Capsule" : "Add to Vault"}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!title.trim() || isLoading}
        />
      </ScrollView>
    </ScreenWrapper>
  );
}
