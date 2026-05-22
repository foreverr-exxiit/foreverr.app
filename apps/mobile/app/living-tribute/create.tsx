import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateLivingTribute, useAIRewrite } from "@foreverr/core";
import { Text, EternLogo, AIRewriteButton } from "@foreverr/ui";

const OCCASIONS = [
  { key: "birthday", label: "Birthday", icon: "gift" },
  { key: "anniversary", label: "Anniversary", icon: "heart" },
  { key: "graduation", label: "Graduation", icon: "school" },
  { key: "wedding", label: "Wedding", icon: "rose" },
  { key: "baby_shower", label: "Baby Shower", icon: "happy" },
  { key: "new_baby", label: "New Baby", icon: "balloon" },
  { key: "retirement", label: "Retirement", icon: "trophy" },
  { key: "promotion", label: "Promotion", icon: "trending-up" },
  { key: "appreciation", label: "Appreciation", icon: "sparkles" },
  { key: "get_well", label: "Get Well", icon: "medkit" },
  { key: "achievement", label: "Achievement", icon: "star" },
  { key: "farewell", label: "Farewell", icon: "airplane" },
  { key: "just_because", label: "Just Because", icon: "heart-circle" },
] as const;

export default function CreateLivingTributeScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const createTribute = useCreateLivingTribute();
  const aiRewrite = useAIRewrite();

  const [honoreeName, setHonoreeName] = useState("");
  const [honoreeEmail, setHonoreeEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [occasion, setOccasion] = useState("appreciation");
  const [privacy, setPrivacy] = useState("public");
  const [isSurprise, setIsSurprise] = useState(false);

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resultId, setResultId] = useState("");

  const isSignedIn = !!user?.id;

  const handleCreate = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to create a living tribute.");
      return;
    }
    if (!honoreeName.trim()) {
      setError("Please enter the honoree's name.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title for the tribute.");
      return;
    }

    try {
      const result = await createTribute.mutateAsync({
        created_by: user!.id,
        honoree_name: honoreeName.trim(),
        honoree_email: honoreeEmail.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        occasion,
        privacy,
        is_surprise: isSurprise,
      });
      setResultId(result.id);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not create tribute. Please try again.");
    }
  };

  // Success state
  if (success) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-20 w-20 rounded-3xl bg-green-50 dark:bg-green-900/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
          </View>
          <Text className="text-xl font-sans-bold text-gray-900 dark:text-white mb-2">
            Tribute Created!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your living tribute for {honoreeName} is ready. Share it with friends to collect messages!
          </Text>
          <View className="w-full gap-3">
            <Pressable
              onPress={() => router.replace(`/living-tribute/${resultId}` as any)}
              className="bg-brand-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-base font-sans-bold text-white">View Tribute</Text>
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
              Living Tribute
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Celebrate someone while they can see it
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
                Sign in to create a tribute
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
            <Ionicons name="gift" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Honor Someone Special
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Create a tribute page to celebrate someone — collect messages, photos, and love from everyone who cares.
          </Text>
        </View>

        <View className="px-4 gap-5">

          {/* Honoree Name */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Who are you honoring? *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Their full name"
              placeholderTextColor="#9ca3af"
              value={honoreeName}
              onChangeText={(t) => { setHonoreeName(t); setError(""); }}
            />
          </View>

          {/* Honoree Email */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Their email (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="So they can be notified"
              placeholderTextColor="#9ca3af"
              value={honoreeEmail}
              onChangeText={setHonoreeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Title */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Tribute title *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Happy Birthday Mom!"
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
            <AIRewriteButton
              currentText={description}
              onResult={setDescription}
              contextType="living_tribute"
              recipientName={honoreeName}
              hint={`${occasion} tribute for ${honoreeName || "someone special"}: ${title || ""}`}
              onAISuggest={(params) => aiRewrite.mutateAsync(params)}
            />
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Why you're honoring them..."
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </View>

          {/* Occasion */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Occasion
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <Pressable
                  key={o.key}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    occasion === o.key
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setOccasion(o.key)}
                >
                  <Ionicons
                    name={o.icon as any}
                    size={14}
                    color={occasion === o.key ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      occasion === o.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Privacy */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Privacy
            </Text>
            <View className="flex-row gap-2">
              {[
                { key: "public", label: "Public", icon: "earth" },
                { key: "private", label: "Private", icon: "lock-closed" },
                { key: "invited", label: "Invite Only", icon: "mail" },
              ].map((p) => (
                <Pressable
                  key={p.key}
                  className={`flex-1 flex-row items-center justify-center rounded-xl py-3.5 ${
                    privacy === p.key
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setPrivacy(p.key)}
                >
                  <Ionicons
                    name={p.icon as any}
                    size={14}
                    color={privacy === p.key ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      privacy === p.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Surprise toggle */}
          <Pressable
            className="flex-row items-center justify-between rounded-xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
            onPress={() => setIsSurprise(!isSurprise)}
          >
            <View className="flex-row items-center">
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
              <View className="ml-3">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Surprise Tribute
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Hidden until you're ready to reveal
                </Text>
              </View>
            </View>
            <View
              className={`h-6 w-10 rounded-full ${
                isSurprise ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
              } justify-center px-0.5`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  isSurprise ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>

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

          {/* Create button — always tappable */}
          <Pressable
            onPress={handleCreate}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              createTribute.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createTribute.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="gift-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Create Living Tribute
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              After creating, share the link with friends and family so they can add their messages, photos, and love.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
