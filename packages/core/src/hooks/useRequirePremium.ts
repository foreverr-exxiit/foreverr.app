import { useCallback, useState } from "react";
import { usePremium } from "./usePremium";
import type { PremiumFeatureKey } from "./usePremium";

/**
 * useRequirePremium — Gating convenience hook
 *
 * Wraps any callback with a premium feature check.
 * If the user has the required feature, the callback runs.
 * If not, `shouldShowPaywall` is set to true, letting the
 * calling component display a PaywallModal.
 *
 * Usage:
 * ```tsx
 * const { requirePremium, shouldShowPaywall, dismissPaywall, featureLabel } = useRequirePremium();
 *
 * <Pressable onPress={requirePremium("premium_templates", "Premium Templates", () => {
 *   // do premium thing
 * })}>
 *
 * <PaywallModal
 *   visible={shouldShowPaywall}
 *   onClose={dismissPaywall}
 *   featureLabel={featureLabel}
 *   ...
 * />
 * ```
 */

export function useRequirePremium() {
  const { hasFeature, tier } = usePremium();
  const [shouldShowPaywall, setShouldShowPaywall] = useState(false);
  const [featureLabel, setFeatureLabel] = useState<string | undefined>();
  const [featureDescription, setFeatureDescription] = useState<string | undefined>();

  const requirePremium = useCallback(
    (
      featureKey: PremiumFeatureKey,
      label: string,
      callback: () => void,
      description?: string
    ) => {
      return () => {
        if (hasFeature(featureKey)) {
          callback();
        } else {
          setFeatureLabel(label);
          setFeatureDescription(description);
          setShouldShowPaywall(true);
        }
      };
    },
    [hasFeature]
  );

  const dismissPaywall = useCallback(() => {
    setShouldShowPaywall(false);
    setFeatureLabel(undefined);
    setFeatureDescription(undefined);
  }, []);

  return {
    requirePremium,
    shouldShowPaywall,
    dismissPaywall,
    featureLabel,
    featureDescription,
    tier,
  };
}
