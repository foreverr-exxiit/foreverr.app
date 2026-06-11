import React, { useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert, TextInput } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useAuth,
  useMemorial,
  useMemorialPhotoTags,
  usePhotoFaceTags,
  useCreatePhotoTag,
  useDeletePhotoTag,
  useTagSuggestions,
} from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

export default function PhotoTagsScreen() {
  const router = useRouter();
  const { memorialId, photoUrl } = useLocalSearchParams<{ memorialId: string; photoUrl?: string }>();
  const { user } = useAuth();
  const { data: memorial } = useMemorial(memorialId);
  const { data: allTags, isLoading } = useMemorialPhotoTags(memorialId);
  const { data: photoTags } = usePhotoFaceTags(photoUrl);
  const { data: suggestions } = useTagSuggestions(memorialId);
  const createTag = useCreatePhotoTag();
  const deleteTag = useDeletePhotoTag();

  const [showTagForm, setShowTagForm] = useState(false);
  const [tagName, setTagName] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<{
    memorial_id?: string;
    profile_id?: string;
    name: string;
  } | null>(null);

  const name = memorial ? `${memorial.first_name ?? ""} ${memorial.last_name ?? ""}`.trim() || "Memorial" : "Memorial";

  // Group tags by person for the "People in Photos" view
  const peopleMap = new Map<string, { name: string; count: number; photos: string[] }>();
  for (const tag of allTags ?? []) {
    const personKey = tag.tagged_memorial_id ?? tag.tagged_profile_id ?? tag.tagged_name ?? "unknown";
    const personName = tag.tagged_name ?? "Unknown Person";
    const existing = peopleMap.get(personKey);
    if (existing) {
      existing.count++;
      if (!existing.photos.includes(tag.photo_url)) {
        existing.photos.push(tag.photo_url);
      }
    } else {
      peopleMap.set(personKey, { name: personName, count: 1, photos: [tag.photo_url] });
    }
  }
  const people = Array.from(peopleMap.entries()).sort((a, b) => b[1].count - a[1].count);

  const handleTag = async () => {
    if (!user?.id || !photoUrl) return;
    if (!tagName.trim() && !selectedSuggestion) {
      Alert.alert("Required", "Please enter a name or select a suggestion.");
      return;
    }

    try {
      await createTag.mutateAsync({
        photo_url: photoUrl,
        memorial_id: memorialId,
        tagged_memorial_id: selectedSuggestion?.memorial_id,
        tagged_profile_id: selectedSuggestion?.profile_id,
        tagged_name: selectedSuggestion?.name ?? tagName.trim(),
        tagged_by: user.id,
      });
      setShowTagForm(false);
      setTagName("");
      setSelectedSuggestion(null);
      Alert.alert("Tagged!", "Person has been tagged in this photo.");
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Could not tag person.");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Stack.Screen options={{ title: "Photo Tags" }} />
        <ActivityIndicator size="small" color="#4A2D7A" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <Stack.Screen options={{ title: photoUrl ? "Tag People" : `People in ${name}'s Photos` }} />

      {/* Photo being tagged */}
      {photoUrl && (
        <View className="px-4 pt-4">
          <View className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              source={{ uri: photoUrl }}
              className="w-full h-64"
              resizeMode="cover"
            />

            {/* Existing tags on this photo */}
            {(photoTags ?? []).length > 0 && (
              <View className="p-3 bg-gray-50 dark:bg-gray-800">
                <Text className="text-xs font-sans-semibold text-gray-500 mb-2">Tagged in this photo:</Text>
                {(photoTags ?? []).map((tag) => (
                  <View key={tag.id} className="flex-row items-center justify-between py-1.5">
                    <View className="flex-row items-center">
                      <Ionicons name="person-circle" size={20} color="#4A2D7A" />
                      <Text className="text-sm font-sans-medium text-gray-800 dark:text-gray-200 ml-2">
                        {tag.tagged_name ?? "Unknown"}
                      </Text>
                      {tag.is_auto_detected && !tag.is_verified && (
                        <View className="ml-2 bg-yellow-100 rounded-full px-2 py-0.5">
                          <Text className="text-[9px] font-sans-medium text-yellow-700">Auto-detected</Text>
                        </View>
                      )}
                      {tag.is_verified && (
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Pressable
                      onPress={() => {
                        Alert.alert("Remove Tag", `Remove ${tag.tagged_name ?? "this person"} from this photo?`, [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Remove",
                            style: "destructive",
                            onPress: () => deleteTag.mutate({ id: tag.id, photo_url: tag.photo_url, memorial_id: memorialId }),
                          },
                        ]);
                      }}
                    >
                      <Ionicons name="close-circle" size={18} color="#9ca3af" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tag button */}
          <Pressable
            className="mt-3 bg-brand-700 rounded-xl py-3 flex-row items-center justify-center"
            onPress={() => setShowTagForm(true)}
          >
            <Ionicons name="person-add" size={16} color="white" />
            <Text className="text-sm font-sans-semibold text-white ml-2">Tag Someone</Text>
          </Pressable>

          {/* Tag form */}
          {showTagForm && (
            <View className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300 mb-2">
                Who is in this photo?
              </Text>

              {/* Suggestions */}
              {(suggestions ?? []).length > 0 && (
                <View className="mb-3">
                  <Text className="text-xs font-sans text-gray-500 mb-1.5">Quick select:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {(suggestions ?? []).map((s) => (
                        <Pressable
                          key={s.id}
                          className={`rounded-full px-3 py-1.5 flex-row items-center ${
                            selectedSuggestion?.name === s.name
                              ? "bg-brand-700"
                              : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          }`}
                          onPress={() => {
                            setSelectedSuggestion({
                              memorial_id: s.memorial_id,
                              profile_id: s.profile_id,
                              name: s.name,
                            });
                            setTagName(s.name);
                          }}
                        >
                          {s.photo_url ? (
                            <Image source={{ uri: s.photo_url }} className="h-4 w-4 rounded-full mr-1.5" />
                          ) : (
                            <Ionicons name="person" size={12} color={selectedSuggestion?.name === s.name ? "white" : "#6b7280"} />
                          )}
                          <Text className={`text-xs font-sans-medium ml-1 ${selectedSuggestion?.name === s.name ? "text-white" : "text-gray-700 dark:text-gray-300"}`}>
                            {s.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Name input */}
              <TextInput
                className="bg-white dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm font-sans text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 mb-3"
                placeholder="Or type a name..."
                placeholderTextColor="#9ca3af"
                value={tagName}
                onChangeText={(text) => {
                  setTagName(text);
                  setSelectedSuggestion(null);
                }}
              />

              <View className="flex-row gap-2">
                <Pressable
                  className="flex-1 rounded-full bg-gray-200 dark:bg-gray-600 py-2.5 items-center"
                  onPress={() => {
                    setShowTagForm(false);
                    setTagName("");
                    setSelectedSuggestion(null);
                  }}
                >
                  <Text className="text-sm font-sans-medium text-gray-600 dark:text-gray-300">Cancel</Text>
                </Pressable>
                <Pressable
                  className="flex-1 rounded-full bg-brand-700 py-2.5 items-center"
                  onPress={handleTag}
                  disabled={createTag.isPending}
                >
                  <Text className="text-sm font-sans-semibold text-white">
                    {createTag.isPending ? "Tagging..." : "Tag Person"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      )}

      {/* People section (when no specific photo) */}
      {!photoUrl && (
        <View className="px-4 pt-6 pb-8">
          <View className="flex-row items-center mb-4">
            <View className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 items-center justify-center">
              <Ionicons name="people" size={22} color="#3B82F6" />
            </View>
            <View className="ml-3">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                People in Photos
              </Text>
              <Text className="text-xs font-sans text-gray-500">
                {people.length} {people.length === 1 ? "person" : "people"} tagged across {(allTags ?? []).length} photos
              </Text>
            </View>
          </View>

          {people.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons name="person-add-outline" size={40} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-400 text-center mt-3">
                No one tagged in photos yet.{"\n"}Tag people to connect faces across memories.
              </Text>
            </View>
          ) : (
            people.map(([key, person]) => (
              <View key={key} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-3">
                <View className="flex-row items-center mb-3">
                  <View className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 items-center justify-center">
                    <Ionicons name="person" size={20} color="#4A2D7A" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">{person.name}</Text>
                    <Text className="text-[10px] font-sans text-gray-500">
                      Tagged in {person.count} {person.count === 1 ? "photo" : "photos"}
                    </Text>
                  </View>
                </View>

                {/* Photo previews */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {person.photos.slice(0, 6).map((url, idx) => (
                      <Image
                        key={idx}
                        source={{ uri: url }}
                        className="h-16 w-16 rounded-lg"
                        resizeMode="cover"
                      />
                    ))}
                    {person.photos.length > 6 && (
                      <View className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
                        <Text className="text-xs font-sans-bold text-gray-500">+{person.photos.length - 6}</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            ))
          )}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
