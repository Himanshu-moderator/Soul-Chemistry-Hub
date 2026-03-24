import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { CONNECTIONS, COMPATIBILITY_PAIRS, MY_PROFILE } from "@/data/mockData";
import { GlassCard } from "@/components/GlassCard";
import { AvatarCircle } from "@/components/AvatarCircle";
import { ChemistryRing } from "@/components/ChemistryRing";
import { TypeBadge } from "@/components/TypeBadge";
import { SectionHeader } from "@/components/SectionHeader";

const STATUS_COLORS: Record<string, string> = {
  Soulmate: COLORS.accent,
  Confidant: COLORS.accentBlue,
  Ally: COLORS.accentGreen,
  Friend: "#FFB800",
  Kindred: "#EC407A",
  Rival: COLORS.accentRed,
};

export default function SoulScreen() {
  const insets = useSafeAreaInsets();
  const [selectedConnection, setSelectedConnection] = useState<typeof CONNECTIONS[0] | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const topConnection = CONNECTIONS[0];

  const handlePress = (c: typeof CONNECTIONS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConnection(c);
    setDetailVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Soul & Chemistry</Text>
            <Text style={styles.headerSub}>Your type connections & compatibility</Text>
          </View>
          <Ionicons name="planet" size={32} color={COLORS.accent} />
        </View>

        {/* Hero Chemistry Card */}
        <GlassCard style={styles.heroCard}>
          <Text style={styles.heroLabel}>Your Highest Chemistry</Text>
          <View style={styles.heroContent}>
            <View style={styles.heroAvatars}>
              <AvatarCircle name={MY_PROFILE.name} size={56} mbti={MY_PROFILE.mbti} />
              <View style={styles.avatarOverlap}>
                <AvatarCircle name={topConnection.name} size={56} mbti={topConnection.mbti} isOnline={topConnection.isOnline} />
              </View>
            </View>
            <View style={styles.heroInfo}>
              <ChemistryRing percent={93} size={90} color={COLORS.accent} label="Soul" />
            </View>
          </View>
          <View style={styles.heroBottom}>
            <View>
              <Text style={styles.connectionName}>{topConnection.name}</Text>
              <View style={styles.connectionTypes}>
                <TypeBadge type={topConnection.mbti} size="sm" />
                <TypeBadge type={topConnection.enneagram} size="sm" color={COLORS.accentBlue} />
              </View>
            </View>
            <View style={[styles.statusCard, { backgroundColor: (STATUS_COLORS[topConnection.status] || COLORS.accent) + "20", borderColor: (STATUS_COLORS[topConnection.status] || COLORS.accent) + "50" }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[topConnection.status] || COLORS.accent }]}>{topConnection.status}</Text>
            </View>
          </View>

          {/* Status labels */}
          <View style={styles.statusLabels}>
            {["Consigliere", "Affiliative", "Calm"].map((s, i) => (
              <View key={s} style={[styles.statusLabel, { backgroundColor: [COLORS.accent, COLORS.accentBlue, COLORS.accentGreen][i] + "20", borderColor: [COLORS.accent, COLORS.accentBlue, COLORS.accentGreen][i] + "40" }]}>
                <View style={[styles.statusDot, { backgroundColor: [COLORS.accent, COLORS.accentBlue, COLORS.accentGreen][i] }]} />
                <Text style={[styles.statusLabelText, { color: [COLORS.accent, COLORS.accentBlue, COLORS.accentGreen][i] }]}>{s}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* All Connections */}
        <SectionHeader title="All Connections" action="See Map" />
        <View style={styles.connectionGrid}>
          {CONNECTIONS.map((c) => (
            <Pressable key={c.id} onPress={() => handlePress(c)} style={({ pressed }) => [styles.connectionItem, { opacity: pressed ? 0.8 : 1 }]}>
              <GlassCard style={styles.connectionCard}>
                <ChemistryRing percent={c.chemistry} size={56} color={STATUS_COLORS[c.status] || COLORS.accent} />
                <AvatarCircle name={c.name} size={36} mbti={c.mbti} isOnline={c.isOnline} style={styles.connectionAvatar} />
                <Text style={styles.connectionCardName} numberOfLines={1}>{c.name.split(" ")[0]}</Text>
                <TypeBadge type={c.mbti} size="sm" />
                <View style={[styles.miniStatus, { backgroundColor: (STATUS_COLORS[c.status] || COLORS.accent) + "20" }]}>
                  <Text style={[styles.miniStatusText, { color: STATUS_COLORS[c.status] || COLORS.accent }]}>{c.status}</Text>
                </View>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        {/* Compatibility Pairs */}
        <SectionHeader title="Golden Type Pairs" style={{ marginTop: 24 }} />
        <View style={styles.pairsContainer}>
          {COMPATIBILITY_PAIRS.map((pair, i) => (
            <GlassCard key={i} style={styles.pairCard}>
              <View style={styles.pairRow}>
                <TypeBadge type={pair.type1} size="md" />
                <View style={styles.pairArrow}>
                  <Ionicons name="heart" size={14} color={COLORS.accentRed} />
                </View>
                <TypeBadge type={pair.type2} size="md" />
              </View>
              <View style={styles.pairBottom}>
                <View style={styles.pairLabelBadge}>
                  <Text style={styles.pairLabel}>{pair.label}</Text>
                </View>
                <ChemistryRing percent={pair.score} size={44} color={COLORS.accentGold} />
              </View>
              <Text style={styles.pairNote}>{pair.note}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Type Breakdown */}
        <SectionHeader title="Your Big 5 Profile" style={{ marginTop: 24 }} />
        <GlassCard>
          {Object.entries(MY_PROFILE.bigFive).map(([key, val]) => {
            const labels: Record<string, [string, string]> = {
              O: ["Openness", "Curious"],
              C: ["Conscientiousness", "Organized"],
              E: ["Extraversion", "Reserved"],
              A: ["Agreeableness", "Cooperative"],
              N: ["Neuroticism", "Stable"],
            };
            const [label, sub] = labels[key] || [key, ""];
            const color = val > 70 ? COLORS.accent : val > 40 ? COLORS.accentBlue : COLORS.accentGreen;
            return (
              <View key={key} style={styles.bigFiveRow}>
                <View style={styles.bigFiveLabel}>
                  <Text style={styles.bigFiveKey}>{label}</Text>
                  <Text style={styles.bigFiveSub}>{sub}</Text>
                </View>
                <View style={styles.bigFiveBar}>
                  <View style={[styles.bigFiveFill, { width: `${val}%`, backgroundColor: color }]} />
                </View>
                <Text style={[styles.bigFiveVal, { color }]}>{val}</Text>
              </View>
            );
          })}
        </GlassCard>
      </ScrollView>

      {/* Connection Detail Modal */}
      <Modal visible={detailVisible} transparent animationType="slide" onRequestClose={() => setDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHandle} />
            {selectedConnection && (
              <>
                <View style={styles.detailHeader}>
                  <AvatarCircle name={selectedConnection.name} size={64} mbti={selectedConnection.mbti} isOnline={selectedConnection.isOnline} />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailName}>{selectedConnection.name}</Text>
                    <View style={styles.detailTypes}>
                      <TypeBadge type={selectedConnection.mbti} size="sm" />
                      <TypeBadge type={selectedConnection.enneagram} size="sm" color={COLORS.accentBlue} />
                    </View>
                    <Text style={styles.detailLastSeen}>
                      {selectedConnection.isOnline ? "Online now" : `Last seen ${selectedConnection.lastSeen}`}
                    </Text>
                  </View>
                  <ChemistryRing percent={selectedConnection.chemistry} size={70} color={STATUS_COLORS[selectedConnection.status] || COLORS.accent} label="Match" />
                </View>

                <View style={styles.detailStats}>
                  {[
                    { label: "Chemistry", val: `${selectedConnection.chemistry}%`, color: COLORS.accent },
                    { label: "Status", val: selectedConnection.status, color: STATUS_COLORS[selectedConnection.status] || COLORS.accent },
                    { label: "MBTI", val: selectedConnection.mbti, color: (COLORS.MBTI as Record<string, string>)[selectedConnection.mbti] || COLORS.accent },
                  ].map((s) => (
                    <View key={s.label} style={[styles.detailStat, { backgroundColor: s.color + "15" }]}>
                      <Text style={[styles.detailStatVal, { color: s.color }]}>{s.val}</Text>
                      <Text style={styles.detailStatLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailActions}>
                  <TouchableOpacity style={styles.messageBtn} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDetailVisible(false);
                  }}>
                    <Feather name="message-circle" size={18} color={COLORS.textPrimary} />
                    <Text style={styles.messageBtnText}>Message</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.compareBtn} onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDetailVisible(false);
                  }}>
                    <Feather name="bar-chart-2" size={18} color={COLORS.accent} />
                    <Text style={styles.compareBtnText}>Compare Types</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  headerSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  heroCard: { gap: 16 },
  heroLabel: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 },
  heroContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroAvatars: { flexDirection: "row", alignItems: "center" },
  avatarOverlap: { marginLeft: -16 },
  heroInfo: { alignItems: "center" },
  heroBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  connectionName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 4 },
  connectionTypes: { flexDirection: "row", gap: 6 },
  statusCard: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  statusLabels: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusLabel: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabelText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  connectionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  connectionItem: { width: "30%" },
  connectionCard: { padding: 12, alignItems: "center", gap: 6, position: "relative" },
  connectionAvatar: { position: "absolute", top: 14, left: "50%", transform: [{ translateX: -18 }] },
  connectionCardName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 12, marginTop: 2 },
  miniStatus: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  miniStatusText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  pairsContainer: { gap: 10 },
  pairCard: { gap: 10 },
  pairRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pairArrow: { flex: 1, alignItems: "center" },
  pairBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pairLabelBadge: { backgroundColor: COLORS.accentGold + "20", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.accentGold + "40" },
  pairLabel: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  pairNote: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  bigFiveRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  bigFiveLabel: { width: 100 },
  bigFiveKey: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bigFiveSub: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 },
  bigFiveBar: { flex: 1, height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: "hidden" },
  bigFiveFill: { height: 6, borderRadius: 3 },
  bigFiveVal: { width: 30, fontFamily: "Inter_700Bold", fontSize: 13, textAlign: "right" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  detailModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 20 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  detailHeader: { flexDirection: "row", gap: 14, alignItems: "center" },
  detailInfo: { flex: 1, gap: 6 },
  detailName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  detailTypes: { flexDirection: "row", gap: 6 },
  detailLastSeen: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  detailStats: { flexDirection: "row", gap: 10 },
  detailStat: { flex: 1, alignItems: "center", padding: 12, borderRadius: 14, gap: 4 },
  detailStatVal: { fontFamily: "Inter_700Bold", fontSize: 16 },
  detailStatLabel: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  detailActions: { flexDirection: "row", gap: 12 },
  messageBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.accent, borderRadius: 14, padding: 14 },
  messageBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  compareBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.accentDim, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.accent + "40" },
  compareBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
