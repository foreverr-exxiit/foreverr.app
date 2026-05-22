import React, { useEffect, useMemo } from "react";
import { View, Pressable, Dimensions, StyleSheet, Text, type ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ── Balloon config ───────────────────────────────────────────────────
const BALLOON_COUNT = 14;

// Memorial: soft pastel balloons (white, lavender, light blue)
const MEMORIAL_BALLOONS = ["\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88"];
// Celebration: colorful festive balloons
const CELEBRATION_BALLOONS = ["\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88", "\uD83C\uDF88"];

// Colors applied as tint overlays to differentiate modes
const MEMORIAL_COLORS = ["#E8D5F5", "#D4C5F9", "#C5D5F5", "#F0E0FF", "#DDD5F0"];
const CELEBRATION_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BD6"];

interface BalloonConfig {
  startX: number;
  startY: number;
  delay: number;
  duration: number;
  size: number;
  swayAmount: number;
  color: string;
}

function generateBalloonConfigs(mode: "memorial" | "celebration"): BalloonConfig[] {
  const colors = mode === "celebration" ? CELEBRATION_COLORS : MEMORIAL_COLORS;
  const configs: BalloonConfig[] = [];
  for (let i = 0; i < BALLOON_COUNT; i++) {
    configs.push({
      startX: 30 + Math.random() * (SCREEN_WIDTH - 60),
      startY: SCREEN_HEIGHT * 0.65 + Math.random() * (SCREEN_HEIGHT * 0.28),
      delay: i * 130 + Math.random() * 200,
      duration: 2400 + Math.random() * 1400,
      size: 28 + Math.floor(Math.random() * 24), // varied sizes 28-52
      swayAmount: 12 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  return configs;
}

// ── Single Balloon ───────────────────────────────────────────────────

interface SingleBalloonProps {
  config: BalloonConfig;
  visible: boolean;
}

function SingleBalloon({ config, visible }: SingleBalloonProps) {
  const progress = useSharedValue(0);
  const swayX = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withDelay(
        config.delay,
        withTiming(1, {
          duration: config.duration,
          easing: Easing.out(Easing.cubic),
        })
      );
      swayX.value = withDelay(
        config.delay,
        withRepeat(
          withSequence(
            withTiming(config.swayAmount, { duration: 600 + Math.random() * 300 }),
            withTiming(-config.swayAmount, { duration: 600 + Math.random() * 300 })
          ),
          -1,
          true
        )
      );
    } else {
      progress.value = 0;
      swayX.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    const p = progress.value;

    const x = config.startX + swayX.value;
    const y = interpolate(p, [0, 1], [config.startY, -80]);

    const opacity = interpolate(
      p,
      [0, 0.05, 0.12, 0.7, 0.9, 1],
      [0, 0.5, 1, 0.9, 0.4, 0]
    );

    const scale = interpolate(
      p,
      [0, 0.1, 0.5, 1],
      [0.3, 1, 0.9, 0.5]
    );

    const rotate = (swayX.value / config.swayAmount) * 6;

    return {
      position: "absolute",
      left: x - config.size / 2,
      top: y - config.size / 2,
      opacity,
      transform: [
        { scale },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  if (!visible) return null;

  // Balloon rendered as colored oval shape + knot + string
  const balloonW = config.size;
  const balloonH = config.size * 1.25;

  return (
    <Animated.View style={[animatedStyle, { alignItems: "center" }]}>
      {/* Balloon body — oval */}
      <View
        style={{
          width: balloonW,
          height: balloonH,
          borderRadius: balloonW / 2,
          backgroundColor: config.color,
          // Glossy highlight
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
        {/* Shine/highlight on balloon */}
        <View
          style={{
            position: "absolute",
            top: balloonH * 0.15,
            left: balloonW * 0.2,
            width: balloonW * 0.25,
            height: balloonH * 0.2,
            borderRadius: balloonW * 0.12,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          }}
        />
      </View>
      {/* Knot */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 6,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: config.color,
          marginTop: -1,
        }}
      />
      {/* String */}
      <View
        style={{
          width: 1,
          height: config.size * 0.6,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        }}
      />
    </Animated.View>
  );
}

// ── Main BalloonAnimation ────────────────────────────────────────────

interface BalloonAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
  mode?: "memorial" | "celebration";
}

export function BalloonAnimation({
  visible,
  memorialName,
  onDismiss,
  duration = 4200,
  mode = "memorial",
}: BalloonAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const balloonConfigs = useMemo(() => generateBalloonConfigs(mode), [visible, mode]);

  const isMemorial = mode === "memorial";
  const overlayBg = isMemorial ? "rgba(20, 10, 40, 0.9)" : "rgba(0, 0, 0, 0.85)";
  const titleText = isMemorial
    ? "Balloons released in loving memory of"
    : "Balloons released in celebration of";
  const nameColor = isMemorial ? "#E9D5FF" : "#FFD700";

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 400 });
      textOpacity.value = withDelay(500, withTiming(1, { duration: 600 }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 500 });
        textOpacity.value = withTiming(0, { duration: 300 });
        setTimeout(onDismiss, 550);
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
    <Animated.View style={[styles.overlay, { backgroundColor: overlayBg }, overlayStyle]}>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        {/* Balloons */}
        {balloonConfigs.map((config, i) => (
          <SingleBalloon key={i} config={config} visible={visible} />
        ))}

        {/* Text — high contrast */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <View style={[styles.textBackdrop, { backgroundColor: isMemorial ? "rgba(20, 10, 40, 0.7)" : "rgba(0, 0, 0, 0.6)", borderColor: isMemorial ? "rgba(160, 120, 220, 0.25)" : "rgba(255, 255, 255, 0.15)" }]}>
            <Text style={styles.textTitle}>{titleText}</Text>
            <Text style={[styles.textName, { color: nameColor }]}>{memorialName}</Text>
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
    zIndex: 9999,
  },
  pressable: {
    flex: 1,
    width: "100%",
  },
  textContainer: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.1,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  textBackdrop: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
  },
  textTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 26,
  },
  textName: {
    fontSize: 23,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  textHint: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
});
