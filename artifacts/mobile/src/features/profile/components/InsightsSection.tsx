import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui";
import { TYPE_INSIGHTS } from "@/data/typeInsights";
import { personaReply } from "@/lib/personaReply";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Msg {
  id: string;
  from: "ai" | "user";
  text: string;
}

const CARDS: { key: "strength" | "growth" | "career" | "love"; title: string; emoji: string }[] = [
  { key: "strength", title: "Core strength", emoji: "💪" },
  { key: "growth", title: "Growth path", emoji: "🌱" },
  { key: "career", title: "Career matches", emoji: "💼" },
  { key: "love", title: "Love & chemistry", emoji: "💞" },
];

const QUICK = ["Compatible types?", "My strengths", "Growth areas", "Career paths"];

// What we know about your type, plus a (scripted) PersonaAI you can ask.
export function InsightsSection() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile } = useApp();
  const insight = TYPE_INSIGHTS[profile.mbti] ?? TYPE_INSIGHTS.INTJ;

  const [messages, setMessages] = useState<Msg[]>([
    { id: "hi", from: "ai", text: "Hi! I'm PersonaAI 🔮 Ask me anything about your personality, compatibility or growth." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((m) => [...m, { id: `u${Date.now()}`, from: "user", text: q }]);
    setInput("");
    setTyping(true);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, from: "ai", text: personaReply(profile.mbti, q) }]);
      setTyping(false);
    }, 1000);
  };

  return (
    <View style={{ gap: 22 }}>
      <View style={styles.grid}>
        {CARDS.map((c) => (
          <Card key={c.key} style={styles.card} padding={14}>
            <Text style={styles.cardTitle}>
              {c.emoji}  {c.title}
            </Text>
            <Text style={styles.cardText}>{insight[c.key]}</Text>
          </Card>
        ))}
      </View>

      <Card padding={14}>
        <View style={styles.chatHead}>
          <View style={{ width: 30, height: 30, flexShrink: 0 }}><LogoMark size={30} /></View>
          <View>
            <Text style={styles.chatTitle}>Ask PersonaAI</Text>
            <Text style={styles.chatSub}>Answers based on your {profile.mbti} profile</Text>
          </View>
        </View>

        <View style={{ gap: 10, marginTop: 14 }}>
          {messages.map((m) =>
            m.from === "ai" ? (
              <View key={m.id} style={[styles.bubble, styles.ai]}>
                <Text style={styles.text}>{m.text}</Text>
              </View>
            ) : (
              <LinearGradient key={m.id} colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, styles.me]}>
                <Text style={[styles.text, { color: colors.onAccent }]}>{m.text}</Text>
              </LinearGradient>
            )
          )}
          {typing && (
            <View style={[styles.bubble, styles.ai]}>
              <Text style={[styles.text, { color: colors.textSecondary }]}>Thinking…</Text>
            </View>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 14 }}>
          {QUICK.map((q) => (
            <Pressable key={q} onPress={() => ask(q)} style={styles.quick}>
              <Text style={styles.quickText}>{q}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your personality"
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={() => ask(input)}
            accessibilityLabel="Ask PersonaAI"
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send" onPress={() => ask(input)} style={[styles.send, { opacity: input.trim() ? 1 : 0.5 }]}>
            <Ionicons name="arrow-up" size={18} color={colors.onAccent} />
          </Pressable>
        </View>
      </Card>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    grid: { gap: 12 },
    card: { gap: 4 },
    cardTitle: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 12.5 },
    cardText: { color: c.text, fontFamily: font.medium, fontSize: 15.5, lineHeight: 22 },
    chatHead: { flexDirection: "row", alignItems: "center", gap: 10 },
    chatTitle: { color: c.text, fontFamily: font.semibold, fontSize: 15.5 },
    chatSub: { ...type.caption, color: c.textTertiary },
    bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "88%" },
    ai: { backgroundColor: c.surfaceStrong, alignSelf: "flex-start", borderBottomLeftRadius: 5 },
    me: { alignSelf: "flex-end", borderBottomRightRadius: 5 },
    text: { color: c.text, fontFamily: font.regular, fontSize: 14.5, lineHeight: 21 },
    quick: { backgroundColor: c.accentSoft, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
    quickText: { color: c.accent, fontFamily: font.semibold, fontSize: 13 },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    input: { flex: 1, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, color: c.text, fontFamily: font.regular, fontSize: 14.5, outlineStyle: "none" } as object,
    send: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
  });
