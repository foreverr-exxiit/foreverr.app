import { View, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth, registerSchema } from "@foreverr/core";
import type { z } from "zod";
type RegisterInput = z.infer<typeof registerSchema>;
import { Text, Input, Button } from "@foreverr/ui";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUpWithEmail, isLoading } = useAuth();

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
    const { error } = await signUpWithEmail(
      data.email,
      data.password,
      data.username,
      data.displayName
    );
    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else {
      Alert.alert(
        "Check your email",
        "We've sent a confirmation link to your email address.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center px-6 py-12">
        <View className="mb-8">
          <Text variant="h1" className="text-brand-800">Create Account</Text>
          <Text variant="body" className="mt-2 text-gray-500">
            Join the community honoring loved ones
          </Text>
        </View>

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
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <View className="mt-6 flex-row justify-center">
          <Text variant="body" className="text-gray-500">Already have an account? </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-base font-sans-semibold text-brand-700">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
