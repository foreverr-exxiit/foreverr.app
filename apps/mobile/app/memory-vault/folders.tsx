import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper, VaultFolderCard } from "@foreverr/ui";
import {
  useVaultFolders,
  useCreateVaultFolder,
  useDeleteVaultFolder,
  useAuthStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const FOLDER_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626",
  "#EC4899", "#06B6D4", "#8B5CF6",
];

const FOLDER_ICONS = [
  "folder", "heart", "star", "bookmark", "camera",
  "musical-notes", "book", "gift",
];

export default function VaultFoldersScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: folders } = useVaultFolders(memorialId);
  const createFolder = useCreateVaultFolder();
  const deleteFolder = useDeleteVaultFolder();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);

  const handleCreate = async () => {
    if (!name.trim() || !user?.id || !memorialId) return;
    await createFolder.mutateAsync({
      memorialId,
      createdBy: user.id,
      name: name.trim(),
      description: description.trim() || undefined,
      color: selectedColor,
      icon: selectedIcon,
    });
    setName("");
    setDescription("");
    setShowCreate(false);
  };

  const handleDelete = (folderId: string, folderName: string) => {
    Alert.alert("Delete Folder", `Remove "${folderName}"? Items inside will not be deleted.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteFolder.mutateAsync(folderId),
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Manage Folders",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Create Form */}
      {showCreate && (
        <View className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-brand-200 dark:border-brand-800">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
              New Folder
            </Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Input
            label="Folder Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Childhood Photos"
          />

          <Input
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="What goes in this folder?"
          />

          {/* Color Picker */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Color
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {FOLDER_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 0,
                  borderColor: "#fff",
                }}
              >
                {selectedColor === color && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Icon Picker */}
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300 mb-2">
            Icon
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {FOLDER_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  selectedIcon === icon
                    ? "bg-brand-100 dark:bg-brand-900/30"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Ionicons
                  name={icon as any}
                  size={20}
                  color={selectedIcon === icon ? "#7C3AED" : "#6b7280"}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Create Folder"
            onPress={handleCreate}
            loading={createFolder.isPending}
            disabled={!name.trim()}
          />
        </View>
      )}

      {/* Folders List */}
      <FlatList
        data={folders ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-3"
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleDelete(item.id, item.name)}
            delayLongPress={500}
          >
            <VaultFolderCard
              name={item.name}
              icon={item.icon}
              color={item.color}
              itemCount={item.item_count}
              onPress={() =>
                router.push(
                  `/memory-vault?memorialId=${memorialId}&folderId=${item.id}&folderName=${encodeURIComponent(item.name)}`
                )
              }
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !showCreate ? (
            <View className="items-center py-16">
              <Ionicons name="folder-open-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 font-sans mt-3 mb-1">No folders yet</Text>
              <Text className="text-xs text-gray-400 font-sans text-center px-8 mb-4">
                Create folders to organize your vault items into collections.
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                className="bg-brand-100 dark:bg-brand-900/20 rounded-xl px-5 py-2.5"
              >
                <Text className="text-sm font-sans-medium text-brand-700">
                  Create First Folder
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        ListFooterComponent={
          (folders?.length ?? 0) > 0 ? (
            <View className="items-center py-4">
              <Text className="text-xs text-gray-400 font-sans">
                Long press a folder to delete it
              </Text>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      {!showCreate && (
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-brand-700 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
