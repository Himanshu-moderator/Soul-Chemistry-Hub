import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card, SectionTitle } from "@/components/ui";
import { bigFiveFor } from "@/lib/personality";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

export type TypeField = "mbti" | "enneagram" | "socionics";

interface Props {
  onPick: (field: TypeField) => void;
}

const BIG_FIVE: Record<string, string> = { O: "Openness", C: "Conscientiousness", E: "Extraversion", A: "Agreeableness", N: "Neuroticism" };

// Your three types and a Big Five sketch.
export function OverviewSection({ onPick }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile } = useApp();

  const types: { field: TypeField; label: string; value: string; tint: string }[] = [
    { field: "mbti", label: "MBTI", value: profile.mbti, tint: colors.mbti[profile.mbti] ?? colors.accent },
    { field: "enneagram", label: "Enneagram", value: profile.enneagram, tint: colors.cyan },
    { field: "socionics", label: "Socionics", value: profile.socionics, tint: colors.gold },
  ];

  return (
    <View style={{ gap: 26 }}>
      <View>
        <SectionTitle title="Your types" />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {types.map((t) => (
            <Pressable key={t.field} onPress={() => onPick(t.field)} style={[styles.typeCard, { backgroundColor: withAlpha(t.tint, 0.13) }]} accessibilityRole="button" accessibilityLabel={`Change ${t.label}`}>
              <Text style={[styles.typeLabel, { color: t.tint }]}>{t.label}</Text>
              <Text style={styles.typeValue}>{t.value}</Text>
              <Feather name="chevron-down" size={14} color={t.tint} />
            </Pressable>
          ))}
        </View>
      </View>

      <View>
        <SectionTitle title="Big Five sketch" />
        <Card padding={18}>
          <View style={{ gap: 14 }}>
            {Object.entries(bigFiveFor(profile.mbti)).map(([key, value]) => (
              <View key={key} style={{ gap: 6 }}>
                <View style={styles.barLabels}>
                  <Text style={styles.barName}>{BIG_FIVE[key]}</Text>
                  <Text style={styles.barValue}>{value}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${value}%`, backgroundColor: colors.accent }]} />
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.footnote}>An illustrative sketch implied by your type, not a test result.</Text>
        </Card>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    typeCard: { flex: 1, borderRadius: 18, paddingVertical: 14, alignItems: "center", gap: 3 },
    typeLabel: { fontFamily: font.semibold, fontSize: 11.5, letterSpacing: 0.5, textTransform: "uppercase" },
    typeValue: { color: c.text, fontFamily: font.bold, fontSize: 20 },
    barLabels: { flexDirection: "row", justifyContent: "space-between" },
    barName: { color: c.text, fontFamily: font.medium, fontSize: 14 },
    barValue: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 14 },
    track: { height: 7, borderRadius: 4, backgroundColor: c.surfaceStrong, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 4 },
    footnote: { ...type.caption, color: c.textTertiary, marginTop: 14 },
  });
