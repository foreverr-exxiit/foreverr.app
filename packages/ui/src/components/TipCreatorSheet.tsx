import React, { useState } from "react";
import { View, Pressable, TextInput, Modal, ActivityIndicator, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

const TIP_PRESETS = [
  { label: "$2", cents: 200 },
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$25", cents: 2500 },
];

interface TipCreatorSheetProps {
  visible: boolean;
  onClose: () => void;
  creatorName: string;
  creatorId: string;
  onSendTip: (amountCents: number, message: string) => Promise<void>;
}

export function TipCreatorSheet({ visible, onClose, creatorName, creatorId, onSendTip }: TipCreatorSheetProps) {
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const finalAmount = isCustom ? Math.round(parseFloat(customAmount || "0") * 100) : selectedAmount;

  const handleSend = async () => {
    if (finalAmount < 100) {
      const msg = "Minimum tip is $1.00";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Minimum Tip", msg);
      return;
    }
    setIsSending(true);
    try {
      await onSendTip(finalAmount, message.trim());
      const msg = `Thank you for tipping ${creatorName}!`;
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Tip Sent! 🎉", msg);
      setMessage("");
      setSelectedAmount(500);
      setCustomAmount("");
      setIsCustom(false);
      onClose();
    } catch {
      const msg = "Failed to send tip. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <Pressable className="bg-white dark:bg-gray-900 rounded-t-3xl px-5 pt-4 pb-8" onPress={(e) => e.stopPropagation()}>
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="items-center mb-5">
            <View className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-2">
              <Ionicons name="heart" size={24} color="#f59e0b" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              Tip {creatorName}
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-1">
              Show your appreciation for their work
            </Text>
          </View>

          {/* Amount Presets */}
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">Choose Amount</Text>
          <View className="flex-row gap-2 mb-3">
            {TIP_PRESETS.map((preset) => (
              <Pressable
                key={preset.cents}
                className={`flex-1 py-3 rounded-xl items-center ${
                  !isCustom && selectedAmount === preset.cents
                    ? "bg-amber-500"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
                onPress={() => {
                  setSelectedAmount(preset.cents);
                  setIsCustom(false);
                }}
              >
                <Text
                  className={`text-sm font-sans-bold ${
                    !isCustom && selectedAmount === preset.cents ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Amount */}
          <Pressable
            className={`flex-row items-center rounded-xl px-4 py-3 mb-4 ${
              isCustom ? "bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500" : "bg-gray-100 dark:bg-gray-800"
            }`}
            onPress={() => setIsCustom(true)}
          >
            <Text className="text-sm font-sans text-gray-500 mr-1">$</Text>
            <TextInput
              className="flex-1 text-sm font-sans text-gray-900 dark:text-white"
              placeholder="Custom amount"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad"
              value={customAmount}
              onChangeText={(t) => {
                setCustomAmount(t);
                setIsCustom(true);
              }}
              onFocus={() => setIsCustom(true)}
            />
          </Pressable>

          {/* Message */}
          <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Add a message (optional)
          </Text>
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-5"
            placeholder="Thanks for the amazing work!"
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={2}
            style={{ minHeight: 50, textAlignVertical: "top" }}
          />

          {/* Send Button */}
          <Pressable
            className={`rounded-xl py-4 items-center ${finalAmount >= 100 ? "bg-amber-500" : "bg-gray-200 dark:bg-gray-700"}`}
            onPress={handleSend}
            disabled={isSending || finalAmount < 100}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="gift-outline" size={18} color={finalAmount >= 100 ? "#ffffff" : "#9ca3af"} />
                <Text className={`text-base font-sans-bold ${finalAmount >= 100 ? "text-white" : "text-gray-400"}`}>
                  Send ${(finalAmount / 100).toFixed(2)} Tip
                </Text>
              </View>
            )}
          </Pressable>

          {/* Fee notice */}
          <Text className="text-[10px] font-sans text-gray-400 text-center mt-2">
            100% goes to the creator (processing fees may apply)
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
