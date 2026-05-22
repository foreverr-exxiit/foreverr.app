import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Platform } from "react-native";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

interface SocialProofToastProps {
  /** Message to display, e.g. "Sarah lit a candle 🕯️" */
  message: string;
  /** Controls visibility with animated entry/exit */
  visible: boolean;
  /** Mode for potential future styling */
  mode?: "memorial" | "celebration";
}

export function SocialProofToast({
  message,
  visible,
}: SocialProofToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (visible && message) {
      // Slide in + fade in
      opacity.setValue(0);
      translateY.setValue(-8);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }
  }, [visible, message, opacity, translateY]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <Animated.Text style={styles.text} numberOfLines={1}>
        {message}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: 240,
    alignSelf: "flex-start",
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
});
