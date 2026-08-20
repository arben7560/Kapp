import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  processLock,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

let supabaseClient: SupabaseClient | null = null;

if (isSupabaseConfigured && supabaseUrl && supabasePublishableKey) {
  supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      lock: processLock,
    },
  });
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

let authLifecycleSubscriptions = 0;
let authLifecycleCleanup: (() => void) | null = null;

export function retainSupabaseAuthLifecycle(): () => void {
  const client = getSupabaseClient();
  if (!client || Platform.OS === "web") return () => undefined;

  authLifecycleSubscriptions += 1;
  if (!authLifecycleCleanup) {
    if (AppState.currentState === "active") {
      client.auth.startAutoRefresh();
    } else {
      client.auth.stopAutoRefresh();
    }
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        client.auth.startAutoRefresh();
      } else {
        client.auth.stopAutoRefresh();
      }
    });
    authLifecycleCleanup = () => {
      subscription.remove();
      client.auth.stopAutoRefresh();
      authLifecycleCleanup = null;
    };
  }

  return () => {
    authLifecycleSubscriptions = Math.max(0, authLifecycleSubscriptions - 1);
    if (authLifecycleSubscriptions === 0) authLifecycleCleanup?.();
  };
}
