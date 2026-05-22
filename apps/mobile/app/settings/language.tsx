import { View, ScrollView, Pressable, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@foreverr/ui";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "\uD83C\uDDFA\uD83C\uDDF8" },
  { code: "es", label: "Spanish", native: "Espa\u00F1ol", flag: "\uD83C\uDDEA\uD83C\uDDF8" },
  { code: "fr", label: "French", native: "Fran\u00E7ais", flag: "\uD83C\uDDEB\uD83C\uDDF7" },
  { code: "pt", label: "Portuguese", native: "Portugu\u00EAs", flag: "\uD83C\uDDE7\uD83C\uDDF7" },
  { code: "zh", label: "Chinese", native: "\u4E2D\u6587", flag: "\uD83C\uDDE8\uD83C\uDDF3" },
  { code: "ar", label: "Arabic", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", flag: "\uD83C\uDDF8\uD83C\uDDE6" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleSelect = (code: string) => {
    setSelectedLanguage(code);
    if (code !== "en") {
      Alert.alert(
        "Language Changed",
        `The app language will be updated to ${LANGUAGES.find((l) => l.code === code)?.label}. Some content may not be fully translated yet.`,
        [{ text: "OK" }]
      );
    }
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
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Language</Text>
            <Text className="text-xs font-sans text-gray-400 mt-0.5">Choose your preferred language</Text>
          </View>
        </View>
      </View>

      {/* Language List */}
      <View className="mt-4 px-2">
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <Pressable
                key={lang.code}
                className={`flex-row items-center py-3.5 px-4 ${isSelected ? "bg-brand-50 dark:bg-brand-900/10" : ""}`}
                onPress={() => handleSelect(lang.code)}
              >
                <Text style={{ fontSize: 22 }} className="mr-3">{lang.flag}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">{lang.label}</Text>
                  <Text className="text-[11px] font-sans text-gray-400">{lang.native}</Text>
                </View>
                {isSelected && (
                  <View className="h-5 w-5 rounded-full bg-brand-700 items-center justify-center">
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Note */}
      <View className="mx-5 mt-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3">
        <View className="flex-row items-start gap-2">
          <Ionicons name="information-circle-outline" size={16} color="#2563EB" />
          <Text className="flex-1 text-[11px] font-sans text-blue-600 dark:text-blue-400 leading-4">
            ǝterrn supports 6 languages. AI-generated content will attempt to match your language preference. Some community content may remain in its original language.
          </Text>
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
