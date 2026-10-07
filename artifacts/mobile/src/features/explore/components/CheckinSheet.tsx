import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button, Sheet } from "@/components/ui";
import { KNOWLEDGE_QUESTIONS } from "@/data/mockData";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface Props {
  visible: boolean;
  onClose: () => void;
  // Called when the answer is right; pays out the coins.
  onCorrect: (coins: number) => void;
}

// A day's check-in question: answer it right to earn coins and extend your streak.
export function CheckinSheet({ visible, onClose, onCorrect }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  // One question per calendar day, so everyone sees the same one.
  const q = KNOWLEDGE_QUESTIONS[Math.floor(Date.now() / 86_400_000) % KNOWLEDGE_QUESTIONS.length];
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setPicked(null);
  }, [visible]);

  const answered = picked !== null;
  const right = picked === q.correct;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCorrect(q.coins);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Daily check-in">
      <Text style={styles.reward}>Answer correctly to earn +{q.coins} coins</Text>
      <Text style={styles.question}>{q.question}</Text>
      <View style={{ gap: 10 }}>
        {q.options.map((option, i) => {
          const isRight = answered && i === q.correct;
          const isWrong = answered && i === picked && !right;
          return (
            <Pressable
              key={option}
              disabled={answered}
              onPress={() => choose(i)}
              style={[
                styles.option,
                isRight && { backgroundColor: withAlpha(colors.success, 0.18), borderColor: colors.success },
                isWrong && { backgroundColor: withAlpha(colors.danger, 0.18), borderColor: colors.danger },
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered && (
        <View style={{ gap: 12 }}>
          <Text style={[styles.result, { color: right ? colors.success : colors.danger }]}>
            {right ? `Correct! +${q.coins} coins` : "Not quite, but you'll get tomorrow's"}
          </Text>
          <Text style={styles.explain}>{q.explanation}</Text>
          <Button label="Done" onPress={onClose} />
        </View>
      )}
    </Sheet>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    reward: { color: c.gold, fontFamily: font.semibold, fontSize: 13.5 },
    question: { ...type.heading, color: c.text, lineHeight: 26 },
    option: { backgroundColor: c.surface, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: 16, borderWidth: 1.5, borderColor: "transparent" },
    optionText: { color: c.text, fontFamily: font.medium, fontSize: 15 },
    result: { fontFamily: font.bold, fontSize: 16 },
    explain: { ...type.body, color: c.textSecondary },
  });
