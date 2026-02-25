import { Text as RNText, type TextProps } from "react-native";

interface Props extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption" | "label";
}

const variantClasses: Record<NonNullable<Props["variant"]>, string> = {
  h1: "text-3xl font-serif-bold text-gray-900 dark:text-white",
  h2: "text-2xl font-sans-bold text-gray-900 dark:text-white",
  h3: "text-xl font-sans-semibold text-gray-900 dark:text-white",
  body: "text-base font-sans text-gray-700 dark:text-gray-300",
  caption: "text-sm font-sans text-gray-500 dark:text-gray-400",
  label: "text-sm font-sans-medium text-gray-600 dark:text-gray-400",
};

export function Text({ variant = "body", className = "", ...props }: Props) {
  return (
    <RNText
      className={`${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
