import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui";
import { TYPE_INSIGHTS } from "@/data/typeInsights";
import { insightsSystemPrompt } from "@/lib/persona";
import { chat, type AiMessage } from "@/services/ai";
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

// What we know about your type, plus a real PersonaAI (a language model) you can ask anything.
export function InsightsSection() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile } = useApp();
  const insight = TYPE_INSIGHTS[profile.mbti] ?? TYPE_INSIGHTS.INTJ;

  const [messages, setMessages] = useState<Msg[]>([
    { id: "hi", from: "ai", text: "Hi! I'm PersonaAI 🔮 Ask me anything about your personality, compatibility or growth, in your own words." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const reply = (text: string) => alive.current && setMessages((m) => [...m, { id: `a${Date.now()}`, from: "ai", text }]);

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || typing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next: Msg[] = [...messages, { id: `u${Date.now()}`, from: "user", text: q }];
    setMessages(next);
    setInput("");
    setTyping(true);
    try {
      // The model sees the whole conversation (minus the greeting, which is not part of it).
      const history: AiMessage[] = next.filter((m) => m.id !== "hi").map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
      reply(await chat({ system: insightsSystemPrompt(profile.mbti, profile.name), messages: history, temperature: 0.7 }));
    } catch {
      reply("I could not reach my brain just now. Please try again in a moment.");
    } finally {
      if (alive.current) setTyping(false);
    }
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


        <View style={[styles.inputRow, { marginTop: 14 }]}>
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
    inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    input: { flex: 1, backgroundColor: c.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11, color: c.text, fontFamily: font.regular, fontSize: 14.5, outlineStyle: "none" } as object,
    send: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
  });
