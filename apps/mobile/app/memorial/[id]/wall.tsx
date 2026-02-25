import { View, FlatList, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTributes, useCreateTribute, useAuth } from "@foreverr/core";
import { Text } from "@foreverr/ui";

const SUB_TABS = ["Condolences", "Tribute", "Social Tags"] as const;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function WallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<string>("Condolences");
  const [message, setMessage] = useState("");

  const { data, isLoading } = useTributes(id);
  const createTribute = useCreateTribute();

  const tributes = data?.pages.flatMap((p) => p.data) ?? [];

  // Filter tributes by sub-tab type
  const filteredTributes = tributes.filter((t: any) => {
    if (activeSubTab === "Condolences") return t.type === "text";
    if (activeSubTab === "Tribute") return t.type !== "text";
    return true; // Social Tags shows all
  });

  const handleSend = async () => {
    if (!message.trim() || !user?.id || !id) return;
    try {
      await createTribute.mutateAsync({
        memorial_id: id,
        author_id: user.id,
        type: "text",
        content: message.trim(),
        ribbon_type: "silver",
        ribbon_count: 1,
      });
      setMessage("");
    } catch {
      Alert.alert("Error", "Failed to post. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={180}>
      {/* Sub-tabs */}
      <View className="flex-row border-b border-gray-100 px-4">
        {SUB_TABS.map((tab) => (
          <Pressable
            key={tab}
            className={`mr-6 py-2.5 ${
              activeSubTab === tab ? "border-b-2 border-gray-900" : ""
            }`}
            onPress={() => setActiveSubTab(tab)}
          >
            <Text
              className={`text-sm font-sans-medium ${
                activeSubTab === tab ? "text-gray-900 dark:text-white" : "text-gray-400"
              }`}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={filteredTributes}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => (
          <View className="px-4 py-3.5 border-b border-gray-50">
            <View className="flex-row items-start">
              <View className="h-9 w-9 rounded-full bg-brand-100 items-center justify-center overflow-hidden">
                {item.author?.avatar_url ? (
                  <Image source={{ uri: item.author.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
                ) : (
                  <Ionicons name="person" size={18} color="#4A2D7A" />
                )}
              </View>
              <View className="ml-2.5 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white">
                    {item.author?.display_name ?? "Anonymous"}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-400 ml-2">{timeAgo(item.created_at)}</Text>
                </View>
                {item.content && (
                  <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 mt-1 leading-5">{item.content}</Text>
                )}
                {item.media_url && (
                  <View className="rounded-xl overflow-hidden mt-2">
                    <Image source={{ uri: item.media_url }} style={{ width: "100%", height: 160 }} contentFit="cover" />
                  </View>
                )}
                <View className="flex-row items-center gap-4 mt-2">
                  <Pressable className="flex-row items-center gap-1">
                    <Ionicons name="heart-outline" size={16} color="#9ca3af" />
                    <Text className="text-xs font-sans text-gray-500">{item.like_count ?? 0}</Text>
                  </Pressable>
                  <Pressable className="flex-row items-center gap-1">
                    <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
                    <Text className="text-xs font-sans text-gray-500">{item.comment_count ?? 0}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-16">
            <Ionicons name="chatbubble-ellipses-outline" size={40} color="#d1d5db" />
            <Text className="mt-3 text-center text-gray-500 text-sm font-sans">
              No {activeSubTab.toLowerCase()} yet.{"\n"}Be the first to leave a message.
            </Text>
          </View>
        }
      />

      {/* Bottom input */}
      <View className="border-t border-gray-100 px-4 py-3 flex-row items-center gap-2">
        <View className="h-9 w-9 rounded-full bg-brand-100 items-center justify-center overflow-hidden">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 36, height: 36 }} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={18} color="#4A2D7A" />
          )}
        </View>
        <View className="flex-1 flex-row items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2">
          <TextInput
            className="flex-1 text-sm font-sans text-gray-900"
            placeholder={`Add a ${activeSubTab === "Condolences" ? "condolence" : "tribute"}...`}
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
          />
        </View>
        <Pressable
          className={`rounded-full px-4 py-2 ${message.trim() ? "bg-red-500" : "bg-gray-300"}`}
          onPress={handleSend}
          disabled={!message.trim() || createTribute.isPending}
        >
          <Text className="text-sm font-sans-semibold text-white">Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
