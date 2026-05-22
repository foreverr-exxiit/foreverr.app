import React, { useCallback, useMemo, useEffect } from "react";
import {
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

// ── Types ─────────────────────────────────────────────────────────────

interface DraggableSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Fractional snap points — 0 = hidden, 0.35 = 35% of screen, etc. */
  snapPoints?: number[];
  /** Index into snapPoints for the initial position when opened (default: 1) */
  initialSnapIndex?: number;
  children: React.ReactNode;
  /** Fixed content above the scrollable area */
  headerContent?: React.ReactNode;
  showHandle?: boolean;
  showCloseButton?: boolean;
  backdropMaxOpacity?: number;
}

// ── Constants ─────────────────────────────────────────────────────────

const SPRING_CONFIG = { damping: 28, stiffness: 280, mass: 0.6 };
const DISMISS_VELOCITY = 500;

// ── Component ─────────────────────────────────────────────────────────

export function DraggableSheet({
  visible,
  onClose,
  snapPoints = [0, 0.35, 0.6, 0.9],
  initialSnapIndex = 1,
  children,
  headerContent,
  showHandle = true,
  showCloseButton = true,
  backdropMaxOpacity = 0.5,
}: DraggableSheetProps) {
  const { height: screenHeight } = useWindowDimensions();
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === "dark";

  // Convert fractional snap points to translateY values
  // 0 = fully hidden (translateY = screenHeight)
  // 0.9 = 90% visible (translateY = screenHeight * 0.1)
  const snapPositions = useMemo(
    () => snapPoints.map((sp) => screenHeight * (1 - sp)),
    [snapPoints, screenHeight]
  );

  const translateY = useSharedValue(screenHeight);
  const contextY = useSharedValue(0);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Animate to initial snap when visibility changes
  useEffect(() => {
    if (visible) {
      const targetSnap = snapPositions[initialSnapIndex] ?? snapPositions[1] ?? screenHeight * 0.65;
      translateY.value = withSpring(targetSnap, SPRING_CONFIG);
    } else {
      translateY.value = withTiming(screenHeight, { duration: 250 });
    }
  }, [visible, snapPositions, initialSnapIndex, screenHeight]);

  // ── Pan gesture (handle area only) ──────────────────────────────────
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((e) => {
      const newY = contextY.value + e.translationY;
      // Clamp: don't go above the highest snap, allow going below for dismiss
      const highestSnap = snapPositions[snapPositions.length - 1];
      translateY.value = Math.max(highestSnap - 20, newY); // 20px rubber-band
    })
    .onEnd((e) => {
      const currentPos = translateY.value;
      const velocity = e.velocityY;

      // Fast flick downward → dismiss
      if (velocity > DISMISS_VELOCITY) {
        translateY.value = withTiming(screenHeight, { duration: 250 });
        runOnJS(handleClose)();
        return;
      }

      // Fast flick upward → go to highest snap
      if (velocity < -DISMISS_VELOCITY) {
        const highestSnap = snapPositions[snapPositions.length - 1];
        translateY.value = withSpring(highestSnap, SPRING_CONFIG);
        return;
      }

      // Find nearest snap point
      let nearestSnap = snapPositions[1]; // default to first visible snap
      let minDist = Infinity;
      for (let i = 1; i < snapPositions.length; i++) {
        const dist = Math.abs(currentPos - snapPositions[i]);
        if (dist < minDist) {
          minDist = dist;
          nearestSnap = snapPositions[i];
        }
      }

      // If dragged below the lowest visible snap too far, dismiss
      if (currentPos > snapPositions[1] + 80) {
        translateY.value = withTiming(screenHeight, { duration: 250 });
        runOnJS(handleClose)();
        return;
      }

      translateY.value = withSpring(nearestSnap, SPRING_CONFIG);
    });

  // ── Animated styles ─────────────────────────────────────────────────

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }] as any,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [snapPositions[snapPositions.length - 1], screenHeight],
      [backdropMaxOpacity, 0],
      Extrapolation.CLAMP
    ),
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Backdrop */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, backdropStyle]}
        />
      </Pressable>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: screenHeight,
            backgroundColor: isDark ? "#111827" : "#ffffff",
          },
          sheetStyle,
        ]}
      >
        {/* Draggable handle area — only this receives pan gesture */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.handleArea}>
            {/* Handle bar */}
            {showHandle && (
              <View style={styles.handleBarContainer}>
                <View style={[styles.handleBar, isDark && { backgroundColor: "#4b5563" }]} />
              </View>
            )}

            {/* Close button */}
            {showCloseButton && (
              <Pressable
                onPress={handleClose}
                style={styles.closeButton}
                hitSlop={12}
              >
                <Ionicons name="close-circle" size={28} color={isDark ? "#6b7280" : "#9ca3af"} />
              </Pressable>
            )}

            {/* Header content (fixed, non-scrollable, part of draggable area) */}
            {headerContent && (
              <View style={styles.headerContentContainer}>
                {headerContent}
              </View>
            )}
          </Animated.View>
        </GestureDetector>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9998,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    overflow: "hidden",
  },
  handleArea: {
    paddingTop: 8,
    paddingBottom: 4,
    position: "relative",
  },
  handleBarContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 14,
    zIndex: 10,
    padding: 2,
  },
  headerContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
});
