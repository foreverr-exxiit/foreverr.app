import { View, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useCreateAppreciationLetter } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

export default function ComposeAppreciationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const createLetter = useCreateAppreciationLetter();

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [deliveryType, setDeliveryType] = useState("immediate");
  const [isPublic, setIsPublic] = useState(false);

  const handleSend = async () => {
    if (!user?.id) return;
    if (!recipientName.trim()) {
      Alert.alert("Required", "Please enter the recipient's name.");
      return;
    }
    if (!subject.trim()) {
      Alert.alert("Required", "Please enter a subject.");
      return;
    }
    if (!content.trim()) {
      Alert.alert("Required", "Please write your letter.");
      return;
    }

    try {
      await createLetter.mutateAsync({
        author_id: user.id,
        recipient_name: recipientName.trim(),
        recipient_email: recipientEmail.trim() || undefined,
        subject: subject.trim(),
        content: content.trim(),
        delivery_type: deliveryType,
        is_public: isPublic,
        is_delivered: deliveryType === "immediate",
        delivered_at: deliveryType === "immediate" ? new Date().toISOString() : undefined,
      } as any);
      Alert.alert("Sent!", "Your letter of appreciation has been sent.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not send letter.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="px-4 py-6">
        {/* Header */}
        <View className="items-center mb-6">
          <View className="h-14 w-14 rounded-full bg-purple-50 dark:bg-purple-900/20 items-center justify-center mb-3">
            <Ionicons name="mail" size={28} color="#8B5CF6" />
          </View>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white text-center">
            Write a Letter of Appreciation
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mt-1">
            Tell someone how they've impacted your life
          </Text>
        </View>

        {/* Recipient Name */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          To *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="Recipient's name"
          placeholderTextColor="#9ca3af"
          value={recipientName}
          onChangeText={setRecipientName}
        />

        {/* Recipient Email */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Their email (optional)
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="they@example.com"
          placeholderTextColor="#9ca3af"
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Subject */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Subject *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4"
          placeholder="Thank you for..."
          placeholderTextColor="#9ca3af"
          value={subject}
          onChangeText={setSubject}
        />

        {/* Content */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Your letter *
        </Text>
        <TextInput
          className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 mb-4 min-h-[200px]"
          placeholder="Dear [name], I wanted to take a moment to tell you..."
          placeholderTextColor="#9ca3af"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Delivery type */}
        <Text className="text-xs font-sans-semibold text-gray-500 uppercase tracking-wider mb-2">
          Delivery
        </Text>
        <View className="flex-row gap-2 mb-4">
          {[
            { key: "immediate", label: "Send Now", icon: "paper-plane" },
            { key: "scheduled", label: "Schedule", icon: "calendar" },
          ].map((d) => (
            <Pressable
              key={d.key}
              className={`flex-1 flex-row items-center justify-center rounded-xl py-3 ${
                deliveryType === d.key ? "bg-brand-700" : "bg-gray-100 dark:bg-gray-800"
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

        {/* Public toggle */}
        <Pressable
          className="flex-row items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 p-4 mb-6"
          onPress={() => setIsPublic(!isPublic)}
        >
          <View className="flex-row items-center">
            <Ionicons name="earth" size={20} color="#7C3AED" />
            <View className="ml-3">
              <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">Make Public</Text>
              <Text className="text-xs font-sans text-gray-500">
                Others can see this letter for inspiration
              </Text>
            </View>
          </View>
          <View className={`h-6 w-10 rounded-full ${isPublic ? "bg-brand-700" : "bg-gray-300 dark:bg-gray-600"} justify-center px-0.5`}>
            <View className={`h-5 w-5 rounded-full bg-white ${isPublic ? "self-end" : "self-start"}`} />
          </View>
        </Pressable>

        {/* Send button */}
        <Button
          title={createLetter.isPending ? "Sending..." : "Send Letter"}
          size="lg"
          fullWidth
          onPress={handleSend}
          disabled={createLetter.isPending || !recipientName.trim() || !subject.trim() || !content.trim()}
        />
      </View>
    </ScrollView>
  );
}
