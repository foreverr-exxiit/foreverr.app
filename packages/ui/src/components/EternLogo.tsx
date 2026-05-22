import React from "react";
import { View, Image } from "react-native";

interface EternLogoProps {
  /** Width in pixels (height auto-scales). The logo will shrink to fit its parent via maxWidth. */
  width?: number;
  /** "full" = wordmark logo, "icon" = favicon/FRR mark */
  variant?: "full" | "icon";
}

const FULL_ASPECT = 3.5; // wordmark aspect ratio (width / height)

/* ── asset imports (must be static require) ── */
const LOGO_GOLD = require("../../../../apps/mobile/assets/images/eterrn-logo-gold.png");
const ICON_GOLD = require("../../../../apps/mobile/assets/images/eterrn-favicon-gold.png");

/**
 * Renders the ǝterrn brand logo (gold variant).
 * - `full` variant: gold wordmark with tagline
 * - `icon` variant: compact ∞ gold icon mark
 */
export function EternLogo({
  width = 360,
  variant = "full",
}: EternLogoProps) {
  if (variant === "icon") {
    return (
      <View style={{ width, maxWidth: "100%", aspectRatio: 1 }}>
        <Image
          source={ICON_GOLD}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Full gold wordmark
  return (
    <View style={{ width, maxWidth: "100%", aspectRatio: FULL_ASPECT }}>
      <Image
        source={LOGO_GOLD}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
      />
    </View>
  );
}
