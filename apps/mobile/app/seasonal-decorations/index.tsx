import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, Alert } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper, SeasonalDecorationCard } from "@foreverr/ui";
import {
  useSeasonalDecorations,
  useAppliedDecorations,
  useApplyDecoration,
} from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

type DecTab = "available" | "applied";

export default function SeasonalDecorationsScreen() {
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: allDecorations } = useSeasonalDecorations();
  const { data: appliedDecorations } = useAppliedDecorations(memorialId);
  const applyDecoration = useApplyDecoration();

  const [activeTab, setActiveTab] = useState<DecTab>("available");

  const appliedIds = new Set(appliedDecorations?.map((d) => d.decoration_id) ?? []);

  const handleApply = (decorationId: string, name: string, ribbonCost: number) => {
    Alert.alert(
      "Apply Decoration",
      `Apply "${name}" for ${ribbonCost} ribbons?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: async () => {
            if (!user?.id || !memorialId) return;
            // Set expiry to 30 days from now
            const expiresAt = new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();
            await applyDecoration.mutateAsync({
              memorialId,
              decorationId,
              appliedBy: user.id,
              expiresAt,
            });
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Seasonal Decorations" }} />

      {/* Tab Bar */}
      <View className="flex-row px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        {(["available", "applied"] as DecTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl mx-1 items-center ${
              activeTab === tab ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === tab ? "text-white" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {tab === "available" ? "🎨 Available" : "✨ Applied"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "available" ? (
        <FlatList
          data={allDecorations ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => (
            <SeasonalDecorationCard
              name={item.name}
              description={item.description}
              decorationType={item.decoration_type}
              previewImageUrl={item.preview_url}
              ribbonCost={item.ribbon_cost}
              availableFrom={item.available_from}
              availableUntil={item.available_until}
              isApplied={appliedIds.has(item.id)}
              onPress={() => {
                if (!appliedIds.has(item.id)) {
                  handleApply(item.id, item.name, item.ribbon_cost);
                }
              }}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🎨</Text>
              <Text className="text-gray-500">
                No seasonal decorations available right now
              </Text>
              <Text className="text-xs text-gray-400 mt-1 text-center px-8">
                Check back during holidays and special occasions for
                limited-time decorations.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={appliedDecorations ?? []}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => {
            const decoration = (item as any).decoration;
            return (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-green-200 shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-xl bg-green-50 items-center justify-center mr-3">
                    <Text className="text-2xl">✨</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white">
                      {decoration?.name ?? "Decoration"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5">
                      Expires:{" "}
                      {item.expires_at
                        ? new Date(item.expires_at).toLocaleDateString()
                        : "Never"}
                    </Text>
                  </View>
                  <View className="bg-green-100 rounded-full px-3 py-1">
                    <Text className="text-xs text-green-700 font-medium">
                      Active
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">✨</Text>
              <Text className="text-gray-500">No decorations applied yet</Text>
              <TouchableOpacity
                onPress={() => setActiveTab("available")}
                className="mt-3 bg-purple-100 rounded-xl px-4 py-2"
              >
                <Text className="text-sm text-purple-700 font-medium">
                  Browse Decorations
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}
