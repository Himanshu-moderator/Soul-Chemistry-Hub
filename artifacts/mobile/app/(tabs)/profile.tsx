import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { CONNECTIONS, PERSONALITY_TYPES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { TypeBadge } from "@/components/TypeBadge";
import { AvatarCircle } from "@/components/AvatarCircle";
import { ChemistryRing } from "@/components/ChemistryRing";
import { CoinBadge } from "@/components/CoinBadge";
import { SectionHeader } from "@/components/SectionHeader";


const MBTI_TYPES = PERSONALITY_TYPES.map((t) => t.code);
const ENNEAGRAM_TYPES = ["1w2", "1w9", "2w1", "2w3", "3w2", "3w4", "4w3", "4w5", "5w4", "5w6", "6w5", "6w7", "7w6", "7w8", "8w7", "8w9", "9w1", "9w8"];
const SOCIONICS_TYPES = ["ILE", "SEI", "ESE", "LII", "EIE", "LSI", "SLE", "IEI", "SEE", "ILI", "LIE", "ESI", "LSE", "EII", "IEE", "SLI"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, coins, isPremium } = useApp();

  const [editVisible, setEditVisible] = useState(false);
  const [editField, setEditField] = useState<"name" | "bio" | "mbti" | "enneagram" | "socionics" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);

  const openEdit = (field: typeof editField) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditField(field);
    if (field === "name") setEditValue(profile.name);
    else if (field === "bio") setEditValue(profile.bio);
    else if (field === "mbti") { setEditValue(profile.mbti); setDropdownOptions(MBTI_TYPES); setDropdownVisible(true); return; }
    else if (field === "enneagram") { setEditValue(profile.enneagram); setDropdownOptions(ENNEAGRAM_TYPES); setDropdownVisible(true); return; }
    else if (field === "socionics") { setEditValue(profile.socionics); setDropdownOptions(SOCIONICS_TYPES); setDropdownVisible(true); return; }
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!editField) return;
    updateProfile({ [editField]: editValue } as any);
    setEditVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const selectDropdown = (val: string) => {
    if (!editField) return;
    updateProfile({ [editField]: val } as any);
    setDropdownVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const typeColor = (COLORS.MBTI as Record<string, string>)[profile.mbti] || COLORS.accent;
  const bestConnections = CONNECTIONS.filter((c) => profile.bestConnections.includes(c.id));
  const xpToNext = 500;
  const xpProgress = (profile.xp % xpToNext) / xpToNext;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Feather name="settings" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Hero */}
        <GlassCard style={styles.profileHero}>
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={styles.avatarWrapper}>
              <AvatarCircle name={profile.name} size={76} mbti={profile.mbti} />
              <View style={styles.avatarEditBadge}>
                <Feather name="camera" size={11} color={COLORS.textPrimary} />
              </View>
            </TouchableOpacity>
            <View style={styles.heroInfo}>
              <TouchableOpacity onPress={() => openEdit("name")} style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Feather name="edit-2" size={13} color={COLORS.textTertiary} />
              </TouchableOpacity>
              <Text style={styles.profileUsername}>{profile.username}</Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={11} color={COLORS.accentGold} />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
            <CoinBadge amount={coins} />
          </View>

          <TouchableOpacity onPress={() => openEdit("bio")}>
            <Text style={styles.bioText}>{profile.bio}</Text>
            <Text style={styles.editHint}>Tap to edit bio</Text>
          </TouchableOpacity>

          {/* Type Badges */}
          <View style={styles.typesRow}>
            <TouchableOpacity onPress={() => openEdit("mbti")} style={[styles.typeEditBtn, { borderColor: typeColor + "50" }]}>
              <Text style={[styles.typeEditLabel, { color: typeColor }]}>MBTI</Text>
              <Text style={[styles.typeEditValue, { color: typeColor }]}>{profile.mbti}</Text>
              <Feather name="chevron-down" size={12} color={typeColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openEdit("enneagram")} style={[styles.typeEditBtn, { borderColor: COLORS.accentBlue + "50" }]}>
              <Text style={[styles.typeEditLabel, { color: COLORS.accentBlue }]}>Ennea</Text>
              <Text style={[styles.typeEditValue, { color: COLORS.accentBlue }]}>{profile.enneagram}</Text>
              <Feather name="chevron-down" size={12} color={COLORS.accentBlue} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openEdit("socionics")} style={[styles.typeEditBtn, { borderColor: COLORS.accentGold + "50" }]}>
              <Text style={[styles.typeEditLabel, { color: COLORS.accentGold }]}>Socio</Text>
              <Text style={[styles.typeEditValue, { color: COLORS.accentGold }]}>{profile.socionics}</Text>
              <Feather name="chevron-down" size={12} color={COLORS.accentGold} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* XP Progress */}
        <GlassCard style={styles.xpCard}>
          <View style={styles.xpRow}>
            <View>
              <Text style={styles.xpLevel}>Level {profile.level}</Text>
              <Text style={styles.xpSub}>{profile.xp} XP total · {profile.streak} day streak</Text>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={16} color={COLORS.accentOrange} />
              <Text style={styles.streakText}>{profile.streak}</Text>
            </View>
          </View>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpNextLabel}>{Math.round(xpProgress * xpToNext)} / {xpToNext} XP to Level {profile.level + 1}</Text>
        </GlassCard>

        {/* Social Stats */}
        <SectionHeader title="Social Stats" />
        <GlassCard>
          <View style={styles.statsGrid}>
            {[
              { label: "Followers", val: profile.followers.toLocaleString(), icon: "users", color: COLORS.accent },
              { label: "Following", val: profile.following.toLocaleString(), icon: "user-check", color: COLORS.accentBlue },
              { label: "Matches", val: profile.matches.toString(), icon: "heart", color: COLORS.accentRed },
              { label: "Coins", val: coins.toString(), icon: "award", color: COLORS.accentGold },
            ].map((s) => (
              <View key={s.label} style={[styles.statBox, { backgroundColor: s.color + "12" }]}>
                <Feather name={s.icon as any} size={18} color={s.color} />
                <Text style={[styles.statVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Badges */}
        <SectionHeader title="Badges" action="View All" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesRow}>
          {profile.badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <MaterialCommunityIcons name="medal" size={20} color={COLORS.accentGold} />
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))}
          <View style={[styles.badge, { borderStyle: "dashed" }]}>
            <Feather name="plus" size={18} color={COLORS.textTertiary} />
            <Text style={[styles.badgeText, { color: COLORS.textTertiary }]}>Earn More</Text>
          </View>
        </ScrollView>

        {/* Best Connections */}
        <SectionHeader title="Best Connections" action="See All" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bestConns}>
          {bestConnections.map((c) => (
            <GlassCard key={c.id} style={styles.bestConnCard} padding={12}>
              <AvatarCircle name={c.name} size={48} mbti={c.mbti} isOnline={c.isOnline} />
              <Text style={styles.bestConnName} numberOfLines={1}>{c.name.split(" ")[0]}</Text>
              <ChemistryRing percent={c.chemistry} size={40} color={COLORS.accent} />
              <TypeBadge type={c.mbti} size="sm" />
            </GlassCard>
          ))}
        </ScrollView>

        {/* Most Compatible */}
        <SectionHeader title="Most Compatible With" />
        <View style={styles.compatGrid}>
          {profile.mostCompatible.map((type) => {
            const typeData = PERSONALITY_TYPES.find((t) => t.code === type);
            const col = (COLORS.MBTI as Record<string, string>)[type] || COLORS.accent;
            return (
              <GlassCard key={type} style={[styles.compatCard, { borderColor: col + "30" }]} padding={14}>
                <View style={[styles.compatDot, { backgroundColor: col }]} />
                <TypeBadge type={type} size="md" />
                <Text style={styles.compatName}>{typeData?.name || type}</Text>
                <Text style={styles.compatTagline} numberOfLines={2}>{typeData?.tagline || ""}</Text>
              </GlassCard>
            );
          })}
        </View>

        {/* Daily Connection Tip */}
        <GlassCard style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={18} color={COLORS.accentGold} />
            <Text style={styles.tipTitle}>Daily Connection Tip</Text>
          </View>
          <Text style={styles.tipText}>
            As an INTJ, you thrive in deep 1-on-1 conversations. Today, reach out to your ENFP connections — their energy will spark your creativity.
          </Text>
        </GlassCard>
      </ScrollView>

      {/* Text Edit Modal */}
      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.editTitle}>Edit {editField === "name" ? "Name" : "Bio"}</Text>
            <TextInput
              style={styles.editInput}
              value={editValue}
              onChangeText={setEditValue}
              multiline={editField === "bio"}
              numberOfLines={editField === "bio" ? 3 : 1}
              autoFocus
              placeholder={editField === "name" ? "Your name" : "Tell your story..."}
              placeholderTextColor={COLORS.textTertiary}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dropdown Modal */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.editTitle}>
              Select {editField === "mbti" ? "MBTI Type" : editField === "enneagram" ? "Enneagram Type" : "Socionics Type"}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.dropdownScroll}>
              {dropdownOptions.map((opt) => {
                const isSelected = (editField === "mbti" ? profile.mbti : editField === "enneagram" ? profile.enneagram : profile.socionics) === opt;
                const col = editField === "mbti" ? ((COLORS.MBTI as Record<string, string>)[opt] || COLORS.accent) : editField === "enneagram" ? COLORS.accentBlue : COLORS.accentGold;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: col + "20", borderColor: col + "50" }]}
                    onPress={() => selectDropdown(opt)}
                  >
                    <Text style={[styles.dropdownItemText, isSelected && { color: col }]}>{opt}</Text>
                    {editField === "mbti" && (
                      <Text style={styles.dropdownSubText}>
                        {PERSONALITY_TYPES.find((t) => t.code === opt)?.name || ""}
                      </Text>
                    )}
                    {isSelected && <Ionicons name="checkmark" size={18} color={col} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtnFull} onPress={() => setDropdownVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard, alignItems: "center", justifyContent: "center" },
  profileHero: { gap: 14 },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatarWrapper: { position: "relative" },
  avatarEditBadge: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: COLORS.bg },
  heroInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  profileName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  profileUsername: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 13 },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.accentGold + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: COLORS.accentGold + "40", alignSelf: "flex-start", marginTop: 2 },
  premiumText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 11 },
  bioText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22 },
  editHint: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 4 },
  typesRow: { flexDirection: "row", gap: 8 },
  typeEditBtn: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 3, backgroundColor: COLORS.bgTertiary },
  typeEditLabel: { fontFamily: "Inter_500Medium", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  typeEditValue: { fontFamily: "Inter_700Bold", fontSize: 16 },
  xpCard: { gap: 10 },
  xpRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  xpLevel: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  xpSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.accentOrange + "20", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accentOrange + "40" },
  streakText: { color: COLORS.accentOrange, fontFamily: "Inter_700Bold", fontSize: 16 },
  xpBarBg: { height: 6, backgroundColor: COLORS.bgTertiary, borderRadius: 3, overflow: "hidden" },
  xpBarFill: { height: 6, backgroundColor: COLORS.accent, borderRadius: 3 },
  xpNextLabel: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statBox: { width: "47%", borderRadius: 14, padding: 14, gap: 6, alignItems: "center" },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 22 },
  statLabel: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  badgesRow: { gap: 10, paddingVertical: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 10 },
  badgeText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bestConns: { gap: 10, paddingVertical: 4 },
  bestConnCard: { width: 100, alignItems: "center", gap: 8 },
  bestConnName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  compatGrid: { flexDirection: "row", gap: 10 },
  compatCard: { flex: 1, gap: 8 },
  compatDot: { width: 8, height: 8, borderRadius: 4 },
  compatName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  compatTagline: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  tipCard: { gap: 10, borderColor: COLORS.accentGold + "30" },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  tipTitle: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  tipText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  editModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  dropdownModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16, maxHeight: "75%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  editTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  editInput: { backgroundColor: COLORS.bgTertiary, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 14, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15, minHeight: 50 },
  editActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center" },
  cancelText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  saveBtn: { flex: 1, padding: 14, borderRadius: 14, backgroundColor: COLORS.accent, alignItems: "center" },
  saveBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  dropdownScroll: { maxHeight: 400 },
  dropdownItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "transparent", marginBottom: 6 },
  dropdownItemText: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  dropdownSubText: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, flex: 1 },
  cancelBtnFull: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", marginTop: 4 },
});
