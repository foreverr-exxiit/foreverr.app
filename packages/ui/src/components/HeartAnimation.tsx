import React, { useEffect, useMemo } from "react";
import { View, Pressable, Dimensions, Text } from "react-native";
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

const HEART_COLORS = ["#F43F5E", "#EC4899", "#FB7185", "#FDA4AF", "#F43F5E", "#EC4899", "#FB7185"];
const NUM_HEARTS = 7;

interface HeartAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
}

function useHeart(index: number, visible: boolean) {
  const translateY = useSharedValue(SCREEN_HEIGHT * 0.6);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);

  const offsetX = useMemo(() => (Math.random() - 0.5) * 80, []);
  const drift = useMemo(() => (Math.random() - 0.5) * 60, []);
  const delay = index * 120;

  useEffect(() => {
    if (visible) {
      translateY.value = withDelay(
        delay,
        withTiming(-100, { duration: 1800, easing: Easing.out(Easing.quad) })
      );
      translateX.value = offsetX;
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(offsetX + drift, { duration: 600 }),
            withTiming(offsetX - drift, { duration: 600 })
          ),
          3,
          true
        )
      );
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(0.8 + Math.random() * 0.4, { duration: 400, easing: Easing.out(Easing.back(1.2)) }),
          withTiming(0.4, { duration: 1400 })
        )
      );
      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 400 })
        )
      );
    } else {
      translateY.value = SCREEN_HEIGHT * 0.6;
      translateX.value = 0;
      scale.value = 0.3;
      opacity.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ] as any,
  }));

  return style;
}

export function HeartAnimation({ visible, memorialName, onDismiss, duration = 2500 }: HeartAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const h0 = useHeart(0, visible);
  const h1 = useHeart(1, visible);
  const h2 = useHeart(2, visible);
  const h3 = useHeart(3, visible);
  const h4 = useHeart(4, visible);
  const h5 = useHeart(5, visible);
  const h6 = useHeart(6, visible);
  const heartStyles = [h0, h1, h2, h3, h4, h5, h6];

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        textOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 450);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      textOpacity.value = 0;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

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
          backgroundColor: "rgba(0, 0, 0, 0.82)",
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
        {/* Floating hearts */}
        {heartStyles.map((style, i) => (
          <Animated.View
            key={i}
            style={[
              {
                position: "absolute",
                alignSelf: "center",
              },
              style,
            ]}
          >
            <Text style={{ fontSize: 36 + (i % 3) * 8, color: HEART_COLORS[i] }}>
              {"\u2764\uFE0F"}
            </Text>
          </Animated.View>
        ))}

        {/* Text */}
        <Animated.View style={{ position: "absolute", bottom: SCREEN_HEIGHT * 0.12, left: 0, right: 0, alignItems: "center", paddingHorizontal: 20, opacity: textStyle ? undefined : 0 }} >
          <Animated.View style={textStyle}>
            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", borderRadius: 16, paddingVertical: 18, paddingHorizontal: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(244, 63, 94, 0.25)" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 19, fontWeight: "600", textAlign: "center", lineHeight: 26 }}>
                You sent love to
              </Text>
              <Text style={{ color: "#F43F5E", fontSize: 23, fontWeight: "700", textAlign: "center", marginTop: 6 }}>
                {memorialName}
              </Text>
            </View>
            <Text style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: 13, textAlign: "center", marginTop: 12 }}>
              Tap anywhere to close
            </Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
