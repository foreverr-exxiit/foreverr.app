import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, ScrollView, useWindowDimensions } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import {
  Text,
  ScreenWrapper,
  MemoryVaultCard,
  TimeCapsuleCard,
  VaultDashboardStats,
  VaultCategoryCard,
  VaultFolderCard,
  VaultSearchBar,
} from "@foreverr/ui";
import {
  useMemoryVaultItems,
  useTimeCapsules,
  useVaultStats,
  useVaultFolders,
  useSearchVaultItems,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const VAULT_CATEGORIES = [
  { key: "all", title: "All Items", icon: "albums", color: "#7C3AED", type: undefined },
  { key: "document", title: "Documents", icon: "document-text", color: "#2563EB", type: "document" },
  { key: "recipe", title: "Recipes", icon: "restaurant", color: "#D97706", type: "recipe" },
  { key: "letter", title: "Letters", icon: "mail", color: "#DC2626", type: "letter" },
  { key: "quote", title: "Quotes", icon: "chatbubble-ellipses", color: "#059669", type: "quote" },
  { key: "photo_album", title: "Albums", icon: "images", color: "#7C3AED", type: "photo_album" },
  { key: "capsules", title: "Time Capsules", icon: "time", color: "#D97706", type: undefined },
] as const;

type ViewMode = "dashboard" | "category" | "capsules" | "search" | "folder";

export default function MemoryVaultScreen() {
  const router = useRouter();
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { width } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  const [activeFolderId, setActiveFolderId] = useState<string | undefined>(undefined);
  const [activeFolderName, setActiveFolderName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const stats = useVaultStats(memorialId);
  const folders = useVaultFolders(memorialId);
  const capsules = useTimeCapsules(viewMode === "capsules" ? memorialId : undefined);
  const vaultItems = useMemoryVaultItems(
    viewMode === "category" || viewMode === "folder" ? memorialId : undefined,
    viewMode === "category" ? activeCategory : undefined
  );
  const searchResults = useSearchVaultItems(memorialId, searchQuery);

  const vaultData = vaultItems.data?.pages?.flatMap((p) => p.data) ?? [];
  const typeCounts = stats.data?.typeCounts ?? {};

  const handleCategoryPress = (key: string, type: string | undefined) => {
    if (key === "capsules") {
      setViewMode("capsules");
    } else {
      setActiveCategory(type);
      setViewMode("category");
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      setViewMode("search");
    } else if (viewMode === "search") {
      setViewMode("dashboard");
    }
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Memory Vault",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Search Bar */}
      <View className="pt-3">
        <VaultSearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Search vault items..."
        />
      </View>

      {/* Back to Dashboard button when in sub-view */}
      {viewMode !== "dashboard" && viewMode !== "search" && (
        <TouchableOpacity
          onPress={() => setViewMode("dashboard")}
          className="flex-row items-center mx-4 mb-3"
        >
          <Ionicons name="arrow-back" size={16} color="#7C3AED" />
          <Text className="text-sm font-sans-medium text-brand-700 ml-1">Back to Dashboard</Text>
        </TouchableOpacity>
      )}

      {/* DASHBOARD VIEW */}
      {viewMode === "dashboard" && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats Header */}
          <VaultDashboardStats
            totalItems={stats.data?.totalItems ?? 0}
            capsulesPending={stats.data?.capsulesPending ?? 0}
            folderCount={stats.data?.folderCount ?? 0}
          />

          {/* Categories Grid */}
          <View className="px-4 mb-4">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
              Browse by Category
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {VAULT_CATEGORIES.map((cat) => (
                <View key={cat.key} style={{ width: (width - 42) / 2 }}>
                  <VaultCategoryCard
                    title={cat.title}
                    icon={cat.icon}
                    count={cat.key === "capsules" ? (stats.data?.capsulesPending ?? 0) : (typeCounts[cat.type ?? ""] ?? 0)}
                    color={cat.color}
                    onPress={() => handleCategoryPress(cat.key, cat.type)}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Folders Section */}
          {(folders.data?.length ?? 0) > 0 && (
            <View className="px-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
                  Folders
                </Text>
                <TouchableOpacity
                  onPress={() => router.push(`/memory-vault/folders?memorialId=${memorialId}`)}
                >
                  <Text className="text-sm font-sans-medium text-brand-700">Manage</Text>
                </TouchableOpacity>
              </View>
              {folders.data?.map((folder) => (
                <VaultFolderCard
                  key={folder.id}
                  name={folder.name}
                  icon={folder.icon}
                  color={folder.color}
                  itemCount={folder.item_count}
                  onPress={() => {
                    setActiveFolderId(folder.id);
                    setActiveFolderName(folder.name);
                    setViewMode("folder");
                  }}
                />
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View className="px-4 mb-8">
            <TouchableOpacity
              onPress={() => router.push(`/memory-vault/folders?memorialId=${memorialId}`)}
              className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 flex-row items-center mb-2"
            >
              <Ionicons name="folder-open" size={20} color="#7C3AED" />
              <Text className="text-sm font-sans-medium text-brand-700 ml-3 flex-1">
                Manage Folders
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* SEARCH RESULTS VIEW */}
      {viewMode === "search" && (
        <FlatList
          data={searchResults.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-2"
          renderItem={({ item }) => (
            <MemoryVaultCard
              title={item.title}
              itemType={item.item_type}
              description={item.description}
              uploaderName={undefined}
              createdAt={item.created_at}
              isPrivate={item.is_private}
              onPress={() =>
                router.push(`/memory-vault/${item.id}?type=item&memorialId=${memorialId}`)
              }
            />
          )}
          ListEmptyComponent={
            searchQuery.length >= 2 ? (
              <View className="items-center py-12">
                <Text className="text-4xl mb-3">🔍</Text>
                <Text className="text-gray-500 font-sans">No results found</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* CAPSULES VIEW */}
      {viewMode === "capsules" && (
        <FlatList
          data={capsules.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-2"
          renderItem={({ item }) => (
            <TimeCapsuleCard
              title={item.title}
              description={item.description}
              unlockDate={item.unlock_date}
              isUnlocked={item.is_unlocked}
              viewCount={item.view_count}
              onPress={() =>
                router.push(`/memory-vault/${item.id}?type=capsule&memorialId=${memorialId}`)
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">🔮</Text>
              <Text className="text-gray-500 font-sans">No time capsules yet</Text>
            </View>
          }
        />
      )}

      {/* CATEGORY VIEW */}
      {viewMode === "category" && (
        <FlatList
          data={vaultData}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-2"
          onEndReached={() => vaultItems.hasNextPage && vaultItems.fetchNextPage()}
          renderItem={({ item }) => (
            <MemoryVaultCard
              title={item.title}
              itemType={item.item_type}
              description={item.description}
              uploaderName={(item as any).uploader?.display_name}
              createdAt={item.created_at}
              isPrivate={item.is_private}
              onPress={() =>
                router.push(`/memory-vault/${item.id}?type=item&memorialId=${memorialId}`)
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-4xl mb-3">📦</Text>
              <Text className="text-gray-500 font-sans">No items in this category</Text>
            </View>
          }
        />
      )}

      {/* FOLDER VIEW */}
      {viewMode === "folder" && (
        <>
          <View className="px-4 py-2">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
              📁 {activeFolderName}
            </Text>
          </View>
          <FlatList
            data={vaultData.filter((item: any) => item.folder_id === activeFolderId)}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-4 py-2"
            renderItem={({ item }) => (
              <MemoryVaultCard
                title={item.title}
                itemType={item.item_type}
                description={item.description}
                uploaderName={(item as any).uploader?.display_name}
                createdAt={item.created_at}
                isPrivate={item.is_private}
                onPress={() =>
                  router.push(`/memory-vault/${item.id}?type=item&memorialId=${memorialId}`)
                }
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-12">
                <Text className="text-4xl mb-3">📂</Text>
                <Text className="text-gray-500 font-sans">No items in this folder yet</Text>
                <Text className="text-xs text-gray-400 font-sans text-center mt-1 px-8">
                  Add items to this folder from the vault dashboard
                </Text>
              </View>
            }
          />
        </>
      )}

      {/* FAB - Create */}
      <TouchableOpacity
        onPress={() => router.push(`/memory-vault/create?memorialId=${memorialId}`)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-brand-700 rounded-full items-center justify-center shadow-lg"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}
