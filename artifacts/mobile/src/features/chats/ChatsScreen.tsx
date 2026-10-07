import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { ChatThemeSheet } from "@/components/chat/ChatThemeSheet";
import { IconButton } from "@/components/ui";
import { CONNECTIONS } from "@/data/mockData";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { ChatList } from "./components/ChatList";
import { CommunityList } from "./components/CommunityList";
import { DirectChat } from "./components/DirectChat";

type Section = "chats" | "communities";

// Chats: your conversations and your communities, one tap apart.
export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode } = useApp();

  const [section, setSection] = useState<Section>("chats");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<(typeof CONNECTIONS)[number] | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);

  const switchTo = (s: Section) => {
    Haptics.selectionAsync();
    setSection(s);
    setSearch("");
  };

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{section === "chats" ? "Chats" : "Communities"}</Text>
        <IconButton icon="droplet" label="Chat theme" onPress={() => setThemeOpen(true)} />
      </View>

      <View style={styles.switch}>
        {(["chats", "communities"] as Section[]).map((s) => (
          <Pressable key={s} accessibilityRole="button" accessibilityState={{ selected: section === s }} onPress={() => switchTo(s)} style={[styles.switchItem, section === s && { backgroundColor: colors.accent }]}>
            <Feather name={s === "chats" ? "message-circle" : "users"} size={15} color={section === s ? colors.onAccent : colors.textSecondary} />
            <Text style={[styles.switchText, section === s && { color: colors.onAccent }]}>{s === "chats" ? "Chats" : "Communities"}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.search}>
        <Feather name="search" size={17} color={colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={section === "chats" ? "Search conversations" : "Search communities"}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel="Search"
        />
      </View>

      {section === "chats" && mode === "account" && (
        <Text style={styles.note}>These are sample contacts. Real conversations happen in Communities.</Text>
      )}
    </View>
  );

  const bottom = insets.bottom + 120;

  return (
    <CosmicBackground>
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        {section === "chats" ? (
          <ChatList search={search} onOpen={setOpen} bottomPadding={bottom} header={header} />
        ) : (
          <CommunityList search={search} bottomPadding={bottom} header={header} />
        )}
      </View>
      <DirectChat contact={open} onClose={() => setOpen(null)} />
      <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </CosmicBackground>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { gap: 14, paddingBottom: 12 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
    title: { ...type.display, color: c.text, fontSize: 32 },
    switch: { flexDirection: "row", backgroundColor: c.surface, borderRadius: radius.pill, padding: 4 },
    switchItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 10, borderRadius: radius.pill },
    switchText: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 14 },
    search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: 16 },
    searchInput: { flex: 1, color: c.text, fontFamily: font.regular, fontSize: 15, paddingVertical: 12, outlineStyle: "none" } as object,
    note: { ...type.caption, color: c.textTertiary },
  });
