import React, { useState, useCallback } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { FAMOUS_PEOPLE, PERSONALITY_TYPES, KNOWLEDGE_QUESTIONS } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { TypeBadge } from "@/components/TypeBadge";
import { AvatarCircle } from "@/components/AvatarCircle";
import { CoinBadge } from "@/components/CoinBadge";
import { SectionHeader } from "@/components/SectionHeader";

export default function PersonalitiesScreen() {
  const insets = useSafeAreaInsets();
  const { followedPeople, toggleFollow, coins, addCoins, dailyCheckinDone, setDailyCheckinDone } = useApp();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [checkinVisible, setCheckinVisible] = useState(false);
  const [checkinStep, setCheckinStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const filters = ["All", "MBTI", "Trending", "Following"];
  const q = KNOWLEDGE_QUESTIONS[0];

  const filtered = FAMOUS_PEOPLE.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mbti.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === "Trending") return matchSearch && p.trending;
    if (activeFilter === "Following") return matchSearch && followedPeople.includes(p.id);
    return matchSearch;
  });

  const handleFollow = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFollow(id);
  };

  const handleCheckIn = () => {
    if (dailyCheckinDone) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCheckinVisible(true);
    setCheckinStep(0);
    setSelectedAnswer(null);
    setShowResult(false);
  };

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
      }, 1800);
    }
  };

  const renderPerson = useCallback(({ item }: { item: typeof FAMOUS_PEOPLE[0] }) => {
    const typeColor = (COLORS.MBTI as Record<string, string>)[item.mbti] || COLORS.accent;
    const isFollowing = followedPeople.includes(item.id);
    return (
      <GlassCard style={styles.personCard}>
        <View style={styles.personRow}>
          <AvatarCircle name={item.name} size={50} mbti={item.mbti} />
          <View style={styles.personInfo}>
            <View style={styles.personNameRow}>
              <Text style={styles.personName}>{item.name}</Text>
              {item.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.accentBlue} />}
              {item.trending && (
                <View style={styles.trendingBadge}>
                  <Ionicons name="flame" size={10} color={COLORS.accentOrange} />
                  <Text style={styles.trendingText}>Trending</Text>
                </View>
              )}
            </View>
            <Text style={styles.personJob}>{item.job}</Text>
            <View style={styles.personTags}>
              <TypeBadge type={item.mbti} size="sm" />
              <TypeBadge type={item.enneagram} size="sm" color={COLORS.accentBlue} />
            </View>
          </View>
          <View style={styles.personRight}>
            <Text style={styles.followersText}>{item.followers}</Text>
            <Text style={styles.followersLabel}>followers</Text>
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={() => handleFollow(item.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>
    );
  }, [followedPeople]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>PersonaDB</Text>
          <Text style={styles.headerSub}>Discover personality profiles</Text>
        </View>
        <Pressable style={styles.headerRight} onPress={handleCheckIn}>
          <CoinBadge amount={coins} />
          {!dailyCheckinDone && <View style={styles.checkinDot} />}
        </Pressable>
      </View>

      {/* Daily check-in banner */}
      {!dailyCheckinDone && (
        <Pressable style={styles.checkinBanner} onPress={handleCheckIn}>
          <View style={styles.checkinLeft}>
            <Ionicons name="sparkles" size={20} color={COLORS.accentGold} />
            <View>
              <Text style={styles.checkinTitle}>Daily Knowledge Check-in</Text>
              <Text style={styles.checkinSub}>Earn +5 coins for today's question</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.accentGold} />
        </Pressable>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search names, types..."
            placeholderTextColor={COLORS.textTertiary}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={COLORS.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveFilter(f);
            }}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingLeft: 4 }}>
          {PERSONALITY_TYPES.slice(0, 6).map((t) => (
            <TouchableOpacity
              key={t.code}
              style={[styles.typeFilterChip, { borderColor: t.color + "50" }]}
              onPress={() => {
                setSearch(t.code);
                setActiveFilter("All");
              }}
            >
              <View style={[styles.typeDot, { backgroundColor: t.color }]} />
              <Text style={[styles.filterText, { color: t.color }]}>{t.code}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Ad placeholder */}
      <View style={styles.adContainer}>
        <Text style={styles.adLabel}>Sponsored</Text>
        <Text style={styles.adText}>Discover your true type with PersonaDB Premium →</Text>
      </View>

      {/* People list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderPerson}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No personalities found</Text>
          </View>
        }
      />

      {/* Check-in Modal */}
      <Modal visible={checkinVisible} transparent animationType="slide" onRequestClose={() => setCheckinVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkinModal}>
            <View style={styles.checkinModalHeader}>
              <Ionicons name="sparkles" size={28} color={COLORS.accentGold} />
              <Text style={styles.checkinModalTitle}>Daily Knowledge Check</Text>
              <Text style={styles.checkinModalSub}>Answer correctly to earn <Text style={{ color: COLORS.accentGold }}>+5 coins</Text></Text>
            </View>

            <Text style={styles.questionText}>{q.question}</Text>

            <View style={styles.optionsList}>
              {q.options.map((opt, idx) => {
                let bg = COLORS.bgCard;
                let border = COLORS.glassBorder;
                let txtColor = COLORS.textPrimary;
                if (showResult && idx === q.correct) {
                  bg = COLORS.accentGreen + "20";
                  border = COLORS.accentGreen;
                  txtColor = COLORS.accentGreen;
                } else if (showResult && idx === selectedAnswer && idx !== q.correct) {
                  bg = COLORS.accentRed + "20";
                  border = COLORS.accentRed;
                  txtColor = COLORS.accentRed;
                } else if (selectedAnswer === idx) {
                  bg = COLORS.accent + "20";
                  border = COLORS.accent;
                }
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}
                    onPress={() => handleAnswer(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, { color: txtColor }]}>{opt}</Text>
                    {showResult && idx === q.correct && (
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
                    )}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  headerSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  headerRight: { alignItems: "flex-end", position: "relative" },
  checkinDot: { position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accentGold, borderWidth: 1.5, borderColor: COLORS.bg },
  checkinBanner: {
    marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 14,
    backgroundColor: COLORS.accentGoldDim, borderWidth: 1, borderColor: COLORS.accentGold + "40",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  checkinLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkinTitle: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  checkinSub: { color: COLORS.accentGold + "99", fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15 },
  filterScroll: { marginBottom: 12 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
    borderColor: COLORS.glassBorder, backgroundColor: COLORS.bgCard,
  },
  filterChipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.textSecondary, fontFamily: "Inter_500Medium", fontSize: 13 },
  filterTextActive: { color: COLORS.textPrimary },
  typeFilterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, backgroundColor: COLORS.bgCard, flexDirection: "row", alignItems: "center", gap: 5 },
  typeDot: { width: 7, height: 7, borderRadius: 3.5 },
  adContainer: {
    marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 10,
    backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: "dashed",
  },
  adLabel: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 2 },
  adText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  listContent: { paddingHorizontal: 20 },
  personCard: { padding: 14 },
  personRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  personInfo: { flex: 1, gap: 4 },
  personNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  personName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
  personJob: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  personTags: { flexDirection: "row", gap: 5, flexWrap: "wrap", marginTop: 2 },
  personRight: { alignItems: "flex-end", gap: 4 },
  followersText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  followersLabel: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 },
  followBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.accent, backgroundColor: "transparent",
  },
  followBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  followBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  followBtnTextActive: { color: COLORS.textPrimary },
  trendingBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: COLORS.accentOrange + "20", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  trendingText: { color: COLORS.accentOrange, fontFamily: "Inter_600SemiBold", fontSize: 9 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 14 },
  emptyText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  checkinModal: {
    backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16,
  },
  checkinModalHeader: { alignItems: "center", gap: 6 },
  checkinModalTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  checkinModalSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  questionText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 26, textAlign: "center" },
  optionsList: { gap: 10 },
  optionBtn: {
    padding: 14, borderRadius: 14, borderWidth: 1.5,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  optionText: { fontFamily: "Inter_500Medium", fontSize: 14, flex: 1 },
  explanationBox: { backgroundColor: COLORS.accentGreen + "15", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.accentGreen + "40" },
  explanationText: { color: COLORS.accentGreen, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  skipBtn: { alignItems: "center", paddingVertical: 10 },
  skipText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
});
