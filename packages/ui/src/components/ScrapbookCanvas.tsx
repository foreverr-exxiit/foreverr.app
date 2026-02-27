import React from "react";
import { View, Text, Image, Pressable } from "react-native";

export interface CanvasElement {
  id: string;
  element_type: string;
  content: string | null;
  media_url: string | null;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  style_data: Record<string, unknown>;
}

interface ScrapbookCanvasProps {
  elements: CanvasElement[];
  backgroundColor: string;
  canvasWidth: number;
  canvasHeight: number;
  onElementPress?: (id: string) => void;
  selectedElementId?: string | null;
}

function CanvasItem({
  element,
  onPress,
  isSelected,
}: {
  element: CanvasElement;
  onPress?: () => void;
  isSelected: boolean;
}) {
  const baseStyle = {
    position: "absolute" as const,
    left: element.position_x,
    top: element.position_y,
    width: element.width,
    height: element.height,
    transform: [{ rotate: `${element.rotation}deg` }],
    zIndex: element.z_index,
  };

  const selectedBorder = isSelected
    ? { borderWidth: 2, borderColor: "#4A2D7A", borderStyle: "dashed" as const }
    : {};

  switch (element.element_type) {
    case "photo":
      return (
        <Pressable style={[baseStyle, selectedBorder]} onPress={onPress}>
          {element.media_url ? (
            <Image
              source={{ uri: element.media_url }}
              style={{ width: "100%", height: "100%", borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
              <Text className="text-2xl">🖼️</Text>
            </View>
          )}
        </Pressable>
      );

    case "text":
      return (
        <Pressable
          style={[
            baseStyle,
            selectedBorder,
            { padding: 8, justifyContent: "center" },
          ]}
          onPress={onPress}
        >
          <Text
            className="text-gray-900 dark:text-white"
            style={{
              fontSize: (element.style_data?.fontSize as number) ?? 16,
              fontWeight: (element.style_data?.fontWeight as "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900") ?? "normal",
              color: (element.style_data?.color as string) ?? "#1f2937",
              textAlign: (element.style_data?.textAlign as any) ?? "left",
            }}
          >
            {element.content ?? ""}
          </Text>
        </Pressable>
      );

    case "sticker":
      return (
        <Pressable
          style={[baseStyle, selectedBorder, { alignItems: "center", justifyContent: "center" }]}
          onPress={onPress}
        >
          <Text style={{ fontSize: Math.min(element.width, element.height) * 0.6 }}>
            {element.content ?? "⭐"}
          </Text>
        </Pressable>
      );

    case "shape":
      return (
        <Pressable
          style={[
            baseStyle,
            selectedBorder,
            {
              backgroundColor: (element.style_data?.fill as string) ?? "#e5e7eb",
              borderRadius: (element.style_data?.borderRadius as number) ?? 8,
              opacity: (element.style_data?.opacity as number) ?? 1,
            },
          ]}
          onPress={onPress}
        />
      );

    case "divider":
      return (
        <Pressable
          style={[
            baseStyle,
            selectedBorder,
            { justifyContent: "center" },
          ]}
          onPress={onPress}
        >
          <View
            style={{
              height: 2,
              backgroundColor: (element.style_data?.color as string) ?? "#d1d5db",
              width: "100%",
            }}
          />
        </Pressable>
      );

    default:
      return null;
  }
}

export function ScrapbookCanvas({
  elements,
  backgroundColor,
  canvasWidth,
  canvasHeight,
  onElementPress,
  selectedElementId,
}: ScrapbookCanvasProps) {
  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: backgroundColor || "#fefce8",
      }}
    >
      {elements.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-3">✨</Text>
          <Text className="text-sm font-sans text-gray-500">
            Tap the toolbar below to add elements
          </Text>
        </View>
      ) : (
        elements.map((el) => (
          <CanvasItem
            key={el.id}
            element={el}
            isSelected={selectedElementId === el.id}
            onPress={() => onElementPress?.(el.id)}
          />
        ))
      )}
    </View>
  );
}
