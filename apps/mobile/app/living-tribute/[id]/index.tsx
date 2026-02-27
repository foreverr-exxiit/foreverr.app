import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Share } from "react-native";
import {
  useAuth,
  useLivingTribute,
  useLivingTributeMessages,
  useAddLivingTributeMessage,
  useInviteToContribute,
  useShareContent,
  useConvertLivingTributeToMemorial,
} from "@foreverr/core";
import { Text, TributeMessageCard, InviteContributorModal, ShareSheet, ConvertToMemorialModal } from "@foreverr/ui";

export default function LivingTributeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: tribute, isLoading } = useLivingTribute(id);
  const { data: messagesData } = useLivingTributeMessages(id);
  const addMessage = useAddLivingTributeMessage();
  const inviteToContribute = useInviteToContribute();
  const shareContent = useShareContent();

  const convertToMemorial = useConvertLivingTributeToMemorial();

  const [messageText, setMessageText] = useState("");
  const [inviteVisible, setInviteVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [convertVisible, setConvertVisible] = useState(false);

  const messages = messagesData?.pages.flatMap((p) => p.data) ?? [];
  const isCreator = tribute?.created_by === user?.id;

  const handleSendMessage = async () => {
    if (!messageText.trim() || !user?.id || !id) return;
    try {
      await addMessage.mutateAsync({
        tribute_id: id,
        author_id: user.id,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not send message.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#4A2D7A" />
      </View>
    );
  }

  if (!tribute) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-sm font-sans text-gray-500">Tribute not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView>
        {/* Header */}
        <View className="bg-brand-50 dark:bg-brand-900/20 px-4 py-6">
          <View className="items-center">
            <View className="h-20 w-20 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-3">
              <Ionicons name="gift" size={36} color="#7C3AED" />
            </View>
            <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
              {tribute.title}
            </Text>
            <Text className="text-sm font-sans text-brand-700 mt-1">
              Honoring {tribute.honoree_name}
            </Text>
            {tribute.description && (
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400 text-center mt-2 px-4">
                {tribute.description}
              </Text>
            )}
          </View>

          {/* Stats */}
          <View className="flex-row justify-center gap-6 mt-4">
            <View className="items-center">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{tribute.contributor_count}</Text>
              <Text className="text-[10px] font-sans text-gray-500">Contributors</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{tribute.message_count}</Text>
              <Text className="text-[10px] font-sans text-gray-500">Messages</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{tribute.view_count}</Text>
              <Text className="text-[10px] font-sans text-gray-500">Views</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View className="flex-row gap-2 mt-4">
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-full bg-brand-700 py-3"
              onPress={() => setInviteVisible(true)}
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text className="ml-2 text-sm font-sans-semibold text-white">Invite</Text>
            </Pressable>
            <Pressable
              className="flex-1 flex-row items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-800 py-3"
              onPress={async () => {
                try {
                  await Share.share({
                    message: `${tribute.title} — Honor ${tribute.honoree_name} on Foreverr! https://foreverr.app/tribute/${tribute.slug}`,
                  });
                } catch {}
              }}
            >
              <Ionicons name="share-outline" size={16} color="#4A2D7A" />
              <Text className="ml-2 text-sm font-sans-semibold text-brand-700">Share</Text>
            </Pressable>
          </View>
        </View>

        {/* Convert to Memorial (creator only) */}
        {isCreator && tribute.status === "active" && (
          <View className="mx-4 mt-4">
            <Pressable
              className="flex-row items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 py-3 border border-red-100 dark:border-red-800"
              onPress={() => setConvertVisible(true)}
            >
              <Ionicons name="heart" size={16} color="#EF4444" />
              <Text className="ml-2 text-sm font-sans-semibold text-red-600">Convert to Memorial</Text>
            </Pressable>
          </View>
        )}

        {/* Messages */}
        <View className="mt-4">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-base font-sans-bold text-gray-900 dark:text-white">
              Messages & Tributes
            </Text>
            {messages.length > 5 && (
              <Pressable onPress={() => router.push(`/living-tribute/${id}/messages`)}>
                <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
              </Pressable>
            )}
          </View>

          {messages.length === 0 ? (
            <View className="items-center py-8 px-6">
              <Ionicons name="chatbubble-ellipses-outline" size={36} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 text-center mt-2">
                No messages yet. Be the first to contribute!
              </Text>
            </View>
          ) : (
            messages.slice(0, 5).map((msg: any) => (
              <TributeMessageCard
                key={msg.id}
                content={msg.content}
                mediaUrl={msg.media_url}
                authorName={(msg.author as any)?.display_name ?? "User"}
                authorAvatarUrl={(msg.author as any)?.avatar_url}
                isAnonymous={msg.is_anonymous}
                reactionCount={msg.reaction_count}
                timestamp={msg.created_at}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Message input */}
      <View className="flex-row items-end px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <TextInput
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white max-h-[100px]"
          placeholder="Write a message..."
          placeholderTextColor="#9ca3af"
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <Pressable
          className={`p-2 ml-2 ${messageText.trim() ? "opacity-100" : "opacity-30"}`}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || addMessage.isPending}
        >
          <Ionicons name="send" size={22} color="#4A2D7A" />
        </Pressable>
      </View>

      {/* Convert to Memorial Modal */}
      <ConvertToMemorialModal
        visible={convertVisible}
        onClose={() => setConvertVisible(false)}
        honoreeName={tribute.honoree_name}
        messageCount={tribute.message_count ?? 0}
        isConverting={convertToMemorial.isPending}
        onConverted={async (dateOfDeath) => {
          if (!user?.id || !id) return;
          try {
            const nameParts = tribute.honoree_name.split(" ");
            const firstName = nameParts[0] ?? tribute.honoree_name;
            const lastName = nameParts.slice(1).join(" ") || "Unknown";
            const memorial = await convertToMemorial.mutateAsync({
              tributeId: id,
              userId: user.id,
              firstName,
              lastName,
              dateOfDeath,
            });
            setConvertVisible(false);
            Alert.alert(
              "Memorial Created",
              `A memorial for ${tribute.honoree_name} has been created with all ${tribute.message_count ?? 0} messages preserved.`,
              [
                { text: "View Memorial", onPress: () => router.push(`/memorial/${memorial.id}` as any) },
                { text: "OK" },
              ]
            );
          } catch (err: any) {
            Alert.alert("Error", err.message ?? "Could not convert tribute.");
          }
        }}
      />

      {/* Invite Modal */}
      <InviteContributorModal
        visible={inviteVisible}
        onClose={() => setInviteVisible(false)}
        tributeTitle={tribute.title}
        onInviteSent={(email) => {
          if (user?.id && id) {
            inviteToContribute.mutate({
              tributeId: id,
              invitedBy: user.id,
              invitedEmail: email,
            });
          }
        }}
      />
    </View>
  );
}
