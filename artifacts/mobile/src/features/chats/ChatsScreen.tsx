import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { ChatThemeSheet } from "@/components/chat/ChatThemeSheet";
import { IconButton } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useSoul } from "@/state/SoulContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { ChatList } from "./components/ChatList";
import { CommunityList } from "./components/CommunityList";
import { DirectChat, type ChatContact } from "./components/DirectChat";
import { RequestsList } from "./components/RequestsList";

type Section = "chats" | "requests" | "communities";

const SECTIONS: { key: Section; label: string }[] = [
  { key: "chats", label: "Chats" },
  { key: "requests", label: "Requests" },
  { key: "communities", label: "Communities" },
];

// Chats: your conversations, your requests and your communities, one tap apart.
export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode } = useApp();
  const soul = useSoul();

  const [section, setSection] = useState<Section>("chats");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<ChatContact | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);

  const switchTo = (s: Section) => {
    Haptics.selectionAsync();
    setSection(s);
    setSearch("");
  };

  const title = section === "chats" ? "Chats" : section === "requests" ? "Requests" : "Communities";

  const header = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <IconButton icon="droplet" label="Chat theme" onPress={() => setThemeOpen(true)} />
      </View>

      <View style={styles.switch}>
        {SECTIONS.map((s) => {
          const on = section === s.key;
          const badge = s.key === "requests" ? soul.received.length : 0;
          return (
            <Pressable key={s.key} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => switchTo(s.key)} style={[styles.switchItem, on && { backgroundColor: colors.accent }]}>
              <Text style={[styles.switchText, on && { color: colors.onAccent }]}>{s.label}</Text>
              {badge > 0 && (
                <View style={[styles.badge, { backgroundColor: on ? colors.onAccent : colors.accent }]}>
                  <Text style={[styles.badgeText, { color: on ? colors.accent : colors.onAccent }]}>{badge}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {section !== "requests" && (
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
      )}

      {section === "chats" && mode === "account" && (
        <Text style={styles.note}>These are sample contacts. Real conversations happen in Communities.</Text>
      )}
    </View>
  );

  const bottom = insets.bottom + 120;

  return (
    <Sky variant="subtle">
      <View style={{ flex: 1, paddingTop: insets.top + 10 }}>
        {section === "chats" && <ChatList search={search} onOpen={setOpen} bottomPadding={bottom} header={header} />}
        {section === "requests" && <RequestsList onOpen={setOpen} bottomPadding={bottom} header={header} />}
        {section === "communities" && <CommunityList search={search} bottomPadding={bottom} header={header} />}
      </View>
      <DirectChat contact={open} onClose={() => setOpen(null)} />
      <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    header: { gap: 14, paddingBottom: 12 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
    title: { ...type.display, color: c.text, fontSize: 32 },
    switch: { flexDirection: "row", backgroundColor: c.surface, borderRadius: radius.pill, padding: 4 },
    switchItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: radius.pill },
    switchText: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 13 },
    badge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: "center", justifyContent: "center" },
    badgeText: { fontFamily: font.bold, fontSize: 11 },
    search: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderRadius: radius.pill, paddingHorizontal: 16 },
    searchInput: { flex: 1, color: c.text, fontFamily: font.regular, fontSize: 15, paddingVertical: 12, outlineStyle: "none" } as object,
    note: { ...type.caption, color: c.textTertiary },
  });
