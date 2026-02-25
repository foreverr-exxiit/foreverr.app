import { View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, forgotPasswordSchema } from "@foreverr/core";
import type { z } from "zod";
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
import { Text, Input, Button, ScreenWrapper } from "@foreverr/ui";

export default function ForgotPasswordScreen() {
  const router = useRouter();
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
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  return (
    <ScreenWrapper className="justify-center px-6">
      <Button
        title="← Back"
        variant="ghost"
        size="sm"
        onPress={() => router.back()}
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
    </ScreenWrapper>
  );
}
