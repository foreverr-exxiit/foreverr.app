import React from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  ScreenWrapper,
  ImportSourceCard,
  ConnectedAccountCard,
  ImportProgressBar,
} from "@foreverr/ui";
import {
  useAuth,
  useMyImportJobs,
  useConnectedAccounts,
  useDisconnectAccount,
  useRetryFailedItems,
} from "@foreverr/core";

const IMPORT_SOURCES = [
  { key: "facebook", label: "Facebook", icon: "logo-facebook" },
  { key: "instagram", label: "Instagram", icon: "logo-instagram" },
  { key: "twitter", label: "Twitter / X", icon: "logo-twitter" },
  { key: "tiktok", label: "TikTok", icon: "logo-tiktok" },
  { key: "google_photos", label: "Google Photos", icon: "logo-google" },
  { key: "apple_photos", label: "Apple Photos", icon: "logo-apple" },
  { key: "gedcom", label: "GEDCOM File", icon: "git-branch" },
  { key: "csv", label: "CSV / Spreadsheet", icon: "document-text" },
  { key: "legacy_com", label: "Legacy.com", icon: "flower" },
  { key: "findagrave", label: "Find a Grave", icon: "location" },
  { key: "ancestry", label: "Ancestry", icon: "people" },
  { key: "manual", label: "Manual Entry", icon: "create" },
] as const;

export default function ImportCenterScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: accounts, isLoading: accountsLoading } = useConnectedAccounts(userId);
  const { data: jobs, isLoading: jobsLoading } = useMyImportJobs(userId);
  const disconnectAccount = useDisconnectAccount();
  const retryFailed = useRetryFailedItems();

  const activeAccounts = (accounts ?? []).filter((a: any) => a.is_active);
  const connectedPlatforms = new Set(activeAccounts.map((a: any) => a.platform));

  const recentJobs = (jobs ?? []).slice(0, 5);

  const handleSourcePress = (sourceKey: string) => {
    if (sourceKey === "gedcom") {
      router.push("/import/gedcom");
    } else {
      router.push(`/import/${sourceKey}`);
    }
  };

  const handleConnect = (sourceKey: string) => {
    // For file-based sources, go straight to the import screen
    if (["gedcom", "csv", "manual"].includes(sourceKey)) {
      handleSourcePress(sourceKey);
      return;
    }
    // For OAuth sources, would normally trigger OAuth flow
    // For now, navigate to the source import screen
    router.push(`/import/${sourceKey}`);
  };

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Import Center",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Description */}
        <View className="px-4 pt-4 pb-2">
          <View className="bg-brand-50 dark:bg-brand-900/20 rounded-2xl p-4 flex-row items-center">
            <View className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-800/30 items-center justify-center">
              <Ionicons name="cloud-download" size={24} color="#7C3AED" />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                Import Your Memories
              </Text>
              <Text className="text-xs font-sans text-gray-600 dark:text-gray-400 mt-0.5">
                Bring photos, posts, and family data from other platforms into Foreverr
              </Text>
            </View>
          </View>
        </View>

        {/* Connected Accounts */}
        {activeAccounts.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
              Connected Accounts
            </Text>
            <View style={{ gap: 10 }}>
              {activeAccounts.map((account: any) => (
                <ConnectedAccountCard
                  key={account.id}
                  platform={account.platform}
                  displayName={account.display_name ?? account.platform}
                  avatarUrl={account.avatar_url}
                  lastSyncAt={account.last_sync_at}
                  isActive={account.is_active}
                  onDisconnect={() => disconnectAccount.mutate(account.id)}
                  onSync={() => router.push(`/import/${account.platform}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Import Sources Grid */}
        <View className="px-4 mb-4">
          <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
            Import Sources
          </Text>
          <View style={{ gap: 10 }}>
            {IMPORT_SOURCES.map((source) => {
              const isFileSource = ["gedcom", "csv", "manual"].includes(source.key);
              const isConnected = isFileSource || connectedPlatforms.has(source.key);

              return (
                <ImportSourceCard
                  key={source.key}
                  platform={source.key}
                  icon={source.icon}
                  isConnected={isConnected}
                  onConnect={() => handleConnect(source.key)}
                  onImport={() => handleSourcePress(source.key)}
                />
              );
            })}
          </View>
        </View>

        {/* Recent Imports */}
        {recentJobs.length > 0 && (
          <View className="px-4 mb-8">
            <Text className="text-base font-sans-semibold text-gray-900 dark:text-white mb-3">
              Recent Imports
            </Text>
            <View style={{ gap: 10 }}>
              {recentJobs.map((job: any) => (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => router.push(`/import/${job.source_type}`)}
                  activeOpacity={0.8}
                >
                  <ImportProgressBar
                    totalItems={job.total_items}
                    importedItems={job.imported_items}
                    failedItems={job.failed_items}
                    status={job.status}
                    onRetry={
                      job.failed_items > 0
                        ? () => retryFailed.mutate(job.id)
                        : undefined
                    }
                  />
                  <View className="flex-row items-center mt-1.5 mb-1">
                    <Text className="text-[11px] font-sans text-gray-400 capitalize">
                      {job.source_type.replace(/_/g, " ")}
                    </Text>
                    <Text className="text-[11px] font-sans text-gray-400 mx-1">
                      {" -> "}
                    </Text>
                    <Text className="text-[11px] font-sans text-gray-400 capitalize">
                      {job.target_type.replace(/_/g, " ")}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Loading States */}
        {(accountsLoading || jobsLoading) && (
          <View className="items-center py-8">
            <ActivityIndicator size="small" color="#7C3AED" />
          </View>
        )}

        {/* Empty state if no accounts and no jobs */}
        {!accountsLoading && !jobsLoading && activeAccounts.length === 0 && recentJobs.length === 0 && (
          <View className="items-center px-8 pb-8">
            <Ionicons name="cloud-upload-outline" size={48} color="#D1D5DB" />
            <Text className="text-sm font-sans text-gray-400 text-center mt-3">
              No imports yet. Connect an account or upload a file to get started.
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
