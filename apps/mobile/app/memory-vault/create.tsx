import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateVaultItem, useCreateTimeCapsule, useAuth } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const ITEM_TYPES = [
  { value: "document", label: "Document", icon: "document-text" },
  { value: "recipe", label: "Recipe", icon: "restaurant" },
  { value: "letter", label: "Letter", icon: "mail" },
  { value: "audio_playlist", label: "Playlist", icon: "musical-notes" },
  { value: "quote", label: "Quote", icon: "chatbox-ellipses" },
  { value: "photo_album", label: "Photo Album", icon: "images" },
  { value: "video", label: "Video", icon: "videocam" },
  { value: "time_capsule", label: "Time Capsule", icon: "time" },
  { value: "keepsake", label: "Keepsake", icon: "diamond" },
  { value: "story", label: "Story", icon: "book" },
] as const;

const UNLOCK_OPTIONS = [
  { label: "1 Year", days: 365 },
  { label: "5 Years", days: 5 * 365 },
  { label: "10 Years", days: 10 * 365 },
  { label: "25 Years", days: 25 * 365 },
];

export default function CreateVaultItemScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createItem = useCreateVaultItem();
  const createCapsule = useCreateTimeCapsule();

  const [itemType, setItemType] = useState("document");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;
  const isTimeCapsule = itemType === "time_capsule";
  const isLoading = createItem.isPending || createCapsule.isPending;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to add to The Core.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (isTimeCapsule && !unlockDate.trim()) {
      setError("Please select an unlock date for the time capsule.");
      return;
    }

    try {
      if (isTimeCapsule) {
        await createCapsule.mutateAsync({
          memorialId: memorialId || "",
          createdBy: user!.id,
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim() || undefined,
          unlockDate: new Date(unlockDate).toISOString(),
        });
      } else {
        await createItem.mutateAsync({
          memorialId: memorialId || "",
          uploadedBy: user!.id,
          itemType,
          title: title.trim(),
          description: description.trim() || undefined,
          content: content.trim() || undefined,
          isPrivate,
        });
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to add item. Please try again.");
    }
  };

  // ─── Success state ──────────────────────────────────────────────
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            {isTimeCapsule ? "Time Capsule Created!" : "Added to Vault!"}
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {isTimeCapsule
              ? `Your time capsule "${title}" has been sealed. It will be revealed on the unlock date.`
              : `"${title}" has been safely stored in The Core.`}
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={goBack}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // ─── Main form ──────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="ml-2">
            <EternLogo width={168} variant="icon" />
          </View>
          <View className="flex-1 ml-2">
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white">
              The Core
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Preserve memories safely forever
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign-in banner */}
        {!isSignedIn && (
          <Pressable
            onPress={() => router.push("/(auth)/login" as any)}
            className="mx-4 mt-4 flex-row items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl px-4 py-3"
          >
            <Ionicons name="log-in-outline" size={20} color="#d97706" />
            <View className="flex-1">
              <Text className="text-sm font-sans-bold text-yellow-800 dark:text-yellow-300">
                Sign in to add to the vault
              </Text>
              <Text className="text-xs font-sans text-yellow-600 dark:text-yellow-400 mt-0.5">
                Tap here to sign in or create an account
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#d97706" />
          </Pressable>
        )}

        {/* Hero */}
        <View className="items-center py-6">
          <View className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-900/20 items-center justify-center mb-3">
            <Ionicons name="lock-closed" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Store a Precious Memory
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Documents, recipes, letters, photos — keep them safe and accessible to those who matter.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Item Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {ITEM_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    itemType === t.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setItemType(t.value)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={14}
                    color={itemType === t.value ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      itemType === t.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Grandma's Secret Recipe"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Brief description..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 60, textAlignVertical: "top" }}
            />
          </View>

          {/* Content */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              {isTimeCapsule ? "Hidden Message" : "Content (optional)"}
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder={isTimeCapsule ? "Write the message to be revealed..." : "Text content, notes, or details..."}
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={setContent}
              multiline
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Time Capsule unlock date */}
          {isTimeCapsule && (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Unlock Date *
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-2">
                {UNLOCK_OPTIONS.map((opt) => {
                  const value = new Date(Date.now() + opt.days * 86400000).toISOString().split("T")[0];
                  return (
                    <Pressable
                      key={opt.label}
                      className={`rounded-full px-3.5 py-2.5 ${
                        unlockDate === value
                          ? "bg-brand-700"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                      onPress={() => { setUnlockDate(value); setError(""); }}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          unlockDate === value ? "text-white" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={unlockDate}
                onChangeText={(t) => { setUnlockDate(t); setError(""); }}
              />
              <Text className="text-xs font-sans text-gray-400 mt-1">
                The capsule will remain sealed until this date
              </Text>
            </View>
          )}

          {/* Privacy toggle (non-capsule) */}
          {!isTimeCapsule && (
            <Pressable
              className="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <View className="flex-row items-center">
                <Ionicons name="eye-off" size={20} color="#7C3AED" />
                <View className="ml-3">
                  <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                    Private Item
                  </Text>
                  <Text className="text-xs font-sans text-gray-500">
                    Only hosts can view this item
                  </Text>
                </View>
              </View>
              <View
                className={`h-6 w-10 rounded-full ${
                  isPrivate ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
                } justify-center px-0.5`}
              >
                <View
                  className={`h-5 w-5 rounded-full bg-white ${
                    isPrivate ? "self-end" : "self-start"
                  }`}
                />
              </View>
            </Pressable>
          )}

          {/* Error Message (inline) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              isLoading
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name={isTimeCapsule ? "time-outline" : "add-circle-outline"} size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  {isTimeCapsule ? "Create Time Capsule" : "Add to Core"}
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              {isTimeCapsule
                ? "Time capsules are sealed and cannot be viewed until the unlock date arrives."
                : "Items stored in the vault are preserved forever and can be shared with family and friends."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
