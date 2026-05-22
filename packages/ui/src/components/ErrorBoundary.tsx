import React from "react";
import { View, Pressable, Platform } from "react-native";
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error("[ErrorBoundary] Caught error:", error?.message);
    console.error("[ErrorBoundary] Component stack:", errorInfo?.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    // On web, navigate to root; on native, just retry (router may not be available)
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center px-8 bg-white dark:bg-gray-900">
          <Text className="text-4xl mb-4">{"⚠️"}</Text>
          <Text className="text-lg font-sans-bold text-gray-900 dark:text-white mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-sm font-sans text-gray-500 text-center mb-6">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </Text>
          <View style={{ gap: 10, alignItems: "center" }}>
            <Pressable
              className="rounded-full bg-brand-700 px-6 py-2.5"
              onPress={this.handleRetry}
            >
              <Text className="text-sm font-sans-semibold text-white">Try Again</Text>
            </Pressable>
            <Pressable
              className="rounded-full bg-gray-200 dark:bg-gray-700 px-6 py-2.5"
              onPress={this.handleGoHome}
            >
              <Text className="text-sm font-sans-semibold text-gray-700 dark:text-gray-300">Go Home</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/** Inline error boundary for individual sections — prevents one section crash from killing the whole screen */
export class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[SectionErrorBoundary] Caught error:", error?.message);
    console.error("[SectionErrorBoundary] Component stack:", errorInfo?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
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
