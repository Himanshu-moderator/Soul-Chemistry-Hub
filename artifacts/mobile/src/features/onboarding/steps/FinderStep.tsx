import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  onChoose: (method: "ai" | "quiz" | "known") => void;
}

// Step 2: how do you want to find your type?
export function FinderStep({ onChoose }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  const option = (method: "ai" | "quiz", emoji: string, title: string, sub: string, hero = false) => (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChoose(method);
      }}
      style={({ pressed }) => [styles.optionWrap, pressed && { transform: [{ scale: 0.985 }] }]}
    >
      {hero ? (
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.option}>
          <Text style={styles.optionEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionTitle, { color: colors.onAccent }]}>{title}</Text>
            <Text style={[styles.optionSub, { color: "rgba(255,255,255,0.8)" }]}>{sub}</Text>
          </View>
          <Feather name="arrow-right" size={20} color={colors.onAccent} />
        </LinearGradient>
      ) : (
        <View style={[styles.option, { backgroundColor: colors.surface }]}>
          <Text style={styles.optionEmoji}>{emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>{title}</Text>
            <Text style={styles.optionSub}>{sub}</Text>
          </View>
          <Feather name="arrow-right" size={20} color={colors.textSecondary} />
        </View>
      )}
    </Pressable>
  );

  return (
    <View style={styles.content}>
      <Text style={styles.emoji}>🔮</Text>
      <Text style={styles.title}>Find your type</Text>
      <Text style={styles.sub}>Chat with PersonaAI or take a quick quiz. It takes about two minutes.</Text>

      <View style={{ gap: 12, marginTop: 18 }}>
        {option("ai", "🤖", "Chat with PersonaAI", "A friendly conversation · 2 min", true)}
        {option("quiz", "📝", "Quick quiz", "Four questions · the classic test")}
      </View>

      <Pressable onPress={() => onChoose("known")} style={styles.known} hitSlop={10}>
        <Text style={styles.knownText}>I already know my type</Text>
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    content: { flex: 1, paddingHorizontal: 24, justifyContent: "center", paddingBottom: 40 },
    emoji: { fontSize: 52, textAlign: "center" },
    title: { ...type.title, color: c.text, textAlign: "center", marginTop: 8 },
    sub: { ...type.body, color: c.textSecondary, textAlign: "center", marginTop: 6 },
    optionWrap: { borderRadius: radius.lg, overflow: "hidden" },
    option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: radius.lg },
    optionEmoji: { fontSize: 30 },
    optionTitle: { color: c.text, fontFamily: font.semibold, fontSize: 17 },
    optionSub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 13, marginTop: 2 },
    known: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 26 },
    knownText: { color: c.textSecondary, fontFamily: font.medium, fontSize: 15 },
  });
