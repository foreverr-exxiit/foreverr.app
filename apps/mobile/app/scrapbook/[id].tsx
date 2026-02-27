import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  Text,
  Input,
  Button,
  ScreenWrapper,
  ScrapbookCanvas,
  ScrapbookElementToolbar,
} from "@foreverr/ui";
import type { CanvasElement } from "@foreverr/ui";
import {
  useScrapbookPages,
  useUpdateScrapbookPage,
  useScrapbookElements,
  useAddScrapbookElement,
  useDeleteScrapbookElement,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const STICKER_OPTIONS = ["⭐", "❤️", "🌸", "🕊️", "🕯️", "🌈", "🦋", "✨", "🎵", "💐", "🙏", "☀️"];

export default function ScrapbookPageDetailScreen() {
  const { id, memorialId } = useLocalSearchParams<{
    id: string;
    memorialId?: string;
  }>();
  const { width: screenWidth } = useWindowDimensions();

  const { data: pages } = useScrapbookPages(memorialId);
  const page = pages?.find((p) => p.id === id);
  const updatePage = useUpdateScrapbookPage();

  // Scrapbook elements
  const { data: elements } = useScrapbookElements(id);
  const addElement = useAddScrapbookElement();
  const deleteElement = useDeleteScrapbookElement();

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const canvasWidth = screenWidth - 32;
  const canvasHeight = canvasWidth * 1.2;

  if (!page) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: "Loading...",
            headerStyle: { backgroundColor: "#2D1B4E" },
            headerTintColor: "#fff",
          }}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass-outline" size={24} color="#7C3AED" />
          <Text className="text-gray-400 font-sans mt-2">Loading page...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const handlePublishToggle = async () => {
    await updatePage.mutateAsync({
      pageId: page.id,
      isPublished: !page.is_published,
    });
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim()) return;
    await updatePage.mutateAsync({
      pageId: page.id,
      title: editTitle.trim(),
    });
    setEditing(false);
  };

  const canvasElements: CanvasElement[] = (elements ?? []).map((el) => ({
    id: el.id,
    element_type: el.element_type,
    content: el.content,
    media_url: el.media_url,
    position_x: el.position_x,
    position_y: el.position_y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    z_index: el.z_index,
    style_data: (el.style_data as Record<string, unknown>) ?? {},
  }));

  const handleAddPhoto = () => {
    addElement.mutate({
      pageId: page.id,
      elementType: "photo",
      positionX: Math.random() * (canvasWidth - 150),
      positionY: Math.random() * (canvasHeight - 150),
      width: 150,
      height: 150,
      zIndex: canvasElements.length,
    });
  };

  const handleAddText = () => {
    addElement.mutate({
      pageId: page.id,
      elementType: "text",
      content: "Tap to edit",
      positionX: Math.random() * (canvasWidth - 180),
      positionY: Math.random() * (canvasHeight - 60),
      width: 180,
      height: 60,
      zIndex: canvasElements.length,
      styleData: { fontSize: 16, color: "#1f2937", textAlign: "center" },
    });
  };

  const handleAddSticker = () => {
    setShowStickerPicker(true);
  };

  const handleSelectSticker = (sticker: string) => {
    addElement.mutate({
      pageId: page.id,
      elementType: "sticker",
      content: sticker,
      positionX: Math.random() * (canvasWidth - 60),
      positionY: Math.random() * (canvasHeight - 60),
      width: 60,
      height: 60,
      zIndex: canvasElements.length,
    });
    setShowStickerPicker(false);
  };

  const handleAddShape = () => {
    addElement.mutate({
      pageId: page.id,
      elementType: "shape",
      positionX: Math.random() * (canvasWidth - 100),
      positionY: Math.random() * (canvasHeight - 100),
      width: 100,
      height: 100,
      zIndex: canvasElements.length,
      styleData: { fill: "#e5e7eb", borderRadius: 12, opacity: 0.8 },
    });
  };

  const handleDeleteElement = () => {
    if (!selectedElementId) return;
    Alert.alert("Delete Element", "Remove this element from the page?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteElement.mutate({ elementId: selectedElementId, pageId: page.id });
          setSelectedElementId(null);
        },
      },
    ]);
  };

  const handleElementPress = (elementId: string) => {
    setSelectedElementId(selectedElementId === elementId ? null : elementId);
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: page.title,
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
          headerRight: () => (
            <View className="flex-row items-center mr-2 gap-3">
              <TouchableOpacity onPress={handlePublishToggle}>
                <Ionicons
                  name={page.is_published ? "cloud-done" : "cloud-upload-outline"}
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditTitle(page.title);
                  setEditing(!editing);
                }}
              >
                <Ionicons name="create-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Edit Title Form */}
        {editing && (
          <View className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-brand-200 dark:border-brand-800">
            <Input
              label="Page Title"
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="New title..."
            />
            <View className="flex-row mt-2 gap-2">
              <View className="flex-1">
                <Button
                  title="Save"
                  onPress={handleSaveTitle}
                  loading={updatePage.isPending}
                />
              </View>
              <TouchableOpacity
                onPress={() => setEditing(false)}
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl justify-center"
              >
                <Text className="text-sm font-sans text-gray-600 dark:text-gray-300">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Page Status */}
        <View className="flex-row items-center justify-between mx-4 mt-3 mb-2">
          {page.page_number ? (
            <View className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1">
              <Text className="text-xs font-sans-medium text-brand-700">
                Page {page.page_number}
              </Text>
            </View>
          ) : <View />}
          <View
            className={`rounded-full px-3 py-1 ${
              page.is_published
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-amber-100 dark:bg-amber-900/20"
            }`}
          >
            <Text
              className={`text-xs font-sans-medium ${
                page.is_published ? "text-green-700" : "text-amber-700"
              }`}
            >
              {page.is_published ? "Published" : "Draft"}
            </Text>
          </View>
        </View>

        {/* Scrapbook Canvas */}
        <View className="mx-4 mt-1 mb-3">
          <ScrapbookCanvas
            elements={canvasElements}
            backgroundColor={page.background_color || "#F3E8FF"}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onElementPress={handleElementPress}
            selectedElementId={selectedElementId}
          />
        </View>

        {/* Sticker Picker */}
        {showStickerPicker && (
          <View className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                Choose a Sticker
              </Text>
              <TouchableOpacity onPress={() => setShowStickerPicker(false)}>
                <Ionicons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-3">
              {STICKER_OPTIONS.map((sticker) => (
                <TouchableOpacity
                  key={sticker}
                  onPress={() => handleSelectSticker(sticker)}
                  className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 items-center justify-center"
                >
                  <Text className="text-2xl">{sticker}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Canvas Info */}
        <View className="mx-4 mb-3">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
            <View className="flex-row justify-between items-center py-1.5">
              <View className="flex-row items-center">
                <Ionicons name="layers-outline" size={14} color="#9ca3af" />
                <Text className="text-sm font-sans text-gray-500 ml-2">Elements</Text>
              </View>
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">
                {canvasElements.length}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-1.5 border-t border-gray-50 dark:border-gray-700 mt-1">
              <View className="flex-row items-center">
                <Ionicons name="color-palette-outline" size={14} color="#9ca3af" />
                <Text className="text-sm font-sans text-gray-500 ml-2">Background</Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="w-4 h-4 rounded-full mr-2 border border-gray-200"
                  style={{ backgroundColor: page.background_color || "#F3E8FF" }}
                />
                <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">
                  {page.background_color || "Default"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tip */}
        <View className="mx-4 mb-8">
          <View className="bg-brand-50 dark:bg-brand-900/10 rounded-xl p-3 flex-row items-center">
            <Ionicons name="bulb-outline" size={16} color="#7C3AED" />
            <Text className="text-xs font-sans text-brand-700 ml-2 flex-1">
              Tap an element to select it. Use the toolbar below to add new elements.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Toolbar */}
      <ScrapbookElementToolbar
        onAddPhoto={handleAddPhoto}
        onAddText={handleAddText}
        onAddSticker={handleAddSticker}
        onAddShape={handleAddShape}
        onDelete={handleDeleteElement}
        hasSelection={!!selectedElementId}
      />
    </ScreenWrapper>
  );
}
