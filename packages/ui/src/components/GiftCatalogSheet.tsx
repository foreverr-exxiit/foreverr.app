import { useState, useCallback } from "react";
import { View, Pressable, Modal, ScrollView, TextInput, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

type GiftCategory = "flowers" | "candles" | "cards" | "more";

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  priceCents: number;
  category: GiftCategory;
}

const CATEGORIES: { key: GiftCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "flowers", label: "Flowers", icon: "flower" },
  { key: "candles", label: "Candles", icon: "flame" },
  { key: "cards", label: "Cards", icon: "mail" },
  { key: "more", label: "More", icon: "gift" },
];

const GIFT_ITEMS: GiftItem[] = [
  // Flowers
  { id: "rose", name: "Red Rose", icon: "\uD83C\uDF39", priceCents: 199, category: "flowers" },
  { id: "bouquet", name: "Bouquet", icon: "\uD83D\uDC90", priceCents: 499, category: "flowers" },
  { id: "sunflower", name: "Sunflower", icon: "\uD83C\uDF3B", priceCents: 199, category: "flowers" },
  { id: "tulip", name: "Tulip", icon: "\uD83C\uDF37", priceCents: 299, category: "flowers" },
  { id: "lily", name: "White Lily", icon: "\u2728\uD83C\uDF3C", priceCents: 399, category: "flowers" },
  { id: "cherry-blossom", name: "Cherry Blossom", icon: "\uD83C\uDF38", priceCents: 299, category: "flowers" },
  // Candles
  { id: "candle", name: "Candle", icon: "\uD83D\uDD6F\uFE0F", priceCents: 149, category: "candles" },
  { id: "vigil-candle", name: "Vigil Candle", icon: "\uD83D\uDCA1", priceCents: 299, category: "candles" },
  { id: "memorial-candle", name: "Memorial Candle", icon: "\uD83D\uDD25", priceCents: 499, category: "candles" },
  { id: "eternal-flame", name: "Eternal Flame", icon: "\u2728\uD83D\uDD25", priceCents: 999, category: "candles" },
  // Cards
  { id: "sympathy", name: "Sympathy Card", icon: "\uD83D\uDC8C", priceCents: 299, category: "cards" },
  { id: "thinking-of-you", name: "Thinking of You", icon: "\uD83D\uDC9D", priceCents: 199, category: "cards" },
  { id: "in-memory", name: "In Memory", icon: "\uD83E\uDD4A", priceCents: 399, category: "cards" },
  { id: "celebration", name: "Celebration", icon: "\uD83C\uDF89", priceCents: 299, category: "cards" },
  // More
  { id: "dove", name: "Peace Dove", icon: "\uD83D\uDD4A\uFE0F", priceCents: 399, category: "more" },
  { id: "heart", name: "Heart", icon: "\u2764\uFE0F", priceCents: 99, category: "more" },
  { id: "star", name: "Star", icon: "\u2B50", priceCents: 199, category: "more" },
  { id: "rainbow", name: "Rainbow", icon: "\uD83C\uDF08", priceCents: 299, category: "more" },
];

interface GiftCatalogSheetProps {
  visible: boolean;
  onClose: () => void;
  targetType: "user" | "memorial" | "living_tribute";
  targetId: string;
  recipientName: string;
  onGiftSent?: (giftName: string) => void;
}

export function GiftCatalogSheet({
  visible,
  onClose,
  targetType,
  targetId,
  recipientName,
  onGiftSent,
}: GiftCatalogSheetProps) {
  const [activeCategory, setActiveCategory] = useState<GiftCategory>("flowers");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [message, setMessage] = useState("");

  const filteredGifts = GIFT_ITEMS.filter((g) => g.category === activeCategory);

  const handleSend = useCallback(() => {
    if (!selectedGift) return;
    onGiftSent?.(selectedGift.name);
    setSelectedGift(null);
    setMessage("");
    onClose();
  }, [selectedGift, message, onGiftSent, onClose]);

  const handleClose = useCallback(() => {
    setSelectedGift(null);
    setMessage("");
    onClose();
  }, [onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable className="flex-1 bg-black/50" onPress={handleClose} />

      <View className="bg-white dark:bg-gray-900 rounded-t-3xl pb-8 max-h-[85%]">
        {/* Handle bar */}
        <View className="items-center pt-3 pb-2">
          <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-3">
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
            Send a Gift to {recipientName}
          </Text>
          <Pressable onPress={handleClose} className="p-1">
            <Ionicons name="close" size={24} color="#6b7280" />
          </Pressable>
        </View>

        {/* Category Tabs */}
        <View className="flex-row px-5 mb-4 gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <Pressable
                key={cat.key}
                className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-full ${
                  isActive
                    ? "bg-brand-700"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
                onPress={() => {
                  setActiveCategory(cat.key);
                  setSelectedGift(null);
                }}
              >
                <Ionicons
                  name={cat.icon}
                  size={16}
                  color={isActive ? "#ffffff" : "#6b7280"}
                />
                <Text
                  className={`text-xs font-sans-semibold ${
                    isActive ? "text-white" : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Gift Grid */}
        <FlatList
          data={filteredGifts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          style={{ maxHeight: 260 }}
          renderItem={({ item }) => {
            const isSelected = selectedGift?.id === item.id;
            return (
              <Pressable
                className={`flex-1 items-center py-3 rounded-xl border-2 ${
                  isSelected
                    ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20"
                    : "border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
                onPress={() => setSelectedGift(item)}
              >
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
                <Text
                  className="text-xs font-sans-medium text-gray-800 dark:text-gray-200 mt-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text className="text-xs font-sans text-gray-500 mt-0.5">
                  ${(item.priceCents / 100).toFixed(2)}
                </Text>
              </Pressable>
            );
          }}
        />

        {/* Message Input + Send */}
        {selectedGift && (
          <View className="px-5 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <Text style={{ fontSize: 20 }}>{selectedGift.icon}</Text>
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                {selectedGift.name}
              </Text>
              <Text className="text-sm font-sans text-gray-500">
                ${(selectedGift.priceCents / 100).toFixed(2)}
              </Text>
            </View>
            <TextInput
              className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-3"
              placeholder="Add a personal message (optional)"
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={200}
            />
            <Pressable
              className="bg-brand-700 rounded-full py-3.5 items-center flex-row justify-center gap-2"
              onPress={handleSend}
            >
              <Ionicons name="gift" size={18} color="#ffffff" />
              <Text className="text-sm font-sans-bold text-white">
                Send Gift - ${(selectedGift.priceCents / 100).toFixed(2)}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}
