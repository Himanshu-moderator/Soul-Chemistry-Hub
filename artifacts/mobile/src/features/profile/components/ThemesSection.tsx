import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { SectionTitle } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { CHAT_THEMES } from "@/theme/chatThemes";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { APP_THEMES, type Colors } from "@/theme/themes";
import { font, radius, type } from "@/theme/tokens";

// Pick how the whole app looks, and how your chats look.
export function ThemesSection() {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { selectedTheme, setSelectedTheme, chatTheme, setChatTheme, isPremium } = useApp();

  return (
    <View style={{ gap: 28 }}>
      <View>
        <SectionTitle title="App theme" />
        <View style={styles.grid}>
          {APP_THEMES.map((t) => {
            const locked = !t.free && !isPremium;
            const on = selectedTheme === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityLabel={`${t.name} theme${locked ? ", premium" : ""}`}
                accessibilityState={{ selected: on }}
                onPress={() => {
                  if (locked) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    router.push("/(tabs)/market");
                    return;
                  }
                  Haptics.selectionAsync();
                  setSelectedTheme(t.id);
                }}
                style={[styles.theme, on && { borderColor: t.accent }]}
              >
                <LinearGradient colors={t.bg} style={styles.swatch}>
                  <LinearGradient colors={[t.accent, t.accentAlt]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.orb} />
                  {locked && (
                    <View style={styles.lock}>
                      <Feather name="lock" size={12} color="#FFFFFF" />
                    </View>
                  )}
                  {on && (
                    <View style={[styles.lock, { backgroundColor: t.accent }]}>
                      <Feather name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </LinearGradient>
                <Text style={styles.themeName}>{t.name}</Text>
                <Text style={styles.themeDesc} numberOfLines={1}>
                  {locked ? "Premium" : t.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View>
        <SectionTitle title="Chat theme" />
        <View style={{ gap: 12 }}>
          {CHAT_THEMES.map((t) => {
            const on = chatTheme === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  Haptics.selectionAsync();
                  setChatTheme(t.id);
                }}
                style={[styles.chat, on && { borderColor: t.accent }]}
              >
                <LinearGradient colors={t.bg} style={styles.chatPreview}>
                  <View style={[styles.bubble, { backgroundColor: t.theirs, alignSelf: "flex-start" }]} />
                  <LinearGradient colors={t.mine} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.bubble, { alignSelf: "flex-end" }]} />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.themeName}>{t.name}</Text>
                  <Text style={styles.themeDesc}>{t.blurb}</Text>
                </View>
                {on && <Feather name="check-circle" size={22} color={t.accent} />}
              </Pressable>
            );
          })}
        </View>
        <Text style={[type.caption, { color: colors.textTertiary, marginTop: 10 }]}>Applies to all your chats and community rooms.</Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    theme: { width: "47.8%", backgroundColor: c.surface, borderRadius: radius.lg, padding: 10, gap: 3, borderWidth: 1.5, borderColor: "transparent" },
    swatch: { height: 84, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    orb: { width: 38, height: 38, borderRadius: 19 },
    lock: { position: "absolute", top: 7, right: 7, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
    themeName: { color: c.text, fontFamily: font.semibold, fontSize: 14.5 },
    themeDesc: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12 },
    chat: { flexDirection: "row", alignItems: "center", gap: 14, padding: 10, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: "transparent" },
    chatPreview: { width: 96, height: 70, borderRadius: 16, padding: 8, justifyContent: "space-between" },
    bubble: { width: 48, height: 18, borderRadius: 9 },
  });
