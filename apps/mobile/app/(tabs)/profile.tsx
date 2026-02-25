import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useHostedMemorials } from "@foreverr/core";
import { Text, Button } from "@foreverr/ui";

const PROFILE_TABS = ["Tribute", "Memorial Gift", "Tags", "Interaction"] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("Tribute");

  const { data: hostedMemorials, isLoading: hostedLoading } = useHostedMemorials(user?.id);

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Profile Header */}
      <View className="items-center px-4 pb-4 pt-14">
        {/* Avatar */}
        <View className="mb-3 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 border-2 border-brand-300">
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
          ) : (
            <Ionicons name="person" size={44} color="#4A2D7A" />
          )}
        </View>

        <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
          {profile?.display_name ?? "User"}
        </Text>
        <Text className="text-sm font-sans text-gray-500">
          @{profile?.username ?? "user"}
        </Text>

        {/* Stats Grid - matches Figma 2x3 grid */}
        <View className="mt-4 w-full">
          <View className="flex-row justify-around">
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-[11px] font-sans text-gray-500">Followers</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-[11px] font-sans text-gray-500">Likes</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-[11px] font-sans text-gray-500">Tributes Written</Text>
            </View>
          </View>
          <View className="flex-row justify-around mt-2">
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">{profile?.ribbon_balance ?? 0}</Text>
              <Text className="text-[11px] font-sans text-gray-500">Spirit</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-[11px] font-sans text-gray-500">Shares</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">0</Text>
              <Text className="text-[11px] font-sans text-gray-500">Gift Loved to One</Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        <Text className="mt-4 text-sm font-sans text-gray-600 dark:text-gray-400 text-center px-4">
          {profile?.bio ?? "Create your first memorial and start honoring loved ones."}
        </Text>

        {/* Hosted Memorials */}
        <View className="mt-5 w-full">
          <View className="flex-row justify-between px-2 mb-2">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Hosted Memorials</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text className="text-xs font-sans-medium text-brand-700">See all</Text>
            </Pressable>
          </View>
          {hostedLoading ? (
            <ActivityIndicator size="small" color="#4A2D7A" />
          ) : (hostedMemorials ?? []).length === 0 ? (
            <View className="px-2">
              <Pressable
                className="flex-row items-center rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                onPress={() => router.push("/(tabs)/create")}
              >
                <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
                  <Ionicons name="add" size={20} color="#4A2D7A" />
                </View>
                <Text className="ml-3 text-sm font-sans-medium text-gray-700 dark:text-gray-300">Create your first memorial</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
              <View className="flex-row gap-2">
                {(hostedMemorials as any[]).map((m: any) => (
                  <Pressable
                    key={m.id}
                    className="items-center"
                    onPress={() => router.push(`/memorial/${m.id}`)}
                  >
                    <View className="h-14 w-14 rounded-full border-2 border-brand-200 bg-brand-100 items-center justify-center overflow-hidden">
                      {m.profile_photo_url ? (
                        <Image source={{ uri: m.profile_photo_url }} style={{ width: 56, height: 56 }} contentFit="cover" />
                      ) : (
                        <Ionicons name="person" size={24} color="#4A2D7A" />
                      )}
                    </View>
                    <Text className="mt-1 text-[10px] font-sans text-gray-600 dark:text-gray-400 text-center w-16" numberOfLines={1}>
                      {m.first_name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Profile Tabs */}
      <View className="border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2">
          <View className="flex-row">
            {PROFILE_TABS.map((tab) => (
              <Pressable
                key={tab}
                className={`px-4 py-3 ${activeTab === tab ? "border-b-2 border-brand-700" : ""}`}
                onPress={() => setActiveTab(tab)}
              >
                <Text className={`text-sm font-sans-medium ${activeTab === tab ? "text-brand-700" : "text-gray-500"}`}>
                  {tab}
                </Text>
              </Pressable>
            ))}
            <Pressable className="px-3 py-3">
              <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View className="p-4">
        <View className="items-center py-8">
          <Text className="text-sm font-sans text-gray-500">No {activeTab.toLowerCase()} activity yet.</Text>
        </View>
      </View>

      {/* Settings / Sign Out */}
      <View className="px-4 pb-8">
        <Pressable className="flex-row items-center rounded-xl bg-gray-50 p-4 mb-3 dark:bg-gray-800">
          <Ionicons name="settings-outline" size={22} color="#6b7280" />
          <Text className="ml-3 text-base font-sans text-gray-700 dark:text-gray-300">Settings</Text>
        </Pressable>
        <Button title="Sign Out" variant="outline" fullWidth onPress={signOut} />
      </View>
    </ScrollView>
  );
}
