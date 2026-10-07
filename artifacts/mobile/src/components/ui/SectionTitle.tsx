import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { font } from "@/theme/tokens";
import { useStyles } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";

interface Props {
  title: string;
  action?: string;
  onAction?: () => void;
}

// A heading above a group of content, with an optional "See all" style link.
export function SectionTitle({ title, action, onAction }: Props) {
  const styles = useStyles(makeStyles);
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    title: { color: c.text, fontFamily: font.bold, fontSize: 19, letterSpacing: -0.3 },
    action: { color: c.accent, fontFamily: font.semibold, fontSize: 14 },
  });
