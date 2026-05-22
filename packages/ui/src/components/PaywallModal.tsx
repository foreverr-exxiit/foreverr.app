import React, { useState } from "react";
import { View, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "../primitives/Text";

// ── Types ──────────────────────────────────────────────────

interface PlanOption {
  slug: string;
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  annualSavings?: string;
  tier: number;
  features: string[];
  badge_icon: string;
  badge_color: string;
}

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureLabel?: string;
  featureDescription?: string;
  onSelectPlan: (planSlug: string, billingPeriod: "monthly" | "annual") => void;
  onRestorePurchase?: () => void;
  currentTier?: number;
  isLoading?: boolean;
}

// ── Default plan display data ──────────────────────────────

const PLANS: PlanOption[] = [
  {
    slug: "premium",
    name: "ǝterrn Premium",
    priceMonthly: "$9.99",
    priceAnnual: "$79.99",
    annualSavings: "Save 33%",
    tier: 1,
    badge_icon: "diamond",
    badge_color: "#7C3AED",
    features: [
      "Premium card templates & animations",
      "AI voice, photo restore & video",
      "Premium digital gifts",
      "Unlimited Core storage",
      "Unlimited living tributes",
      "Custom themes & ad-free",
      "1.5x Core Points multiplier",
      "Priority support",
    ],
  },
  {
    slug: "elite",
    name: "ǝterrn Elite",
    priceMonthly: "$19.99",
    priceAnnual: "$159.99",
    annualSavings: "Save 33%",
    tier: 2,
    badge_icon: "star",
    badge_color: "#D97706",
    features: [
      "Everything in Premium, plus:",
      "Physical gift delivery",
      "Family plan (up to 5 members)",
      "Branded & white-label cards",
      "VIP event hosting",
      "Priority celebrity requests",
      "Custom domains",
      "2x Core Points multiplier",
      "Dedicated support",
    ],
  },
];

// ── Checkmark row ──────────────────────────────────────────

function FeatureRow({ text, color }: { text: string; color: string }) {
  return (
    <View className="flex-row items-start mb-2.5">
      <View className="mr-2.5 mt-0.5">
        <Ionicons name="checkmark-circle" size={16} color={color} />
      </View>
      <Text className="text-xs font-sans text-gray-700 dark:text-gray-300 flex-1 leading-4">
        {text}
      </Text>
    </View>
  );
}

// ── Component ──────────────────────────────────────────────

export function PaywallModal({
  visible,
  onClose,
  featureLabel,
  featureDescription,
  onSelectPlan,
  onRestorePurchase,
  currentTier = 0,
  isLoading = false,
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  const activePlan = PLANS.find((p) => p.slug === selectedPlan) ?? PLANS[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="bg-white dark:bg-gray-900 rounded-t-3xl max-h-[92%]">
          {/* Handle bar */}
          <View className="items-center pt-3 pb-1">
            <View className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* ── Hero Section ── */}
            <View className="items-center px-6 pt-4 pb-5">
              <View className="h-16 w-16 rounded-full bg-brand-100 dark:bg-brand-900/30 items-center justify-center mb-3">
                <Ionicons name="diamond" size={32} color="#7C3AED" />
              </View>
              <Text className="text-xl font-sans-bold text-gray-900 dark:text-white text-center">
                Unlock the Full Experience
              </Text>
              {featureLabel ? (
                <View className="mt-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-4 py-2.5">
                  <Text className="text-xs font-sans-semibold text-brand-700 text-center">
                    🔒 "{featureLabel}" requires Premium
                  </Text>
                  {featureDescription ? (
                    <Text className="text-[10px] font-sans text-gray-500 text-center mt-1">
                      {featureDescription}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="text-sm font-sans text-gray-500 dark:text-gray-400 text-center mt-1.5">
                  Upgrade to honor loved ones with premium features
                </Text>
              )}
            </View>

            {/* ── Plan Selector Tabs ── */}
            <View className="flex-row mx-6 mb-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {PLANS.map((plan) => (
                <Pressable
                  key={plan.slug}
                  className={`flex-1 rounded-lg py-2.5 items-center ${
                    selectedPlan === plan.slug
                      ? "bg-white dark:bg-gray-700 shadow-sm"
                      : ""
                  }`}
                  onPress={() => setSelectedPlan(plan.slug)}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name={plan.badge_icon as any}
                      size={14}
                      color={selectedPlan === plan.slug ? plan.badge_color : "#9CA3AF"}
                    />
                    <Text
                      className={`ml-1.5 text-xs font-sans-semibold ${
                        selectedPlan === plan.slug
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500"
                      }`}
                    >
                      {plan.name.replace("ǝterrn ", "")}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* ── Billing Toggle ── */}
            <View className="flex-row mx-6 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1">
              <Pressable
                className={`flex-1 rounded-lg py-2.5 items-center ${
                  billingPeriod === "monthly"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : ""
                }`}
                onPress={() => setBillingPeriod("monthly")}
              >
                <Text
                  className={`text-xs font-sans-semibold ${
                    billingPeriod === "monthly"
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                className={`flex-1 rounded-lg py-2.5 items-center ${
                  billingPeriod === "annual"
                    ? "bg-white dark:bg-gray-700 shadow-sm"
                    : ""
                }`}
                onPress={() => setBillingPeriod("annual")}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`text-xs font-sans-semibold ${
                      billingPeriod === "annual"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Annual
                  </Text>
                  {activePlan.annualSavings ? (
                    <View className="ml-1.5 bg-green-100 dark:bg-green-900/30 rounded-full px-2 py-0.5">
                      <Text className="text-[9px] font-sans-bold text-green-700 dark:text-green-400">
                        {activePlan.annualSavings}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            </View>

            {/* ── Price Display ── */}
            <View className="items-center mb-4 mx-6">
              <View className="flex-row items-end">
                <Text className="text-3xl font-sans-bold text-gray-900 dark:text-white">
                  {billingPeriod === "annual" ? activePlan.priceAnnual : activePlan.priceMonthly}
                </Text>
                <Text className="text-sm font-sans text-gray-500 mb-1 ml-1">
                  /{billingPeriod === "annual" ? "year" : "month"}
                </Text>
              </View>
              {billingPeriod === "annual" ? (
                <Text className="text-xs font-sans text-gray-400 mt-1">
                  That's just{" "}
                  {activePlan.slug === "premium" ? "$6.67" : "$13.33"}
                  /month
                </Text>
              ) : null}
            </View>

            {/* ── Features List ── */}
            <View className="mx-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4">
              <Text className="text-xs font-sans-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">
                What's included
              </Text>
              {activePlan.features.map((feature, i) => (
                <FeatureRow key={i} text={feature} color={activePlan.badge_color} />
              ))}
            </View>

            {/* ── CTA Button ── */}
            <View className="mx-6 mb-3">
              {currentTier >= activePlan.tier ? (
                <View className="rounded-2xl bg-green-50 dark:bg-green-900/20 py-4 items-center">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#059669" />
                    <Text className="ml-2 text-sm font-sans-bold text-green-700 dark:text-green-400">
                      You already have this plan!
                    </Text>
                  </View>
                </View>
              ) : (
                <Pressable
                  className="rounded-2xl py-4 items-center"
                  style={{ backgroundColor: activePlan.badge_color }}
                  onPress={() => onSelectPlan(activePlan.slug, billingPeriod)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text className="text-base font-sans-bold text-white">Processing...</Text>
                  ) : (
                    <Text className="text-base font-sans-bold text-white">
                      {billingPeriod === "annual"
                        ? `Start with ${activePlan.name}`
                        : `Subscribe to ${activePlan.name.replace("ǝterrn ", "")}`}
                    </Text>
                  )}
                </Pressable>
              )}
            </View>

            {/* ── Trial info ── */}
            <Text className="text-[10px] font-sans text-gray-400 text-center mx-6 mb-4">
              7-day free trial • Cancel anytime • No commitment
            </Text>

            {/* ── Restore Purchase ── */}
            {onRestorePurchase ? (
              <Pressable
                className="mx-6 mb-3 py-2.5 items-center"
                onPress={onRestorePurchase}
              >
                <Text className="text-xs font-sans-medium text-brand-700 dark:text-brand-400">
                  Restore Purchase
                </Text>
              </Pressable>
            ) : null}

            {/* ── Legal Links ── */}
            <View className="flex-row justify-center gap-4 mx-6 mb-2">
              <Text className="text-[10px] font-sans text-gray-400 underline">
                Terms of Service
              </Text>
              <Text className="text-[10px] font-sans text-gray-400 underline">
                Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
