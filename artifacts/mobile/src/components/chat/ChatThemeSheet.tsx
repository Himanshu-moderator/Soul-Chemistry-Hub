import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Sheet } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { CHAT_THEMES } from "@/theme/chatThemes";
import { font, radius } from "@/theme/tokens";

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Pick how conversations look. Applies to every chat and room.
export function ChatThemeSheet({ visible, onClose }: Props) {
  const { chatTheme, setChatTheme } = useApp();

  return (
    <Sheet visible={visible} onClose={onClose} title="Chat theme">
      <Text style={styles.sub}>Changes how your chats and rooms look.</Text>
      {CHAT_THEMES.map((t) => {
        const on = t.id === chatTheme;
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => {
              Haptics.selectionAsync();
              setChatTheme(t.id);
            }}
            style={[styles.card, on && { borderColor: t.accent }]}
          >
            <LinearGradient colors={t.bg} style={styles.preview}>
              <View style={[styles.previewBubble, { backgroundColor: t.theirs, alignSelf: "flex-start" }]} />
              <LinearGradient colors={t.mine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.previewBubble, { alignSelf: "flex-end" }]} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.blurb}>{t.blurb}</Text>
            </View>
            {on && <Feather name="check-circle" size={22} color={t.accent} />}
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sub: { color: "rgba(244,243,250,0.62)", fontFamily: font.regular, fontSize: 14 },
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 10, borderRadius: radius.lg, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1.5, borderColor: "transparent" },
  preview: { width: 92, height: 70, borderRadius: 16, padding: 8, justifyContent: "space-between" },
  previewBubble: { width: 46, height: 18, borderRadius: 9 },
  name: { color: "#F4F3FA", fontFamily: font.semibold, fontSize: 16 },
  blurb: { color: "rgba(244,243,250,0.6)", fontFamily: font.regular, fontSize: 13, marginTop: 2 },
});
