import { View, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMessages, useSendMessage, useChatRealtime, useMarkChatRead, useAuth } from "@foreverr/core";
import { Text, ChatBubble } from "@foreverr/ui";

export default function ChatConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage } = useMessages(id);
  const sendMessage = useSendMessage();
  const markRead = useMarkChatRead();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; content: string | null; senderName: string } | null>(null);

  // Subscribe to realtime messages
  useChatRealtime(id);

  // Mark as read when entering
  useCallback(() => {
    if (id && user?.id) {
      markRead.mutate({ roomId: id, userId: user.id });
    }
  }, [id, user?.id])();

  const messages = data?.pages.flatMap((p) => p.data) ?? [];

  const handleSend = async () => {
    if (!text.trim() || !user?.id || !id) return;
    await sendMessage.mutateAsync({
      roomId: id,
      senderId: user.id,
      content: text.trim(),
      replyToId: replyTo?.id,
    });
    setText("");
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-800"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item: any) => item.id}
        inverted
        renderItem={({ item }: { item: any }) => (
          <ChatBubble
            content={item.content}
            senderName={item.sender?.display_name ?? "Unknown"}
            senderAvatarUrl={item.sender?.avatar_url}
            timestamp={item.created_at}
            isOwn={item.sender_id === user?.id}
            type={item.type}
            onLongPress={() =>
              setReplyTo({
                id: item.id,
                content: item.content,
                senderName: item.sender?.display_name ?? "Unknown",
              })
            }
          />
        )}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View className="items-center py-20">
            <Text className="text-sm font-sans text-gray-400">No messages yet. Say hello!</Text>
          </View>
        }
      />

      {/* Reply preview */}
      {replyTo && (
        <View className="flex-row items-center px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
          <View className="flex-1 border-l-2 border-brand-700 pl-2">
            <Text className="text-[10px] font-sans-semibold text-brand-700">
              Replying to {replyTo.senderName}
            </Text>
            <Text className="text-xs font-sans text-gray-500" numberOfLines={1}>
              {replyTo.content ?? "Media"}
            </Text>
          </View>
          <Pressable onPress={() => setReplyTo(null)}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </Pressable>
        </View>
      )}

      {/* Input bar */}
      <View className="flex-row items-end px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Pressable
          className="p-2"
          onPress={() =>
            Alert.alert("Attach", "Choose what to send", [
              { text: "Cancel", style: "cancel" },
              { text: "Photo", onPress: () => Alert.alert("Coming Soon", "Photo sharing will be available soon!") },
              { text: "Candle 🕯️", onPress: () => {
                if (user?.id && id) {
                  sendMessage.mutate({ roomId: id, senderId: user.id, content: "🕯️", type: "candle" } as any);
                }
              }},
            ])
          }
        >
          <Ionicons name="add-circle-outline" size={24} color="#4A2D7A" />
        </Pressable>
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white max-h-[100px]"
          placeholder="Message..."
          placeholderTextColor="#9ca3af"
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          className={`p-2 ${text.trim() ? "opacity-100" : "opacity-30"}`}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={22} color="#4A2D7A" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
