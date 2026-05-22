import React, { useEffect, useMemo } from "react";
import { Pressable, Dimensions, StyleSheet, View, Text, type ViewStyle } from "react-native";
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

// ── Dove config ──────────────────────────────────────────────────────
const DOVE_COUNT = 12;
const DOVE_EMOJI = "\uD83D\uDD4A\uFE0F"; // 🕊️ faces LEFT naturally

interface DoveConfig {
  startX: number;
  startY: number;
  /** Peak height of the arc (lower = higher on screen) */
  peakY: number;
  delay: number;
  duration: number;
  size: number;
  /** Wing flap speed in ms per beat */
  flapSpeed: number;
}

function generateDoveConfigs(): DoveConfig[] {
  const configs: DoveConfig[] = [];
  for (let i = 0; i < DOVE_COUNT; i++) {
    // ALL doves start from the RIGHT side and fly LEFT (natural 🕊️ direction)
    const startX = SCREEN_WIDTH * 0.7 + Math.random() * (SCREEN_WIDTH * 0.4);
    // Stagger vertical start positions across the lower-right area
    const startY = SCREEN_HEIGHT * 0.4 + Math.random() * (SCREEN_HEIGHT * 0.35);
    // Peak of the arc — how high each dove rises (varies for depth)
    const peakY = SCREEN_HEIGHT * 0.08 + Math.random() * (SCREEN_HEIGHT * 0.15);
    // Stagger launch times
    const delay = i * 200 + Math.random() * 250;
    // Flight duration — vary for natural depth feeling
    const duration = 2600 + Math.random() * 1200;
    // Size variety
    const sizePool = [28, 32, 36, 40, 44, 50];
    const size = sizePool[Math.floor(Math.random() * sizePool.length)];
    // Wing flap speed — smaller = faster
    const flapSpeed = 140 + Math.random() * 60;

    configs.push({ startX, startY, peakY, delay, duration, size, flapSpeed });
  }
  return configs;
}

// ── Single Dove ──────────────────────────────────────────────────────

function SingleDove({ config, visible }: { config: DoveConfig; visible: boolean }) {
  const progress = useSharedValue(0);
  const wingBeat = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Flight progress 0 → 1
      progress.value = withDelay(
        config.delay,
        withTiming(1, {
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
        })
      );
      // Wing flapping — scaleY oscillation simulates wing beats realistically
      wingBeat.value = withDelay(
        config.delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: config.flapSpeed, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: config.flapSpeed, easing: Easing.in(Easing.quad) })
          ),
          -1,
          true
        )
      );
    } else {
      progress.value = 0;
      wingBeat.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle((): ViewStyle => {
    const p = progress.value;

    // Right-to-left path: start right, exit left
    const exitX = -config.size * 2;
    const x = interpolate(p, [0, 1], [config.startX, exitX]);

    // Arc path: start at startY, rise to peakY, then exit slightly higher
    const y = interpolate(
      p,
      [0, 0.15, 0.5, 0.85, 1],
      [
        config.startY,
        config.startY - (config.startY - config.peakY) * 0.3,
        config.peakY,
        config.peakY - 20,
        config.peakY - 40,
      ]
    );

    // Fade in, stay, fade out as it exits left
    const opacity = interpolate(
      p,
      [0, 0.04, 0.1, 0.8, 0.95, 1],
      [0, 0.5, 1, 0.9, 0.3, 0]
    );

    // Scale — full size in middle, slightly smaller at edges
    const scale = interpolate(
      p,
      [0, 0.08, 0.4, 0.9, 1],
      [0.4, 1, 0.95, 0.8, 0.5]
    );

    // Wing flap: scaleY oscillates between 0.85 and 1.0 for wing beat effect
    const wingScale = interpolate(wingBeat.value, [0, 1], [0.85, 1.0]);

    // Subtle body tilt: nose up when climbing, level when cruising
    const tilt = interpolate(
      p,
      [0, 0.2, 0.5, 0.8, 1],
      [-12, -8, -3, -5, -8]
    );

    return {
      position: "absolute",
      left: x - config.size / 2,
      top: y - config.size / 2,
      opacity,
      transform: [
        { scale },
        { scaleY: wingScale },
        { rotate: `${tilt}deg` },
      ],
    };
  });

  if (!visible) return null;

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: config.size }}>{DOVE_EMOJI}</Text>
    </Animated.View>
  );
}

// ── Main DoveAnimation ───────────────────────────────────────────────

interface DoveAnimationProps {
  visible: boolean;
  memorialName: string;
  onDismiss: () => void;
  duration?: number;
}

export function DoveAnimation({
  visible,
  memorialName,
  onDismiss,
  duration = 4800,
}: DoveAnimationProps) {
  const overlayOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.3);
  const glowOpacity = useSharedValue(0);

  const doveConfigs = useMemo(() => generateDoveConfigs(), [visible]);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 400 });

      // Soft glow in the sky area
      glowOpacity.value = withDelay(600, withTiming(0.2, { duration: 800 }));
      glowScale.value = withDelay(
        600,
        withRepeat(
          withSequence(
            withTiming(1.2, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );

      textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));

      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(0, { duration: 500 });
        textOpacity.value = withTiming(0, { duration: 300 });
        glowOpacity.value = withTiming(0, { duration: 400 });
        setTimeout(onDismiss, 550);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      overlayOpacity.value = 0;
      textOpacity.value = 0;
      glowOpacity.value = 0;
      glowScale.value = 0.3;
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
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        {/* Soft sky glow */}
        <Animated.View style={[styles.glow, glowStyle]} />

        {/* Multitude of doves — right to left */}
        {doveConfigs.map((config, i) => (
          <SingleDove key={i} config={config} visible={visible} />
        ))}

        {/* Text — high contrast with solid backdrop */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <View style={styles.textBackdrop}>
            <Text style={styles.textTitle}>
              Doves released in honor of
            </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 9999,
  },
  pressable: {
    flex: 1,
    width: "100%",
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    left: SCREEN_WIDTH * 0.3 - 140,
    top: SCREEN_HEIGHT * 0.15 - 140,
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
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
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
});
