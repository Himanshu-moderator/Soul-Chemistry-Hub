import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, TypeBadge } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Props {
  onEditName: () => void;
  onEditBio: () => void;
}

// The top of the profile: who you are, your level and your numbers.
export function ProfileHeader({ onEditName, onEditBio }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile, isPremium } = useApp();
  // Level is derived from XP so the two can never disagree: 500 XP per level.
  const level = 1 + Math.floor(profile.xp / 500);
  const nextLevelXp = level * 500;
  const progress = (profile.xp % 500) / 500;

  const stats = [
    { label: "Followers", value: profile.followers.toLocaleString() },
    { label: "Following", value: profile.following.toLocaleString() },
    { label: "Matches", value: profile.matches.toLocaleString() },
    { label: "Streak", value: `${profile.streak}🔥` },
  ];

  return (
    <View style={{ gap: 18 }}>
      <View style={styles.hero}>
        <Avatar name={profile.name} size={92} mbti={profile.mbti} />
        <Pressable onPress={onEditName} style={styles.nameRow} accessibilityRole="button" accessibilityLabel="Edit name">
          <Text style={styles.name}>{profile.name}</Text>
          <Feather name="edit-2" size={14} color={colors.textTertiary} />
        </Pressable>
        <View style={styles.metaRow}>
          <Text style={styles.username}>{profile.username}</Text>
          <TypeBadge type={profile.mbti} />
          {isPremium && (
            <View style={styles.premium}>
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <Pressable onPress={onEditBio} accessibilityRole="button" accessibilityLabel="Edit bio">
          <Text style={styles.bio}>{profile.bio || "Add a bio"}</Text>
        </Pressable>
      </View>

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
            {profile.xp} / {nextLevelXp} XP
          </Text>
        </View>
        <View style={styles.track}>
          <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.fill, { width: `${Math.max(4, progress * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    hero: { alignItems: "center", gap: 8 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
    name: { ...type.title, color: c.text, fontSize: 26 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    username: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14 },
    premium: { backgroundColor: "rgba(251,191,36,0.16)", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
    premiumText: { color: c.gold, fontFamily: font.bold, fontSize: 11 },
    bio: { ...type.body, color: c.textSecondary, textAlign: "center", paddingHorizontal: 16 },
    stats: { flexDirection: "row", backgroundColor: c.surface, borderRadius: radius.lg, paddingVertical: 14 },
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
