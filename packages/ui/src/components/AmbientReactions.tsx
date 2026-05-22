import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Platform,
  Easing,
  Dimensions,
} from "react-native";
import { Text } from "../primitives/Text";

const USE_NATIVE_DRIVER = Platform.OS !== "web";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Emoji sets per mode ──────────────────────────────────────────────

const MEMORIAL_EMOJIS = [
  { emoji: "\u2764\uFE0F", label: "Love" },
  { emoji: "\uD83D\uDD6F\uFE0F", label: "Candle" },
  { emoji: "\uD83D\uDD4A\uFE0F", label: "Honor" },
  { emoji: "\uD83C\uDF38", label: "Flower" },
  { emoji: "\uD83E\uDD0D", label: "Peace" },
];

const CELEBRATION_EMOJIS = [
  { emoji: "\u2764\uFE0F", label: "Love" },
  { emoji: "\uD83C\uDF89", label: "Cheers" },
  { emoji: "\uD83C\uDF88", label: "Celebrate" },
  { emoji: "\uD83C\uDF38", label: "Flower" },
  { emoji: "\u2B50", label: "Star" },
];

// ── Single floating particle ────────────────────────────────────────

interface Particle {
  id: number;
  emoji: string;
  label: string;
  startX: number;
  anim: Animated.Value;
}

let particleIdCounter = 0;

// ── Component ───────────────────────────────────────────────────────

interface AmbientReactionsProps {
  /** Which emoji set to use */
  mode?: "memorial" | "celebration";
  /** How often (ms) a new particle spawns. Default 6000 (6s) */
  intervalMs?: number;
  /** If true, show particles. Default true */
  enabled?: boolean;
  /** Reaction counts — heavier types appear more often */
  counts?: Record<string, number>;
}

export function AmbientReactions({
  mode = "memorial",
  intervalMs = 6000,
  enabled = true,
  counts,
}: AmbientReactionsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emojis = mode === "celebration" ? CELEBRATION_EMOJIS : MEMORIAL_EMOJIS;

  // Weight selection based on counts (heavier types appear more)
  const pickEmoji = useCallback(() => {
    if (counts && Object.keys(counts).length > 0) {
      // Build weighted pool
      const pool: typeof emojis[number][] = [];
      for (const e of emojis) {
        const typeKey = e.label.toLowerCase();
        const weight = Math.max(1, counts[typeKey] ?? counts[e.label] ?? 1);
        for (let i = 0; i < Math.min(weight, 10); i++) {
          pool.push(e);
        }
      }
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return emojis[Math.floor(Math.random() * emojis.length)];
  }, [emojis, counts]);

  const spawnParticle = useCallback(() => {
    const chosen = pickEmoji();
    const id = particleIdCounter++;
    const startX = 20 + Math.random() * (SCREEN_WIDTH - 60);
    const anim = new Animated.Value(0);

    const particle: Particle = {
      id,
      emoji: chosen.emoji,
      label: chosen.label,
      startX,
      anim,
    };

    setParticles((prev) => [...prev, particle]);

    Animated.timing(anim, {
      toValue: 1,
      duration: 3200 + Math.random() * 1200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start(() => {
      // Remove when done
      setParticles((prev) => prev.filter((p) => p.id !== id));
    });
  }, [pickEmoji]);

  useEffect(() => {
    if (!enabled) return;

    // Spawn first one after a short delay
    const initialDelay = setTimeout(() => {
      spawnParticle();
    }, 2000 + Math.random() * 2000);

    timerRef.current = setInterval(() => {
      spawnParticle();
      // Sometimes spawn a second one shortly after for variety
      if (Math.random() > 0.6) {
        setTimeout(spawnParticle, 400 + Math.random() * 600);
      }
    }, intervalMs);

    return () => {
      clearTimeout(initialDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, intervalMs, spawnParticle]);

  if (!enabled || particles.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.15, 0.7, 1],
          outputRange: [0, 0.85, 0.6, 0],
        });
        const scale = p.anim.interpolate({
          inputRange: [0, 0.3, 1],
          outputRange: [0.5, 1, 0.7],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 50],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              styles.particle,
              {
                left: p.startX,
                opacity,
                transform: [{ translateY }, { translateX }, { scale }],
              },
            ]}
          >
            <Text style={styles.particleEmoji}>{p.emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 1,
  },
  particle: {
    position: "absolute",
    bottom: 0,
    alignItems: "center",
  },
  particleEmoji: {
    fontSize: 20,
  },
});
