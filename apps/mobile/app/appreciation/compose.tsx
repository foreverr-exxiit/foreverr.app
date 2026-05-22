import { View, ScrollView, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateAppreciationLetter, useAIRewrite } from "@foreverr/core";
import { Text, EternLogo, AIRewriteButton } from "@foreverr/ui";

const SCHEDULE_OPTIONS = [
  { label: "Tomorrow", days: 1 },
  { label: "Next Week", days: 7 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
];

export default function ComposeAppreciationScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  }, [router]);
  const { user } = useAuth();
  const createLetter = useCreateAppreciationLetter();
  const aiRewrite = useAIRewrite();

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [deliveryType, setDeliveryType] = useState("immediate");
  const [scheduledDate, setScheduledDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Inline feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isSignedIn = !!user?.id;

  const handleSend = async () => {
    setError("");

    if (!isSignedIn) {
      setError("Please sign in to send an appreciation letter.");
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
    if (deliveryType === "scheduled" && !scheduledDate.trim()) {
      setError("Please select a delivery date for the scheduled letter.");
      return;
    }

    try {
      await createLetter.mutateAsync({
        author_id: user!.id,
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim() || undefined,
        subject: subject.trim(),
        content: content.trim(),
        delivery_type: deliveryType,
        is_public: isPublic,
        is_delivered: deliveryType === "immediate",
        delivered_at: deliveryType === "immediate" ? new Date().toISOString() : undefined,
        scheduled_date: deliveryType === "scheduled" && scheduledDate ? scheduledDate : undefined,
      } as any);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Could not send letter. Please try again.");
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
            {deliveryType === "immediate" ? "Letter Sent!" : "Letter Scheduled!"}
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {deliveryType === "immediate"
              ? `Your appreciation letter to ${recipientName} has been sent. What a wonderful way to brighten their day!`
              : `Your letter to ${recipientName} is scheduled for delivery on ${scheduledDate}.`}
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
              Appreciation
            </Text>
            <Text className="text-xs font-sans text-gray-500 mt-0.5">
              Tell someone how they've impacted your life
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
                Sign in to send appreciation
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
            <Ionicons name="heart" size={32} color="#7C3AED" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Write a Letter of Appreciation
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1 px-8">
            Express gratitude, celebrate someone, or simply let them know they matter.
          </Text>
        </View>

        <View className="px-4 gap-5">
          {/* Recipient Name */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              To *
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Recipient's name"
              placeholderTextColor="#9ca3af"
              value={recipientName}
              onChangeText={(t) => { setRecipientName(t); setError(""); }}
            />
          </View>

          {/* Recipient Email */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Their Email (optional)
            </Text>
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="they@example.com"
              placeholderTextColor="#9ca3af"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Subject with suggestions */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </Text>
            {!subject && (
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {[
                  "Thank you for being there",
                  "You changed my life",
                  "I appreciate you",
                  "You inspire me",
                  "Grateful for your kindness",
                ].map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    className="rounded-full bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5"
                    onPress={() => { setSubject(suggestion); setError(""); }}
                  >
                    <Text className="text-xs font-sans-medium text-brand-700 dark:text-brand-400">
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Thank you for..."
              placeholderTextColor="#9ca3af"
              value={subject}
              onChangeText={(t) => { setSubject(t); setError(""); }}
            />
          </View>

          {/* Letter Content */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Your Letter *
            </Text>
            <AIRewriteButton
              currentText={content}
              onResult={(text) => { setContent(text); setError(""); }}
              contextType="appreciation_letter"
              recipientName={recipientName}
              hint={subject || undefined}
              onAISuggest={(params) => aiRewrite.mutateAsync(params)}
            />
            <TextInput
              className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
              placeholder="Dear [name], I wanted to take a moment to tell you..."
              placeholderTextColor="#9ca3af"
              value={content}
              onChangeText={(t) => { setContent(t); setError(""); }}
              multiline
              style={{ minHeight: 180, textAlignVertical: "top" }}
            />
          </View>

          {/* Delivery type */}
          <View>
            <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
              Delivery
            </Text>
            <View className="flex-row gap-2">
              {[
                { key: "immediate", label: "Send Now", icon: "paper-plane" },
                { key: "scheduled", label: "Schedule", icon: "calendar" },
              ].map((d) => (
                <Pressable
                  key={d.key}
                  className={`flex-1 flex-row items-center justify-center rounded-full py-3.5 ${
                    deliveryType === d.key
                      ? "bg-brand-700"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  }`}
                  onPress={() => setDeliveryType(d.key)}
                >
                  <Ionicons
                    name={d.icon as any}
                    size={14}
                    color={deliveryType === d.key ? "white" : "#6b7280"}
                  />
                  <Text
                    className={`ml-1.5 text-xs font-sans-medium ${
                      deliveryType === d.key ? "text-white" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Schedule Date (only when scheduled delivery) */}
          {deliveryType === "scheduled" && (
            <View>
              <Text className="text-sm font-sans-bold text-gray-700 dark:text-gray-300 mb-2">
                Delivery Date *
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-2">
                {SCHEDULE_OPTIONS.map((opt) => {
                  const value = new Date(Date.now() + opt.days * 86400000).toISOString().split("T")[0];
                  return (
                    <Pressable
                      key={opt.label}
                      className={`rounded-full px-3.5 py-2.5 ${
                        scheduledDate === value
                          ? "bg-brand-700"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      }`}
                      onPress={() => { setScheduledDate(value); setError(""); }}
                    >
                      <Text
                        className={`text-xs font-sans-medium ${
                          scheduledDate === value ? "text-white" : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={scheduledDate}
                onChangeText={(t) => { setScheduledDate(t); setError(""); }}
              />
            </View>
          )}

          {/* Public toggle */}
          <Pressable
            className="flex-row items-center justify-between rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700"
            onPress={() => setIsPublic(!isPublic)}
          >
            <View className="flex-row items-center">
              <Ionicons name="earth" size={20} color="#7C3AED" />
              <View className="ml-3">
                <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
                  Make Public
                </Text>
                <Text className="text-xs font-sans text-gray-500">
                  Others can see this letter for inspiration
                </Text>
              </View>
            </View>
            <View
              className={`h-6 w-10 rounded-full ${
                isPublic ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"
              } justify-center px-0.5`}
            >
              <View
                className={`h-5 w-5 rounded-full bg-white ${
                  isPublic ? "self-end" : "self-start"
                }`}
              />
            </View>
          </Pressable>

          {/* Error Message (inline) */}
          {error.length > 0 && (
            <View className="flex-row items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text className="flex-1 text-sm font-sans text-red-700 dark:text-red-400">
                {error}
              </Text>
              <Pressable onPress={() => setError("")}>
                <Ionicons name="close" size={16} color="#ef4444" />
              </Pressable>
            </View>
          )}

          {/* Send button */}
          <Pressable
            onPress={handleSend}
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
                <Ionicons name="heart-outline" size={18} color="white" />
                <Text className="text-base font-sans-bold text-white">
                  {deliveryType === "immediate" ? "Send Letter" : "Schedule Letter"}
                </Text>
              </>
            )}
          </Pressable>

          {/* Helper text */}
          <View className="flex-row items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-2xl px-4 py-3">
            <Ionicons name="information-circle-outline" size={18} color="#7C3AED" />
            <Text className="flex-1 text-xs font-sans text-brand-600/80 dark:text-brand-400/80">
              Letters of appreciation can be sent immediately or scheduled for a special date. Public letters can inspire others to spread kindness.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
