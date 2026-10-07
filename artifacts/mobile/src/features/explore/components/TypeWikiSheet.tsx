import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card, Sheet, TypeBadge } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { TYPE_INSIGHTS } from "@/data/typeInsights";
import { useStyles } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  visible: boolean;
  onClose: () => void;
  mbti: string;
}

const FACTS: [string, keyof (typeof TYPE_INSIGHTS)[string], string][] = [
  ["Strength", "strength", "💪"],
  ["Growth", "growth", "🌱"],
  ["Careers", "career", "💼"],
  ["Love & friendship", "love", "💞"],
];

// A short reference card for one personality type.
export function TypeWikiSheet({ visible, onClose, mbti }: Props) {
  const styles = useStyles(makeStyles);
  const info = PERSONALITY_TYPES.find((t) => t.code === mbti);
  const insight = TYPE_INSIGHTS[mbti];

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.head}>
        <TypeBadge type={mbti} size="lg" />
        <Text style={styles.name}>{info?.name}</Text>
        <Text style={styles.tag}>{info?.tagline}</Text>
      </View>
      {insight &&
        FACTS.map(([label, key, emoji]) => (
          <Card key={key} padding={14}>
            <Text style={styles.label}>
              {emoji}  {label}
            </Text>
            <Text style={styles.value}>{insight[key]}</Text>
          </Card>
        ))}
    </Sheet>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    head: { alignItems: "flex-start", gap: 6 },
    name: { ...type.title, color: c.text },
    tag: { ...type.body, color: c.textSecondary },
    label: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 12.5, marginBottom: 4 },
    value: { color: c.text, fontFamily: font.regular, fontSize: 15, lineHeight: 22 },
  });
