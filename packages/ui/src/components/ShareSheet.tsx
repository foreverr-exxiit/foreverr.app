import React from "react";
import { View, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

interface ShareOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const SHARE_OPTIONS: ShareOption[] = [
  { key: "copy_link", label: "Copy Link", icon: "link-outline", color: "#4A2D7A", bgColor: "bg-brand-50 dark:bg-brand-900/20" },
  { key: "native", label: "More", icon: "share-outline", color: "#374151", bgColor: "bg-gray-100 dark:bg-gray-700" },
  { key: "whatsapp", label: "WhatsApp", icon: "logo-whatsapp", color: "#25D366", bgColor: "bg-green-50 dark:bg-green-900/20" },
  { key: "facebook", label: "Facebook", icon: "logo-facebook", color: "#1877F2", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "twitter", label: "X / Twitter", icon: "logo-twitter", color: "#1DA1F2", bgColor: "bg-sky-50 dark:bg-sky-900/20" },
  { key: "instagram_story", label: "Stories", icon: "logo-instagram", color: "#E4405F", bgColor: "bg-pink-50 dark:bg-pink-900/20" },
  { key: "sms", label: "Text / SMS", icon: "chatbubble-outline", color: "#059669", bgColor: "bg-emerald-50 dark:bg-emerald-900/20" },
];

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  targetType: "memorial" | "tribute" | "event" | "profile" | "badge" | "living_tribute";
  targetId: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  onShare: (platform: string) => void;
  onCopyLink?: () => void;
}

export function ShareSheet({
  visible,
  onClose,
  title,
  description,
  imageUrl,
  onShare,
  onCopyLink,
}: ShareSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
      >
        <View className="flex-1" />
        <Pressable
          className="bg-white dark:bg-gray-900 rounded-t-3xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          {/* Preview section */}
          <View className="px-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white" numberOfLines={2}>
              {title}
            </Text>
            {description ? (
              <Text className="text-xs font-sans text-gray-500 mt-1" numberOfLines={2}>
                {description}
              </Text>
            ) : null}
          </View>

          {/* Share options grid */}
          <View className="px-5 py-4">
            <Text className="text-xs font-sans-semibold text-gray-400 uppercase tracking-wider mb-3">
              Share via
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-4">
                {SHARE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    className="items-center"
                    style={{ width: 72 }}
                    onPress={() => {
                      if (option.key === "copy_link" && onCopyLink) {
                        onCopyLink();
                      } else {
                        onShare(option.key);
                      }
                    }}
                  >
                    <View
                      className={`h-14 w-14 rounded-2xl items-center justify-center mb-1.5 ${option.bgColor}`}
                    >
                      <Ionicons name={option.icon} size={26} color={option.color} />
                    </View>
                    <Text className="text-[10px] font-sans-medium text-gray-600 dark:text-gray-400 text-center">
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Cancel button */}
          <View className="px-5 pb-8 pt-2">
            <Pressable
              className="w-full rounded-2xl bg-gray-100 dark:bg-gray-800 py-3.5 items-center"
              onPress={onClose}
            >
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
