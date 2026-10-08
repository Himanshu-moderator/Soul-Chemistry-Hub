import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isFinished, questionOrder, scoreTest, type Answer, type Answers } from "@/lib/mbti";
import { useStyles } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { LikertScale } from "../components/LikertScale";
import { TypeResult } from "../components/TypeResult";

interface Props {
  onResult: (type: string) => void;
  onProgress: (fraction: number) => void;
}

// The classic questionnaire: about 32 statements you agree or disagree with. Axes that
// come out too close to call get two extra statements to settle them (so 32 to 40
// questions). The result screen shows how strongly you lean on each side.
export function QuizStep({ onResult, onProgress }: Props) {
  const styles = useStyles(makeStyles);
  const [answers, setAnswers] = useState<Answers>({});
  const [position, setPosition] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const order = useMemo(() => questionOrder(answers), [answers]);
  const question = order[position];

  const answer = (value: Answer) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    const nextOrder = questionOrder(next);
    onProgress(0.2 + (Math.min(position + 1, nextOrder.length) / nextOrder.length) * 0.6);
    if (position + 1 < nextOrder.length) setPosition(position + 1);
    else if (isFinished(next)) setShowResult(true);
  };

  if (showResult) {
    const result = scoreTest(answers);
    return <TypeResult type={result.type} axes={result.axes.map((a) => ({ axis: a.axis, letter: a.letter, percent: a.percent }))} onContinue={() => onResult(result.type)} />;
  }

  return (
    <View style={styles.root}>
      <Text style={styles.count}>
        Question {position + 1} of {order.length}
      </Text>
      <Text style={styles.question}>{question.text}</Text>
      <View style={{ marginTop: 44 }}>
        <LikertScale value={answers[question.id]} onChange={answer} />
      </View>
      {/* always laid out, so the answer buttons never jump when it appears */}
      <Pressable accessibilityRole="button" disabled={position === 0} onPress={() => setPosition(position - 1)} hitSlop={12} style={[styles.previous, { opacity: position === 0 ? 0 : 1 }]}>
        <Text style={styles.previousText}>Previous question</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, paddingHorizontal: 28, justifyContent: "center", paddingBottom: 60 },
    count: { color: c.accent, fontFamily: font.semibold, fontSize: 13, textAlign: "center", letterSpacing: 1, textTransform: "uppercase" },
    question: { ...type.title, color: c.text, textAlign: "center", marginTop: 16, minHeight: 100 },
    previous: { alignSelf: "center", marginTop: 40 },
    previousText: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14 },
  });
