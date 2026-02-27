import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Share,
} from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Text, ScreenWrapper, Button } from "@foreverr/ui";
import {
  useMemoryVaultItems,
  useTimeCapsules,
  useDeleteVaultItem,
  useVaultItemTags,
  useAuthStore,
} from "@foreverr/core";
import { Ionicons } from "@expo/vector-icons";

const TYPE_CONFIG: Record<
  string,
  { icon: string; ionicon: string; color: string; label: string }
> = {
  document: { icon: "📄", ionicon: "document-text", color: "#2563EB", label: "Document" },
  recipe: { icon: "🍳", ionicon: "restaurant", color: "#D97706", label: "Recipe" },
  letter: { icon: "✉️", ionicon: "mail", color: "#DC2626", label: "Letter" },
  audio_playlist: { icon: "🎵", ionicon: "musical-notes", color: "#7C3AED", label: "Playlist" },
  quote: { icon: "💬", ionicon: "chatbubble-ellipses", color: "#059669", label: "Quote" },
  photo_album: { icon: "📸", ionicon: "images", color: "#EC4899", label: "Album" },
  video: { icon: "🎬", ionicon: "videocam", color: "#8B5CF6", label: "Video" },
  other: { icon: "📦", ionicon: "cube", color: "#6B7280", label: "Other" },
};

function MetaRow({
  icon,
  label,
  value,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-2.5 ${
        !last ? "border-b border-gray-50 dark:border-gray-700" : ""
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={14} color="#9ca3af" />
        <Text className="text-sm font-sans text-gray-500 ml-2">{label}</Text>
      </View>
      <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">{value}</Text>
    </View>
  );
}

function TypeSpecificContent({
  type,
  content,
  config,
}: {
  type: string;
  content: string;
  config: { color: string; icon: string; ionicon: string; label: string };
}) {
  switch (type) {
    case "quote":
      return (
        <View
          className="rounded-2xl p-5 mb-3 border"
          style={{
            backgroundColor: `${config.color}08`,
            borderColor: `${config.color}30`,
          }}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color={config.color} />
          <Text
            className="text-lg font-sans-medium leading-7 mt-3"
            style={{ color: config.color, fontStyle: "italic" }}
          >
            &ldquo;{content}&rdquo;
          </Text>
        </View>
      );

    case "recipe":
      return (
        <View className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 mb-3 border border-amber-100 dark:border-amber-800">
          <View className="flex-row items-center mb-3">
            <Ionicons name="restaurant" size={18} color="#D97706" />
            <Text className="text-sm font-sans-semibold text-amber-700 ml-2">Recipe</Text>
          </View>
          <Text className="text-base font-sans text-gray-900 dark:text-gray-100 leading-6">
            {content}
          </Text>
        </View>
      );

    case "letter":
      return (
        <View className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 mb-3 border border-red-100 dark:border-red-800">
          <View className="flex-row items-center mb-3">
            <Ionicons name="mail" size={18} color="#DC2626" />
            <Text className="text-sm font-sans-semibold text-red-700 ml-2">Letter</Text>
          </View>
          <Text className="text-base font-sans text-gray-900 dark:text-gray-100 leading-7">
            {content}
          </Text>
        </View>
      );

    case "audio_playlist":
      return (
        <View className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 mb-3 border border-purple-100 dark:border-purple-800">
          <View className="flex-row items-center mb-3">
            <Ionicons name="musical-notes" size={18} color="#7C3AED" />
            <Text className="text-sm font-sans-semibold text-purple-700 ml-2">Playlist</Text>
          </View>
          <Text className="text-base font-sans text-gray-800 dark:text-gray-200 leading-6">
            {content}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (content) {
                Alert.alert(
                  "Audio Playlist",
                  "Songs & tracks in this playlist:\n\n" + content,
                  [{ text: "OK" }]
                );
              }
            }}
            activeOpacity={0.7}
            className="mt-3 bg-purple-100 dark:bg-purple-800/30 rounded-xl p-3 flex-row items-center justify-center"
          >
            <Ionicons name="musical-notes" size={22} color="#7C3AED" />
            <Text className="text-sm font-sans-medium text-purple-700 ml-2">
              View Playlist Tracks
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#7C3AED" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>
      );

    default:
      return (
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center mb-2">
            <Ionicons name="reader-outline" size={16} color="#9ca3af" />
            <Text className="text-sm font-sans-medium text-gray-500 ml-2">Content</Text>
          </View>
          <Text className="text-base font-sans text-gray-900 dark:text-gray-100 leading-6">
            {content}
          </Text>
        </View>
      );
  }
}

export default function VaultItemDetailScreen() {
  const router = useRouter();
  const { id, type, memorialId } = useLocalSearchParams<{
    id: string;
    type?: string;
    memorialId?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const deleteItem = useDeleteVaultItem();
  const tags = useVaultItemTags(memorialId);

  const isCapsule = type === "capsule";
  const capsules = useTimeCapsules(isCapsule ? memorialId : undefined);
  const vaultItems = useMemoryVaultItems(!isCapsule ? memorialId : undefined);

  const capsule = capsules.data?.find((c) => c.id === id);
  const vaultData = vaultItems.data?.pages?.flatMap((p) => p.data) ?? [];
  const vaultItem = vaultData.find((v) => v.id === id);

  const item = isCapsule ? capsule : vaultItem;
  const itemTags = (tags.data ?? []).filter((t: any) => t.item_id === id);

  const handleShare = async (title: string) => {
    try {
      await Share.share({
        message: `Check out "${title}" in the Memory Vault on Foreverr`,
      });
    } catch (_e) {
      // user cancelled
    }
  };

  if (!item) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: "Loading...",
            headerStyle: { backgroundColor: "#2D1B4E" },
            headerTintColor: "#fff",
          }}
        />
        <View className="flex-1 items-center justify-center">
          <View className="w-12 h-12 rounded-full bg-brand-100 items-center justify-center mb-3">
            <Ionicons name="hourglass-outline" size={24} color="#7C3AED" />
          </View>
          <Text className="text-gray-400 font-sans">Loading item...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ── TIME CAPSULE VIEW ──
  if (isCapsule && capsule) {
    const isUnlocked = capsule.is_unlocked;
    const unlockDateObj = new Date(capsule.unlock_date);
    const daysUntilUnlock = Math.ceil(
      (unlockDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: capsule.title,
            headerStyle: { backgroundColor: "#2D1B4E" },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity onPress={() => handleShare(capsule.title)} className="mr-2">
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <View
            className="items-center pt-8 pb-6 px-4"
            style={{ backgroundColor: isUnlocked ? "#f0fdf4" : "#faf5ff" }}
          >
            <View
              className={`w-28 h-28 rounded-3xl items-center justify-center mb-4 ${
                isUnlocked ? "bg-green-100" : "bg-purple-100"
              }`}
            >
              <Ionicons
                name={isUnlocked ? "lock-open" : "time"}
                size={48}
                color={isUnlocked ? "#059669" : "#7C3AED"}
              />
            </View>
            <Text className="text-xl font-sans-bold text-gray-900 text-center">
              {capsule.title}
            </Text>
            <View
              className={`mt-3 rounded-full px-5 py-2 ${
                isUnlocked ? "bg-green-100" : "bg-purple-100"
              }`}
            >
              <Text
                className={`text-sm font-sans-medium ${
                  isUnlocked ? "text-green-700" : "text-purple-700"
                }`}
              >
                {isUnlocked
                  ? "Unlocked"
                  : daysUntilUnlock > 0
                    ? `${daysUntilUnlock} days until unlock`
                    : "Ready to unlock!"}
              </Text>
            </View>
          </View>

          <View className="px-4 pt-4">
            {capsule.description && (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="document-text-outline" size={16} color="#9ca3af" />
                  <Text className="text-sm font-sans-medium text-gray-500 ml-2">Description</Text>
                </View>
                <Text className="text-base font-sans text-gray-800 dark:text-gray-200 leading-6">
                  {capsule.description}
                </Text>
              </View>
            )}

            {isUnlocked && capsule.content ? (
              <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mb-3 border border-purple-100 dark:border-purple-800">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="sparkles" size={16} color="#7C3AED" />
                  <Text className="text-sm font-sans-medium text-purple-600 ml-2">
                    Revealed Message
                  </Text>
                </View>
                <Text className="text-base font-sans text-gray-900 dark:text-gray-100 leading-6">
                  {capsule.content}
                </Text>
              </View>
            ) : !isUnlocked ? (
              <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 mb-3 border border-gray-200 dark:border-gray-700 items-center">
                <Ionicons name="lock-closed" size={40} color="#d1d5db" />
                <Text className="text-sm font-sans text-gray-500 text-center mt-3 px-4">
                  This capsule will be revealed on{" "}
                  {unlockDateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            ) : null}

            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Details</Text>
              <MetaRow icon="calendar-outline" label="Unlock Date" value={unlockDateObj.toLocaleDateString()} />
              <MetaRow icon="lock-closed-outline" label="Status" value={isUnlocked ? "Unlocked" : "Locked"} />
              {isUnlocked && (
                <MetaRow icon="eye-outline" label="Views" value={String(capsule.view_count)} />
              )}
              <MetaRow icon="time-outline" label="Created" value={new Date(capsule.created_at).toLocaleDateString()} last />
            </View>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // ── REGULAR VAULT ITEM VIEW ──
  if (vaultItem) {
    const config = TYPE_CONFIG[vaultItem.item_type] || TYPE_CONFIG.other;
    const isOwner = user?.id === vaultItem.uploaded_by;

    const handleDelete = () => {
      Alert.alert("Delete Item", "Are you sure you want to remove this from the vault?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteItem.mutateAsync(vaultItem.id);
            router.back();
          },
        },
      ]);
    };

    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: vaultItem.title,
            headerStyle: { backgroundColor: "#2D1B4E" },
            headerTintColor: "#fff",
            headerRight: () => (
              <TouchableOpacity onPress={() => handleShare(vaultItem.title)} className="mr-2">
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Media Preview */}
          {vaultItem.media_url ? (
            <View className="w-full aspect-video bg-gray-100 dark:bg-gray-800">
              <Image
                source={{ uri: vaultItem.media_url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          ) : (
            <View
              className="items-center pt-8 pb-6"
              style={{ backgroundColor: `${config.color}10` }}
            >
              <View
                className="w-24 h-24 rounded-3xl items-center justify-center mb-4"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Ionicons name={config.ionicon as any} size={44} color={config.color} />
              </View>
            </View>
          )}

          <View className="px-4 pt-4">
            {/* Title + Badges */}
            <View className="mb-4">
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
                {vaultItem.title}
              </Text>
              <View className="flex-row items-center mt-2 flex-wrap gap-2">
                <View
                  className="rounded-full px-3 py-1 flex-row items-center"
                  style={{ backgroundColor: `${config.color}15` }}
                >
                  <Ionicons name={config.ionicon as any} size={12} color={config.color} />
                  <Text className="text-xs font-sans-medium ml-1.5" style={{ color: config.color }}>
                    {config.label}
                  </Text>
                </View>
                {vaultItem.is_private && (
                  <View className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 flex-row items-center">
                    <Ionicons name="lock-closed" size={10} color="#6B7280" />
                    <Text className="text-xs font-sans-medium text-gray-500 ml-1">Private</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Tags */}
            {itemTags.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-4">
                {itemTags.map((t: any) => (
                  <View key={t.id} className="bg-brand-50 dark:bg-brand-900/20 rounded-full px-3 py-1">
                    <Text className="text-xs font-sans-medium text-brand-700">#{t.tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Description */}
            {vaultItem.description && (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="document-text-outline" size={16} color="#9ca3af" />
                  <Text className="text-sm font-sans-medium text-gray-500 ml-2">Description</Text>
                </View>
                <Text className="text-base font-sans text-gray-800 dark:text-gray-200 leading-6">
                  {vaultItem.description}
                </Text>
              </View>
            )}

            {/* Type-Specific Content */}
            {vaultItem.content && (
              <TypeSpecificContent type={vaultItem.item_type} content={vaultItem.content} config={config} />
            )}

            {/* Meta */}
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-3">Details</Text>
              <MetaRow icon="albums-outline" label="Type" value={config.label} />
              <MetaRow icon="eye-outline" label="Visibility" value={vaultItem.is_private ? "Private" : "Public"} />
              <MetaRow icon="time-outline" label="Added" value={new Date(vaultItem.created_at).toLocaleDateString()} last />
            </View>

            {/* Delete */}
            {isOwner && (
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 items-center border border-red-100 dark:border-red-800 mb-8 flex-row justify-center"
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
                <Text className="text-sm font-sans-medium text-red-600 ml-2">Remove from Vault</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  // ── NOT FOUND ──
  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: "Not Found",
          headerStyle: { backgroundColor: "#2D1B4E" },
          headerTintColor: "#fff",
        }}
      />
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-400 font-sans mt-3">Item not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-sm font-sans-medium text-brand-700">Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
