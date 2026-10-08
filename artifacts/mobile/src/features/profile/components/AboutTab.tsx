import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { InterestGrid } from "@/features/soul/components/InterestGrid";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import { withAlpha, type Colors } from "@/theme/themes";
import { BadgesSection } from "./BadgesSection";
import { OverviewSection, type TypeField } from "./OverviewSection";

interface Props {
  onPick: (field: TypeField) => void;
  onEdit: () => void;
}

// Your page as other people see it, plus your badges and type details.
export function AboutTab({ onPick, onEdit }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { profile } = useApp();

  const details: { icon: keyof typeof Feather.glyphMap; label: string; value: string }[] = [
    { icon: "briefcase", label: "Profession", value: profile.profession },
    { icon: "book-open", label: "Education", value: profile.education },
    { icon: "globe", label: "Languages", value: profile.languages },
    { icon: "map-pin", label: "Location", value: profile.location },
  ];

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={styles.label}>Soul</Text>
        {profile.photos.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {profile.photos.map((uri, i) => (
              <View key={i} style={styles.shot}>
                <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Pressable accessibilityRole="button" onPress={onEdit} style={styles.addPhotos}>
            <Feather name="image" size={22} color={colors.accent} />
            <Text style={styles.addText}>Add photos so people can see you</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.twoCol}>
        <View style={[styles.card, styles.tile]}>
          <Text style={styles.tileLabel}>looking for</Text>
          <Text style={styles.tileValue}>{profile.relationship}</Text>
        </View>
        <View style={[styles.card, styles.tile]}>
          <Text style={styles.tileLabel}>ask me about</Text>
          <Text style={styles.tileValue}>{profile.askMe}</Text>
        </View>
      </View>

      <View style={[styles.card, styles.stack]}>
        <Text style={styles.title}>About Me</Text>
        <Text style={styles.about}>{profile.bio || "Add a bio in Edit profile."}</Text>
      </View>

      <View style={[styles.card, styles.stack, { gap: 0 }]}>
        {details.map((d, i) => (
          <View key={d.label} style={[styles.detail, i > 0 && styles.divider]}>
            <View style={[styles.detailIcon, { backgroundColor: withAlpha(colors.accent, 0.14) }]}>
              <Feather name={d.icon} size={16} color={colors.accent} />
            </View>
            <Text style={styles.detailLabel}>{d.label}</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {d.value || "Not added"}
            </Text>
          </View>
        ))}
      </View>

      {profile.idols.length > 0 && (
        <View style={[styles.card, styles.stack]}>
          <Text style={styles.title}>Idols</Text>
          <View style={styles.idols}>
            {profile.idols.map((idol) => (
              <View key={idol.name} style={styles.idol}>
                <View style={[styles.idolArt, { backgroundColor: withAlpha(colors.accent, 0.16) }]}>
                  <Text style={{ fontSize: 28 }}>{idol.emoji}</Text>
                </View>
                <Text style={styles.idolName} numberOfLines={2}>
                  {idol.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {profile.interests.length > 0 && (
        <View style={[styles.card, styles.stack]}>
          <Text style={styles.title}>My card</Text>
          <InterestGrid interests={profile.interests} />
        </View>
      )}

      <View style={{ marginTop: 14, gap: 26 }}>
        <BadgesSection />
        <OverviewSection onPick={onPick} />
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    label: { color: c.textTertiary, fontFamily: font.medium, fontSize: 14, marginBottom: 10, paddingLeft: 4 },
    gallery: { gap: 12, paddingRight: 8 },
    shot: { width: 150, height: 214, borderRadius: 22, overflow: "hidden", backgroundColor: c.surface },
    addPhotos: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderRadius: radius.lg, padding: 18, borderWidth: 1, borderColor: c.border },
    addText: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14, flex: 1 },
    card: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: c.surface, borderRadius: radius.xl, padding: 18, borderWidth: 1, borderColor: c.border },
    stack: { flexDirection: "column", alignItems: "stretch", gap: 12 },
    twoCol: { flexDirection: "row", gap: 12 },
    tile: { flex: 1, flexDirection: "column", alignItems: "flex-start", gap: 6, padding: 16 },
    tileLabel: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    tileValue: { color: c.text, fontFamily: font.semibold, fontSize: 15, lineHeight: 20 },
    title: { ...type.heading, color: c.text },
    about: { ...type.body, color: c.text },
    detail: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
    divider: { borderTopWidth: 1, borderTopColor: c.border },
    detailIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    detailLabel: { color: c.textSecondary, fontFamily: font.medium, fontSize: 14, width: 84 },
    detailValue: { color: c.text, fontFamily: font.semibold, fontSize: 14.5, flex: 1, textAlign: "right" },
    idols: { flexDirection: "row", gap: 14 },
    idol: { flex: 1, alignItems: "center", gap: 8 },
    idolArt: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
    idolName: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12.5, textAlign: "center" },
  });
