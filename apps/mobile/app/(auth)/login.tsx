import { useState } from "react";
import { View, ScrollView, Alert, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AppleAuthentication from "expo-apple-authentication";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, loginSchema } from "@foreverr/core";
import type { z } from "zod";
type LoginInput = z.infer<typeof loginSchema>;
import { Text, Input, Button, GoogleIcon, FacebookIcon, XIcon, AppleIcon, ForeverrLogo } from "@foreverr/ui";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithApple, isLoading } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    const { error } = await signInWithEmail(data.email, data.password);
    if (error) {
      Alert.alert("Sign In Failed", error.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (credential.identityToken) {
        const { error } = await signInWithApple(credential.identityToken);
        if (error) Alert.alert("Apple Sign In Failed", error.message);
      }
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Apple Sign In failed. Please try again.");
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Branded header */}
      <View className="bg-brand-900 px-4 pb-4 pt-14 items-center">
        <Pressable onPress={() => router.push("/(tabs)")}>
          <ForeverrLogo width={550} variant="full" />
        </Pressable>
      </View>
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-8">
        <Text className="text-2xl font-sans-bold text-center text-gray-900 dark:text-white mb-8">
          Welcome Back!
        </Text>

        <View className="gap-5">
          {/* Email */}
          <View>
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-1.5">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <Ionicons name="mail-outline" size={20} color="#9ca3af" />
                  <Input
                    placeholder="Please Enter your Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    className="flex-1 ml-2 border-0 bg-transparent p-0"
                  />
                </View>
              )}
            />
          </View>

          {/* Password */}
          <View>
            <Text className="text-sm font-sans-semibold text-gray-900 dark:text-white mb-1.5">Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View className="flex-row items-center rounded-full border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                  <Ionicons name="lock-closed-outline" size={20} color="#9ca3af" />
                  <Input
                    placeholder="Please Enter your Password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    className="flex-1 ml-2 border-0 bg-transparent p-0"
                  />
                </View>
              )}
            />
          </View>

          {/* Remember me + Forgot */}
          <View className="flex-row items-center justify-between">
            <Pressable className="flex-row items-center" onPress={() => setRememberMe(!rememberMe)}>
              <View className={`h-5 w-5 rounded border-2 mr-2 items-center justify-center ${rememberMe ? "bg-brand-700 border-brand-700" : "border-gray-300 dark:border-gray-600"}`}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text className="text-sm font-sans text-gray-600 dark:text-gray-400">Remember me</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-sm font-sans-medium text-brand-700">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Sign In Button */}
          <Pressable
            className="w-full rounded-full bg-brand-700 py-4 items-center mt-2"
            onPress={() => {
              handleSubmit(onSubmit, (validationErrors) => {
                const firstError = Object.values(validationErrors)[0]?.message;
                if (firstError) {
                  Alert.alert("Please fix", String(firstError));
                }
              })();
            }}
            disabled={isLoading}
          >
            <Text className="text-base font-sans-semibold text-white">
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>
        </View>

        {/* OR divider */}
        <View className="my-6 items-center">
          <View className="flex-row items-center w-full px-4">
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <Text className="text-sm font-sans-semibold text-gray-500 dark:text-gray-400 mx-4">OR</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </View>
          <Text className="text-xs font-sans text-gray-500 dark:text-gray-400 mt-2">Login with social Networks</Text>
        </View>

        {/* Social login icons — all 4 providers */}
        <View className="flex-row justify-center gap-4">
          {/* Google */}
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200"
            onPress={() => Alert.alert("Coming Soon", "Google Sign In will be available soon.")}
            accessibilityLabel="Sign in with Google"
            accessibilityRole="button"
          >
            <GoogleIcon size={22} />
          </Pressable>
          {/* Facebook */}
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-[#1877F2]"
            onPress={() => Alert.alert("Coming Soon", "Facebook Sign In will be available soon.")}
            accessibilityLabel="Sign in with Facebook"
            accessibilityRole="button"
          >
            <FacebookIcon size={22} />
          </Pressable>
          {/* X (formerly Twitter) */}
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-black"
            onPress={() => Alert.alert("Coming Soon", "X Sign In will be available soon.")}
            accessibilityLabel="Sign in with X"
            accessibilityRole="button"
          >
            <XIcon size={18} color="#FFFFFF" />
          </Pressable>
          {/* Apple */}
          {Platform.OS === "ios" && (
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full bg-black"
              onPress={handleAppleSignIn}
              accessibilityLabel="Sign in with Apple"
              accessibilityRole="button"
            >
              <AppleIcon size={22} />
            </Pressable>
          )}
        </View>

        {/* Sign up link */}
        <View className="mt-8 flex-row justify-center">
          <Text className="text-sm font-sans text-gray-500">Don't Have an Account? </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text className="text-sm font-sans-bold text-brand-700">Sign up</Text>
          </Pressable>
        </View>

        {/* Browse as Guest */}
        <Pressable
          onPress={() => router.replace("/(tabs)")}
          className="mt-4 items-center py-3"
        >
          <Text className="text-sm font-sans-medium text-gray-500">
            Browse as Guest
          </Text>
        </Pressable>
      </View>
    </ScrollView>
    </View>
  );
}
