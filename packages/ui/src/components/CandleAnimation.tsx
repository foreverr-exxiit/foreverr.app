import React, { useEffect } from "react";
import { View, Pressable, Dimensions, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CandleAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
}

/**
 * Single lit candle — centered, with flickering flame and warm glow.
 * Candle stays stationary (vigil style).
 */
export function CandleAnimation({
  visible,
  memorialName,
  onDismiss,
  duration = 3800,
}: CandleAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const candleScale = useSharedValue(0.3);
  const flameOpacity = useSharedValue(0.7);
  const flameTranslateY = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const glowOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 400 });

      // Scale candle in
      candleScale.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
      });

      // Flickering flame
      flameOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.6, { duration: 300 }),
          withTiming(0.9, { duration: 350 })
        ),
        -1,
        true
      );

      flameTranslateY.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 500 }),
          withTiming(1, { duration: 400 }),
          withTiming(-2, { duration: 300 })
        ),
        -1,
        true
      );

      // Warm glow pulse
      glowOpacity.value = withDelay(300, withTiming(0.2, { duration: 500 }));
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Text
      textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        candleScale.value = withTiming(0.3, { duration: 400 });
        textOpacity.value = withTiming(0, { duration: 300 });
        glowOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 450);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      candleScale.value = 0.3;
      textOpacity.value = 0;
      glowOpacity.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const candleStyle = useAnimatedStyle(() => ({ transform: [{ scale: candleScale.value }] }));
  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ translateY: flameTranslateY.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        {/* Warm glow */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Candle body */}
        <Animated.View style={[styles.candleWrapper, candleStyle]}>
          {/* Flame */}
          <Animated.View style={[styles.flameContainer, flameStyle]}>
            <Text style={styles.flameEmoji}>{"\uD83D\uDD25"}</Text>
          </Animated.View>

          {/* Candle stick */}
          <View style={styles.candleStick} />
        </Animated.View>

        {/* Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <View style={styles.textBackdrop}>
            <Text style={styles.textTitle}>You lit a candle in memory of</Text>
            <Text style={styles.textName}>{memorialName}</Text>
          </View>
          <Text style={styles.textHint}>Tap anywhere to close</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: "rgba(10, 3, 0, 0.93)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  pressable: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 165, 0, 0.18)",
  },
  candleWrapper: {
    alignItems: "center",
  },
  flameContainer: {
    alignSelf: "center",
    marginBottom: -4,
  },
  flameEmoji: {
    fontSize: 52,
  },
  candleStick: {
    alignSelf: "center",
    width: 30,
    height: 65,
    backgroundColor: "#FFF8E7",
    borderRadius: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  textContainer: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.12,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 180, 0, 0.25)",
  },
  textTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  textName: {
    color: "#FFD700",
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  textHint: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
});
