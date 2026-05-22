import { useState, useCallback } from "react";
import { View, ScrollView, Alert, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, registerSchema } from "@foreverr/core";
import type { z } from "zod";
type RegisterInput = z.infer<typeof registerSchema>;
import { Text, Input, Button, EternLogo } from "@foreverr/ui";

// Cross-platform alert that works on web + native
function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login" as any);
  }, [router]);
  const { signUpWithEmail, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
      displayName: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const { data: signUpData, error } = await signUpWithEmail(
        data.email,
        data.password,
        data.username,
        data.displayName
      );
      if (error) {
        setAuthError(error.message);
        showAlert("Sign Up Failed", error.message);
      } else if (signUpData?.session) {
        // Auto-confirmed — user is signed in
        setAuthSuccess("Account created! Signing you in...");
      } else {
        // Email confirmation required
        const msg = "We've sent a confirmation link to your email address. Please check your inbox.";
        setAuthSuccess(msg);
        showAlert("Check your email", msg);
      }
    } catch (err: any) {
      const msg = err?.message ?? "Something went wrong. Please try again.";
      setAuthError(msg);
      showAlert("Sign Up Failed", msg);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Branded header */}
      <View className="bg-brand-900 px-4 pb-6 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")} className="items-center">
          <View className="mt-2">
            <EternLogo width={1200} variant="full" />
          </View>
        </Pressable>
      </View>
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-8">
        <View className="mb-8">
          <Text variant="h1" className="text-brand-800">Create Account</Text>
          <Text variant="body" className="mt-2 text-gray-500">
            Join the community honoring loved ones
          </Text>
        </View>

        {/* Inline error banner — visible on web where Alert.alert may not show */}
        {authError && (
          <Pressable
            className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex-row items-start"
            onPress={() => setAuthError(null)}
          >
            <Ionicons name="alert-circle" size={18} color="#ef4444" style={{ marginTop: 1 }} />
            <Text className="ml-2 flex-1 text-sm font-sans text-red-700 dark:text-red-300">
              {authError}
            </Text>
            <Ionicons name="close" size={16} color="#ef4444" />
          </Pressable>
        )}

        {/* Success banner */}
        {authSuccess && (
          <View className="mb-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 flex-row items-start">
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" style={{ marginTop: 1 }} />
            <Text className="ml-2 flex-1 text-sm font-sans text-green-700 dark:text-green-300">
              {authSuccess}
            </Text>
          </View>
        )}

        <View className="gap-4">
          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Display Name"
                placeholder="Your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.displayName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Username"
                placeholder="Choose a username"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={() => {
              handleSubmit(onSubmit, (validationErrors) => {
                const firstError = Object.values(validationErrors)[0]?.message;
                if (firstError) {
                  setAuthError(String(firstError));
                  showAlert("Please fix", String(firstError));
                }
              })();
            }}
          />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text variant="body" className="text-gray-500">Already have an account? </Text>
          <Pressable onPress={goBack}>
            <Text className="text-base font-sans-semibold text-brand-700">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}
