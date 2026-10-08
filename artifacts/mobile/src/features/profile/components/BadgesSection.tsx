import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SectionTitle } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useSoul } from "@/state/SoulContext";
import { useStyles } from "@/theme/ThemeProvider";
import { font, radius } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

interface Badge {
  emoji: string;
  title: string;
  how: string; // what earns it
  earned: boolean;
}

// Your badges: the ones you have earned in colour, the rest dimmed with how to get them.
export function BadgesSection() {
  const styles = useStyles(makeStyles);
  const { profile, joinedCommunities } = useApp();
  const soul = useSoul();
  const level = 1 + Math.floor(profile.xp / 500);

  const badges: Badge[] = [
    { emoji: "🚀", title: "Early adopter", how: "Joined in the first wave", earned: true },
    { emoji: "🎓", title: "Type scholar", how: "Learned your type", earned: profile.badges.includes("Type Scholar") },
    { emoji: "🔥", title: "7-day streak", how: "Check in 7 days in a row", earned: profile.streak >= 7 },
    { emoji: "🌌", title: "Community soul", how: "Join 3 communities", earned: joinedCommunities.length >= 3 },
    { emoji: "💌", title: "First spark", how: "Like or message someone", earned: soul.sent.length > 0 || soul.connectedPeople.length > 0 },
    { emoji: "🤝", title: "First match", how: "Start a real chat", earned: soul.connectedPeople.length > 0 },
    { emoji: "✅", title: "Verified", how: "Verify your profile", earned: !!profile.verified },
    { emoji: "⭐", title: "Level 5", how: "Reach level 5", earned: level >= 5 },
  ];
  const count = badges.filter((b) => b.earned).length;

  return (
    <View>
      <SectionTitle title={`Badges · ${count} of ${badges.length}`} />
      <View style={styles.grid}>
        {badges.map((b) => (
          <View key={b.title} style={[styles.tile, !b.earned && styles.locked]}>
            <Text style={styles.emoji}>{b.emoji}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {b.title}
            </Text>
            <Text style={styles.how} numberOfLines={2}>
              {b.earned ? "Earned" : b.how}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    tile: { width: "47.5%", flexGrow: 1, backgroundColor: c.surface, borderRadius: radius.lg, padding: 14, gap: 4, borderWidth: 1, borderColor: c.border },
    locked: { opacity: 0.45 },
    emoji: { fontSize: 26 },
    title: { color: c.text, fontFamily: font.semibold, fontSize: 14.5, marginTop: 4 },
    how: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
  });
