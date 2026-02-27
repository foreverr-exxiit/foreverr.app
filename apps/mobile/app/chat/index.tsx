import { View, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChatRooms, useAuth } from "@foreverr/core";
import { Text, ChatListItem, ListSkeleton } from "@foreverr/ui";

export default function ChatListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: rooms, isLoading } = useChatRooms(user?.id);

  if (isLoading) {
    return <ListSkeleton />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-800">
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            roomName={item.name ?? "Chat"}
            lastMessage={item.last_message_text}
            lastMessageAt={item.last_message_at}
            isMemorial={item.type === "memorial"}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-8 py-20">
            <View className="h-16 w-16 rounded-full bg-brand-100 items-center justify-center mb-4">
              <Ionicons name="chatbubbles-outline" size={32} color="#4A2D7A" />
            </View>
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">No conversations yet</Text>
            <Text className="text-sm font-sans text-center text-gray-500">
              When you host a memorial or start a conversation, it will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
