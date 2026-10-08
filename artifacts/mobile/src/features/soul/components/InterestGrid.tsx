import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Interest, InterestKind } from "@/data/people";
import { useStyles } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

const KIND_TINT: Record<InterestKind, string> = {
  Hobby: "#E7B341",
  Music: "#22D3EE",
  Food: "#FB923C",
  Travel: "#34D399",
  Value: "#F472B6",
};

// A person's interests as a grid of little collectible cards.
export function InterestGrid({ interests }: { interests: Interest[] }) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.grid}>
      {interests.map((it) => {
        const tint = KIND_TINT[it.kind];
        return (
          <View key={it.label} style={styles.cell}>
            <Text style={[styles.kind, { color: tint, backgroundColor: withAlpha(tint, 0.14) }]}>{it.kind}</Text>
            <View style={[styles.art, { backgroundColor: withAlpha(tint, 0.1) }]}>
              <Text style={styles.emoji}>{it.emoji}</Text>
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {it.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cell: { width: "31%", flexGrow: 1, backgroundColor: c.surfaceStrong, borderRadius: 18, overflow: "hidden", alignItems: "center", paddingBottom: 10, gap: 8 },
    kind: { alignSelf: "stretch", textAlign: "center", fontFamily: font.semibold, fontSize: 11, paddingVertical: 5, letterSpacing: 0.4 },
    art: { width: "70%", aspectRatio: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    emoji: { fontSize: 34 },
    label: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12.5, paddingHorizontal: 6 },
  });
