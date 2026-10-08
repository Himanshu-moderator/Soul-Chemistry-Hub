import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { COMMUNITIES } from "@/data/mockData";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface Props {
  // Communities that start selected (already joined, plus the one for your type).
  initial: string[];
  // Your type, so its community is listed first.
  type: string;
  onDone: (picked: string[]) => void;
  // Leave without joining anything.
  onSkip: () => void;
}

// An optional step: tap any communities you like, or skip it.
export function CommunitiesStep({ initial, type: mine, onDone, onSkip }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [picked, setPicked] = useState<string[]>(initial);

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  // Your own type's community first, then the rest in their usual order.
  const list = [...COMMUNITIES].sort((a, b) => Number(b.code === mine) - Number(a.code === mine));

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Join a community</Text>
        <Text style={styles.sub}>Optional. Tap any you like, or skip: you can always join later.</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.chips} showsVerticalScrollIndicator={false}>
        {list.map((c) => {
          const on = picked.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => toggle(c.id)}
              style={[styles.chip, { backgroundColor: on ? withAlpha(c.color, 0.18) : colors.surface, borderColor: on ? c.color : colors.border }]}
            >
              {on ? <Feather name="check" size={14} color={c.color} /> : <View style={[styles.dot, { backgroundColor: c.color }]} />}
              <Text style={[styles.chipText, on && { color: colors.text }]} numberOfLines={1}>
                {c.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        {picked.length > 0 && <Button label={`Join ${picked.length} & continue`} onPress={() => onDone(picked)} />}
        <Button label="Skip for now" variant={picked.length > 0 ? "ghost" : "primary"} onPress={onSkip} />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 16 },
    title: { ...type.title, color: c.text },
    sub: { ...type.body, color: c.textSecondary, marginTop: 4 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, paddingBottom: 12 },
    chip: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, height: 40, borderRadius: 20, borderWidth: 1, maxWidth: "100%" },
    dot: { width: 8, height: 8, borderRadius: 4 },
    chipText: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14, flexShrink: 1 },
    footer: { paddingHorizontal: 20, paddingBottom: 18, paddingTop: 6, gap: 8 },
  });
