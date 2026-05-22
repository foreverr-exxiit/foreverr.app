/**
 * RevenueCat Integration Hook
 *
 * Provides purchase management via RevenueCat SDK.
 * Uses real RevenueCat SDK on native platforms (iOS/Android)
 * and falls back to a web stub for development/testing.
 *
 * Setup:
 *   1. pnpm add react-native-purchases --filter @foreverr/mobile
 *   2. npx pod-install (iOS)
 *   3. Set EXPO_PUBLIC_REVENUECAT_API_KEY in .env
 *   4. Configure products in RevenueCat dashboard
 *
 * Usage:
 *   const { purchase, restore, isReady } = useRevenueCat();
 *   await purchase(plan, "monthly");
 */

import { useState, useEffect, useCallback } from "react";
import { Platform, Alert } from "react-native";
import { env } from "@foreverr/config";
import { useAuth } from "./useAuth";
import { useActivateSubscription, useRestoreSubscription } from "./usePremium";
import type { SubscriptionPlan } from "./usePremium";
import { analytics } from "../services/analytics";
import { captureException } from "../services/errorReporting";

// ── Types ──────────────────────────────────────────────────

interface RevenueCatState {
  isReady: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  error: string | null;
  offerings: RevenueCatOffering[] | null;
}

interface RevenueCatOffering {
  identifier: string;
  availablePackages: RevenueCatPackage[];
}

interface RevenueCatPackage {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    priceString: string;
    price: number;
  };
}

interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  customerId?: string;
  error?: string;
}

// ── Lazy import RevenueCat SDK (only on native) ──

let Purchases: any = null;

async function loadRevenueCatSDK() {
  if (Platform.OS === "web") return null;
  try {
    const mod = require("react-native-purchases");
    return mod.default ?? mod;
  } catch {
    console.warn("[RevenueCat] react-native-purchases not installed. Using stub mode.");
    return null;
  }
}

// ── Hook ───────────────────────────────────────────────────

export function useRevenueCat() {
  const { user } = useAuth();
  const activateSubscription = useActivateSubscription();
  const restoreSubscription = useRestoreSubscription();

  const [state, setState] = useState<RevenueCatState>({
    isReady: false,
    isPurchasing: false,
    isRestoring: false,
    error: null,
    offerings: null,
  });

  // ── Initialize RevenueCat ──
  useEffect(() => {
    const init = async () => {
      try {
        Purchases = await loadRevenueCatSDK();

        if (Purchases && env.revenueCatApiKey) {
          // Real SDK initialization
          await Purchases.configure({
            apiKey: env.revenueCatApiKey,
            appUserID: user?.id ?? undefined,
          });

          // Fetch offerings
          try {
            const offerings = await Purchases.getOfferings();
            const mapped = Object.values(offerings.all ?? {}).map((o: any) => ({
              identifier: o.identifier,
              availablePackages: (o.availablePackages ?? []).map((p: any) => ({
                identifier: p.identifier,
                product: {
                  identifier: p.product.identifier,
                  title: p.product.title,
                  priceString: p.product.priceString,
                  price: p.product.price,
                },
              })),
            }));
            setState((s) => ({ ...s, isReady: true, offerings: mapped }));
          } catch {
            setState((s) => ({ ...s, isReady: true }));
          }
        } else {
          // Stub mode (web or SDK not installed)
          setState((s) => ({ ...s, isReady: true }));
        }
      } catch (err) {
        console.warn("[RevenueCat] Init error:", err);
        setState((s) => ({ ...s, isReady: true, error: "Failed to initialize payments" }));
      }
    };

    if (user?.id) {
      init();
    }
  }, [user?.id]);

  // ── Purchase a product ──
  const purchase = useCallback(
    async (plan: SubscriptionPlan, billingPeriod: "monthly" | "annual"): Promise<PurchaseResult> => {
      setState((s) => ({ ...s, isPurchasing: true, error: null }));

      try {
        const productId = billingPeriod === "annual"
          ? plan.store_product_id_annual
          : plan.store_product_id_monthly;

        if (!productId) {
          throw new Error("No product ID configured for this plan");
        }

        let transactionId = `stub_${Date.now()}`;

        if (Purchases) {
          // ── Real RevenueCat purchase ──
          const { customerInfo } = await Purchases.purchaseProduct(productId);
          transactionId = customerInfo?.originalAppUserId ?? `rc_${Date.now()}`;

          // Verify the entitlement is active
          const premiumEntitlement = customerInfo?.entitlements?.active?.["premium"] ??
            customerInfo?.entitlements?.active?.["elite"];

          if (!premiumEntitlement) {
            throw new Error("Purchase completed but entitlement not found");
          }
        } else {
          // ── Stub mode: Simulate for web/dev ──
          Alert.alert(
            "Payment Preview",
            `In production, this opens the native payment sheet for ${plan.name} (${billingPeriod}).\n\nSimulating successful purchase.`,
            [{ text: "OK" }]
          );
        }

        // Activate subscription in our database
        await activateSubscription.mutateAsync({
          plan_id: plan.id,
          billing_period: billingPeriod,
          provider: "revenuecat",
          provider_subscription_id: transactionId,
          provider_customer_id: user?.id ?? undefined,
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });

        analytics.track("purchase_completed", {
          plan_id: plan.id,
          plan_slug: plan.slug,
          tier: plan.tier,
          billing_period: billingPeriod,
          product_id: productId,
          transaction_id: transactionId,
          stub_mode: !Purchases,
        });

        setState((s) => ({ ...s, isPurchasing: false }));
        return {
          success: true,
          productId,
          transactionId,
          customerId: user?.id,
        };
      } catch (err: any) {
        const errorMessage = err?.message ?? "Purchase failed";
        const isCancellation = errorMessage.includes("cancelled") || errorMessage.includes("canceled") ||
          err?.userCancelled === true;

        if (!isCancellation) {
          // Real failure — report so we can diagnose payment friction.
          captureException(err, {
            where: "useRevenueCat.purchase",
            plan_id: plan.id,
            plan_slug: plan.slug,
            billing_period: billingPeriod,
          });
          setState((s) => ({ ...s, isPurchasing: false, error: errorMessage }));
        } else {
          analytics.track("purchase_cancelled", {
            plan_id: plan.id,
            plan_slug: plan.slug,
            billing_period: billingPeriod,
          });
          setState((s) => ({ ...s, isPurchasing: false }));
        }

        return { success: false, error: isCancellation ? "cancelled" : errorMessage };
      }
    },
    [user?.id, activateSubscription]
  );

  // ── Restore purchases ──
  const restore = useCallback(async (): Promise<PurchaseResult> => {
    setState((s) => ({ ...s, isRestoring: true, error: null }));

    try {
      if (Purchases) {
        // ── Real RevenueCat restore ──
        const { customerInfo } = await Purchases.restorePurchases();
        const activeEntitlements = customerInfo?.entitlements?.active ?? {};
        const hasActive = Object.keys(activeEntitlements).length > 0;

        if (hasActive) {
          await restoreSubscription.mutateAsync();
          Alert.alert("Restored!", "Your subscription has been restored successfully.");
        } else {
          Alert.alert("No Subscription Found", "We couldn't find an active subscription to restore.");
        }

        setState((s) => ({ ...s, isRestoring: false }));
        return { success: hasActive };
      } else {
        // ── Stub mode ──
        await restoreSubscription.mutateAsync();
        Alert.alert("Restore Complete", "If you have a previous subscription, it has been restored.");
        setState((s) => ({ ...s, isRestoring: false }));
        return { success: true };
      }
    } catch (err: any) {
      captureException(err, { where: "useRevenueCat.restore" });
      setState((s) => ({ ...s, isRestoring: false, error: err?.message }));
      return { success: false, error: err?.message };
    }
  }, [restoreSubscription]);

  return {
    ...state,
    purchase,
    restore,
  };
}
