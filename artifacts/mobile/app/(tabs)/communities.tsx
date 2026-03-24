import React, { useState } from "react";
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
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { COMMUNITIES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { TypeBadge } from "@/components/TypeBadge";

type Community = typeof COMMUNITIES[0];

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const { joinedCommunities, toggleCommunity } = useApp();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"discover" | "mine">("discover");
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareLink] = useState("https://personadb.app/c/");

  const filtered = COMMUNITIES.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "mine") return matchSearch && joinedCommunities.includes(c.id);
    return matchSearch;
  });

  const handleJoin = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleCommunity(id);
  };

  const handleShare = (community: Community) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCommunity(community);
    setShareVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <Pressable style={styles.createBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Feather name="plus" size={18} color={COLORS.accent} />
          <Text style={styles.createBtnText}>Create</Text>
        </Pressable>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmented}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "discover" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("discover")}
        >
          <Text style={[styles.segmentText, activeTab === "discover" && styles.segmentTextActive]}>Discover</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "mine" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("mine")}
        >
          <Text style={[styles.segmentText, activeTab === "mine" && styles.segmentTextActive]}>My Communities</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{joinedCommunities.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Feather name="search" size={15} color={COLORS.textTertiary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search communities..."
            placeholderTextColor={COLORS.textTertiary}
          />
        </View>
      </View>

      {/* Ad Banner */}
      <View style={styles.adContainer}>
        <Text style={styles.adLabel}>Sponsored</Text>
        <Text style={styles.adText}>Create your own private community — upgrade to Premium</Text>
      </View>

      {/* Community List */}
      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>No communities found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isJoined = joinedCommunities.includes(item.id);
          return (
            <Pressable onPress={() => { setSelectedCommunity(item); }} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
              <GlassCard style={styles.communityCard}>
                {/* Color bar */}
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={[styles.communityIcon, { backgroundColor: item.color + "25", borderColor: item.color + "50" }]}>
                      <Text style={[styles.communityIconText, { color: item.color }]}>{item.code}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.communityName} numberOfLines={1}>{item.name}</Text>
                        {item.isPrivate && <Ionicons name="lock-closed" size={12} color={COLORS.textTertiary} />}
                      </View>
                      <Text style={styles.communityDesc} numberOfLines={2}>{item.description}</Text>
                    </View>
                  </View>

                  <View style={styles.tagsRow}>
                    {item.tags.map((t) => (
                      <View key={t} style={styles.tag}>
                        <Text style={styles.tagText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="people" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.statText}>{item.members.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="chatbubbles" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.statText}>{item.posts.toLocaleString()}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Ionicons name="time" size={12} color={COLORS.textTertiary} />
                        <Text style={styles.statText}>{item.recentActivity}</Text>
                      </View>
                    </View>
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(item)}>
                        <Feather name="share-2" size={14} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.joinBtn, isJoined && styles.joinBtnActive]}
                        onPress={() => handleJoin(item.id)}
                      >
                        <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextActive]}>
                          {isJoined ? "Joined" : "Join"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Pressable>
          );
        }}
      />

      {/* Share Link Modal */}
      <Modal visible={shareVisible} transparent animationType="slide" onRequestClose={() => setShareVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.shareModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.shareTitle}>Share Community</Text>
            {selectedCommunity && (
              <Text style={styles.shareName}>{selectedCommunity.name}</Text>
            )}
            <View style={styles.linkBox}>
              <Text style={styles.linkText}>{shareLink}{selectedCommunity?.id}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShareVisible(false);
              }}>
                <Feather name="copy" size={16} color={COLORS.textPrimary} />
                <Text style={styles.copyText}>Copy Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptions}>
              {["Twitter / X", "Telegram", "Discord", "WhatsApp"].map((p) => (
                <TouchableOpacity key={p} style={styles.sharePlatform} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShareVisible(false);
                }}>
                  <Feather name="external-link" size={16} color={COLORS.accent} />
                  <Text style={styles.sharePlatformText}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShareVisible(false)}>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: COLORS.accentDim, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent + "40" },
  createBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  segmented: { flexDirection: "row", marginHorizontal: 20, marginBottom: 14, backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: COLORS.glassBorder },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 },
  segmentBtnActive: { backgroundColor: COLORS.accent },
  segmentText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  segmentTextActive: { color: COLORS.textPrimary },
  countBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 11 },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 14, paddingVertical: 11 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15 },
  adContainer: { marginHorizontal: 20, marginBottom: 12, padding: 12, borderRadius: 10, backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: "dashed" },
  adLabel: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 2 },
  adText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  listContent: { paddingHorizontal: 20 },
  communityCard: { padding: 0, overflow: "hidden" },
  colorBar: { height: 4, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  cardContent: { padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", gap: 12 },
  communityIcon: { width: 50, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  communityIconText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  cardInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  communityName: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15, flex: 1 },
  communityDesc: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  tagsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { backgroundColor: COLORS.bgTertiary, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: COLORS.glassBorder },
  tagText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 11 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 12 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shareBtn: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", justifyContent: "center" },
  joinBtn: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accent },
  joinBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  joinBtnText: { color: COLORS.accent, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  joinBtnTextActive: { color: COLORS.textPrimary },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 14 },
  emptyText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  shareModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 14 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 8 },
  shareTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  shareName: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  linkBox: { backgroundColor: COLORS.bgTertiary, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 14, gap: 10 },
  linkText: { color: COLORS.accent, fontFamily: "Inter_400Regular", fontSize: 13 },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.accent, borderRadius: 10, padding: 10, justifyContent: "center" },
  copyText: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  shareOptions: { gap: 8 },
  sharePlatform: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.glassBorder },
  sharePlatformText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 15 },
});
