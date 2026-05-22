import React, { useCallback, useState } from "react";
import { View, ScrollView, Pressable, Platform, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  ScreenWrapper,
  FollowButton,
  BadgeDisplay,
  ProfileActivityTimeline,
  TrustLevelBadge,
  TipCreatorSheet,
  SubscribeSheet,
} from "@foreverr/ui";
import {
  usePublicProfile,
  useIsFollowingUser,
  useToggleUserFollow,
  useUserActivities,
  useAuthStore,
  useProfileStats,
  useCreateDM,
  useRequireAuth,
  useCreatorByUserId,
  TIER_INFO,
  useSendCreatorTip,
  useSubscribeToChannel,
  useChannelSubscription,
} from "@foreverr/core";

export default function PublicProfileScreen() {
  const router = useRouter();
  const { id: userId } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.user);
  const { requireAuth } = useRequireAuth();
  const { data: profileData, isLoading } = usePublicProfile(userId);
  const { data: isFollowing } = useIsFollowingUser(currentUser?.id, userId);
  const { data: stats } = useProfileStats(userId);
  const toggleFollow = useToggleUserFollow();
  const activities = useUserActivities(userId);
  const createDM = useCreateDM();
  const { data: creatorProfile } = useCreatorByUserId(userId);
  const sendTip = useSendCreatorTip();
  const [showTipSheet, setShowTipSheet] = useState(false);
  const [showSubscribeSheet, setShowSubscribeSheet] = useState(false);
  const subscribe = useSubscribeToChannel();
  const { data: existingSub } = useChannelSubscription(creatorProfile?.id, currentUser?.id);

  const isOwnProfile = currentUser?.id === userId;

  const handleToggleFollow = () => {
    if (!currentUser?.id || !userId) return;
    toggleFollow.mutate({
      followerId: currentUser.id,
      followingId: userId,
      isCurrentlyFollowing: !!isFollowing,
    });
  };

  const handleMessage = useCallback(() => {
    requireAuth(async () => {
      if (!currentUser?.id || !userId || currentUser.id === userId) return;
      try {
        const room = await createDM.mutateAsync({
          userId: currentUser.id,
          otherUserId: userId,
          otherUserName: profileData?.profile?.display_name ?? "User",
        });
        if (room?.id) {
          router.push(`/chat/${room.id}` as any);
        }
      } catch {
        if (Platform.OS === "web") {
          window.alert("Unable to start chat. Please try again later.");
        } else {
          Alert.alert("Unable to start chat", "Please try again later.");
        }
      }
    });
  }, [currentUser?.id, userId, profileData, createDM, requireAuth, router]);

  const handleShare = async () => {
    const name = profileData?.profile?.display_name ?? "User";
    const slug = profileData?.profile?.username;
    const url = slug ? `https://eterrn.app/user/${slug}` : `https://eterrn.app/user/${userId}`;
    try {
      await Share.share({
        message: `Check out ${name}'s profile on ǝterrn: ${url}`,
        url,
      });
    } catch {
      // User cancelled share
    }
  };

  const activityData = activities.data?.pages?.flatMap((p) => p.data) ?? [];
  const timelineActivities = activityData.map((a) => ({
    id: a.id,
    activityType: a.activity_type,
    description: `${a.activity_type.replace(/_/g, " ")}`,
    createdAt: a.created_at,
  }));

  if (isLoading || !profileData) {
    return (
      <ScreenWrapper>
        <Stack.Screen
          options={{
            title: "Profile",
            headerStyle: { backgroundColor: "#FFFFFF" },
            headerTintColor: "#4A2D7A",
          }}
        />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="hourglass-outline" size={24} color="#7C3AED" />
          <Text className="text-gray-400 font-sans mt-2">Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const { profile, hostedMemorials, displayedBadges, tributeCount } = profileData;

  const badgesForDisplay = displayedBadges.map((b) => ({
    id: b.id,
    badgeType: b.badge_type,
    badgeTier: b.badge_tier,
    icon: b.definition?.icon ?? "ribbon",
    name: b.definition?.name ?? b.badge_type,
  }));

  // Compute trust level from profile data if available
  const trustLevel = (profile as any)?.trust_level ?? null;

  return (
    <ScreenWrapper>
      <Stack.Screen
        options={{
          title: profile.display_name,
          headerStyle: { backgroundColor: "#FFFFFF" },
          headerTintColor: "#4A2D7A",
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ── Profile Header ── */}
        <View className="items-center pt-6 pb-1 px-4">
          {/* Avatar */}
          <View className="mb-2 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-brand-100 border-2 border-brand-300">
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96 }} contentFit="cover" />
            ) : (
              <Ionicons name="person" size={44} color="#4A2D7A" />
            )}
          </View>

          {/* Name + Trust */}
          <View className="items-center">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
              {profile.display_name}
            </Text>
            {trustLevel && trustLevel >= 2 && (
              <TrustLevelBadge
                level={trustLevel}
                levelName={trustLevel >= 3 ? "Verified" : "Trusted"}
                isVerified={trustLevel >= 3}
                compact
              />
            )}
            {creatorProfile && (
              <Pressable
                className="flex-row items-center gap-1 mt-1 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: (TIER_INFO[(creatorProfile.tier as keyof typeof TIER_INFO) ?? "rising"]?.color ?? "#9ca3af") + "20" }}
                onPress={() => router.push(`/services` as any)}
              >
                <Text className="text-xs">
                  {TIER_INFO[(creatorProfile.tier as keyof typeof TIER_INFO) ?? "rising"]?.icon}
                </Text>
                <Text
                  className="text-[10px] font-sans-semibold"
                  style={{ color: TIER_INFO[(creatorProfile.tier as keyof typeof TIER_INFO) ?? "rising"]?.color }}
                >
                  {TIER_INFO[(creatorProfile.tier as keyof typeof TIER_INFO) ?? "rising"]?.name}
                </Text>
              </Pressable>
            )}
          </View>
          <Text className="text-sm font-sans text-gray-500 dark:text-gray-400">
            @{profile.username}
          </Text>

          {/* Bio */}
          {profile.bio ? (
            <Text className="mt-2 text-sm font-sans text-gray-600 dark:text-gray-300 text-center px-4">
              {profile.bio}
            </Text>
          ) : (
            <Text className="mt-2 text-sm font-sans text-gray-400 dark:text-gray-500 text-center px-4 italic">
              {isOwnProfile ? "Add a bio to tell people about yourself" : "This person hasn't added a bio yet"}
            </Text>
          )}

          {/* ── Stats — Instagram-style 2-row grid ── */}
          <View className="mt-3 w-full">
            <View className="flex-row justify-around">
              <Pressable
                className="items-center flex-1"
                onPress={() => router.push(`/user/${userId}/followers?tab=followers`)}
              >
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {stats?.followerCount ?? profile.follower_count ?? 0}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Followers</Text>
              </Pressable>
              <Pressable
                className="items-center flex-1"
                onPress={() => router.push(`/user/${userId}/followers?tab=following`)}
              >
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {(profile as any)?.following_count ?? 0}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Following</Text>
              </Pressable>
              <View className="items-center flex-1">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {stats?.tributesWritten ?? tributeCount}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Tributes</Text>
              </View>
            </View>
            <View className="flex-row justify-around mt-1.5">
              <View className="items-center flex-1">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {stats?.ribbonBalance ?? (profile as any)?.ribbon_balance ?? 0}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Spirit</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {stats?.memorialsHosted ?? hostedMemorials.length}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Memorials</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">
                  {(profile as any)?.badge_count ?? badgesForDisplay.length}
                </Text>
                <Text className="text-[11px] font-sans text-gray-500">Badges</Text>
              </View>
            </View>
          </View>

          {/* ── Action Buttons — Follow + Message + Share ── */}
          <View className="flex-row gap-2 mt-3 w-full">
            {isOwnProfile ? (
              <>
                <Pressable
                  className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 items-center"
                  onPress={() => router.push("/settings" as any)}
                >
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">Edit Profile</Text>
                </Pressable>
                <Pressable
                  className="flex-1 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 items-center"
                  onPress={handleShare}
                >
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">Share Profile</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  className={`flex-1 py-2.5 rounded-lg items-center ${isFollowing ? "bg-gray-100 dark:bg-gray-800" : "bg-brand-700"}`}
                  onPress={handleToggleFollow}
                  disabled={toggleFollow.isPending}
                >
                  <Text className={`text-sm font-sans-semibold ${isFollowing ? "text-gray-800 dark:text-gray-200" : "text-white"}`}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 items-center flex-row justify-center gap-1.5"
                  onPress={handleMessage}
                  disabled={createDM.isPending}
                >
                  <Ionicons name="chatbubble-outline" size={14} color="#374151" />
                  <Text className="text-sm font-sans-semibold text-gray-800 dark:text-gray-200">
                    {createDM.isPending ? "Opening…" : "Message"}
                  </Text>
                </Pressable>
                <Pressable
                  className="w-10 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center"
                  onPress={handleShare}
                >
                  <Ionicons name="share-social-outline" size={16} color="#374151" />
                </Pressable>
                {creatorProfile && (
                  <>
                    <Pressable
                      className="w-10 py-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 items-center justify-center"
                      onPress={() => requireAuth(() => setShowTipSheet(true))}
                    >
                      <Ionicons name="gift-outline" size={16} color="#f59e0b" />
                    </Pressable>
                    <Pressable
                      className={`w-10 py-2.5 rounded-lg items-center justify-center ${existingSub ? "bg-green-100 dark:bg-green-900/30" : "bg-purple-100 dark:bg-purple-900/30"}`}
                      onPress={() => requireAuth(() => setShowSubscribeSheet(true))}
                    >
                      <Ionicons name={existingSub ? "checkmark-circle" : "star-outline"} size={16} color={existingSub ? "#059669" : "#7c3aed"} />
                    </Pressable>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── Creator Services Section ── */}
        {creatorProfile && !isOwnProfile && (
          <View className="mt-3 mx-4 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
            <View className="flex-row items-center gap-2 mb-2">
              <Ionicons name="briefcase-outline" size={16} color="#059669" />
              <Text className="text-sm font-sans-semibold text-green-800 dark:text-green-300">
                Available for Hire
              </Text>
              {creatorProfile.rating_avg > 0 && (
                <View className="flex-row items-center gap-0.5 ml-auto">
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text className="text-xs font-sans-semibold text-green-700">
                    {creatorProfile.rating_avg?.toFixed(1)} ({creatorProfile.rating_count})
                  </Text>
                </View>
              )}
            </View>
            {creatorProfile.tagline && (
              <Text className="text-xs font-sans text-green-700 dark:text-green-400 mb-2">{creatorProfile.tagline}</Text>
            )}
            {creatorProfile.specialties && creatorProfile.specialties.length > 0 && (
              <View className="flex-row flex-wrap gap-1.5 mb-3">
                {creatorProfile.specialties.slice(0, 4).map((spec: string) => (
                  <View key={spec} className="bg-green-100 dark:bg-green-800/40 rounded-full px-2 py-0.5">
                    <Text className="text-[9px] font-sans-semibold text-green-700 dark:text-green-300 capitalize">
                      {spec.replace(/_/g, " ")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 bg-green-600 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5"
                onPress={() => router.push(`/services` as any)}
              >
                <Ionicons name="cart-outline" size={14} color="#ffffff" />
                <Text className="text-sm font-sans-semibold text-white">View Services</Text>
              </Pressable>
              <Pressable
                className="bg-brand-100 dark:bg-brand-900/30 rounded-xl py-2.5 px-4 items-center flex-row justify-center gap-1.5"
                onPress={() => router.push(`/channel/${creatorProfile.id}` as any)}
              >
                <Ionicons name="tv-outline" size={14} color="#4A2D7A" />
                <Text className="text-xs font-sans-semibold text-brand-700">Channel</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* ── Badge Showcase ── */}
        {badgesForDisplay.length > 0 && (
          <View className="mt-3 px-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">Badges</Text>
              <Text className="text-xs font-sans text-gray-400">{badgesForDisplay.length} earned</Text>
            </View>
            <BadgeDisplay badges={badgesForDisplay.slice(0, 6)} />
          </View>
        )}

        {/* ── Divider ── */}
        <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-3" />

        {/* ── People They Honor — Instagram-style circles ── */}
        <View className="mt-4 px-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white">
              {isOwnProfile ? "People You Honor" : "People They Honor"}
            </Text>
            {hostedMemorials.length > 5 && (
              <Text className="text-xs font-sans-medium text-brand-700">
                {hostedMemorials.length} total
              </Text>
            )}
          </View>
          {hostedMemorials.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {hostedMemorials.map((mem) => (
                  <Pressable
                    key={mem.id}
                    className="items-center"
                    onPress={() => router.push(`/lifecycle/${mem.id}`)}
                  >
                    <View className="h-16 w-16 rounded-full border-2 border-brand-200 bg-brand-100 items-center justify-center overflow-hidden">
                      {(mem.profile_photo_url || mem.cover_photo_url) ? (
                        <Image
                          source={{ uri: mem.profile_photo_url ?? mem.cover_photo_url ?? "" }}
                          style={{ width: 64, height: 64 }}
                          contentFit="cover"
                        />
                      ) : (
                        <Ionicons name="person" size={26} color="#4A2D7A" />
                      )}
                    </View>
                    <Text
                      className="mt-1 text-[10px] font-sans text-gray-600 dark:text-gray-400 text-center w-16"
                      numberOfLines={1}
                    >
                      {mem.first_name}
                    </Text>
                    {mem.date_of_death && (
                      <Text className="text-[8px] font-sans text-gray-400">
                        {new Date(mem.date_of_death).getFullYear()}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View className="items-center py-6 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Ionicons name="heart-outline" size={28} color="#d1d5db" />
              <Text className="text-sm font-sans text-gray-500 mt-2">
                {isOwnProfile ? "No memorials yet" : "No memorials created yet"}
              </Text>
              {isOwnProfile && (
                <Pressable className="mt-2" onPress={() => router.push("/(tabs)/create")}>
                  <Text className="text-sm font-sans-medium text-brand-700">Honor someone special</Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* ── Divider ── */}
        <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-4" />

        {/* ── Engagement Stats ── */}
        {stats && (stats.reactionsReceived > 0 || stats.giftsGiven > 0) && (
          <View className="mt-4 px-4">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-2">
              Engagement
            </Text>
            <View className="flex-row gap-2">
              {stats.reactionsReceived > 0 && (
                <View className="flex-1 rounded-xl bg-rose-50 dark:bg-rose-900/20 p-3 items-center">
                  <Ionicons name="heart" size={22} color="#ec4899" />
                  <Text className="mt-1 text-lg font-sans-bold text-gray-900 dark:text-white">
                    {stats.reactionsReceived}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-500">Reactions Received</Text>
                </View>
              )}
              {stats.giftsGiven > 0 && (
                <View className="flex-1 rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 items-center">
                  <Ionicons name="flower" size={22} color="#D97706" />
                  <Text className="mt-1 text-lg font-sans-bold text-gray-900 dark:text-white">
                    {stats.giftsGiven}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-500">Gifts Given</Text>
                </View>
              )}
              {stats.tributesWritten > 0 && (
                <View className="flex-1 rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 items-center">
                  <Ionicons name="create" size={22} color="#7C3AED" />
                  <Text className="mt-1 text-lg font-sans-bold text-gray-900 dark:text-white">
                    {stats.tributesWritten}
                  </Text>
                  <Text className="text-[10px] font-sans text-gray-500">Tributes Written</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Divider ── */}
        {timelineActivities.length > 0 && (
          <View className="h-2 bg-gray-100 dark:bg-gray-800 mt-4" />
        )}

        {/* ── Recent Activity ── */}
        {timelineActivities.length > 0 && (
          <View className="px-4 mt-4 mb-8">
            <Text className="text-sm font-sans-bold text-gray-900 dark:text-white mb-3">
              Recent Activity
            </Text>
            <ProfileActivityTimeline activities={timelineActivities.slice(0, 20)} />
          </View>
        )}

        {/* Empty state when no activity */}
        {timelineActivities.length === 0 && hostedMemorials.length === 0 && badgesForDisplay.length === 0 && (
          <View className="items-center py-12 px-6">
            <Ionicons name="sparkles-outline" size={40} color="#d1d5db" />
            <Text className="text-sm font-sans-semibold text-gray-500 mt-3 text-center">
              {isOwnProfile
                ? "Start honoring loved ones to build your legacy"
                : `${profile.display_name} is just getting started on ǝterrn`}
            </Text>
            {isOwnProfile && (
              <Pressable
                className="mt-3 rounded-full bg-brand-700 px-5 py-2.5"
                onPress={() => router.push("/(tabs)/create")}
              >
                <Text className="text-sm font-sans-semibold text-white">Create a Memorial</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Bottom spacer */}
        <View className="h-8" />
      </ScrollView>

      {/* Tip Creator Sheet */}
      {creatorProfile && (
        <TipCreatorSheet
          visible={showTipSheet}
          onClose={() => setShowTipSheet(false)}
          creatorName={creatorProfile.display_name ?? profile.display_name}
          creatorId={creatorProfile.id}
          onSendTip={async (amountCents, message) => {
            if (!currentUser?.id) return;
            await sendTip.mutateAsync({
              creator_id: creatorProfile.id,
              tipper_id: currentUser.id,
              amount_cents: amountCents,
              message,
            });
          }}
        />
      )}

      {/* Subscribe Sheet */}
      {creatorProfile && (
        <SubscribeSheet
          visible={showSubscribeSheet}
          onClose={() => setShowSubscribeSheet(false)}
          channelName={creatorProfile.display_name ?? profile.display_name}
          channelId={creatorProfile.id}
          currentTier={existingSub?.tier ?? null}
          onSubscribe={async (tier, amountCents) => {
            if (!currentUser?.id) return;
            await subscribe.mutateAsync({
              channel_id: creatorProfile.id,
              subscriber_id: currentUser.id,
              tier,
              amount_cents: amountCents,
            });
          }}
        />
      )}
    </ScreenWrapper>
  );
}
