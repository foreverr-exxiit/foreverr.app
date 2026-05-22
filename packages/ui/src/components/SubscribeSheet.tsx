import { View, Modal, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const TIERS = [
  { key: "basic", label: "Basic", price: 499, icon: "star-outline" as const, features: ["Exclusive posts & updates", "Early access to new content", "Supporter badge on profile"] },
  { key: "premium", label: "Premium", price: 999, icon: "star-half-outline" as const, features: ["Everything in Basic", "Behind-the-scenes content", "Monthly digital keepsake", "Priority support"] },
  { key: "vip", label: "VIP", price: 1999, icon: "star" as const, features: ["Everything in Premium", "Direct messaging access", "Custom memorial consultation", "Name on supporter wall", "Quarterly video update"] },
];

interface SubscribeSheetProps {
  visible: boolean;
  onClose: () => void;
  channelName: string;
  channelId: string;
  onSubscribe: (tier: string, amountCents: number) => Promise<void>;
  currentTier?: string | null;
}

export function SubscribeSheet({ visible, onClose, channelName, channelId, onSubscribe, currentTier }: SubscribeSheetProps) {
  const [selectedTier, setSelectedTier] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async () => {
    const tier = TIERS.find((t) => t.key === selectedTier);
    if (!tier) return;
    setIsSubmitting(true);
    try {
      await onSubscribe(selectedTier, tier.price);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-gray-800 rounded-t-3xl px-4 pt-6 pb-10">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                Subscribe to {channelName}
              </Text>
              <Text className="text-xs font-sans text-gray-500 mt-0.5">
                Support and get exclusive content
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Ionicons name="close-circle" size={28} color="#9ca3af" />
            </Pressable>
          </View>

          {/* Tiers */}
          <View className="gap-3 mb-6">
            {TIERS.map((tier) => {
              const selected = selectedTier === tier.key;
              const isCurrent = currentTier === tier.key;
              return (
                <Pressable
                  key={tier.key}
                  className={`rounded-2xl p-4 border-2 ${
                    selected ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setSelectedTier(tier.key)}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={tier.icon} size={18} color={selected ? "#4A2D7A" : "#9ca3af"} />
                      <Text className={`text-sm font-sans-bold ${selected ? "text-brand-700" : "text-gray-900 dark:text-white"}`}>
                        {tier.label}
                      </Text>
                      {isCurrent && (
                        <View className="bg-green-100 rounded-full px-2 py-0.5">
                          <Text className="text-[10px] font-sans-semibold text-green-700">Current</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm font-sans-bold text-brand-700">
                      ${(tier.price / 100).toFixed(2)}/mo
                    </Text>
                  </View>
                  {tier.features.map((f, i) => (
                    <View key={i} className="flex-row items-center gap-1.5 mt-1">
                      <Ionicons name="checkmark-circle" size={14} color={selected ? "#4A2D7A" : "#9ca3af"} />
                      <Text className="text-xs font-sans text-gray-600 dark:text-gray-400">{f}</Text>
                    </View>
                  ))}
                </Pressable>
              );
            })}
          </View>

          {/* Subscribe Button */}
          <Pressable
            className={`rounded-xl py-4 items-center ${isSubmitting ? "bg-brand-400" : "bg-brand-700"}`}
            onPress={handleSubscribe}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-sans-bold text-white">
                {currentTier ? "Change Subscription" : "Subscribe"} — ${(TIERS.find((t) => t.key === selectedTier)!.price / 100).toFixed(2)}/mo
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
