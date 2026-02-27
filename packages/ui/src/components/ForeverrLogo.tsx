import React from "react";
import { View, Image } from "react-native";

interface ForeverrLogoProps {
  /** Width in pixels (height auto-scales). The logo will shrink to fit its parent via maxWidth. */
  width?: number;
  /** "full" = wordmark logo, "icon" = favicon/FRR mark */
  variant?: "full" | "icon";
  /**
   * "onDark" = standard logo (white text visible on dark bg)
   * "onLight" = wraps full logo in a dark container so white text is visible on light/white bg
   * Only affects the "full" variant — icon variant is all-purple and works on any background.
   */
  colorScheme?: "onDark" | "onLight";
}

const FULL_ASPECT = 3.5; // wordmark aspect ratio (width / height)

/**
 * Renders the Foreverr brand logo.
 * - `full` variant: FOREVERR wordmark with EXXiiT tagline
 * - `icon` variant: FRR compact icon mark (for headers, app icon)
 * - `colorScheme="onLight"` wraps the full logo in a dark purple pill so white "FOR" text is visible
 * - Uses maxWidth: '100%' so the logo shrinks to fit its parent on smaller screens.
 */
export function ForeverrLogo({
  width = 180,
  variant = "full",
  colorScheme = "onDark",
}: ForeverrLogoProps) {
  if (variant === "icon") {
    return (
      <View style={{ width, maxWidth: "100%", aspectRatio: 1 }}>
        <Image
          source={require("../../../../apps/mobile/assets/images/foreverr-favicon.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // On light backgrounds, wrap the logo in a dark purple pill
  if (colorScheme === "onLight") {
    const paddingH = 32;
    const paddingV = 20;
    const imgH = width / FULL_ASPECT;
    const containerW = width + paddingH * 2;
    const containerH = imgH + paddingV * 2;
    return (
      <View
        style={{
          width: containerW,
          maxWidth: "100%",
          aspectRatio: containerW / containerH,
          backgroundColor: "#2D1B4E",
          borderRadius: 9999,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={require("../../../../apps/mobile/assets/images/foreverr-logo.png")}
          style={{ width: "75%", aspectRatio: FULL_ASPECT }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Standard full wordmark — onDark
  return (
    <View style={{ width, maxWidth: "100%", aspectRatio: FULL_ASPECT }}>
      <Image
        source={require("../../../../apps/mobile/assets/images/foreverr-logo.png")}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      />
    </View>
  );
}
