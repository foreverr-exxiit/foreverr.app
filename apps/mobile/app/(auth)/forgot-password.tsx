import { useCallback } from "react";
import { View, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, forgotPasswordSchema } from "@foreverr/core";
import type { z } from "zod";
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
import { Text, Input, Button, ScreenWrapper, EternLogo } from "@foreverr/ui";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/(auth)/login" as any);
  }, [router]);
  const { resetPassword, isLoading } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    const { error } = await resetPassword(data.email);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert(
        "Email Sent",
        "Check your inbox for a password reset link.",
        [{ text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace("/(auth)/login" as any); } }]
      );
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

      <View className="flex-1 justify-center px-6">
        <Button
          title="← Back"
          variant="ghost"
          size="sm"
          onPress={goBack}
          className="self-start mb-6"
        />

        <Text variant="h2" className="mb-2">Reset Password</Text>
        <Text variant="body" className="mb-8 text-gray-500">
          Enter your email and we'll send you a link to reset your password.
        </Text>

        <View className="gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Button
            title="Send Reset Link"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </View>
    </View>
  );
}
