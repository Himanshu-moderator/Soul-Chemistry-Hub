import { Link, Stack } from "expo-router";
import React from "react";
import { StyleSheet, Text } from "react-native";
import { Screen } from "@/components/ui";
import { font } from "@/theme/tokens";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <Screen contentStyle={styles.center}>
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          Back to Pdb
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 16 },
  title: { color: "#F4F3FA", fontFamily: font.bold, fontSize: 20 },
  link: { color: "#A78BFA", fontFamily: font.semibold, fontSize: 15 },
});
