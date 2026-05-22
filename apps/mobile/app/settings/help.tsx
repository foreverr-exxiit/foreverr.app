import { View, ScrollView, Pressable, Linking, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How do I create a memorial?",
    answer: "Tap the \"+\" button on the home screen and select \"Create Memorial\". You'll be guided through adding basic information, photos, and a first tribute. Memorials can be for someone who has passed or as a living tribute for someone still with us.",
  },
  {
    question: "What are ribbons and how do I get them?",
    answer: "Ribbons are virtual tokens used to attach to tributes — they show honor and support. You receive free ribbons when you sign up, and can earn more by being active on the platform. Premium ribbon packs are also available for purchase.",
  },
  {
    question: "Can I make a memorial private?",
    answer: "Yes. When creating or editing a memorial, you can set it to \"Private\" so only people you invite can view it. You can also set memorials to \"Family Only\" which limits access to approved family members.",
  },
  {
    question: "How do gifts and donations work?",
    answer: "You can send virtual gifts (flowers, candles, cards) using Core Points, or contribute real money through fundraiser campaigns set up on memorial pages. All monetary donations are processed securely through Stripe.",
  },
  {
    question: "What does the AI writing assistant do?",
    answer: "Our AI assistant helps you write tributes, obituaries, appreciation letters, and other memorial content. It uses context about the person being honored to generate heartfelt suggestions. You always have full control to edit or reject AI suggestions.",
  },
  {
    question: "How do I manage who can edit a memorial?",
    answer: "Memorial creators can invite collaborators and assign roles (Admin, Editor, Viewer). Go to the memorial page, tap the settings icon, and select \"Manage Collaborators\" to add or remove people.",
  },
  {
    question: "Can I transfer ownership of a memorial?",
    answer: "Yes. As a memorial owner, you can transfer ownership through the Trust & Claims system. Go to the memorial settings and select \"Transfer Ownership\". The new owner must accept the transfer.",
  },
  {
    question: "How do I cancel my premium subscription?",
    answer: "Go to Settings > Subscription & Billing > Manage Subscription. You can cancel anytime and your premium features will remain active until the end of your current billing period.",
  },
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      className="py-3 px-4 border-b border-gray-100 dark:border-gray-800"
      onPress={() => setExpanded(!expanded)}
    >
      <View className="flex-row items-center">
        <Text className="flex-1 text-sm font-sans-medium text-gray-900 dark:text-white pr-3">
          {item.question}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color="#9ca3af"
        />
      </View>
      {expanded && (
        <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 leading-5 mt-2">
          {item.answer}
        </Text>
      )}
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open the link.");
    });
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Help & Support</Text>
            <Text className="text-xs font-sans text-gray-400 mt-0.5">We're here to help</Text>
          </View>
        </View>
      </View>

      {/* Contact Options */}
      <View className="px-5 pt-5">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Get in Touch</Text>
        <View className="flex-row gap-3 mb-6">
          <Pressable
            className="flex-1 items-center py-4 bg-brand-50 dark:bg-brand-900/10 rounded-2xl"
            onPress={() => openUrl("mailto:support@eterrn.app")}
          >
            <View className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/20 items-center justify-center mb-2">
              <Ionicons name="mail-outline" size={20} color="#4A2D7A" />
            </View>
            <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">Email Us</Text>
            <Text className="text-[10px] font-sans text-gray-400 mt-0.5">support@eterrn.app</Text>
          </Pressable>

          <Pressable
            className="flex-1 items-center py-4 bg-green-50 dark:bg-green-900/10 rounded-2xl"
            onPress={() => {
              Alert.alert("Live Chat", "Live chat is available Monday-Friday, 9am-6pm EST. Would you like to start a chat?", [
                { text: "Not Now" },
                { text: "Start Chat", onPress: () => openUrl("mailto:support@eterrn.app?subject=Live%20Chat%20Request") },
              ]);
            }}
          >
            <View className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mb-2">
              <Ionicons name="chatbubbles-outline" size={20} color="#059669" />
            </View>
            <Text className="text-xs font-sans-bold text-gray-900 dark:text-white">Live Chat</Text>
            <Text className="text-[10px] font-sans text-gray-400 mt-0.5">Mon-Fri 9am-6pm</Text>
          </Pressable>
        </View>
      </View>

      {/* FAQ */}
      <View className="px-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Frequently Asked Questions</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQAccordion key={idx} item={item} />
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-5 mb-6">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => {
              Alert.alert("Report a Problem", "Please describe the issue you're experiencing. Screenshots are helpful!\n\nYou can also email us at support@eterrn.app", [
                { text: "Cancel" },
                { text: "Email Support", onPress: () => openUrl("mailto:support@eterrn.app?subject=Bug%20Report") },
              ]);
            }}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="bug-outline" size={16} color="#EF4444" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">Report a Problem</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>

          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => {
              Alert.alert("Feature Request", "We love hearing your ideas! Send us your feature suggestions.", [
                { text: "Cancel" },
                { text: "Send Feedback", onPress: () => openUrl("mailto:feedback@eterrn.app?subject=Feature%20Request") },
              ]);
            }}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="bulb-outline" size={16} color="#D97706" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">Request a Feature</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>

          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => {
              Alert.alert("Report Content", "If you've found content that is inappropriate, abusive, or violates our community guidelines, please email us with the details.", [
                { text: "Cancel" },
                { text: "Report", onPress: () => openUrl("mailto:trust@eterrn.app?subject=Content%20Report") },
              ]);
            }}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="flag-outline" size={16} color="#7C3AED" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">Report Inappropriate Content</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>

          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => router.push("/settings/privacy" as any)}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
            </View>
            <Text className="flex-1 text-sm font-sans text-gray-700 dark:text-gray-300">Privacy & Security Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>

      {/* Footer note */}
      <View className="items-center pb-10 px-8">
        <Text className="text-[11px] font-sans text-gray-400 text-center">
          Our support team typically responds within 24 hours during business days. For urgent matters, please include "URGENT" in your email subject line.
        </Text>
      </View>
    </ScrollView>
  );
}
