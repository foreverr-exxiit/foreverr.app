import React from "react";
import { View, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ShareCardPreviewProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  templateLayout?: "standard" | "photo_overlay" | "minimal" | "celebration";
  backgroundColor?: string;
  textColor?: string;
  onShare?: () => void;
}

export function ShareCardPreview({
  title,
  subtitle,
  imageUrl,
  templateLayout = "standard",
  backgroundColor = "#2D1B4E",
  textColor = "#FFFFFF",
  onShare,
}: ShareCardPreviewProps) {
  const renderStandard = () => (
    <View
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor }}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-40"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text
          className="text-lg font-sans-bold"
          style={{ color: textColor }}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-sm font-sans mt-1 opacity-80"
            style={{ color: textColor }}
            numberOfLines={3}
          >
            {subtitle}
          </Text>
        )}
        <View className="flex-row items-center mt-3">
          <View className="h-5 w-5 rounded-full bg-white/20 items-center justify-center">
            <Ionicons name="heart" size={12} color={textColor} />
          </View>
          <Text
            className="ml-1.5 text-[10px] font-sans-medium opacity-60"
            style={{ color: textColor }}
          >
            foreverr.app
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPhotoOverlay = () => (
    <View className="rounded-2xl overflow-hidden h-56" style={{ backgroundColor }}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      )}
      <View className="absolute inset-0 bg-black/40" />
      <View className="flex-1 justify-end p-4">
        <Text className="text-lg font-sans-bold text-white" numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm font-sans text-white/80 mt-1" numberOfLines={2}>
            {subtitle}
          </Text>
        )}
        <Text className="text-[10px] font-sans text-white/50 mt-2">foreverr.app</Text>
      </View>
    </View>
  );

  const renderMinimal = () => (
    <View
      className="rounded-2xl p-5"
      style={{ backgroundColor }}
    >
      <Text
        className="text-base font-sans-bold text-center"
        style={{ color: textColor }}
        numberOfLines={2}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className="text-sm font-sans text-center mt-2 opacity-70"
          style={{ color: textColor }}
          numberOfLines={3}
        >
          {subtitle}
        </Text>
      )}
      <Text
        className="text-[10px] font-sans text-center mt-3 opacity-50"
        style={{ color: textColor }}
      >
        foreverr.app
      </Text>
    </View>
  );

  const renderCelebration = () => (
    <View
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor }}
    >
      <View className="items-center px-4 pt-6 pb-2">
        <View className="flex-row">
          <Ionicons name="sparkles" size={20} color="#F59E0B" />
          <Ionicons name="star" size={16} color="#FBBF24" style={{ marginHorizontal: 4 }} />
          <Ionicons name="sparkles" size={20} color="#F59E0B" />
        </View>
      </View>
      {imageUrl && (
        <View className="items-center">
          <Image
            source={{ uri: imageUrl }}
            className="h-20 w-20 rounded-full border-2 border-white/30"
          />
        </View>
      )}
      <View className="p-4 items-center">
        <Text
          className="text-lg font-sans-bold text-center"
          style={{ color: textColor }}
          numberOfLines={2}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            className="text-sm font-sans text-center mt-1 opacity-80"
            style={{ color: textColor }}
            numberOfLines={3}
          >
            {subtitle}
          </Text>
        )}
        <Text
          className="text-[10px] font-sans text-center mt-3 opacity-50"
          style={{ color: textColor }}
        >
          foreverr.app
        </Text>
      </View>
    </View>
  );

  const cardContent = () => {
    switch (templateLayout) {
      case "photo_overlay":
        return renderPhotoOverlay();
      case "minimal":
        return renderMinimal();
      case "celebration":
        return renderCelebration();
      default:
        return renderStandard();
    }
  };

  return (
    <View className="mx-4 mb-3">
      {cardContent()}

      {onShare && (
        <Pressable
          className="mt-2 flex-row items-center justify-center rounded-full bg-brand-700 py-2.5"
          onPress={onShare}
        >
          <Ionicons name="share-outline" size={16} color="white" />
          <Text className="ml-2 text-sm font-sans-semibold text-white">Share This Card</Text>
        </Pressable>
      )}
    </View>
  );
}
