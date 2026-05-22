import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Platform, Alert } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateVaultPreservation, useVaultPreservationOrders, PRESERVATION_TYPES } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function VaultPreserveScreen() {
  const router = useRouter();
  const { vaultId, itemCount } = useLocalSearchParams<{ vaultId: string; itemCount?: string }>();
  const { user } = useAuth();
  const createPreservation = useCreateVaultPreservation();
  const { data: orders, isLoading: ordersLoading } = useVaultPreservationOrders(user?.id);

  const [selectedType, setSelectedType] = useState("digital_archive");
  const [notes, setNotes] = useState("");

  const typeInfo = PRESERVATION_TYPES[selectedType];
  const count = parseInt(itemCount ?? "0");

  const handleOrder = async () => {
    if (!user?.id || !vaultId) return;

    try {
      await createPreservation.mutateAsync({
        vault_id: vaultId,
        owner_id: user.id,
        preservation_type: selectedType,
        amount_cents: typeInfo?.basePrice ?? 1999,
        items_count: count,
        notes: notes.trim() || undefined,
      });
      const msg = "Your preservation order has been placed! A specialist will begin processing shortly.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Order Placed! 📦", msg);
      router.back();
    } catch {
      const msg = "Could not place order. Please try again.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Error", msg);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-4 py-5">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
            <Ionicons name="shield-checkmark" size={32} color="#4A2D7A" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
            Preserve Your Memories
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-4">
            Transform your vault into lasting keepsakes — digital archives, printed books, video compilations, and more.
          </Text>
          {count > 0 && (
            <View className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1 mt-2">
              <Text className="text-xs font-sans-semibold text-brand-700">{count} items in vault</Text>
            </View>
          )}
        </View>

        {/* Preservation Types */}
        <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-3">
          Choose Preservation Type
        </Text>
        <View className="gap-3 mb-6">
          {Object.entries(PRESERVATION_TYPES).map(([key, info]) => {
            const selected = selectedType === key;
            return (
              <Pressable
                key={key}
                className={`rounded-2xl p-4 border-2 ${
                  selected ? "border-brand-700 bg-brand-50 dark:bg-brand-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                }`}
                onPress={() => setSelectedType(key)}
              >
                <View className="flex-row items-center gap-3">
                  <View className={`h-10 w-10 rounded-xl items-center justify-center ${selected ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-700"}`}>
                    <Ionicons name={info.icon as any} size={20} color={selected ? "#ffffff" : "#4A2D7A"} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className={`text-sm font-sans-bold ${selected ? "text-brand-700" : "text-gray-900 dark:text-white"}`}>
                        {info.label}
                      </Text>
                      <Text className="text-sm font-sans-bold text-brand-700">
                        ${(info.basePrice / 100).toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-xs font-sans text-gray-500 mt-0.5">{info.description}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Notes */}
        <Text className="text-xs font-sans-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          Special Instructions (optional)
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white mb-6"
          placeholder="Any specific preferences or details..."
          placeholderTextColor="#9ca3af"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 80, textAlignVertical: "top" }}
        />

        {/* Order Summary */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
          <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">Order Summary</Text>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-sans text-gray-500">{typeInfo?.label}</Text>
            <Text className="text-xs font-sans-semibold text-gray-900 dark:text-white">
              ${((typeInfo?.basePrice ?? 0) / 100).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-xs font-sans text-gray-500">Vault Items</Text>
            <Text className="text-xs font-sans text-gray-500">{count} items</Text>
          </View>
          <View className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Total</Text>
            <Text className="text-lg font-sans-bold text-brand-700">
              ${((typeInfo?.basePrice ?? 0) / 100).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Place Order */}
        <Pressable
          className={`rounded-xl py-4 items-center ${createPreservation.isPending ? "bg-brand-400" : "bg-brand-700"}`}
          onPress={handleOrder}
          disabled={createPreservation.isPending}
        >
          {createPreservation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View className="flex-row items-center gap-2">
              <Ionicons name="shield-checkmark-outline" size={18} color="#ffffff" />
              <Text className="text-base font-sans-bold text-white">
                Place Preservation Order
              </Text>
            </View>
          )}
        </Pressable>

        {/* Past Orders */}
        {(orders ?? []).length > 0 && (
          <View className="mt-8">
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-3">
              Your Preservation Orders
            </Text>
            {(orders ?? []).map((order: any) => {
              const oType = PRESERVATION_TYPES[order.preservation_type];
              return (
                <View key={order.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={(oType?.icon ?? "document-outline") as any} size={16} color="#4A2D7A" />
                      <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                        {oType?.label ?? order.preservation_type}
                      </Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded-full ${
                      order.status === "completed" ? "bg-green-100" : order.status === "in_progress" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <Text className={`text-[10px] font-sans-semibold capitalize ${
                        order.status === "completed" ? "text-green-700" : order.status === "in_progress" ? "text-blue-700" : "text-gray-600"
                      }`}>
                        {order.status.replace("_", " ")}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
