import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar, TypeBadge } from "@/components/ui";
import { CONNECTIONS } from "@/data/mockData";
import { useStyles } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

type Contact = (typeof CONNECTIONS)[number];

const PREVIEWS = [
  "means what are u here for? 😅",
  "Visit my pages and follow? Sorry if busy",
  "how abt a mid length",
  "bald d...",
  "yeah right lol",
  "I understand why someone would vote her...",
  "like I said before...",
  "so what do you think about it?",
];
const TIMES = ["Just now", "2m", "15m", "45m", "1h", "Sat", "Fri", "Wed"];
const UNREAD = [6, 0, 2, 0, 1, 0, 0, 3];

interface Props {
  search: string;
  onOpen: (contact: Contact) => void;
  bottomPadding: number;
  header?: React.ReactElement;
}

// The inbox: sample conversations you can open and reply to.
export function ChatList({ search, onOpen, bottomPadding, header }: Props) {
  const styles = useStyles(makeStyles);
  const items = CONNECTIONS.map((c, i) => ({ contact: c, preview: PREVIEWS[i % 8], time: TIMES[i % 8], unread: UNREAD[i % 8] })).filter(
    (x) => !search || x.contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(x) => x.contact.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
      ListEmptyComponent={<Text style={styles.empty}>No conversations found</Text>}
      renderItem={({ item }) => (
        <Pressable onPress={() => onOpen(item.contact)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
          <Avatar name={item.contact.name} size={52} mbti={item.contact.mbti} online={item.contact.isOnline} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.contact.name}
              </Text>
              <TypeBadge type={item.contact.mbti} size="sm" />
            </View>
            <Text style={[styles.preview, item.unread > 0 && styles.previewUnread]} numberOfLines={1}>
              {item.preview}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.time}>{item.time}</Text>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </Pressable>
      )}
    />
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 11 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 16, flexShrink: 1 },
    preview: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14 },
    previewUnread: { color: c.text, fontFamily: font.medium },
    meta: { alignItems: "flex-end", gap: 6 },
    time: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" },
    badgeText: { color: c.onAccent, fontFamily: font.bold, fontSize: 12 },
    empty: { color: c.textSecondary, textAlign: "center", paddingVertical: 40, fontFamily: font.regular },
  });
