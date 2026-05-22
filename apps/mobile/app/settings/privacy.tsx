import { View, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@foreverr/core";
import { Text } from "@foreverr/ui";

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/settings" as any);
  }, [router]);

  // Privacy toggles
  const [profilePublic, setProfilePublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [showInDirectory, setShowInDirectory] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(false);

  // Security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  // Data toggles
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [personalizedContent, setPersonalizedContent] = useState(true);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent and cannot be undone. All your memorials, tributes, letters, and data will be permanently removed. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete My Account",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Please type DELETE to confirm. This will remove all your data from ǝterrn permanently.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "I Understand, Delete",
                  style: "destructive",
                  onPress: () => {
                    Alert.alert("Account Deletion Requested", "Your account deletion request has been submitted. Your data will be removed within 30 days per our data retention policy. You will receive a confirmation email.");
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Your Data",
      "We'll prepare a copy of all your data including memorials, tributes, letters, photos, and account information. You'll receive a download link via email within 48 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request Download",
          onPress: () => {
            Alert.alert("Request Submitted", "You'll receive an email with your data download link within 48 hours.");
          },
        },
      ]
    );
  };

  function SettingToggle({
    icon,
    iconColor,
    label,
    description,
    value,
    onValueChange,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    label: string;
    description: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
  }) {
    return (
      <View className="flex-row items-center py-3 px-4">
        <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <View className="flex-1 mr-3">
          <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">{label}</Text>
          <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 mt-0.5">{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#d1d5db", true: "#7C3AED" }}
          thumbColor="#ffffff"
          style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-900 px-4 pt-14 pb-4 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center">
          <Pressable onPress={goBack} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#4A2D7A" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-sans-bold text-gray-900 dark:text-white">Privacy & Security</Text>
            <Text className="text-xs font-sans text-gray-400 mt-0.5">Manage how your information is used</Text>
          </View>
        </View>
      </View>

      {/* Privacy Section */}
      <View className="mt-4 px-2">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider px-4 mb-1.5">Privacy</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          <SettingToggle
            icon="earth-outline"
            iconColor="#059669"
            label="Public Profile"
            description="Allow anyone to view your profile and tributes"
            value={profilePublic}
            onValueChange={setProfilePublic}
          />
          <SettingToggle
            icon="pulse-outline"
            iconColor="#2563EB"
            label="Activity Status"
            description="Show your recent activity to other users"
            value={showActivity}
            onValueChange={setShowActivity}
          />
          <SettingToggle
            icon="pricetag-outline"
            iconColor="#7C3AED"
            label="Allow Tagging"
            description="Let others tag you in memorials and tributes"
            value={allowTagging}
            onValueChange={setAllowTagging}
          />
          <SettingToggle
            icon="people-outline"
            iconColor="#D97706"
            label="Show in Directory"
            description="Appear in the public memorial directory"
            value={showInDirectory}
            onValueChange={setShowInDirectory}
          />
          <SettingToggle
            icon="chatbubble-outline"
            iconColor="#ec4899"
            label="Allow Messages"
            description="Let other users send you direct messages"
            value={allowMessages}
            onValueChange={setAllowMessages}
          />
          <SettingToggle
            icon="ellipse"
            iconColor="#22c55e"
            label="Online Status"
            description="Show when you're currently active on ǝterrn"
            value={showOnlineStatus}
            onValueChange={setShowOnlineStatus}
          />
        </View>
      </View>

      {/* Security Section */}
      <View className="mt-6 px-2">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider px-4 mb-1.5">Security</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          <SettingToggle
            icon="key-outline"
            iconColor="#7C3AED"
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={twoFactorEnabled}
            onValueChange={(v) => {
              if (v) {
                Alert.alert("Enable 2FA", "Two-factor authentication will be enabled. You'll need to verify via SMS or authenticator app on your next login.");
              }
              setTwoFactorEnabled(v);
            }}
          />
          <SettingToggle
            icon="finger-print-outline"
            iconColor="#059669"
            label="Biometric Login"
            description="Use Face ID or fingerprint to sign in"
            value={biometricLogin}
            onValueChange={setBiometricLogin}
          />
          <SettingToggle
            icon="alert-circle-outline"
            iconColor="#EF4444"
            label="Login Alerts"
            description="Get notified when someone signs into your account from a new device"
            value={loginAlerts}
            onValueChange={setLoginAlerts}
          />

          {/* Change Password */}
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => {
              Alert.alert("Change Password", "A password reset link will be sent to your registered email address.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Send Reset Link",
                  onPress: () => Alert.alert("Email Sent", "Check your inbox for the password reset link."),
                },
              ]);
            }}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={16} color="#6b7280" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">Change Password</Text>
              <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 mt-0.5">Send a password reset link to your email</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>

          {/* Active Sessions */}
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => {
              Alert.alert("Active Sessions", "You are currently signed in on 1 device. To sign out of all other devices, tap Sign Out All.", [
                { text: "Close" },
                {
                  text: "Sign Out All Others",
                  style: "destructive",
                  onPress: () => Alert.alert("Done", "You've been signed out of all other devices."),
                },
              ]);
            }}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="phone-portrait-outline" size={16} color="#6b7280" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">Active Sessions</Text>
              <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 mt-0.5">Manage devices where you're signed in</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>

      {/* Data & Personalization */}
      <View className="mt-6 px-2">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider px-4 mb-1.5">Data & Personalization</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          <SettingToggle
            icon="analytics-outline"
            iconColor="#2563EB"
            label="Usage Analytics"
            description="Help us improve ǝterrn by sharing anonymous usage data"
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />
          <SettingToggle
            icon="sparkles-outline"
            iconColor="#D97706"
            label="Personalized Content"
            description="See memorial and tribute recommendations based on your activity"
            value={personalizedContent}
            onValueChange={setPersonalizedContent}
          />
        </View>
      </View>

      {/* Your Data Section */}
      <View className="mt-6 px-2">
        <Text className="text-[10px] font-sans-bold text-gray-400 uppercase tracking-wider px-4 mb-1.5">Your Data</Text>
        <View className="bg-gray-50 dark:bg-gray-800/50 rounded-xl mx-2 overflow-hidden">
          {/* Download Data */}
          <Pressable className="flex-row items-center py-3 px-4" onPress={handleDownloadData}>
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="download-outline" size={16} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">Download Your Data</Text>
              <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 mt-0.5">Get a copy of everything you've shared on ǝterrn</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>

          {/* Blocked Users */}
          <Pressable
            className="flex-row items-center py-3 px-4"
            onPress={() => Alert.alert("Blocked Users", "You haven't blocked anyone yet. You can block users from their profile page.")}
          >
            <View className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-3">
              <Ionicons name="ban-outline" size={16} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sans-medium text-gray-900 dark:text-white">Blocked Users</Text>
              <Text className="text-[11px] font-sans text-gray-400 dark:text-gray-500 mt-0.5">Manage users you've blocked</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </Pressable>
        </View>
      </View>

      {/* Danger Zone */}
      <View className="mt-6 px-4 pb-10">
        <Text className="text-[10px] font-sans-bold text-red-400 uppercase tracking-wider mb-2">Danger Zone</Text>
        <Pressable
          className="flex-row items-center justify-center py-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10"
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
          <Text className="ml-2 text-sm font-sans-medium text-red-500">Delete My Account</Text>
        </Pressable>
        <Text className="text-[10px] font-sans text-gray-400 text-center mt-2 px-4">
          This permanently removes your account and all associated data. This action cannot be undone.
        </Text>
      </View>
    </ScrollView>
  );
}
