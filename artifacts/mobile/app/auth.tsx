import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

type Screen = "signin" | "signup" | "forgot" | "confirm" | "reset-sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { signIn, signUp, sendPasswordReset, resendConfirmation, startDemo, backendConfigured } = useAuth();

  const [screen, setScreen] = useState<Screen>(params.mode === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (next: Screen) => {
    setScreen(next);
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (screen === "signup" && name.trim().length < 1) return setError("Tell us what to call you.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (screen !== "forgot" && password.length < 8) return setError("Your password needs at least 8 characters.");

    setBusy(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (screen === "signin") {
        const r = await signIn(email, password);
        if (!r.ok) setError(r.error);
        // On success the route gate takes over and moves us into the app.
      } else if (screen === "signup") {
        const r = await signUp(email, password, name);
        if (!r.ok) setError(r.error);
        else if (r.needsConfirmation) go("confirm");
      } else if (screen === "forgot") {
        const r = await sendPasswordReset(email);
        if (!r.ok) setError(r.error);
        else go("reset-sent");
      }
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    const r = await resendConfirmation(email);
    setBusy(false);
    if (r.ok) setNotice("Sent again. It can take a minute to arrive.");
    else setError(r.error);
  };

  const heading =
    screen === "signup" ? "Create your account" : screen === "forgot" ? "Reset your password" : "Welcome back";
  const sub =
    screen === "signup"
      ? "Save your type, your communities and your chats across devices."
      : screen === "forgot"
      ? "Enter your email and we'll send you a link to choose a new password."
      : "Sign in to pick up where you left off.";

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          accessibilityLabel="Back"
          style={styles.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        >
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {screen === "confirm" || screen === "reset-sent" ? (
          <View style={styles.centerBlock}>
            <Text style={styles.bigEmoji}>{screen === "confirm" ? "📬" : "🔑"}</Text>
            <Text style={styles.heading}>Check your email</Text>
            <Text style={styles.sub}>
              {screen === "confirm"
                ? `We sent a confirmation link to ${email.trim()}. Open it, then come back and sign in.`
                : `If an account exists for ${email.trim()}, a reset link is on its way.`}
            </Text>
            {notice && <Text style={styles.notice}>{notice}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => go("signin")}>
              <Text style={styles.primaryBtnText}>Go to sign in</Text>
            </TouchableOpacity>
            {screen === "confirm" && (
              <TouchableOpacity onPress={resend} disabled={busy} style={styles.linkBtn}>
                <Text style={styles.link}>Didn't get it? Send again</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.sub}>{sub}</Text>

            {!backendConfigured && (
              <View style={styles.banner}>
                <Text style={styles.bannerText}>Accounts aren't connected in this build. You can still try the demo.</Text>
              </View>
            )}

            <View style={styles.form}>
              {screen === "signup" && (
                <View>
                  <Text style={styles.label}>Your name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Alex"
                    placeholderTextColor={COLORS.textTertiary}
                    autoCapitalize="words"
                    maxLength={40}
                    textContentType="name"
                  />
                </View>
              )}
              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                />
              </View>
              {screen !== "forgot" && (
                <View>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={screen === "signup" ? "At least 8 characters" : "Your password"}
                      placeholderTextColor={COLORS.textTertiary}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      textContentType={screen === "signup" ? "newPassword" : "password"}
                      onSubmitEditing={submit}
                    />
                    <Pressable
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      onPress={() => setShowPassword((v) => !v)}
                      style={styles.eye}
                    >
                      <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={COLORS.textSecondary} />
                    </Pressable>
                  </View>
                </View>
              )}

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.primaryBtn, (busy || !backendConfigured) && { opacity: 0.6 }]}
                onPress={submit}
                disabled={busy || !backendConfigured}
              >
                {busy ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {screen === "signup" ? "Create account" : screen === "forgot" ? "Send reset link" : "Sign in"}
                  </Text>
                )}
              </TouchableOpacity>

              {screen === "signin" && (
                <TouchableOpacity onPress={() => go("forgot")} style={styles.linkBtn}>
                  <Text style={styles.link}>Forgot your password?</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {screen === "signup" ? "Already have an account?" : screen === "forgot" ? "Remembered it?" : "New here?"}
              </Text>
              <TouchableOpacity onPress={() => go(screen === "signup" || screen === "forgot" ? "signin" : "signup")}>
                <Text style={styles.link}>{screen === "signup" || screen === "forgot" ? "Sign in" : "Create account"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.demoBtn} onPress={startDemo}>
              <Feather name="play-circle" size={18} color={COLORS.accent} />
              <Text style={styles.demoText}>Try the demo, no account needed</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 24, flexGrow: 1 },
  back: { width: 40, height: 40, justifyContent: "center", marginBottom: 12 },
  heading: { color: COLORS.textPrimary, fontSize: 28, fontWeight: "800", marginBottom: 8 },
  sub: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  form: { gap: 16 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eye: { position: "absolute", right: 6, padding: 12 },
  error: { color: COLORS.accentRed, fontSize: 14, lineHeight: 20 },
  notice: { color: "#22C55E", fontSize: 14, marginTop: 8 },
  primaryBtn: {
    backgroundColor: "#7C4DFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    alignSelf: "stretch",
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  linkBtn: { alignItems: "center", paddingVertical: 6 },
  link: { color: "#B39DFF", fontSize: 14, fontWeight: "600" },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 24 },
  switchText: { color: COLORS.textSecondary, fontSize: 14 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.glassBorder },
  dividerText: { color: COLORS.textTertiary, fontSize: 13 },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    paddingVertical: 15,
  },
  demoText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "600" },
  banner: { backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 12, padding: 12, marginBottom: 16 },
  bannerText: { color: "#F59E0B", fontSize: 13, lineHeight: 18 },
  centerBlock: { alignItems: "center", gap: 14, paddingTop: 40 },
  bigEmoji: { fontSize: 56 },
});
