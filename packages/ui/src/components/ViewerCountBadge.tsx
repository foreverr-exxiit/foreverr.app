import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Platform } from "react-native";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

function formatViewerCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

interface ViewerCountBadgeProps {
  /** Number of viewers to display */
  count: number;
  /** Show a pulsing live indicator dot */
  isLive?: boolean;
}

export function ViewerCountBadge({ count, isLive = false }: ViewerCountBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isLive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLive, pulseAnim]);

  if (count <= 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {isLive && (
        <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
      )}
      <Animated.Text style={styles.text}>
        {"\uD83D\uDC41"} {formatViewerCount(count)} watching
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: 6,
  },
  text: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
});
