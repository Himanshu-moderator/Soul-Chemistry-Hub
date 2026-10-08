import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChemistryRing, TypeBadge } from "@/components/ui";
import type { InterestKind, SoulPerson } from "@/data/people";
import { chemistryBetween } from "@/lib/personality";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import { PersonPhoto } from "./PersonPhoto";

const KIND_TINT: Record<InterestKind, string> = {
  Hobby: "#E7B341",
  Music: "#22D3EE",
  Food: "#FB923C",
  Travel: "#34D399",
  Value: "#F472B6",
};

const PHOTO_COUNT = 3;

interface Props {
  person: SoulPerson;
  // Room to leave at the bottom for the floating buttons and the tab bar.
  bottomInset: number;
  topAction?: React.ReactNode;
}

const verdict = (pct: number) => (pct >= 88 ? "Our chemistry is great 🧩" : pct >= 75 ? "We could click ✨" : "Different, in a good way 🌗");

// One person: a full-screen photo first, then (scrolling down) their chemistry with
// you, what they want, about them, and their interests as a card collection.
export function ProfileCard({ person, bottomInset, topAction }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { profile } = useApp();
  const [photo, setPhoto] = useState(0);

  const pct = chemistryBetween(profile.mbti, person.mbti, person.name.length);
  const heroH = Math.max(480, height);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset }}>
      {/* Photo */}
      <View style={[styles.hero, { height: heroH }]}>
        <PersonPhoto person={person} index={photo} />
        {/* tap the left or right half to flip through photos */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.tapRow}>
            <Pressable accessibilityLabel="Previous photo" style={{ flex: 1 }} onPress={() => setPhoto((p) => Math.max(0, p - 1))} />
            <Pressable accessibilityLabel="Next photo" style={{ flex: 1 }} onPress={() => setPhoto((p) => Math.min(PHOTO_COUNT - 1, p + 1))} />
          </View>
        </View>
        <LinearGradient colors={["rgba(6,5,15,0.55)", "rgba(6,5,15,0)"]} style={styles.topScrim} pointerEvents="none" />
        <LinearGradient colors={["rgba(6,5,15,0)", "rgba(6,5,15,0.92)"]} style={styles.bottomScrim} pointerEvents="none" />

        <View style={[styles.topBar, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
          <View style={styles.segments} pointerEvents="none">
            {Array.from({ length: PHOTO_COUNT }, (_, i) => (
              <View key={i} style={[styles.segment, { backgroundColor: i <= photo ? "#FFFFFF" : "rgba(255,255,255,0.35)" }]} />
            ))}
          </View>
          {topAction}
        </View>

        <View style={styles.identity} pointerEvents="none">
          <View style={styles.chips}>
            {person.verified && (
              <View style={styles.chip}>
                <Ionicons name="checkmark-circle" size={13} color={colors.cyan} />
                <Text style={styles.chipText}>Photo verified</Text>
              </View>
            )}
            {person.isNew && (
              <View style={styles.chip}>
                <Text style={styles.chipText}>👋 New here</Text>
              </View>
            )}
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: person.isOnline ? colors.success : colors.textTertiary }]} />
              <Text style={styles.chipText}>{person.isOnline ? "online" : `online ${person.lastSeen}`}</Text>
            </View>
          </View>
          <Text style={styles.name}>
            {person.name} <Text style={styles.age}>{person.age}</Text>
          </Text>
          <View style={styles.placeRow}>
            <Feather name="map-pin" size={14} color="rgba(255,255,255,0.86)" />
            <Text style={styles.place}>{person.city}, India</Text>
          </View>
          <View style={styles.typeRow}>
            <TypeBadge type={person.mbti} />
            <Text style={styles.match}>{pct}% match</Text>
          </View>
        </View>
      </View>

      {/* Below the photo */}
      <View style={styles.body}>
        <View style={styles.card}>
          <ChemistryRing percent={pct} size={78} stroke={7} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.verdict}>{verdict(pct)}</Text>
            <Text style={styles.pair}>
              {profile.mbti} & {person.mbti}
            </Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={[styles.card, styles.tile]}>
            <View style={[styles.tileIcon, { backgroundColor: withAlpha(colors.accent, 0.18) }]}>
              <Feather name="heart" size={18} color={colors.accent} />
            </View>
            <Text style={styles.tileLabel}>looking for</Text>
            <Text style={styles.tileValue}>{person.relationship}</Text>
          </View>
          <View style={[styles.card, styles.tile]}>
            <View style={[styles.tileIcon, { backgroundColor: withAlpha(colors.accentAlt, 0.18) }]}>
              <Feather name="message-circle" size={18} color={colors.accentAlt} />
            </View>
            <Text style={styles.tileLabel}>ask me about</Text>
            <Text style={styles.tileValue}>{person.askMe}</Text>
          </View>
        </View>

        <View style={[styles.card, { flexDirection: "column", alignItems: "flex-start", gap: 8 }]}>
          <Text style={styles.sectionTitle}>About me</Text>
          <Text style={styles.about}>{person.about}</Text>
          <Text style={styles.facts}>
            {person.mbti} · Enneagram {person.enneagram}
          </Text>
        </View>

        <View style={[styles.card, { flexDirection: "column", alignItems: "stretch", gap: 14 }]}>
          <Text style={styles.sectionTitle}>My card</Text>
          <View style={styles.grid}>
            {person.interests.map((it) => {
              const tint = KIND_TINT[it.kind];
              return (
                <View key={it.label} style={styles.cell}>
                  <Text style={[styles.cellKind, { color: tint, backgroundColor: withAlpha(tint, 0.14) }]}>{it.kind}</Text>
                  <View style={[styles.cellArt, { backgroundColor: withAlpha(tint, 0.1) }]}>
                    <Text style={styles.cellEmoji}>{it.emoji}</Text>
                  </View>
                  <Text style={styles.cellLabel} numberOfLines={1}>
                    {it.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    hero: { borderBottomLeftRadius: 30, borderBottomRightRadius: 30, overflow: "hidden", backgroundColor: c.surface },
    tapRow: { flex: 1, flexDirection: "row" },
    topScrim: { position: "absolute", left: 0, right: 0, top: 0, height: 140 },
    bottomScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 360 },
    topBar: { position: "absolute", left: 0, right: 0, top: 0, paddingHorizontal: 16, gap: 12 },
    segments: { flexDirection: "row", gap: 5 },
    segment: { flex: 1, height: 3, borderRadius: 2 },
    identity: { position: "absolute", left: 20, right: 20, bottom: 190, gap: 6 },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
    chip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(10,8,24,0.62)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
    chipText: { color: "#FFFFFF", fontFamily: font.medium, fontSize: 12 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    name: { color: "#FFFFFF", fontFamily: font.bold, fontSize: 34, letterSpacing: -0.8 },
    age: { fontFamily: font.regular, fontSize: 28 },
    placeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    place: { color: "rgba(255,255,255,0.86)", fontFamily: font.medium, fontSize: 15 },
    typeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
    match: { color: "#FFFFFF", fontFamily: font.semibold, fontSize: 14 },

    body: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
    card: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: c.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: c.border },
    verdict: { color: c.accent, fontFamily: font.semibold, fontSize: 16 },
    pair: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14 },
    twoCol: { flexDirection: "row", gap: 12 },
    tile: { flex: 1, flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 16 },
    tileIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 4 },
    tileLabel: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    tileValue: { color: c.text, fontFamily: font.semibold, fontSize: 15, lineHeight: 20 },
    sectionTitle: { ...type.heading, color: c.text },
    about: { ...type.body, color: c.text },
    facts: { ...type.caption, color: c.textTertiary },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    cell: { width: "31%", flexGrow: 1, backgroundColor: c.surfaceStrong, borderRadius: 18, overflow: "hidden", alignItems: "center", paddingBottom: 10, gap: 8 },
    cellKind: { alignSelf: "stretch", textAlign: "center", fontFamily: font.semibold, fontSize: 11, paddingVertical: 5, letterSpacing: 0.4 },
    cellArt: { width: "70%", aspectRatio: 1, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    cellEmoji: { fontSize: 34 },
    cellLabel: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12.5, paddingHorizontal: 6 },
  });
