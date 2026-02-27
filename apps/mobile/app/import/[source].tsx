import React, { useState, useCallback } from "react";
import { View, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  ScreenWrapper,
  ImportPreviewGrid,
  ImportProgressBar,
} from "@foreverr/ui";
import {
  useAuth,
  useStartImport,
  useImportJob,
  useImportJobItems,
  useCancelImport,
  useRetryFailedItems,
} from "@foreverr/core";

const SOURCE_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  twitter: "Twitter / X",
  tiktok: "TikTok",
  google_photos: "Google Photos",
  apple_photos: "Apple Photos",
  csv: "CSV / Spreadsheet",
  legacy_com: "Legacy.com",
  findagrave: "Find a Grave",
  ancestry: "Ancestry",
  manual: "Manual Entry",
};

type ScreenPhase = "select" | "preview" | "importing" | "done";

interface PreviewItem {
  id: string;
  contentType: string;
  content?: string;
  mediaUrl?: string;
  selected: boolean;
}

export default function SourceImportScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source: string }>();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [phase, setPhase] = useState<ScreenPhase>("select");
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | undefined>();
  const [targetType, setTargetType] = useState<string>("memorial");

  const startImport = useStartImport();
  const cancelImport = useCancelImport();
  const retryFailed = useRetryFailedItems();
  const { data: activeJob } = useImportJob(activeJobId);
  const { data: jobItems } = useImportJobItems(activeJobId);

  const sourceLabel = SOURCE_LABELS[source ?? ""] ?? source ?? "Source";

  // Simulate fetching content from the source platform
  const handleFetchContent = useCallback(() => {
    // In production, this would call an OAuth-protected API endpoint
    // For now, generate placeholder preview items
    const sampleItems: PreviewItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `preview-${i}`,
      contentType: i % 3 === 0 ? "photo" : i % 3 === 1 ? "text" : "post",
      content: i % 3 !== 0 ? `Sample ${source} content #${i + 1}` : undefined,
      mediaUrl: i % 3 === 0 ? `https://picsum.photos/seed/${source}${i}/300/300` : undefined,
      selected: true,
    }));
    setPreviewItems(sampleItems);
    setPhase("preview");
  }, [source]);

  const handleToggleItem = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = previewItems.every((item) => item.selected);
    setPreviewItems((prev) =>
      prev.map((item) => ({ ...item, selected: !allSelected }))
    );
  };

  const handleImportSelected = async () => {
    if (!userId || !source) return;

    const selectedItems = previewItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      Alert.alert("No items selected", "Please select at least one item to import.");
      return;
    }

    try {
      const job = await startImport.mutateAsync({
        userId,
        sourceType: source,
        targetType,
        totalItems: selectedItems.length,
        sourceMetadata: {
          selectedCount: selectedItems.length,
          totalAvailable: previewItems.length,
        },
      });

      setActiveJobId(job.id);
      setPhase("importing");

      // In production, this would trigger a backend process
      // The UI would poll the job status via useImportJob
    } catch (err: any) {
      Alert.alert("Import Error", err.message ?? "Failed to start import.");
    }
  };

  const handleCancel = () => {
    if (activeJobId) {
      cancelImport.mutate(activeJobId);
    }
    setPhase("select");
    setActiveJobId(undefined);
  };

  const handleRetry = () => {
    if (activeJobId) {
      retryFailed.mutate(activeJobId);
    }
  };

  // Target type selection options
  const TARGET_TYPES = [
    { key: "memorial", label: "Memorial", icon: "flower" },
    { key: "living_tribute", label: "Living Tribute", icon: "heart" },
    { key: "memory_vault", label: "Memory Vault", icon: "lock-closed" },
    { key: "family_tree", label: "Family Tree", icon: "git-branch" },
    { key: "profile", label: "My Profile", icon: "person" },
  ] as const;

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: `Import from ${sourceLabel}`,
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      {/* SELECT PHASE — choose target + fetch */}
      {phase === "select" && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Source Info */}
          <View className="px-4 pt-4 pb-2">
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <Text className="text-base font-sans-semibold text-gray-900 dark:text-white">
                Import from {sourceLabel}
              </Text>
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 mt-1">
                Select where you want to import content to, then fetch available items.
              </Text>
            </View>
          </View>

          {/* Target Type Selection */}
          <View className="px-4 mb-4">
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">
              Import To
            </Text>
            <View style={{ gap: 8 }}>
              {TARGET_TYPES.map((t) => (
                <View
                  key={t.key}
                  className={`rounded-xl p-3.5 flex-row items-center border ${
                    targetType === t.key
                      ? "bg-brand-50 dark:bg-brand-900/20 border-brand-300 dark:border-brand-700"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                  }`}
                  onTouchEnd={() => setTargetType(t.key)}
                >
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center ${
                      targetType === t.key
                        ? "bg-brand-100 dark:bg-brand-800/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={20}
                      color={targetType === t.key ? "#7C3AED" : "#9CA3AF"}
                    />
                  </View>
                  <Text
                    className={`text-sm font-sans-medium ml-3 ${
                      targetType === t.key
                        ? "text-brand-700 dark:text-brand-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {t.label}
                  </Text>
                  {targetType === t.key && (
                    <View className="ml-auto">
                      <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Fetch Button */}
          <View className="px-4 mb-8">
            <View
              className="bg-brand-700 rounded-xl py-3.5 items-center flex-row justify-center"
              onTouchEnd={handleFetchContent}
            >
              <Ionicons name="cloud-download" size={18} color="white" />
              <Text className="text-base font-sans-semibold text-white ml-2">
                Fetch Content from {sourceLabel}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* PREVIEW PHASE — select items + import */}
      {phase === "preview" && (
        <ImportPreviewGrid
          items={previewItems}
          onToggleItem={handleToggleItem}
          onSelectAll={handleSelectAll}
          onImportSelected={handleImportSelected}
        />
      )}

      {/* IMPORTING PHASE — show progress */}
      {phase === "importing" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-4">
              <Ionicons name="sync" size={32} color="#7C3AED" />
            </View>
            <Text className="text-lg font-sans-semibold text-gray-900 dark:text-white">
              Importing from {sourceLabel}
            </Text>
            <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 mt-1 text-center">
              This may take a moment. You can safely leave this screen.
            </Text>
          </View>

          {activeJob && (
            <ImportProgressBar
              totalItems={activeJob.total_items}
              importedItems={activeJob.imported_items}
              failedItems={activeJob.failed_items}
              status={activeJob.status}
              onRetry={activeJob.failed_items > 0 ? handleRetry : undefined}
            />
          )}

          {!activeJob && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text className="text-sm font-sans text-gray-500 mt-3">
                Starting import...
              </Text>
            </View>
          )}

          {/* Items list */}
          {(jobItems ?? []).length > 0 && (
            <View className="mt-4">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-2">
                Import Items
              </Text>
              {(jobItems ?? []).slice(0, 20).map((item: any) => (
                <View
                  key={item.id}
                  className="flex-row items-center py-2 border-b border-gray-100 dark:border-gray-700"
                >
                  <Ionicons
                    name={
                      item.status === "imported"
                        ? "checkmark-circle"
                        : item.status === "failed"
                        ? "close-circle"
                        : "hourglass-outline"
                    }
                    size={16}
                    color={
                      item.status === "imported"
                        ? "#059669"
                        : item.status === "failed"
                        ? "#DC2626"
                        : "#9CA3AF"
                    }
                  />
                  <Text className="text-sm font-sans text-gray-700 dark:text-gray-300 ml-2 flex-1 capitalize">
                    {item.content_type}
                  </Text>
                  <Text className="text-xs font-sans text-gray-400 capitalize">
                    {item.status}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Cancel */}
          <View
            className="mt-6 border border-gray-300 dark:border-gray-600 rounded-xl py-3 items-center"
            onTouchEnd={handleCancel}
          >
            <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-400">
              Cancel Import
            </Text>
          </View>
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}
