import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "../supabase/client";

// ============================================================
// Configuration (skip on web — push notifications are native-only)
// ============================================================

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
}

// ============================================================
// Permission & Token Registration
// ============================================================

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not already granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    // Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#4A2D7A",
        sound: "default",
      });

      await Notifications.setNotificationChannelAsync("social", {
        name: "Social",
        description: "Follows, mentions, and badge awards",
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#7C3AED",
      });

      await Notifications.setNotificationChannelAsync("memorial", {
        name: "Memorial Updates",
        description: "Tributes, candles, and memorial activity",
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: "#4A2D7A",
      });
    }

    // Get the Expo push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined, // Will use the project ID from app.json
    });

    return tokenData.data;
  } catch (error) {
    console.error("Failed to register for push notifications:", error);
    return null;
  }
}

/**
 * Save the push token to the user's profile in Supabase.
 * Stores in notification_preferences JSON field.
 */
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("notification_preferences")
      .eq("id", userId)
      .single();

    const prefs = (profile?.notification_preferences ?? {}) as Record<string, unknown>;

    await supabase
      .from("profiles")
      .update({
        notification_preferences: {
          ...prefs,
          push_token: token,
          push_registered_at: new Date().toISOString(),
          push_platform: Platform.OS,
        },
      })
      .eq("id", userId);
  } catch (error) {
    console.error("Failed to save push token:", error);
  }
}

// ============================================================
// Notification Routing
// ============================================================

export type NotificationRoute =
  | { type: "memorial"; memorialId: string }
  | { type: "tribute"; memorialId: string; tributeId: string }
  | { type: "chat"; chatId: string }
  | { type: "event"; eventId: string }
  | { type: "user"; userId: string }
  | { type: "badge"; badgeType: string }
  | { type: "capsule"; capsuleId: string; memorialId: string }
  | { type: "mention"; contextType: string; contextId: string }
  | { type: "follow"; followerId: string }
  | { type: "generic" };

/**
 * Parse notification data into a route for navigation.
 */
export function parseNotificationRoute(
  data: Record<string, unknown> | undefined
): NotificationRoute {
  if (!data) return { type: "generic" };

  const type = data.type as string | undefined;

  switch (type) {
    case "memorial":
      return { type: "memorial", memorialId: data.memorial_id as string };
    case "tribute":
      return {
        type: "tribute",
        memorialId: data.memorial_id as string,
        tributeId: data.tribute_id as string,
      };
    case "chat":
      return { type: "chat", chatId: data.chat_id as string };
    case "event":
      return { type: "event", eventId: data.event_id as string };
    case "user":
      return { type: "user", userId: data.user_id as string };
    case "badge":
      return { type: "badge", badgeType: data.badge_type as string };
    case "capsule":
      return {
        type: "capsule",
        capsuleId: data.capsule_id as string,
        memorialId: data.memorial_id as string,
      };
    case "mention":
      return {
        type: "mention",
        contextType: data.context_type as string,
        contextId: data.context_id as string,
      };
    case "follow":
      return { type: "follow", followerId: data.follower_id as string };
    default:
      return { type: "generic" };
  }
}

/**
 * Convert a NotificationRoute into an Expo Router path.
 */
export function getRouteUrl(route: NotificationRoute): string {
  switch (route.type) {
    case "memorial":
      return `/memorial/${route.memorialId}`;
    case "tribute":
      return `/memorial/${route.memorialId}/wall`;
    case "chat":
      return `/chat/${route.chatId}`;
    case "event":
      return `/events/${route.eventId}`;
    case "user":
      return `/user/${route.userId}`;
    case "badge":
      return "/badges";
    case "capsule":
      return `/memory-vault/${route.capsuleId}?type=capsule&memorialId=${route.memorialId}`;
    case "mention":
      return "/(tabs)/notifications";
    case "follow":
      return `/user/${route.followerId}`;
    case "generic":
    default:
      return "/(tabs)/notifications";
  }
}

// ============================================================
// Listeners Setup
// ============================================================

/**
 * Setup notification listeners. Call in root layout.
 * Returns cleanup function.
 */
export function setupNotificationListeners(
  onNavigate: (url: string) => void
): () => void {
  // When user taps a notification while app is in foreground
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response.notification.request.content.data as Record<string, unknown>;
      const route = parseNotificationRoute(data);
      const url = getRouteUrl(route);
      onNavigate(url);
    }
  );

  // When notification is received while app is in foreground
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (_notification) => {
      // Could update badge count or show in-app notification
    }
  );

  return () => {
    responseSubscription.remove();
    receivedSubscription.remove();
  };
}

// ============================================================
// Badge Count Management
// ============================================================

export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (_e) {
    // Silently fail on unsupported platforms
  }
}

export async function clearBadgeCount(): Promise<void> {
  await setBadgeCount(0);
}
