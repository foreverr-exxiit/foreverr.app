import React, { useState } from "react";
import { View, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ImagePickerButtonProps {
  /** Current image URL (if already set) */
  value?: string | null;
  /** Called with the local URI when user picks/takes a photo */
  onPick: (uri: string) => void;
  /** Called when user removes the photo */
  onRemove?: () => void;
  /** Label shown above the button */
  label?: string;
  /** Placeholder text when no image */
  placeholder?: string;
  /** Shape: square (1:1) or wide (16:9) or circle */
  shape?: "square" | "wide" | "circle";
  /** Size of the picker area */
  size?: "sm" | "md" | "lg";
  /** Show camera option in addition to gallery */
  showCamera?: boolean;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Upload progress 0-1 */
  progress?: number;
  /** Hook functions — pass from useImageUpload */
  pickImage?: () => Promise<{ uri: string } | null>;
  takePhoto?: () => Promise<{ uri: string } | null>;
  /** Help text */
  helpText?: string;
}

const SIZE_MAP = {
  sm: { container: "h-20 w-20", image: "h-20 w-20", icon: 24 },
  md: { container: "h-32 w-32", image: "h-32 w-32", icon: 32 },
  lg: { container: "h-44 w-full", image: "h-44 w-full", icon: 40 },
};

export function ImagePickerButton({
  value,
  onPick,
  onRemove,
  label,
  placeholder = "Add Photo",
  shape = "square",
  size = "md",
  showCamera = true,
  isUploading = false,
  progress = 0,
  pickImage,
  takePhoto,
  helpText,
}: ImagePickerButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const sizeConfig = SIZE_MAP[size];
  const borderRadius = shape === "circle" ? "rounded-full" : shape === "wide" ? "rounded-xl" : "rounded-2xl";

  const handlePress = () => {
    if (isUploading) return;

    if (value) {
      // Image exists — show remove/replace options
      Alert.alert("Photo", "What would you like to do?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Replace",
          onPress: () => handlePick(),
        },
        ...(onRemove
          ? [{ text: "Remove", style: "destructive" as const, onPress: onRemove }]
          : []),
      ]);
    } else if (showCamera && takePhoto) {
      // No image — show camera/gallery options
      Alert.alert("Add Photo", "Choose a source", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Camera",
          onPress: async () => {
            const result = await takePhoto();
            if (result) onPick(result.uri);
          },
        },
        {
          text: "Photo Library",
          onPress: () => handlePick(),
        },
      ]);
    } else {
      handlePick();
    }
  };

  const handlePick = async () => {
    if (pickImage) {
      const result = await pickImage();
      if (result) onPick(result.uri);
    }
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</Text>
      )}

      <Pressable
        className={`${size === "lg" ? "w-full" : ""} overflow-hidden border-2 border-dashed ${
          value ? "border-brand-300 dark:border-brand-700" : "border-gray-300 dark:border-gray-600"
        } ${borderRadius} ${sizeConfig.container} items-center justify-center bg-gray-50 dark:bg-gray-800 active:opacity-80`}
        onPress={handlePress}
        disabled={isUploading}
      >
        {isUploading ? (
          <View className="items-center justify-center">
            <ActivityIndicator size="small" color="#4A2D7A" />
            <Text className="text-[10px] font-sans text-gray-500 mt-1">
              {Math.round(progress * 100)}%
            </Text>
          </View>
        ) : value ? (
          <View className="relative w-full h-full">
            <Image
              source={{ uri: value }}
              className={`w-full h-full ${borderRadius}`}
              resizeMode="cover"
            />
            {/* Edit overlay */}
            <View className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1.5">
              <Ionicons name="pencil" size={12} color="white" />
            </View>
          </View>
        ) : (
          <View className="items-center justify-center p-2">
            <Ionicons name="camera-outline" size={sizeConfig.icon} color="#9ca3af" />
            <Text className="text-[11px] font-sans text-gray-400 mt-1 text-center">{placeholder}</Text>
          </View>
        )}
      </Pressable>

      {helpText && (
        <Text className="text-[10px] font-sans text-gray-400 mt-1">{helpText}</Text>
      )}
    </View>
  );
}
