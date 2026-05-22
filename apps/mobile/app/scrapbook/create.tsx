import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateScrapbookPage, useAuth } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const BG_COLORS = [
  { value: "#F3E8FF", label: "Lavender" },
  { value: "#FFF7ED", label: "Cream" },
  { value: "#F0FDF4", label: "Mint" },
  { value: "#FEF2F2", label: "Rose" },
  { value: "#F0F9FF", label: "Sky" },
  { value: "#FFFBEB", label: "Gold" },
  { value: "#F5F5F4", label: "Stone" },
  { value: "#1E1B4B", label: "Midnight" },
];

export default function CreateScrapbookPageScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createPage = useCreateScrapbookPage();

  const [title, setTitle] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#F3E8FF");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to create a scrapbook page.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a page title.");
      return;
    }

    try {
      await createPage.mutateAsync({
        memorialId: memorialId || "",
        createdBy: user!.id,
        title: title.trim(),
        pageNumber: pageNumber ? parseInt(pageNumber, 10) : undefined,
        backgroundColor,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create page. Please try again.");
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
            Scrapbook Page Created!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your page "{title}" is ready. Add photos, stickers, and memories to bring it to life!
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
              Scrapbook
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Create a beautiful memory page
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
                Sign in to create a scrapbook
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
            <Ionicons name="book" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            New Scrapbook Page
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Choose a background, give it a title, and start collecting memories.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Page Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Page Title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Summer Memories 2024"
              placeholderTextColor="#9ca3af"
              value={title}
              onChangeText={(t) => { setTitle(t); setError(""); }}
            />
          </View>

          {/* Page Number */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Page Number (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="1"
              placeholderTextColor="#9ca3af"
              value={pageNumber}
              onChangeText={setPageNumber}
              keyboardType="numeric"
            />
          </View>

          {/* Background Color */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {BG_COLORS.map((c) => (
                <Pressable
                  key={c.value}
                  onPress={() => setBackgroundColor(c.value)}
                  className="items-center"
                >
                  <View
                    className={`w-12 h-12 rounded-xl border-2 ${
                      backgroundColor === c.value
                        ? "border-brand-700"
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                    style={{ backgroundColor: c.value, opacity: backgroundColor === c.value ? 1 : 0.6 }}
                  />
                  <Text className="text-xs font-sans text-gray-500 mt-1">{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </Text>
            <View
              className="h-44 rounded-2xl items-center justify-center border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor }}
            >
              <Ionicons
                name="book-outline"
                size={36}
                color={backgroundColor === "#1E1B4B" ? "#FFFFFF" : "#7C3AED"}
              />
              <Text
                className={`text-sm font-sans-bold mt-2 ${
                  backgroundColor === "#1E1B4B" ? "text-white" : "text-gray-700"
                }`}
              >
                {title || "Your Page Title"}
              </Text>
              {pageNumber ? (
                <Text
                  className={`text-xs font-sans mt-1 ${
                    backgroundColor === "#1E1B4B" ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  Page {pageNumber}
                </Text>
              ) : null}
            </View>
          </View>

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

          {/* Create button */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              createPage.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createPage.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Create Page
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              After creating your page, you can add photos, text, stickers, and other elements to tell your story.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
