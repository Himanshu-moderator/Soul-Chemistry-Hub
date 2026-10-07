import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Avatar, TypeBadge } from "@/components/ui";
import { FAMOUS_PEOPLE } from "@/data/mockData";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";

type Person = (typeof FAMOUS_PEOPLE)[number];

interface Props {
  person: Person;
  following: boolean;
  onToggleFollow: () => void;
}

// One famous personality: avatar, name, what they do, their type and a follow button.
function PersonRowImpl({ person, following, onToggleFollow }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Avatar name={person.name} size={46} mbti={person.mbti} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {person.name}
          </Text>
          {person.verified && <Ionicons name="checkmark-circle" size={15} color={colors.cyan} />}
          {person.trending && <Ionicons name="flame" size={14} color={colors.warning} />}
        </View>
        <Text style={styles.job} numberOfLines={1}>
          {person.job}
        </Text>
        <Text style={styles.meta}>
          {person.followers} fans · {person.enneagram}
        </Text>
      </View>
      <View style={styles.right}>
        <TypeBadge type={person.mbti} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={following ? `Unfollow ${person.name}` : `Follow ${person.name}`}
          hitSlop={8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleFollow();
          }}
          style={[styles.follow, following && { backgroundColor: colors.accentSoft }]}
        >
          <Feather name={following ? "check" : "plus"} size={16} color={following ? colors.accent : colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12 },
    info: { flex: 1, gap: 2 },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    name: { color: c.text, fontFamily: font.semibold, fontSize: 16, flexShrink: 1 },
    job: { color: c.textSecondary, fontFamily: font.regular, fontSize: 13.5 },
    meta: { color: c.textTertiary, fontFamily: font.regular, fontSize: 12 },
    right: { alignItems: "flex-end", gap: 8, paddingLeft: 4 },
    follow: { width: 34, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceStrong, borderRadius: 17 },
  });

// Re-render a row only when its own data changes (the list is long).
export const PersonRow = React.memo(PersonRowImpl);
