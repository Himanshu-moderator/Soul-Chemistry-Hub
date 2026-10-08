import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Avatar, TypeBadge } from "@/components/ui";
import { groupedRow } from "@/components/ui/grouped";
import { personById, type SoulPerson } from "@/data/people";
import { FIRST_MESSAGE_LIMIT, useSoul, type SentRequest } from "@/state/SoulContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import type { ChatContact } from "./DirectChat";

type Tab = "received" | "sent";

interface Props {
  bottomPadding: number;
  header?: React.ReactElement;
  onOpen: (contact: ChatContact) => void;
}

const ago = (ts: number) => {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

const SENT_LABEL: Record<SentRequest["kind"], string> = {
  like: "You liked them",
  message: "You sent a message",
  superchat: "Superchat",
};

// Requests: who liked or wrote to you (Received) and who you reached out to (Sent).
export function RequestsList({ bottomPadding, header, onOpen }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const soul = useSoul();
  const [tab, setTab] = useState<Tab>("received");

  const received = soul.received.map((r) => ({ r, p: personById(r.id) })).filter((x): x is { r: (typeof soul.received)[number]; p: SoulPerson } => !!x.p);
  const sent = soul.sent.map((r) => ({ r, p: personById(r.id) })).filter((x): x is { r: SentRequest; p: SoulPerson } => !!x.p);

  const switcher = (
    <View style={styles.switch}>
      {(["received", "sent"] as Tab[]).map((t) => {
        const count = t === "received" ? received.length : sent.length;
        const on = tab === t;
        return (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => {
              Haptics.selectionAsync();
              setTab(t);
            }}
            style={[styles.switchItem, on && { backgroundColor: colors.surfaceStrong }]}
          >
            <Text style={[styles.switchText, on && { color: colors.text }]}>{t === "received" ? "Received" : "Sent"}</Text>
            {count > 0 && (
              <View style={[styles.count, on && { backgroundColor: colors.accent }]}>
                <Text style={[styles.countText, on && { color: colors.onAccent }]}>{count}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  const head = (
    <View style={{ gap: 14 }}>
      {header}
      {switcher}
    </View>
  );

  if (tab === "received") {
    return (
      <FlatList
        data={received}
        keyExtractor={(x) => x.p.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={head}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
        ListEmptyComponent={<Text style={styles.empty}>No requests right now. People who like you or write to you show up here.</Text>}
        renderItem={({ item, index }) => (
          <View style={[styles.row, groupedRow(colors, index, received.length)]}>
            <Avatar name={item.p.name} size={52} mbti={item.p.mbti} online={item.p.isOnline} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.p.name}
                </Text>
                <TypeBadge type={item.p.mbti} size="sm" />
              </View>
              <Text style={styles.preview} numberOfLines={2}>
                {item.r.message ?? "Liked your profile"}
              </Text>
              <Text style={styles.time}>{ago(item.r.at)}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" accessibilityLabel={`Decline ${item.p.name}`} onPress={() => soul.decline(item.p.id)} style={[styles.round, { backgroundColor: colors.surfaceStrong }]}>
                <Feather name="x" size={18} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Accept ${item.p.name}`}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  soul.accept(item.p.id);
                  onOpen(item.p);
                }}
                style={[styles.round, { backgroundColor: colors.accent }]}
              >
                <Feather name="check" size={18} color={colors.onAccent} />
              </Pressable>
            </View>
          </View>
        )}
      />
    );
  }

  return (
    <FlatList
      data={sent}
      keyExtractor={(x) => x.p.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={head}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding }}
      ListEmptyComponent={<Text style={styles.empty}>Nothing sent yet. Like someone in Soul, or send them a message.</Text>}
      renderItem={({ item, index }) => {
        const mine = soul.threadFor(item.p.id).filter((m) => m.mine).length;
        const accepted = item.r.accepted;
        return (
          <Pressable
            disabled={!accepted}
            onPress={() => onOpen(item.p)}
            style={({ pressed }) => [styles.row, groupedRow(colors, index, sent.length), pressed && { opacity: 0.7 }]}
          >
            <Avatar name={item.p.name} size={52} mbti={item.p.mbti} online={item.p.isOnline} />
            <View style={{ flex: 1, gap: 3 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.p.name}
                </Text>
                <TypeBadge type={item.p.mbti} size="sm" />
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {SENT_LABEL[item.r.kind]}
                {!accepted && item.r.kind === "message" ? ` · ${mine} of ${FIRST_MESSAGE_LIMIT} messages used` : ""}
              </Text>
              <Text style={styles.time}>{ago(item.r.at)}</Text>
            </View>
            <View style={[styles.status, { backgroundColor: accepted ? withAlpha(colors.success, 0.16) : colors.surfaceStrong }]}>
              <Text style={[styles.statusText, { color: accepted ? colors.success : colors.textSecondary }]}>{accepted ? "Accepted" : "Pending"}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    switch: { flexDirection: "row", gap: 8 },
    switchItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.pill },
    switchText: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 14 },
    count: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: c.surfaceStrong, alignItems: "center", justifyContent: "center" },
    countText: { color: c.textSecondary, fontFamily: font.bold, fontSize: 11 },
    row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 16, flexShrink: 1 },
    preview: { color: c.textSecondary, fontFamily: font.regular, fontSize: 14 },
    time: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    actions: { flexDirection: "row", gap: 8 },
    round: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
    status: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill },
    statusText: { fontFamily: font.semibold, fontSize: 12 },
    empty: { ...type.body, color: c.textSecondary, textAlign: "center", paddingVertical: 40, paddingHorizontal: 20 },
  });
