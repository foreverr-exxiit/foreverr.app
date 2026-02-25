import { View, ScrollView, Alert, Platform, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as AppleAuthentication from "expo-apple-authentication";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, loginSchema } from "@foreverr/core";
import type { z } from "zod";
type LoginInput = z.infer<typeof loginSchema>;
import { Text, Input, Button } from "@foreverr/ui";

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail, signInWithApple, isLoading } = useAuth();

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
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-12">
        {/* Logo */}
        <View className="mb-8 items-center">
          <Text className="text-3xl font-sans-bold">
            <Text className="text-brand-900">FOR</Text>
            <Text className="text-brand-500">EVE</Text>
            <Text className="text-brand-900">RR</Text>
          </Text>
          <Text className="text-xs font-sans-medium tracking-widest text-gray-400 mt-1">
            EXXiiT
          </Text>
        </View>

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
            <View className="flex-row items-center">
              <View className="h-5 w-5 rounded border border-gray-300 mr-2" />
              <Text className="text-sm font-sans text-gray-600">Remember me</Text>
            </View>
            <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
              <Text className="text-sm font-sans-medium text-brand-700">
                Forgot Password?
              </Text>
            </Pressable>
          </View>

          {/* Sign In Button */}
          <Pressable
            className="w-full rounded-full bg-brand-700 py-4 items-center mt-2"
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            <Text className="text-base font-sans-semibold text-white">
              {isLoading ? "Signing In..." : "Sign In"}
            </Text>
          </Pressable>
        </View>

        {/* OR divider */}
        <View className="my-6 items-center">
          <Text className="text-sm font-sans text-gray-400">OR</Text>
          <Text className="text-xs font-sans text-gray-400 mt-1">Login with social Networks</Text>
        </View>

        {/* Social login icons */}
        <View className="flex-row justify-center gap-4">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200"
            onPress={() => Alert.alert("Coming Soon", "Google Sign In will be available soon.")}
          >
            <Text className="text-lg font-sans-bold text-red-500">G</Text>
          </Pressable>
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-full bg-blue-600"
            onPress={() => Alert.alert("Coming Soon", "Facebook Sign In will be available soon.")}
          >
            <Ionicons name="logo-facebook" size={24} color="white" />
          </Pressable>
          {Platform.OS === "ios" ? (
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full bg-black"
              onPress={handleAppleSignIn}
            >
              <Ionicons name="logo-apple" size={24} color="white" />
            </Pressable>
          ) : (
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-full bg-blue-400"
              onPress={() => Alert.alert("Coming Soon", "Twitter Sign In will be available soon.")}
            >
              <Ionicons name="logo-twitter" size={24} color="white" />
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
      </View>
    </ScrollView>
  );
}
