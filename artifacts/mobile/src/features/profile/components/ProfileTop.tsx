import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, TypeBadge } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  onEdit: () => void;
}

// The top of your profile, laid out like everyone else's page: cover, profile
// picture, name, then your numbers and your level.
export function ProfileTop({ onEdit }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, isPremium } = useApp();
  // Level is derived from XP so the two can never disagree: 500 XP per level.
  const level = 1 + Math.floor(profile.xp / 500);
  const progress = (profile.xp % 500) / 500;

  const stats = [
    { label: "Followers", value: profile.followers.toLocaleString() },
    { label: "Following", value: profile.following.toLocaleString() },
    { label: "Matches", value: profile.matches.toLocaleString() },
    { label: "Streak", value: `${profile.streak}🔥` },
  ];

  return (
    <View>
      <View style={styles.cover}>
        {profile.cover ? (
          <Image source={{ uri: profile.cover }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <LinearGradient colors={[colors.accent, colors.accentAlt]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient colors={["rgba(6,5,15,0.45)", "rgba(6,5,15,0)", "rgba(6,5,15,0.8)"]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={onEdit} style={[styles.edit, { top: insets.top + 10 }]}>
          <Feather name="edit-2" size={15} color="#FFFFFF" />
          <Text style={styles.editText}>Edit profile</Text>
        </Pressable>
      </View>

      <View style={styles.head}>
        <View style={styles.dpRing}>
          {profile.dp ? <Image source={{ uri: profile.dp }} style={styles.dpImg} /> : <Avatar name={profile.name} size={98} mbti={profile.mbti} />}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.verified && <Ionicons name="checkmark-circle" size={22} color={colors.cyan} />}
        </View>
        <Text style={styles.facts}>
          {profile.username} · {profile.location}
        </Text>
        <View style={styles.chips}>
          <TypeBadge type={profile.mbti} />
          <Text style={styles.enn}>Enneagram {profile.enneagram}</Text>
          {isPremium && (
            <View style={styles.premium}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.stats}>
          {stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.level}>
          <View style={styles.levelRow}>
            <Text style={styles.levelTitle}>Level {level}</Text>
            <Text style={styles.levelXp}>
              {profile.xp} / {level * 500} XP
            </Text>
          </View>
          <View style={styles.track}>
            <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${Math.max(4, progress * 100)}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    cover: { height: 210, backgroundColor: c.surface },
    edit: { position: "absolute", right: 16, flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(10,8,24,0.55)", paddingHorizontal: 14, height: 38, borderRadius: radius.pill },
    editText: { color: "#FFFFFF", fontFamily: font.semibold, fontSize: 13.5 },
    head: { alignItems: "center", marginTop: -50, paddingHorizontal: 20, gap: 6 },
    dpRing: { width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: c.bg, overflow: "hidden", backgroundColor: c.surfaceStrong, alignItems: "center", justifyContent: "center" },
    dpImg: { width: "100%", height: "100%" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    name: { ...type.title, color: c.text },
    facts: { ...type.body, color: c.textSecondary },
    chips: { flexDirection: "row", alignItems: "center", gap: 10 },
    enn: { color: c.textSecondary, fontFamily: font.medium, fontSize: 13 },
    premium: { backgroundColor: "rgba(251,191,36,0.16)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    premiumText: { color: c.gold, fontFamily: font.bold, fontSize: 11 },
    body: { paddingHorizontal: 16, paddingTop: 18, gap: 16 },
    stats: { flexDirection: "row", backgroundColor: c.surface, borderRadius: radius.lg, paddingVertical: 14, borderWidth: 1, borderColor: c.border },
    stat: { flex: 1, alignItems: "center", gap: 2 },
    statValue: { color: c.text, fontFamily: font.bold, fontSize: 18 },
    statLabel: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    level: { gap: 8 },
    levelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
    levelTitle: { color: c.text, fontFamily: font.semibold, fontSize: 15 },
    levelXp: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12.5 },
    track: { height: 8, borderRadius: 4, backgroundColor: c.surfaceStrong, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 4 },
  });
