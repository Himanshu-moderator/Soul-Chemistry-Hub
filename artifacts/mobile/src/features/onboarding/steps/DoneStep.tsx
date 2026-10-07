import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { COMPATIBLE_TYPES } from "@/lib/personality";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { TYPE_EMOJIS } from "../content";

interface Props {
  type: string;
  onEnter: () => void;
}

// The last step: your result and the way into the app.
export function DoneStep({ type: code, onEnter }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const info = PERSONALITY_TYPES.find((t) => t.code === code);
  const tint = colors.mbti[code] ?? colors.accent;
  const matches = (COMPATIBLE_TYPES[code] ?? ["ENFP", "INFJ"]).join(" & ");

  return (
    <View style={styles.root}>
      <Text style={styles.small}>You're an</Text>
      <LinearGradient colors={[tint, colors.accentAlt]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.emojiRing}>
        <View style={[styles.emojiInner, { backgroundColor: colors.surfaceSolid }]}>
          <Text style={{ fontSize: 44 }}>{TYPE_EMOJIS[code] ?? "✨"}</Text>
        </View>
      </LinearGradient>
      <Text style={[styles.code, { color: tint }]}>{code}</Text>
      <Text style={styles.name}>{info?.name}</Text>
      <Text style={styles.tagline}>{info?.tagline}</Text>

      <Card style={{ alignSelf: "stretch", marginTop: 22 }} padding={18}>
        <Text style={styles.fact}>🤝  Often clicks with {matches}</Text>
        <Text style={[styles.fact, { marginTop: 10 }]}>🌌  Your communities are waiting inside</Text>
      </Card>

      <View style={{ alignSelf: "stretch", marginTop: 26 }}>
        <Button label="Enter Pdb" icon="arrow-right" onPress={onEnter} />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 30 },
    small: { ...type.body, color: c.textSecondary },
    emojiRing: { width: 104, height: 104, borderRadius: 52, padding: 3, marginVertical: 14 },
    emojiInner: { flex: 1, borderRadius: 50, alignItems: "center", justifyContent: "center" },
    code: { fontFamily: font.bold, fontSize: 46, letterSpacing: 1 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 20, marginTop: 2 },
    tagline: { ...type.body, color: c.textSecondary, textAlign: "center", marginTop: 4 },
    fact: { color: c.text, fontFamily: font.medium, fontSize: 14.5 },
  });
