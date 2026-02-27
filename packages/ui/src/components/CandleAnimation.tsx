import React, { useEffect } from "react";
import { View, Pressable, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { Text } from "../primitives/Text";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CandleAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  /** Auto-dismiss after this many ms (default 3500) */
  duration?: number;
}

/**
 * Beautiful fullscreen overlay when a user lights a candle.
 * - Candle fades in with spring animation
 * - Flame flickers with repeating opacity + translateY
 * - Warm glow radiates outward
 * - Text: "You lit a candle in memory of [name]"
 * - Auto-dismisses after duration
 */
export function CandleAnimation({
  visible,
  memorialName,
  onDismiss,
  duration = 3500,
}: CandleAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const candleScale = useSharedValue(0.3);
  const flameOpacity = useSharedValue(0.7);
  const flameTranslateY = useSharedValue(0);
  const glowScale = useSharedValue(0.5);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Fade in overlay
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

      // Glow pulse
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Text fade in after candle appears
      textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

      // Auto dismiss
      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        candleScale.value = withTiming(0.3, { duration: 400 });
        textOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 450);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      candleScale.value = 0.3;
      textOpacity.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const candleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: candleScale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    opacity: flameOpacity.value,
    transform: [{ translateY: flameTranslateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        },
        overlayStyle,
      ]}
    >
      <Pressable
        style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}
        onPress={onDismiss}
      >
        {/* Warm glow */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(255, 165, 0, 0.15)",
            },
            glowStyle,
          ]}
        />

        {/* Candle body */}
        <Animated.View style={candleStyle}>
          {/* Flame */}
          <Animated.View
            style={[
              {
                alignSelf: "center",
                marginBottom: -4,
              },
              flameStyle,
            ]}
          >
            <Text style={{ fontSize: 48 }}>🔥</Text>
          </Animated.View>

          {/* Candle stick */}
          <View
            style={{
              alignSelf: "center",
              width: 28,
              height: 60,
              backgroundColor: "#FFF8E7",
              borderRadius: 4,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          />
        </Animated.View>

        {/* Text */}
        <Animated.View style={[{ marginTop: 40, paddingHorizontal: 40 }, textStyle]}>
          <Text
            style={{
              color: "#FFF8E7",
              fontSize: 18,
              fontWeight: "600",
              textAlign: "center",
              lineHeight: 26,
            }}
          >
            You lit a candle in memory of
          </Text>
          <Text
            style={{
              color: "#FFD700",
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            {memorialName}
          </Text>
          <Text
            style={{
              color: "rgba(255, 248, 231, 0.5)",
              fontSize: 12,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            Tap anywhere to close
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
