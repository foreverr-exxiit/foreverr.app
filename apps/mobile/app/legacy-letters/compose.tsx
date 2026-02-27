import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";
import { useCreateLegacyLetter } from "@foreverr/core";
import { useAuthStore } from "@foreverr/core";

const DELIVERY_TYPES = [
  { value: "in_app", label: "In-App", icon: "📱" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "both", label: "Both", icon: "📬" },
];

export default function ComposeLetterScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createLetter = useCreateLegacyLetter();

  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryType, setDeliveryType] = useState("in_app");

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim() || !recipientName.trim() || !deliveryDate.trim() || !user?.id)
      return;

    await createLetter.mutateAsync({
      authorId: user.id,
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim() || undefined,
      subject: subject.trim(),
      content: content.trim(),
      deliveryDate: new Date(deliveryDate).toISOString(),
      deliveryType,
    });

    router.back();
  };

  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Write a Legacy Letter" }} />
      <ScrollView className="flex-1 px-4 py-4">
        {/* Intro */}
        <View className="bg-purple-50 rounded-2xl p-4 mb-5 border border-purple-100">
          <Text className="text-sm text-purple-800 leading-5">
            ✉️ Write a heartfelt letter to be delivered to someone special on a future date.
            Perfect for birthdays, anniversaries, or just to let someone know you're thinking of them.
          </Text>
        </View>

        <Input
          label="Recipient's Name"
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Who is this letter for?"
        />

        <Input
          label="Recipient's Email (optional)"
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          placeholder="For email delivery"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="Letter subject..."
        />

        <Input
          label="Your Message"
          value={content}
          onChangeText={setContent}
          placeholder="Dear...\n\nWrite your heartfelt message here..."
          multiline
          numberOfLines={8}
          textAlignVertical="top"
        />

        <Input
          label="Delivery Date (YYYY-MM-DD)"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="2027-06-15"
        />

        {/* Delivery Type */}
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Method</Text>
        <View className="flex-row mb-5">
          {DELIVERY_TYPES.map((dt) => (
            <TouchableOpacity
              key={dt.value}
              onPress={() => setDeliveryType(dt.value)}
              className={`px-4 py-2.5 rounded-xl mr-2 flex-row items-center ${
                deliveryType === dt.value ? "bg-purple-700" : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <Text className="mr-1.5">{dt.icon}</Text>
              <Text
                className={`text-sm font-medium ${
                  deliveryType === dt.value ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {dt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Seal & Schedule Letter"
          onPress={handleSubmit}
          loading={createLetter.isPending}
          disabled={
            !subject.trim() ||
            !content.trim() ||
            !recipientName.trim() ||
            !deliveryDate.trim() ||
            createLetter.isPending
          }
        />

        <View className="h-8" />
      </ScrollView>
    </ScreenWrapper>
  );
}
