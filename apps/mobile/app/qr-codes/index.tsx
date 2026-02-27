import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, Share } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper, QRCodeCard, QRCodeImage } from "@foreverr/ui";
import { useMemorialQRCodes, useCreateQRCode, useAuthStore } from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

export default function QRCodesScreen() {
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: qrCodes } = useMemorialQRCodes(memorialId);
  const createQR = useCreateQRCode();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [label, setLabel] = useState("");
  const [locationName, setLocationName] = useState("");
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user?.id || !memorialId) return;

    await createQR.mutateAsync({
      memorialId,
      createdBy: user.id,
      label: label.trim() || undefined,
      locationName: locationName.trim() || undefined,
    });

    setLabel("");
    setLocationName("");
    setShowCreateForm(false);
  };

  const handleShareCode = async (code: string, codeLabel?: string | null) => {
    try {
      await Share.share({
        message: `Memorial QR Code${codeLabel ? ` (${codeLabel})` : ""}: ${code}\n\nScan to visit the memorial on Foreverr`,
      });
    } catch (_e) {
      // user cancelled
    }
  };

  const selectedCode = qrCodes?.find((qr) => qr.id === selectedCodeId);

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "QR Codes",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* Intro Banner */}
      <View className="mx-4 mt-3 bg-gray-900 dark:bg-gray-800 rounded-2xl p-4 mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-xl bg-white/10 items-center justify-center mr-3">
            <Ionicons name="qr-code" size={24} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-sans-semibold mb-0.5">
              Memorial QR Codes
            </Text>
            <Text className="text-gray-400 text-xs font-sans leading-4">
              Generate unique QR codes that link directly to this memorial.
              Place them on headstones, urns, or memorial plaques.
            </Text>
          </View>
        </View>
      </View>

      {/* Create Form */}
      {showCreateForm && (
        <View className="mx-4 bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-brand-200 dark:border-brand-800">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
              Generate QR Code
            </Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <Input
            label="Label (optional)"
            value={label}
            onChangeText={setLabel}
            placeholder="e.g., Headstone, Memorial Plaque"
          />

          <Input
            label="Location (optional)"
            value={locationName}
            onChangeText={setLocationName}
            placeholder="e.g., Rose Hill Cemetery, Plot 23"
          />

          <Button
            title="Generate QR Code"
            onPress={handleCreate}
            loading={createQR.isPending}
          />
        </View>
      )}

      {/* Selected QR Code Preview */}
      {selectedCode && (
        <View className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-brand-200 dark:border-brand-800 items-center">
          <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
            {selectedCode.label || "QR Code Preview"}
          </Text>
          <QRCodeImage code={selectedCode.code} size={180} />
          <View className="flex-row items-center mt-4 gap-3">
            <TouchableOpacity
              onPress={() => handleShareCode(selectedCode.code, selectedCode.label)}
              className="flex-row items-center bg-brand-100 dark:bg-brand-900/20 rounded-xl px-4 py-2.5"
            >
              <Ionicons name="share-outline" size={16} color="#7C3AED" />
              <Text className="text-sm font-sans-medium text-brand-700 ml-2">Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectedCodeId(null)}
              className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5"
            >
              <Ionicons name="close" size={16} color="#6B7280" />
              <Text className="text-sm font-sans-medium text-gray-500 ml-1">Close</Text>
            </TouchableOpacity>
          </View>
          {selectedCode.location_name && (
            <View className="flex-row items-center mt-3">
              <Ionicons name="location-outline" size={14} color="#9ca3af" />
              <Text className="text-xs font-sans text-gray-400 ml-1">
                {selectedCode.location_name}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* QR Code List */}
      <FlatList
        data={qrCodes ?? []}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-2"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3"
            onPress={() => setSelectedCodeId(selectedCodeId === item.id ? null : item.id)}
          >
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex-row items-center">
              {/* Mini QR Code */}
              <View className="mr-3">
                <QRCodeImage code={item.code} size={56} />
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                  {item.label || "QR Code"}
                </Text>
                {item.location_name && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={12} color="#9ca3af" />
                    <Text className="text-xs font-sans text-gray-400 ml-1">
                      {item.location_name}
                    </Text>
                  </View>
                )}
                <View className="flex-row items-center mt-1.5 gap-3">
                  <View className="flex-row items-center">
                    <Ionicons name="scan-outline" size={12} color="#7C3AED" />
                    <Text className="text-xs font-sans text-gray-500 ml-1">
                      {item.scan_count} scans
                    </Text>
                  </View>
                  <View
                    className={`rounded-full px-2 py-0.5 ${
                      item.is_active ? "bg-green-100" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-sans-medium ${
                        item.is_active ? "text-green-700" : "text-gray-500"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Share */}
              <TouchableOpacity
                onPress={() => handleShareCode(item.code, item.label)}
                className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center"
              >
                <Ionicons name="share-outline" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !showCreateForm ? (
            <View className="items-center py-16">
              <Ionicons name="qr-code-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 font-sans mt-3 mb-1">No QR codes generated yet</Text>
              <Text className="text-xs text-gray-400 font-sans text-center px-8 mb-4">
                Create QR codes to link physical memorial sites to this digital memorial.
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateForm(true)}
                className="bg-brand-100 dark:bg-brand-900/20 rounded-xl px-5 py-2.5"
              >
                <Text className="text-sm font-sans-medium text-brand-700">
                  Create Your First QR Code
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      {!showCreateForm && (
        <TouchableOpacity
          onPress={() => setShowCreateForm(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-brand-700 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}
