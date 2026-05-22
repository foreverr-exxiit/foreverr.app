import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

type PromptType = "double_tap" | "react" | "tribute";

const PROMPTS: Record<PromptType, { memorial: string; celebration: string; icon: keyof typeof Ionicons.glyphMap }> = {
  double_tap: {
    memorial: "Double-tap to send love",
    celebration: "Double-tap to celebrate",
    icon: "heart-outline",
  },
  react: {
    memorial: "Light a candle to honor their memory",
    celebration: "Send cheers to celebrate",
    icon: "flame-outline",
  },
  tribute: {
    memorial: "Tap reply to share a memory",
    celebration: "Tap reply to send a cheer",
    icon: "chatbubble-outline",
  },
};

interface EngagementPromptProps {
  /** Controls visibility with animated entry/exit */
  visible: boolean;
  /** Memorial or celebration mode */
  mode?: "memorial" | "celebration";
  /** Which prompt to display */
  promptType?: PromptType;
}

export function EngagementPrompt({
  visible,
  mode = "memorial",
  promptType = "double_tap",
}: EngagementPromptProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();

      // Start pulsing
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      );
      pulseRef.current.start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      pulseRef.current?.stop();
    }

    return () => {
      pulseRef.current?.stop();
    };
  }, [visible, opacity, pulseAnim]);

  const prompt = PROMPTS[promptType];
  const text = mode === "celebration" ? prompt.celebration : prompt.memorial;

  return (
    <Animated.View
      style={[styles.container, { opacity: Animated.multiply(opacity, pulseAnim) }]}
      pointerEvents="none"
    >
      <Ionicons
        name={prompt.icon}
        size={14}
        color="rgba(255,255,255,0.8)"
        style={styles.icon}
      />
      <Animated.Text style={styles.text}>{text}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
});
