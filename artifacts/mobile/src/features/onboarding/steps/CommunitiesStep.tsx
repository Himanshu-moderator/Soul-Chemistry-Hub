import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Button } from "@/components/ui";
import { COMMUNITIES } from "@/data/mockData";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface Props {
  // Communities that start selected (already joined, plus the one for your type).
  initial: string[];
  onDone: (picked: string[]) => void;
}

// Pick a few communities to join.
export function CommunitiesStep({ initial, onDone }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const [picked, setPicked] = useState<string[]>(initial);

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Join your people</Text>
        <Text style={styles.sub}>Pick a few communities. You can change this any time.</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {COMMUNITIES.map((c) => {
          const on = picked.includes(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => toggle(c.id)}
              style={[styles.row, { backgroundColor: on ? withAlpha(c.color, 0.16) : colors.surface, borderColor: on ? c.color : "transparent" }]}
            >
              <View style={[styles.badge, { backgroundColor: withAlpha(c.color, 0.22) }]}>
                <Text style={[styles.badgeText, { color: c.color }]}>{c.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.desc} numberOfLines={1}>
                  {c.description}
                </Text>
              </View>
              <Feather name={on ? "check-circle" : "circle"} size={22} color={on ? c.color : colors.textTertiary} />
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={picked.length ? `Join ${picked.length} & continue` : "Skip for now"} onPress={() => onDone(picked)} />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 6, paddingBottom: 14 },
    title: { ...type.title, color: c.text },
    sub: { ...type.body, color: c.textSecondary, marginTop: 4 },
    list: { paddingHorizontal: 20, gap: 10, paddingBottom: 12 },
    row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1.5 },
    badge: { width: 66, height: 42, paddingHorizontal: 4, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    badgeText: { fontFamily: font.bold, fontSize: 11 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 15 },
    desc: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12.5, marginTop: 2 },
    footer: { paddingHorizontal: 20, paddingBottom: 18, paddingTop: 6 },
  });
