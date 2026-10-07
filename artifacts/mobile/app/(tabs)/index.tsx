import React, { useState, useCallback } from "react";
import {
  FlatList,
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
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { FAMOUS_PEOPLE, PERSONALITY_TYPES, KNOWLEDGE_QUESTIONS } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { AvatarCircle } from "@/components/AvatarCircle";
import { TypeBadge } from "@/components/TypeBadge";
import { CoinBadge } from "@/components/CoinBadge";

type FilterType = "All" | "Trending" | "Following";

const featureCards = (mbti: string) => [
  { id: "f1", title: `Famous ${mbti}`, sub: "Celebrities, characters, music", icon: "⭐", color: "#7C3AED" },
  { id: "f2", title: "Chemistry", sub: `Who feels like home to ${mbti}?`, icon: "◎", color: "#0891B2", isChemistry: true },
  { id: "f3", title: `${mbti} Wiki`, sub: "Strengths, soul, growth & more", icon: "🧠", color: "#065F46" },
  { id: "f4", title: "Community", sub: "MBTI, creativity & life", icon: "👥", color: "#1D4ED8" },
];

export default function PersonalitiesScreen() {
  const insets = useSafeAreaInsets();
  const { followedPeople, toggleFollow, coins, addCoins, dailyCheckinDone, setDailyCheckinDone, profile } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const q = KNOWLEDGE_QUESTIONS[0];

  const filtered = FAMOUS_PEOPLE.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.mbti.includes(search.toUpperCase());
    if (activeFilter === "Trending") return matchSearch && p.trending;
    if (activeFilter === "Following") return matchSearch && followedPeople.includes(p.id);
    return matchSearch;
  });

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAnswer(idx);
    setShowResult(true);
    if (idx === q.correct) {
      setTimeout(() => {
        addCoins(q.coins);
        setDailyCheckinDone(true);
        setCheckinVisible(false);
      }, 1600);
    }
  };

  const renderPerson = useCallback(({ item, index }: { item: typeof FAMOUS_PEOPLE[0]; index: number }) => {
    const isFollowing = followedPeople.includes(item.id);
    const typeColor = COLORS.typeColor;

    return (
      <TouchableOpacity
        style={styles.personRow}
        activeOpacity={0.75}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <View style={styles.personLeft}>
          <AvatarCircle name={item.name} size={52} mbti={item.mbti} />
          <View style={styles.personInfo}>
            <View style={styles.personNameRow}>
              <Text style={styles.personName}>{item.name}</Text>
              {item.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
                </View>
              )}
            </View>
            <Text style={styles.personSource} numberOfLines={1}>{item.job}</Text>
            {item.trending && (
              <View style={styles.trendingRow}>
                <Text style={styles.trendingText}>🔥 Trending</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.personRight}>
          <Text style={styles.voteCount}>{item.followers} Pdb votes</Text>
          <Text style={[styles.mbtiLarge, { color: typeColor }]}>{item.mbti}</Text>
          <Text style={styles.enneagramSmall}>{item.enneagram}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [followedPeople]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header banner - artistic dark bg */}
      <View style={styles.heroBanner}>
        <View style={styles.bannerBg} />
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.avatarBtn}>
            <AvatarCircle name={profile.name} size={32} mbti={profile.mbti} />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="2 million characters, celebrities, drink..."
            placeholderTextColor={COLORS.textTertiary}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={COLORS.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Feature cards grid */}
            <View style={styles.featureGrid}>
              {featureCards(profile.mbti).map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.featureCard, { borderColor: card.color + "30" }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  activeOpacity={0.75}
                >
                  {card.isChemistry ? (
                    <View style={[styles.chemistryIcon, { borderColor: card.color }]}>
                      <View style={[styles.chemistryInner, { backgroundColor: card.color }]} />
                    </View>
                  ) : (
                    <Text style={styles.featureIcon}>{card.icon}</Text>
                  )}
                  <Text style={styles.featureTitle}>{card.title}</Text>
                  <Text style={styles.featureSub}>{card.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Daily check-in */}
            {!dailyCheckinDone && (
              <TouchableOpacity style={styles.checkinBanner} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setCheckinVisible(true);
              }}>
                <View style={styles.checkinLeft}>
                  <Ionicons name="sparkles" size={18} color={COLORS.accentGold} />
                  <View>
                    <Text style={styles.checkinTitle}>Daily Knowledge Check-in</Text>
                    <Text style={styles.checkinSub}>Earn +5 coins · Answer today's question</Text>
                  </View>
                </View>
                <View style={styles.coinPill}>
                  <CoinBadge amount={coins} size="sm" />
                </View>
              </TouchableOpacity>
            )}

            {/* Filter tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {(["All", "Trending", "Following"] as FilterType[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
                >
                  <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
              {PERSONALITY_TYPES.slice(0, 8).map((t) => (
                <TouchableOpacity
                  key={t.code}
                  style={[styles.typeChip, { borderColor: t.color + "45" }]}
                  onPress={() => { setSearch(t.code); setActiveFilter("All"); }}
                >
                  <Text style={[styles.typeChipText, { color: t.color }]}>{t.code}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Section label */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>
                {activeFilter === "Trending" ? "🔥 Trending" : activeFilter === "Following" ? "Following" : "All Entries"}
              </Text>
              <TouchableOpacity style={styles.sortBtn}>
                <Ionicons name="swap-vertical" size={14} color={COLORS.textTertiary} />
                <Text style={styles.sortText}>Hot</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
      />

      {/* Daily Check-in Modal */}
      <Modal visible={checkinVisible} transparent animationType="slide" onRequestClose={() => setCheckinVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkinModal}>
            <View style={styles.modalHandle} />
            <View style={styles.checkinModalHeader}>
              <Ionicons name="sparkles" size={26} color={COLORS.accentGold} />
              <Text style={styles.checkinModalTitle}>Daily Knowledge Check</Text>
              <Text style={styles.checkinModalSub}>Answer correctly to earn <Text style={{ color: COLORS.accentGold }}>+5 coins</Text></Text>
            </View>
            <Text style={styles.questionText}>{q.question}</Text>
            <View style={styles.optionsList}>
              {q.options.map((opt, idx) => {
                let bg = COLORS.bgCard;
                let border = COLORS.glassBorder;
                let textColor = COLORS.textPrimary;
                if (showResult && idx === q.correct) { bg = COLORS.accentGreen + "1A"; border = COLORS.accentGreen; textColor = COLORS.accentGreen; }
                else if (showResult && idx === selectedAnswer && idx !== q.correct) { bg = COLORS.accentRed + "1A"; border = COLORS.accentRed; textColor = COLORS.accentRed; }
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => handleAnswer(idx)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                    {showResult && idx === q.correct && <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />}
                  </TouchableOpacity>
                );
              })}
            </View>
            {showResult && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationText}>{q.explanation}</Text>
              </View>
            )}
            {!showResult && (
              <TouchableOpacity style={styles.skipBtn} onPress={() => setCheckinVisible(false)}>
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heroBanner: { position: "relative", overflow: "hidden" },
  bannerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F1019",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  avatarBtn: {},
  headerActions: { flexDirection: "row", gap: 10 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgCard, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: COLORS.glassBorder },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 12, marginHorizontal: 16, marginBottom: 14 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 14 },
  listContent: { paddingHorizontal: 0 },
  listHeader: { backgroundColor: COLORS.bg },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginBottom: 14 },
  featureCard: { width: "47%", backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  chemistryIcon: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  chemistryInner: { width: 16, height: 16, borderRadius: 8, opacity: 0.6 },
  featureIcon: { fontSize: 22 },
  featureTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  featureSub: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 16 },
  checkinBanner: { marginHorizontal: 16, marginBottom: 14, padding: 13, borderRadius: 14, backgroundColor: COLORS.accentGold + "12", borderWidth: 1, borderColor: COLORS.accentGold + "30", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  checkinLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkinTitle: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  checkinSub: { color: COLORS.accentGold + "80", fontFamily: "Inter_400Regular", fontSize: 11, marginTop: 1 },
  coinPill: { backgroundColor: COLORS.accentGold + "20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  filterScroll: { marginBottom: 10 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 13 },
  filterTextActive: { color: "#FFF" },
  typeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, backgroundColor: COLORS.bgCard },
  typeChipText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 10 },
  sectionLabel: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15 },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 13 },
  personRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13 },
  personLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  personInfo: { flex: 1, gap: 3 },
  personNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  personName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  verifiedBadge: {},
  personSource: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  trendingRow: {},
  trendingText: { color: COLORS.accentOrange, fontFamily: "Inter_500Medium", fontSize: 11 },
  personRight: { alignItems: "flex-end", gap: 1 },
  voteCount: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 },
  mbtiLarge: { fontFamily: "Inter_700Bold", fontSize: 20, letterSpacing: 0.5 },
  enneagramSmall: { color: COLORS.textTertiary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  separator: { height: 1, backgroundColor: COLORS.glassBorder, marginHorizontal: 16 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 14 },
  emptyText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", justifyContent: "flex-end" },
  checkinModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  checkinModalHeader: { alignItems: "center", gap: 6 },
  checkinModalTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 21 },
  checkinModalSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  questionText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 26, textAlign: "center" },
  optionsList: { gap: 10 },
  optionBtn: { padding: 14, borderRadius: 14, borderWidth: 1.5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1, lineHeight: 20 },
  explanationBox: { backgroundColor: COLORS.accentGreen + "12", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.accentGreen + "30" },
  explanationText: { color: COLORS.accentGreen, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
});
