import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { axisInfo, letterLabel, type AxisResult } from "@/lib/mbti";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

export interface EvidenceLine {
  axis: AxisResult["axis"];
  letter: string;
  percent: number;
  note?: string; // why (used by the chat, which explains its reasoning)
}

interface Props {
  type: string;
  axes: EvidenceLine[];
  intro?: string;
  onContinue: () => void;
}

// The result of either way of finding your type: the four letters, how strongly you
// lean on each side, and a button to carry on.
export function TypeResult({ type: code, axes, intro, onContinue }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const info = PERSONALITY_TYPES.find((t) => t.code === code);

  return (
    <View style={styles.root}>
      <Text style={styles.kicker}>{intro ?? "Your type"}</Text>
      <Text style={[styles.code, { color: colors.mbti[code] ?? colors.accent }]}>{code}</Text>
      {info && <Text style={styles.name}>{info.name}</Text>}

      <View style={styles.bars}>
        {axes.map((a) => {
          const meta = axisInfo(a.axis);
          const winsFirst = a.letter === meta.first;
          return (
            <View key={a.axis} style={{ gap: 6 }}>
              <View style={styles.barLabels}>
                <Text style={[styles.pole, winsFirst && styles.poleOn]}>{meta.firstLabel}</Text>
                <Text style={[styles.pole, !winsFirst && styles.poleOn]}>{meta.secondLabel}</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${a.percent}%`, alignSelf: winsFirst ? "flex-start" : "flex-end", backgroundColor: colors.accent }]} />
              </View>
              <Text style={[styles.percent, { alignSelf: winsFirst ? "flex-start" : "flex-end" }]}>
                {letterLabel(a.letter as never)} {a.percent}%
              </Text>
              {a.note ? <Text style={styles.note}>{a.note}</Text> : null}
            </View>
          );
        })}
      </View>

      <Button label="Continue" onPress={onContinue} />
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, paddingHorizontal: 24, justifyContent: "center", gap: 14, paddingBottom: 30 },
    kicker: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14, textAlign: "center", letterSpacing: 0.4 },
    code: { fontFamily: font.bold, fontSize: 60, textAlign: "center", letterSpacing: 2 },
    name: { ...type.heading, color: c.text, textAlign: "center", marginTop: -6 },
    bars: { gap: 18, marginVertical: 14, backgroundColor: c.surface, borderRadius: radius.xl, padding: 18 },
    barLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    pole: { color: c.textTertiary, fontFamily: font.medium, fontSize: 12.5 },
    poleOn: { color: c.text, fontFamily: font.semibold },
    percent: { color: c.accent, fontFamily: font.semibold, fontSize: 12.5 },
    track: { height: 8, borderRadius: 4, backgroundColor: c.surfaceStrong, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 4 },
    note: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12.5, lineHeight: 17 },
  });
