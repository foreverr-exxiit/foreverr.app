import React from "react";
import { View, Pressable, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ImportPreviewItem {
  id: string;
  contentType: string;
  content?: string;
  mediaUrl?: string;
  selected: boolean;
}

interface ImportPreviewGridProps {
  items: ImportPreviewItem[];
  onToggleItem: (id: string) => void;
  onSelectAll: () => void;
  onImportSelected: () => void;
}

const CONTENT_TYPE_ICONS: Record<string, string> = {
  photo: "image",
  video: "videocam",
  text: "document-text",
  post: "chatbubble-ellipses",
  story: "book",
  memory: "heart",
  person: "person",
  relationship: "people",
};

function PreviewItem({
  item,
  onToggle,
}: {
  item: ImportPreviewItem;
  onToggle: () => void;
}) {
  const iconName = CONTENT_TYPE_ICONS[item.contentType] ?? "document";
  const isMedia = item.contentType === "photo" || item.contentType === "video";

  return (
    <Pressable
      onPress={onToggle}
      className="flex-1 m-1 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700"
      style={{ aspectRatio: 1 }}
    >
      {/* Content */}
      {isMedia && item.mediaUrl ? (
        <Image
          source={{ uri: item.mediaUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-full bg-gray-100 dark:bg-gray-800 items-center justify-center p-2">
          <Ionicons name={iconName as any} size={28} color="#9CA3AF" />
          {item.content && (
            <Text
              className="text-[10px] font-sans text-gray-500 dark:text-gray-400 text-center mt-1"
              numberOfLines={2}
            >
              {item.content}
            </Text>
          )}
        </View>
      )}

      {/* Checkbox overlay */}
      <View className="absolute top-2 right-2">
        <View
          className={`w-6 h-6 rounded-full items-center justify-center ${
            item.selected
              ? "bg-brand-700"
              : "bg-white/80 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-600"
          }`}
        >
          {item.selected && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
      </View>

      {/* Content type badge */}
      <View className="absolute bottom-2 left-2 bg-black/50 rounded-md px-1.5 py-0.5 flex-row items-center">
        <Ionicons name={iconName as any} size={10} color="white" />
        <Text className="text-[9px] font-sans text-white ml-1 capitalize">
          {item.contentType}
        </Text>
      </View>
    </Pressable>
  );
}

export function ImportPreviewGrid({
  items,
  onToggleItem,
  onSelectAll,
  onImportSelected,
}: ImportPreviewGridProps) {
  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <View className="flex-1">
      {/* Toolbar */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <Pressable onPress={onSelectAll} className="flex-row items-center">
          <View
            className={`w-5 h-5 rounded items-center justify-center mr-2 ${
              allSelected
                ? "bg-brand-700"
                : "border border-gray-300 dark:border-gray-600"
            }`}
          >
            {allSelected && (
              <Ionicons name="checkmark" size={12} color="white" />
            )}
          </View>
          <Text className="text-sm font-sans-medium text-gray-700 dark:text-gray-300">
            {allSelected ? "Deselect All" : "Select All"}
          </Text>
        </Pressable>

        <Text className="text-sm font-sans text-gray-500 dark:text-gray-400">
          {selectedCount} of {items.length} selected
        </Text>
      </View>

      {/* Grid */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 4 }}
        renderItem={({ item }) => (
          <PreviewItem
            item={item}
            onToggle={() => onToggleItem(item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-16">
            <Ionicons name="cloud-download-outline" size={48} color="#D1D5DB" />
            <Text className="text-base font-sans-semibold text-gray-400 mt-4">
              No items to preview
            </Text>
            <Text className="text-sm font-sans text-gray-400 text-center mt-1 px-8">
              Connect a source and fetch content to see a preview
            </Text>
          </View>
        }
      />

      {/* Import button */}
      {selectedCount > 0 && (
        <View className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          <Pressable
            onPress={onImportSelected}
            className="bg-brand-700 rounded-xl py-3.5 items-center flex-row justify-center"
          >
            <Ionicons name="cloud-download" size={18} color="white" />
            <Text className="text-base font-sans-semibold text-white ml-2">
              Import {selectedCount} {selectedCount === 1 ? "Item" : "Items"}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
