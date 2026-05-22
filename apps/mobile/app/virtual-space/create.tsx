import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateVirtualSpace, useAuth } from "@foreverr/core";
import { Text, EternLogo } from "@foreverr/ui";

const SPACE_TYPES = [
  { value: "memorial_room", label: "Memorial Room", icon: "business" },
  { value: "garden", label: "Garden", icon: "leaf" },
  { value: "chapel", label: "Chapel", icon: "home" },
  { value: "gravesite", label: "Gravesite", icon: "flag" },
  { value: "beach", label: "Beach", icon: "sunny" },
  { value: "forest", label: "Forest", icon: "trail-sign" },
  { value: "nursery", label: "Nursery", icon: "happy" },
  { value: "celebration", label: "Celebration Hall", icon: "sparkles" },
  { value: "custom", label: "Custom", icon: "color-palette" },
] as const;

export default function CreateVirtualSpaceScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { memorialId } = useLocalSearchParams<{ memorialId: string }>();
  const { user } = useAuth();
  const createSpace = useCreateVirtualSpace();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [spaceType, setSpaceType] = useState("memorial_room");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultId, setResultId] = useState("");

  const isSignedIn = !!user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to create a virtual space.");
      return;
    }
    if (!name.trim()) {
      setError("Please enter a name for the space.");
      return;
    }

    try {
      const space = await createSpace.mutateAsync({
        memorialId: memorialId || "",
        createdBy: user!.id,
        name: name.trim(),
        description: description.trim() || undefined,
        spaceType,
      });
      setResultId(space.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create space. Please try again.");
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
            Virtual Space Created!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your space "{name}" is ready. Visitors can now leave tributes and explore it.
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={() => router.replace(`/virtual-space/${resultId}` as any)}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">Visit Space</Text>
            </Pressable>
            <Pressable
              onPress={goBack}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-gray-600 dark:text-gray-400">Back</Text>
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
              Virtual Space
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Create an immersive experience
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
                Sign in to create a space
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
            <Ionicons name="globe" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            New Virtual Space
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Create an immersive space where visitors can leave tributes, explore, and connect.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Space Name */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Space Name *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Dad's Memorial Garden"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={(t) => { setName(t); setError(""); }}
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Description (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Describe this space..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 80, textAlignVertical: "top" }}
            />
          </View>

          {/* Space Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Space Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {SPACE_TYPES.map((t) => (
                <Pressable
                  key={t.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    spaceType === t.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setSpaceType(t.value)}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={14}
                    color={spaceType === t.value ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      spaceType === t.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
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
              createSpace.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createSpace.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="globe-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Create Space
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Virtual spaces are immersive environments where visitors can place tributes, light candles, and share memories.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
