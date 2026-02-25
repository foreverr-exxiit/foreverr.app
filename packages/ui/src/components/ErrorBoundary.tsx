import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "../primitives/Text";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center px-8 bg-white dark:bg-gray-900">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <Pressable
            className="rounded-full bg-brand-700 px-6 py-2.5"
            onPress={this.handleRetry}
          >
            <Text className="text-sm font-sans-semibold text-white">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

/** Inline error display for query errors */
export function QueryError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View className="items-center py-8 px-4">
      <Text className="text-sm font-sans text-red-500 text-center mb-3">
        {message ?? "Failed to load data. Please try again."}
      </Text>
      {onRetry && (
        <Pressable className="rounded-full bg-brand-700 px-5 py-2" onPress={onRetry}>
          <Text className="text-sm font-sans-semibold text-white">Retry</Text>
        </Pressable>
      )}
    </View>
  );
}
