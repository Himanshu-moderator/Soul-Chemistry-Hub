import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

// Public, safe-to-ship values (the anon key only does what Row Level Security
// allows). Set them in artifacts/mobile/.env, see .env.example.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// False in builds without a backend: the app then offers the demo only.
export const backendConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = backendConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Only the web build can land on a reset-password link.
        detectSessionInUrl: Platform.OS === "web",
      },
    })
  : null;
