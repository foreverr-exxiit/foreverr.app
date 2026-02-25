import { Pressable, Text, ActivityIndicator, type PressableProps } from "react-native";

interface Props extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: "bg-brand-700 active:bg-brand-800",
  secondary: "bg-gray-100 dark:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700",
  outline: "border-2 border-brand-700 active:bg-brand-50 dark:active:bg-brand-950",
  ghost: "active:bg-gray-100 dark:active:bg-gray-800",
};

const textVariantClasses = {
  primary: "text-white",
  secondary: "text-gray-900 dark:text-white",
  outline: "text-brand-700",
  ghost: "text-brand-700",
};

const sizeClasses = {
  sm: "px-4 py-2 rounded-lg",
  md: "px-6 py-3 rounded-xl",
  lg: "px-8 py-4 rounded-2xl",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: Props) {
  return (
    <Pressable
      className={`flex-row items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? "w-full" : ""
      } ${disabled || loading ? "opacity-50" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#7e22ce"}
          size="small"
        />
      ) : (
        <Text
          className={`font-sans-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
