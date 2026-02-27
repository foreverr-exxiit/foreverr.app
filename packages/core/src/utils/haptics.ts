import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * Centralized haptic feedback utilities.
 * All haptics are no-ops on web / unsupported devices.
 */

/** Light tap — buttons, toggles, chip selections */
export function lightTap() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Medium tap — confirming actions, card presses, follow/unfollow */
export function mediumTap() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Heavy tap — destructive actions, candle lit, donation confirmed */
export function heavyTap() {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
}

/** Success feedback — form submitted, badge earned, follow confirmed */
export function successHaptic() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Warning feedback — validation error, near daily streak end */
export function warningHaptic() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

/** Error feedback — failed action, network error */
export function errorHaptic() {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}

/** Selection tick — scrolling through picker, slider dragging */
export function selectionTick() {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}
