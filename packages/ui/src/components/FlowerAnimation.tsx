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

const NUM_PETALS = 6;
const PETAL_EMOJIS = ["\uD83C\uDF38", "\uD83C\uDF3A", "\uD83C\uDF38", "\uD83C\uDF3C", "\uD83C\uDF38", "\uD83C\uDF3A"];

interface FlowerAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
}

function usePetal(index: number, visible: boolean) {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  const startX = useMemo(() => (Math.random() - 0.5) * SCREEN_WIDTH * 0.8, []);
  const sway = useMemo(() => 20 + Math.random() * 20, []);
  const delay = index * 150;
  const speed = 2200 + Math.random() * 400;

  useEffect(() => {
    if (visible) {
      translateY.value = withDelay(
        delay,
        withTiming(SCREEN_HEIGHT * 0.8, { duration: speed, easing: Easing.inOut(Easing.sin) })
      );

      translateX.value = startX;
      translateX.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(startX + sway, { duration: 700 }),
            withTiming(startX - sway, { duration: 700 })
          ),
          4,
          true
        )
      );

      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.0, { duration: 300 }),
          withTiming(0.8, { duration: speed - 300 })
        )
      );

      opacity.value = withDelay(
        delay,
        withSequence(
          withTiming(1, { duration: 200 }),
          withTiming(1, { duration: speed - 600 }),
          withTiming(0, { duration: 400 })
        )
      );

      rotation.value = withDelay(
        delay,
        withTiming(360, { duration: 3000 })
      );
    } else {
      translateY.value = -50;
      translateX.value = 0;
      scale.value = 0.6;
      opacity.value = 0;
      rotation.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ] as any,
  }));

  return style;
}

export function FlowerAnimation({ visible, memorialName, onDismiss, duration = 3000 }: FlowerAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const glowOpacity = useSharedValue(0);

  const pe0 = usePetal(0, visible);
  const pe1 = usePetal(1, visible);
  const pe2 = usePetal(2, visible);
  const pe3 = usePetal(3, visible);
  const pe4 = usePetal(4, visible);
  const pe5 = usePetal(5, visible);
  const petalStyles = [pe0, pe1, pe2, pe3, pe4, pe5];

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 350 });

      // Pink glow
      glowOpacity.value = withDelay(200, withTiming(0.12, { duration: 500 }));
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      textOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 400 });
        textOpacity.value = withTiming(0, { duration: 300 });
        glowOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 450);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      textOpacity.value = 0;
      glowOpacity.value = 0;
      glowScale.value = 0.8;
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
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
          backgroundColor: "rgba(0, 0, 0, 0.80)",
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
        {/* Pink glow */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "rgba(236, 72, 153, 0.15)",
            },
            glowStyle,
          ]}
        />

        {/* Falling petals */}
        {petalStyles.map((style, i) => (
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
            <Text style={{ fontSize: 32 + (i % 3) * 6 }}>{PETAL_EMOJIS[i]}</Text>
          </Animated.View>
        ))}

        {/* Text */}
        <Animated.View style={{ position: "absolute", bottom: SCREEN_HEIGHT * 0.12, left: 0, right: 0, alignItems: "center", paddingHorizontal: 20 }}>
          <Animated.View style={textStyle}>
            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", borderRadius: 16, paddingVertical: 18, paddingHorizontal: 28, alignItems: "center", borderWidth: 1, borderColor: "rgba(236, 72, 153, 0.25)" }}>
              <Text style={{ color: "#FFFFFF", fontSize: 19, fontWeight: "600", textAlign: "center", lineHeight: 26 }}>
                Flowers placed for
              </Text>
              <Text style={{ color: "#EC4899", fontSize: 23, fontWeight: "700", textAlign: "center", marginTop: 6 }}>
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
