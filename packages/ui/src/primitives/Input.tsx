import { TextInput, View, Text, type TextInputProps } from "react-native";
import { forwardRef } from "react";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, Props>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-sans-medium text-gray-700 dark:text-gray-300">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={`w-full rounded-xl border px-4 py-3 text-base font-sans text-gray-900 dark:text-white ${
            error
              ? "border-red-500 bg-red-50 dark:bg-red-950"
              : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
          } ${className}`}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {error && (
          <Text className="mt-1 text-sm font-sans text-red-500">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
