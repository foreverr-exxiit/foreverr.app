import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCreateLegacyLetter, useAuth, useAIRewrite } from "@foreverr/core";
import { Text, EternLogo, AIRewriteButton } from "@foreverr/ui";

const DELIVERY_TYPES = [
  { value: "in_app", label: "In-App", icon: "phone-portrait" },
  { value: "email", label: "Email", icon: "mail" },
  { value: "both", label: "Both", icon: "notifications" },
] as const;

const DELIVERY_DATES = [
  { label: "6 Months", days: 182 },
  { label: "1 Year", days: 365 },
  { label: "2 Years", days: 730 },
  { label: "5 Years", days: 5 * 365 },
];

export default function ComposeLetterScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const createLetter = useCreateLegacyLetter();
  const aiRewrite = useAIRewrite();

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryType, setDeliveryType] = useState("in_app");

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  const handleSubmit = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to write a legacy letter.");
      return;
    }
    if (!recipientName.trim()) {
      setError("Please enter the recipient's name.");
      return;
    }
    if (!subject.trim()) {
      setError("Please enter a subject for your letter.");
      return;
    }
    if (!content.trim()) {
      setError("Please write your letter content.");
      return;
    }
    if (!deliveryDate.trim()) {
      setError("Please select a delivery date.");
      return;
    }

    try {
      await createLetter.mutateAsync({
        authorId: user!.id,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim() || undefined,
        subject: subject.trim(),
        content: content.trim(),
        deliveryDate: new Date(deliveryDate).toISOString(),
        deliveryType,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create letter. Please try again.");
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
            Letter Sealed!
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            Your letter to {recipientName} has been sealed and scheduled for delivery on {deliveryDate}. It will be kept safe until then.
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
              Core Letter
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Words delivered in the future
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
                Sign in to write a letter
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
            <Ionicons name="mail" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Write a Core Letter
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            A heartfelt letter delivered on a future date — birthdays, anniversaries, or just because.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Recipient Name */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Recipient's Name *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Who is this letter for?"
              placeholderTextColor="#9ca3af"
              value={recipientName}
              onChangeText={(t) => { setRecipientName(t); setError(""); }}
            />
          </View>

          {/* Recipient Email */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Recipient's Email (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="For email delivery"
              placeholderTextColor="#9ca3af"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Subject */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="e.g. Happy 18th Birthday!"
              placeholderTextColor="#9ca3af"
              value={subject}
              onChangeText={(t) => { setSubject(t); setError(""); }}
            />
          </View>

          {/* Letter Content */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Your Message *
            </Text>
            <AIRewriteButton
              currentText={content}
              onResult={(text) => { setContent(text); setError(""); }}
              contextType="legacy_letter"
              recipientName={recipientName}
              hint={subject || undefined}
              onAISuggest={(params) => aiRewrite.mutateAsync(params)}
            />
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Dear...&#10;&#10;Write your heartfelt message here..."
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={(t) => { setContent(t); setError(""); }}
              multiline
              style={{ minHeight: 160, textAlignVertical: "top" }}
            />
          </View>

          {/* Delivery Date */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Delivery Date *
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {DELIVERY_DATES.map((opt) => {
                const value = new Date(Date.now() + opt.days * 86400000).toISOString().split("T")[0];
                return (
                  <Pressable
                    key={opt.label}
                    className={`rounded-full px-3.5 py-2.5 ${
                      deliveryDate === value
                        ? "bg-brand-700"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                    onPress={() => { setDeliveryDate(value); setError(""); }}
                  >
                    <Text
                      className={`text-xs font-sans-medium ${
                        deliveryDate === value ? "text-white" : "text-gray-600 dark:text-gray-400"
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
              value={deliveryDate}
              onChangeText={(t) => { setDeliveryDate(t); setError(""); }}
            />
            <Text className="text-xs font-sans text-gray-400 mt-1">
              Your letter will be delivered on this date
            </Text>
          </View>

          {/* Delivery Type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Delivery Method
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {DELIVERY_TYPES.map((dt) => (
                <Pressable
                  key={dt.value}
                  className={`flex-row items-center rounded-full px-3.5 py-2.5 ${
                    deliveryType === dt.value
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setDeliveryType(dt.value)}
                >
                  <Ionicons
                    name={dt.icon as any}
                    size={14}
                    color={deliveryType === dt.value ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      deliveryType === dt.value ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {dt.label}
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

          {/* Submit button */}
          <Pressable
            onPress={handleSubmit}
            className={`w-full rounded-2xl py-4 items-center flex-row justify-center gap-2 ${
              createLetter.isPending
                ? "bg-brand-500"
                : "bg-brand-700 active:bg-brand-800"
            }`}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            {createLetter.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  Seal & Schedule Letter
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Once sealed, your letter will be kept safe and delivered on the chosen date. The recipient will be notified when it arrives.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
