import { View, type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props extends ViewProps {
  safe?: boolean;
  padded?: boolean;
}

export function ScreenWrapper({
  safe = true,
  padded = true,
  className = "",
  children,
  ...props
}: Props) {
  const Wrapper = safe ? SafeAreaView : View;

  return (
    <Wrapper
      className={`flex-1 bg-white dark:bg-gray-900 ${
        padded ? "px-4" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Wrapper>
  );
}
