import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { PERSONALITY_TYPES } from "@/data/mockData";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import { TYPE_EMOJIS, TYPE_ROWS } from "../content";

interface Props {
  onPick: (type: string) => void;
}

// "I already know my type": pick it from the sixteen.
export function TypeGridStep({ onPick }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [selected, setSelected] = useState("");

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pick your type</Text>
        <Text style={styles.sub}>You can change it later in your profile.</Text>
        <View style={styles.grid}>
          {TYPE_ROWS.flat().map((code) => {
            const tint = colors.mbti[code] ?? colors.accent;
            const on = selected === code;
            const name = PERSONALITY_TYPES.find((t) => t.code === code)?.name.replace("The ", "");
            return (
              <Pressable
                key={code}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelected(code);
                }}
                style={[styles.cell, { backgroundColor: withAlpha(tint, on ? 0.28 : 0.1), borderColor: on ? tint : "transparent" }]}
              >
                <Text style={styles.emoji}>{TYPE_EMOJIS[code]}</Text>
                <Text style={[styles.code, { color: tint }]}>{code}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={selected ? `Continue as ${selected}` : "Choose a type"} disabled={!selected} onPress={() => onPick(selected)} />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 16 },
    title: { ...type.title, color: c.text },
    sub: { ...type.body, color: c.textSecondary, marginTop: 4, marginBottom: 18 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cell: { width: "23%", flexGrow: 1, alignItems: "center", paddingVertical: 14, borderRadius: radius.md, borderWidth: 1.5, gap: 3 },
    emoji: { fontSize: 24 },
    code: { fontFamily: font.bold, fontSize: 14, letterSpacing: 0.4 },
    name: { color: c.textSecondary, fontFamily: font.regular, fontSize: 10.5 },
    footer: { paddingHorizontal: 20, paddingBottom: 18 },
  });
