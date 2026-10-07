import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session, User } from "@supabase/supabase-js";
import { backendConfigured, supabase } from "@/services/supabase";

// none: signed out. demo: everything is local sample data on this device.
// account: a real signed-in user whose data lives in the backend.
export type Mode = "none" | "demo" | "account";

const MODE_KEY = "pdb_mode";

export type AuthResult = { ok: true; needsConfirmation?: boolean } | { ok: false; error: string };

type AuthContextType = {
  ready: boolean;
  mode: Mode;
  user: User | null;
  backendConfigured: boolean;
  startDemo: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  // Ends a demo or signs out of the account.
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Turns backend errors into something a person can act on.
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again, or reset your password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password") && m.includes("characters")) return "Your password needs at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("network") || m.includes("fetch")) return "Couldn't reach the server. Check your connection and try again.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<Mode>("none");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: string | null = null;
      try {
        stored = await AsyncStorage.getItem(MODE_KEY);
      } catch {
        // storage unavailable: start signed out
      }
      let current: Session | null = null;
      if (supabase) {
        try {
          current = (await supabase.auth.getSession()).data.session;
        } catch {
          // offline: fall through
        }
      }
      if (cancelled) return;
      setSession(current);
      setMode(current ? "account" : stored === "demo" ? "demo" : "none");
      setReady(true);
    })();

    const sub = supabase?.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) setMode("account");
      else setMode((m) => (m === "account" ? "none" : m));
    });
    return () => {
      cancelled = true;
      sub?.data.subscription.unsubscribe();
    };
  }, []);

  const startDemo = useCallback(async () => {
    try {
      await AsyncStorage.setItem(MODE_KEY, "demo");
    } catch {
      // not persisted: the demo still works for this visit
    }
    setMode("demo");
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Accounts aren't available in this build. Try the demo instead." };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    // Supabase hides duplicate emails by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0)
      return { ok: false, error: friendlyAuthError("User already registered") };
    return { ok: true, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Accounts aren't available in this build. Try the demo instead." };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Accounts aren't available in this build." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const resendConfirmation = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) return { ok: false, error: "Accounts aren't available in this build." };
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    if (error) return { ok: false, error: friendlyAuthError(error.message) };
    return { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(MODE_KEY);
    } catch {
      // nothing to clear
    }
    if (supabase && session) await supabase.auth.signOut();
    setSession(null);
    setMode("none");
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        ready,
        mode,
        user: session?.user ?? null,
        backendConfigured,
        startDemo,
        signUp,
        signIn,
        sendPasswordReset,
        resendConfirmation,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
