import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Card } from "@/components/ui";
import { COMMUNITIES } from "@/data/mockData";
import { supabase } from "@/services/supabase";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";

interface Props {
  search: string;
  bottomPadding: number;
  header?: React.ReactElement;
}

// Communities to join and chat in. Accounts see real member counts; the demo shows samples.
export function CommunityList({ search, bottomPadding, header }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { mode, joinedCommunities, toggleCommunity } = useApp();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (mode !== "account" || !supabase) return;
    void supabase
      .from("community_stats")
      .select("community_id, members")
      .then(({ data }) => {
        const map: Record<string, number> = {};
        (data ?? []).forEach((r: { community_id: string; members: number }) => (map[r.community_id] = r.members));
        setCounts(map);
      });
  }, [mode, joinedCommunities]);

  const items = COMMUNITIES.filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <FlatList
      data={items}
      keyExtractor={(c) => c.id}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={header}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomPadding, gap: 12 }}
      ListEmptyComponent={<Text style={styles.empty}>No communities found</Text>}
      renderItem={({ item }) => {
        const joined = joinedCommunities.includes(item.id);
        const members = mode === "account" ? counts[item.id] ?? 0 : item.members;
        return (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/community/${item.id}` as never);
            }}
          >
            <Card padding={14}>
              <View style={styles.top}>
                <View style={[styles.badge, { backgroundColor: withAlpha(item.color, 0.22) }]}>
                  <Text style={[styles.badgeText, { color: item.color }]}>{item.code}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.desc} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <View style={styles.bottom}>
                <View style={styles.stat}>
                  <Feather name="users" size={13} color={colors.textTertiary} />
                  <Text style={styles.statText}>{members.toLocaleString()}</Text>
                  {mode !== "account" && <Text style={styles.statText}>· {item.recentActivity}</Text>}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={joined ? `Leave ${item.name}` : `Join ${item.name}`}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleCommunity(item.id);
                  }}
                  style={[styles.join, joined && { backgroundColor: colors.accentSoft }]}
                >
                  <Text style={[styles.joinText, joined && { color: colors.accent }]}>{joined ? "Joined ✓" : "Join"}</Text>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    top: { flexDirection: "row", gap: 12, alignItems: "center" },
    badge: { width: 66, height: 46, paddingHorizontal: 4, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    badgeText: { fontFamily: font.bold, fontSize: 12 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 16 },
    desc: { color: c.textSecondary, fontFamily: font.regular, fontSize: 13, lineHeight: 18 },
    bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
    stat: { flexDirection: "row", alignItems: "center", gap: 5 },
    statText: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12.5 },
    join: { backgroundColor: c.surfaceStrong, borderRadius: radius.pill, paddingHorizontal: 18, paddingVertical: 8 },
    joinText: { color: c.text, fontFamily: font.semibold, fontSize: 13.5 },
    empty: { color: c.textSecondary, textAlign: "center", paddingVertical: 40, fontFamily: font.regular },
  });
