import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { Avatar, Card, ChemistryRing, SectionTitle, TypeBadge } from "@/components/ui";
import { CONNECTIONS } from "@/data/mockData";
import { bestPairs } from "@/lib/personality";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

const DISCOVER = [
  { emoji: "🌙", title: "Wonder Chat", sub: "Talk anonymously" },
  { emoji: "✈️", title: "Paper Airplane", sub: "Send a signal" },
  { emoji: "💭", title: "Thought Bubbles", sub: "Ask the crowd" },
  { emoji: "👀", title: "Who Noticed", sub: "Quiet visitors" },
];

// Soul: your closest matches and the types you click with.
export default function SoulScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile, mode } = useApp();
  const [open, setOpen] = useState(true);

  const sorted = [...CONNECTIONS].sort((a, b) => b.chemistry - a.chemistry);
  const top = sorted[0];

  return (
    <CosmicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 120, gap: 26 }}>
        <View>
          <Text style={styles.title}>Soul</Text>
          <Text style={styles.sub}>Your people and your chemistry</Text>
        </View>

        {/* Top match */}
        <LinearGradient colors={[colors.accent + "66", colors.accentAlt + "33"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.heroLabel}>{mode === "demo" ? "Your top match" : "Sample top match"}</Text>
            <Text style={styles.heroName}>{top.name}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" }}>
              <TypeBadge type={top.mbti} />
              <Text style={styles.heroStatus}>{top.status}</Text>
            </View>
          </View>
          <View style={styles.heroRing}>
            <ChemistryRing percent={top.chemistry} size={92} stroke={7} />
            <View style={styles.heroAvatar}>
              <Avatar name={top.name} size={30} mbti={top.mbti} />
            </View>
          </View>
        </LinearGradient>

        {/* Connections */}
        <View>
          <SectionTitle title="My connections" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 20 }} style={{ marginHorizontal: -20, paddingLeft: 20 }}>
            {sorted.map((c) => (
              <View key={c.id} style={styles.conn}>
                <Avatar name={c.name} size={60} mbti={c.mbti} online={c.isOnline} />
                <Text style={styles.connName}>{c.name.split(" ")[0]}</Text>
                <Text style={[styles.connScore, { color: colors.accent }]}>{c.chemistry}%</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Best types */}
        <View>
          <SectionTitle title={`Types that click with ${profile.mbti}`} />
          <Card padding={4}>
            {bestPairs(profile.mbti).map((pair, i, all) => (
              <View key={pair.type2} style={[styles.pair, i < all.length - 1 && styles.pairBorder]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TypeBadge type={pair.type1} />
                  <Text style={{ color: colors.danger }}>♥</Text>
                  <TypeBadge type={pair.type2} />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.pairLabel}>{pair.label}</Text>
                  <Text style={styles.pairScore}>{pair.score}%</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Discover */}
        <View>
          <SectionTitle title="Discover" />
          <View style={styles.grid}>
            {DISCOVER.map((d) => (
              <View key={d.title} style={styles.tile}>
                <Text style={{ fontSize: 26 }}>{d.emoji}</Text>
                <Text style={styles.tileTitle}>{d.title}</Text>
                <Text style={styles.tileSub}>{d.sub}</Text>
                <View style={styles.soon}>
                  <Text style={styles.soonText}>Soon</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Card padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.openTitle}>Open to new friends</Text>
              <Text style={styles.openSub}>Let people with a high match find you</Text>
            </View>
            <Switch value={open} onValueChange={setOpen} trackColor={{ true: colors.accent, false: colors.surfaceStrong }} thumbColor="#FFFFFF" />
          </View>
        </Card>
      </ScrollView>
    </CosmicBackground>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    title: { ...type.display, color: c.text, fontSize: 32 },
    sub: { ...type.body, color: c.textSecondary, marginTop: 2 },
    hero: { flexDirection: "row", alignItems: "center", gap: 12, padding: 20, borderRadius: radius.xl },
    heroLabel: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 12.5, letterSpacing: 0.6, textTransform: "uppercase" },
    heroName: { color: c.text, fontFamily: font.bold, fontSize: 26, letterSpacing: -0.5 },
    heroStatus: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14 },
    heroRing: { alignItems: "center", justifyContent: "center" },
    heroAvatar: { position: "absolute", bottom: -8 },
    conn: { alignItems: "center", gap: 4, width: 66 },
    connName: { color: c.text, fontFamily: font.medium, fontSize: 13 },
    connScore: { fontFamily: font.bold, fontSize: 12.5 },
    pair: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
    pairBorder: { borderBottomWidth: 1, borderBottomColor: c.border },
    pairLabel: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12.5 },
    pairScore: { color: c.text, fontFamily: font.bold, fontSize: 18 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    tile: { width: "47.8%", backgroundColor: c.surface, borderRadius: radius.lg, padding: 16, gap: 2 },
    tileTitle: { color: c.text, fontFamily: font.semibold, fontSize: 15, marginTop: 6 },
    tileSub: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12.5 },
    soon: { position: "absolute", top: 12, right: 12, backgroundColor: c.surfaceStrong, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    soonText: { color: c.textSecondary, fontFamily: font.semibold, fontSize: 10.5 },
    openTitle: { ...type.bodyStrong, color: c.text },
    openSub: { ...type.caption, color: c.textSecondary, marginTop: 1 },
  });
