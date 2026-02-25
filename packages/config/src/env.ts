import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  supabaseUrl: (extra.SUPABASE_URL as string) || process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: (extra.SUPABASE_ANON_KEY as string) || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  revenueCatApiKey: (extra.REVENUECAT_API_KEY as string) || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "",
  appUrl: "https://foreverr.app",
} as const;
