import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import type { Answer } from "@/lib/mbti";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface Props {
  value?: Answer;
  onChange: (value: Answer) => void;
}

const VALUES: Answer[] = [1, 2, 3, 4, 5];
const SIZES = [46, 38, 32, 38, 46]; // the ends are the strongest answers, so they are the biggest
const LABELS = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

// A five-point agree / disagree scale: five round buttons from "strongly disagree" to
// "strongly agree".
export function LikertScale({ value, onChange }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.row}>
        {VALUES.map((v, i) => {
          const on = value === v;
          const agree = v > 3;
          const tint = v === 3 ? colors.textTertiary : agree ? colors.accent : colors.accentAlt;
          return (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityLabel={LABELS[i]}
              accessibilityState={{ selected: on }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(v);
              }}
              style={[styles.dot, { width: SIZES[i], height: SIZES[i], borderRadius: SIZES[i] / 2, borderColor: tint, backgroundColor: on ? tint : withAlpha(tint, 0.1) }]}
            />
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>Disagree</Text>
        <Text style={styles.end}>Agree</Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    dot: { borderWidth: 2 },
    ends: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    end: { color: c.textTertiary, fontFamily: font.medium, fontSize: 13 },
  });
