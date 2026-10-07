import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { LogoMark } from "@/components/brand/Logo";
import { Button, IconButton, TextField } from "@/components/ui";
import { useAuth } from "@/state/AuthContext";
import { useStyles } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

type Step = "signin" | "signup" | "forgot" | "confirm" | "reset-sent";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COPY: Record<"signin" | "signup" | "forgot", { title: string; sub: string; cta: string }> = {
  signin: { title: "Welcome back", sub: "Sign in to pick up where you left off.", cta: "Sign in" },
  signup: { title: "Create your account", sub: "Save your type, your communities and your chats across devices.", cta: "Create account" },
  forgot: { title: "Reset your password", sub: "Enter your email and we'll send you a link to choose a new one.", cta: "Send reset link" },
};

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const params = useLocalSearchParams<{ mode?: string }>();
  const { signIn, signUp, sendPasswordReset, resendConfirmation, startDemo, backendConfigured } = useAuth();

  const [step, setStep] = useState<Step>(params.mode === "signup" ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const go = (next: Step) => {
    setStep(next);
    setError(null);
    setNotice(null);
  };

  const submit = async () => {
    if (step === "confirm" || step === "reset-sent") return;
    setError(null);
    setNotice(null);
    if (step === "signup" && name.trim().length < 1) return setError("Tell us what to call you.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (step !== "forgot" && password.length < 8) return setError("Your password needs at least 8 characters.");

    setBusy(true);
    try {
      if (step === "signin") {
        const r = await signIn(email, password);
        if (!r.ok) setError(r.error); // on success the route gate moves us into the app
      } else if (step === "signup") {
        const r = await signUp(email, password, name);
        if (!r.ok) setError(r.error);
        else if (r.needsConfirmation) go("confirm");
      } else {
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

  const done = step === "confirm" || step === "reset-sent";
  const form = !done ? COPY[step as "signin" | "signup" | "forgot"] : null;

  return (
    <CosmicBackground variant="starry">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.top}>
            <IconButton icon="arrow-left" label="Back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
            <LogoMark size={40} />
            <View style={{ width: 40 }} />
          </View>

          {done ? (
            <View style={styles.centered}>
              <Text style={styles.bigEmoji}>{step === "confirm" ? "📬" : "🔑"}</Text>
              <Text style={styles.title}>Check your email</Text>
              <Text style={[styles.sub, { textAlign: "center" }]}>
                {step === "confirm"
                  ? `We sent a confirmation link to ${email.trim()}. Open it, then come back and sign in.`
                  : `If an account exists for ${email.trim()}, a reset link is on its way.`}
              </Text>
              {notice && <Text style={styles.notice}>{notice}</Text>}
              {error && <Text style={styles.error}>{error}</Text>}
              <View style={styles.stack}>
                <Button label="Go to sign in" onPress={() => go("signin")} />
                {step === "confirm" && <Button label="Didn't get it? Send again" variant="ghost" size="sm" onPress={resend} loading={busy} />}
              </View>
            </View>
          ) : (
            form && (
              <>
                <Text style={styles.title}>{form.title}</Text>
                <Text style={styles.sub}>{form.sub}</Text>

                {!backendConfigured && (
                  <View style={styles.banner}>
                    <Text style={styles.bannerText}>Accounts aren't connected in this build. You can still try the demo.</Text>
                  </View>
                )}

                <View style={styles.fields}>
                  {step === "signup" && (
                    <TextField label="Your name" value={name} onChangeText={setName} placeholder="Alex" autoCapitalize="words" maxLength={40} textContentType="name" />
                  )}
                  <TextField
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    autoComplete="email"
                  />
                  {step !== "forgot" && (
                    <TextField
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      placeholder={step === "signup" ? "At least 8 characters" : "Your password"}
                      secret
                      autoCapitalize="none"
                      textContentType={step === "signup" ? "newPassword" : "password"}
                      onSubmitEditing={submit}
                    />
                  )}
                </View>

                {error && <Text style={styles.error}>{error}</Text>}

                <View style={styles.stack}>
                  <Button label={form.cta} onPress={submit} loading={busy} disabled={!backendConfigured} />
                  {step === "signin" && <Button label="Forgot your password?" variant="ghost" size="sm" onPress={() => go("forgot")} />}
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchText}>{step === "signup" ? "Already have an account?" : step === "forgot" ? "Remembered it?" : "New here?"}</Text>
                  <Pressable onPress={() => go(step === "signup" || step === "forgot" ? "signin" : "signup")}>
                    <Text style={styles.link}>{step === "signup" || step === "forgot" ? "Sign in" : "Create account"}</Text>
                  </Pressable>
                </View>

                <View style={styles.divider}>
                  <View style={styles.line} />
                  <Text style={styles.or}>or</Text>
                  <View style={styles.line} />
                </View>

                <Button label="Try the demo" variant="secondary" icon="play-circle" onPress={startDemo} />
              </>
            )
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </CosmicBackground>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    content: { paddingHorizontal: 24, flexGrow: 1, gap: 14 },
    top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
    title: { ...type.title, color: c.text, fontSize: 30, lineHeight: 36 },
    sub: { ...type.body, color: c.textSecondary, marginBottom: 6 },
    fields: { gap: 16, marginTop: 4 },
    stack: { gap: 8, marginTop: 8, alignSelf: "stretch" },
    error: { color: c.danger, fontFamily: font.regular, fontSize: 14, lineHeight: 20 },
    notice: { color: c.success, fontFamily: font.medium, fontSize: 14 },
    switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
    switchText: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14 },
    link: { color: c.accent, fontFamily: font.semibold, fontSize: 14 },
    divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 8 },
    line: { flex: 1, height: 1, backgroundColor: c.border },
    or: { color: c.textTertiary, fontFamily: font.regular, fontSize: 13 },
    banner: { backgroundColor: "rgba(251,191,36,0.12)", borderRadius: 14, padding: 12 },
    bannerText: { color: c.warning, fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
    centered: { alignItems: "center", gap: 14, paddingTop: 36 },
    bigEmoji: { fontSize: 56 },
  });
