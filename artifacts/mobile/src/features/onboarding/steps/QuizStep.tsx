import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { QUIZ_QUESTIONS } from "../content";

interface Props {
  onResult: (type: string) => void;
  onProgress: (fraction: number) => void;
}

// The four-question quiz: each answer adds one letter of the type.
export function QuizStep({ onResult, onProgress }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [index, setIndex] = useState(0);
  const [letters, setLetters] = useState<string[]>([]);
  const q = QUIZ_QUESTIONS[index];

  const answer = (letter: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...letters, letter];
    setLetters(next);
    onProgress(0.2 + (next.length / QUIZ_QUESTIONS.length) * 0.6);
    if (index < QUIZ_QUESTIONS.length - 1) setIndex(index + 1);
    else onResult(next.join(""));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.count}>
        {index + 1} / {QUIZ_QUESTIONS.length}
      </Text>
      <Text style={styles.question}>{q.q}</Text>
      <View style={{ gap: 12, marginTop: 28 }}>
        {q.a.map((label, i) => (
          <Pressable key={label} onPress={() => answer(q.dim[i])} style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.surfaceStrong }]}>
            <Text style={styles.optionText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, paddingHorizontal: 24, justifyContent: "center", paddingBottom: 60 },
    count: { color: c.accent, fontFamily: font.semibold, fontSize: 14, textAlign: "center", letterSpacing: 1 },
    question: { ...type.title, color: c.text, textAlign: "center", marginTop: 12 },
    option: { backgroundColor: c.surface, borderRadius: radius.lg, paddingVertical: 20, paddingHorizontal: 22 },
    optionText: { color: c.text, fontFamily: font.medium, fontSize: 17, textAlign: "center" },
  });
