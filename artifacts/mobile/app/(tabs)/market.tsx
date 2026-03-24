import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { THEMES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";
import { CoinBadge } from "@/components/CoinBadge";
import { SectionHeader } from "@/components/SectionHeader";

const PREMIUM_FEATURES = [
  { icon: "infinite", label: "Unlimited Connections", desc: "Connect with everyone, no limits" },
  { icon: "color-palette", label: "All 6 Themes", desc: "Unlock every premium theme" },
  { icon: "analytics", label: "Deep Analytics", desc: "Full Big 5, MBTI cognitive stack" },
  { icon: "people", label: "Private Communities", desc: "Create & manage private groups" },
  { icon: "star", label: "AI Type Advisor", desc: "Personalized type coaching" },
  { icon: "shield-checkmark", label: "No Ads", desc: "Completely ad-free experience" },
];

const COIN_PACKS = [
  { id: "p1", coins: 100, price: "$0.99", bonus: null, popular: false },
  { id: "p2", coins: 500, price: "$3.99", bonus: "+50 Bonus", popular: true },
  { id: "p3", coins: 1200, price: "$7.99", bonus: "+200 Bonus", popular: false },
  { id: "p4", coins: 5000, price: "$24.99", bonus: "+1000 Bonus", popular: false },
];

const COIN_REWARDS = [
  { id: "r1", label: "Daily Check-in", coins: 5, icon: "checkmark-circle" },
  { id: "r2", label: "Complete Profile", coins: 20, icon: "person" },
  { id: "r3", label: "Join Community", coins: 10, icon: "people" },
  { id: "r4", label: "7-Day Streak", coins: 35, icon: "flame" },
  { id: "r5", label: "Refer a Friend", coins: 50, icon: "gift" },
];

export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { coins, selectedTheme, setSelectedTheme, isPremium, setIsPremium, trialActive, setTrialActive, profile } = useApp();
  const [trialModalVisible, setTrialModalVisible] = useState(false);
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [selectedPack, setSelectedPack] = useState<typeof COIN_PACKS[0] | null>(null);
  const [activeSection, setActiveSection] = useState<"premium" | "themes" | "coins">("premium");

  const handleStartTrial = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsPremium(true);
    setTrialActive(true);
    setTrialModalVisible(false);
  };

  const handleThemeSelect = (id: string, isFree: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isFree && !isPremium) {
      setTrialModalVisible(true);
      return;
    }
    setSelectedTheme(id);
  };

  const handleBuyCoin = (pack: typeof COIN_PACKS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPack(pack);
    setPurchaseVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Market</Text>
            <Text style={styles.headerSub}>Premium · Themes · Coins</Text>
          </View>
          <View style={styles.coinDisplay}>
            <CoinBadge amount={coins} />
          </View>
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionTabs}>
          {(["premium", "themes", "coins"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.sectionTab, activeSection === s && styles.sectionTabActive]}
              onPress={() => setActiveSection(s)}
            >
              <Text style={[styles.sectionTabText, activeSection === s && styles.sectionTabTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium Section */}
        {activeSection === "premium" && (
          <>
            {isPremium ? (
              <GlassCard style={styles.activeSubCard}>
                <View style={styles.activeSubTop}>
                  <Ionicons name="star" size={28} color={COLORS.accentGold} />
                  <View>
                    <Text style={styles.activeSubTitle}>Premium Active</Text>
                    <Text style={styles.activeSubSub}>{trialActive ? "14-day Free Trial · Cancel Anytime" : "Full Premium Member"}</Text>
                  </View>
                </View>
                <View style={styles.activeSubBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.accentGreen} />
                  <Text style={styles.activeSubBadgeText}>All features unlocked</Text>
                </View>
              </GlassCard>
            ) : (
              <GlassCard style={styles.premiumHero}>
                <View style={styles.premiumHeroTop}>
                  <View style={styles.premiumIconWrap}>
                    <Ionicons name="star" size={32} color={COLORS.accentGold} />
                  </View>
                  <View>
                    <Text style={styles.premiumHeroTitle}>PersonaDB Premium</Text>
                    <Text style={styles.premiumHeroSub}>14-day free trial, then $9.99/mo</Text>
                  </View>
                </View>

                <View style={styles.premiumFeatures}>
                  {PREMIUM_FEATURES.map((f) => (
                    <View key={f.label} style={styles.premiumFeature}>
                      <View style={styles.premiumFeatureIcon}>
                        <Ionicons name={f.icon as any} size={18} color={COLORS.accent} />
                      </View>
                      <View style={styles.premiumFeatureInfo}>
                        <Text style={styles.premiumFeatureLabel}>{f.label}</Text>
                        <Text style={styles.premiumFeatureDesc}>{f.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.trialBtn} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setTrialModalVisible(true);
                }}>
                  <Ionicons name="star" size={18} color={COLORS.bg} />
                  <Text style={styles.trialBtnText}>Start 14-Day Free Trial</Text>
                </TouchableOpacity>

                <Text style={styles.trialNote}>Cancel anytime. No charge for 14 days.</Text>
              </GlassCard>
            )}

            {/* Ad placeholder */}
            <View style={styles.adContainer}>
              <Text style={styles.adLabel}>Sponsored</Text>
              <Text style={styles.adText}>Take the official MBTI assessment — 15% off with code PERSONADB</Text>
            </View>
          </>
        )}

        {/* Themes Section */}
        {activeSection === "themes" && (
          <>
            <Text style={styles.sectionNote}>Choose your visual experience</Text>
            <View style={styles.themesGrid}>
              {THEMES.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                const isLocked = !theme.free && !isPremium;
                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[styles.themeCard, isSelected && styles.themeCardSelected]}
                    onPress={() => handleThemeSelect(theme.id, theme.free)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.themePreview, { backgroundColor: theme.preview }]}>
                      <View style={[styles.themeAccentLine, { backgroundColor: theme.accent }]} />
                      <View style={[styles.themeAccentDot, { backgroundColor: theme.accent }]} />
                      {isLocked && (
                        <View style={styles.themeLockOverlay}>
                          <Ionicons name="lock-closed" size={20} color="rgba(255,255,255,0.7)" />
                        </View>
                      )}
                    </View>
                    <View style={styles.themeInfo}>
                      <View style={styles.themeNameRow}>
                        <Text style={styles.themeName}>{theme.name}</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} />}
                      </View>
                      <Text style={styles.themeDesc}>{theme.description}</Text>
                      {!theme.free && (
                        <View style={styles.premiumThemeBadge}>
                          <Ionicons name="star" size={10} color={COLORS.accentGold} />
                          <Text style={styles.premiumThemeBadgeText}>Premium</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!isPremium && (
              <TouchableOpacity style={styles.unlockThemesBtn} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTrialModalVisible(true);
              }}>
                <Ionicons name="star" size={16} color={COLORS.accentGold} />
                <Text style={styles.unlockThemesBtnText}>Unlock All Themes — Free Trial</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Coins Section */}
        {activeSection === "coins" && (
          <>
            <GlassCard style={styles.coinBalanceCard}>
              <View style={styles.coinBalanceRow}>
                <Ionicons name="logo-bitcoin" size={36} color={COLORS.accentGold} />
                <View>
                  <Text style={styles.coinBalanceVal}>{coins}</Text>
                  <Text style={styles.coinBalanceLabel}>PersonaCoins</Text>
                </View>
              </View>
              <View style={styles.coinUsageHint}>
                <Text style={styles.coinUsageText}>Use coins for premium features, boosts & exclusive content</Text>
              </View>
            </GlassCard>

            <SectionHeader title="Buy Coins" />
            <View style={styles.coinPacks}>
              {COIN_PACKS.map((pack) => (
                <TouchableOpacity
                  key={pack.id}
                  style={[styles.coinPack, pack.popular && styles.coinPackPopular]}
                  onPress={() => handleBuyCoin(pack)}
                  activeOpacity={0.7}
                >
                  {pack.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Most Popular</Text>
                    </View>
                  )}
                  <View style={styles.coinPackLeft}>
                    <Ionicons name="logo-bitcoin" size={28} color={COLORS.accentGold} />
                    <View>
                      <Text style={styles.coinPackAmount}>{pack.coins.toLocaleString()}</Text>
                      {pack.bonus && <Text style={styles.coinPackBonus}>{pack.bonus}</Text>}
                    </View>
                  </View>
                  <View style={styles.coinPackBtn}>
                    <Text style={styles.coinPackPrice}>{pack.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <SectionHeader title="Earn Free Coins" style={{ marginTop: 8 }} />
            <View style={styles.earnList}>
              {COIN_REWARDS.map((r) => (
                <GlassCard key={r.id} style={styles.earnItem} padding={14}>
                  <View style={styles.earnLeft}>
                    <View style={styles.earnIconWrap}>
                      <Ionicons name={r.icon as any} size={20} color={COLORS.accent} />
                    </View>
                    <Text style={styles.earnLabel}>{r.label}</Text>
                  </View>
                  <View style={styles.earnRight}>
                    <Ionicons name="logo-bitcoin" size={14} color={COLORS.accentGold} />
                    <Text style={styles.earnCoins}>+{r.coins}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Trial Modal */}
      <Modal visible={trialModalVisible} transparent animationType="slide" onRequestClose={() => setTrialModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.trialModal}>
            <View style={styles.modalHandle} />
            <View style={styles.trialModalHeader}>
              <View style={styles.trialModalIcon}>
                <Ionicons name="star" size={36} color={COLORS.accentGold} />
              </View>
              <Text style={styles.trialModalTitle}>Try Premium Free</Text>
              <Text style={styles.trialModalSub}>14 days free · Cancel anytime · No charge today</Text>
            </View>

            <View style={styles.trialFeatureList}>
              {PREMIUM_FEATURES.slice(0, 4).map((f) => (
                <View key={f.label} style={styles.trialFeatureItem}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.accentGreen} />
                  <Text style={styles.trialFeatureText}>{f.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.trialPricingBox}>
              <View style={styles.trialPricingRow}>
                <Text style={styles.trialPricingPeriod}>Days 1–14</Text>
                <Text style={styles.trialPricingFree}>Free</Text>
              </View>
              <View style={[styles.trialPricingRow, { borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: 10, marginTop: 6 }]}>
                <Text style={styles.trialPricingPeriod}>After trial</Text>
                <Text style={styles.trialPricingPrice}>$9.99 / month</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startTrialBtn} onPress={handleStartTrial}>
              <Text style={styles.startTrialText}>Start Free Trial</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.maybeLaterBtn} onPress={() => setTrialModalVisible(false)}>
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Purchase Modal */}
      <Modal visible={purchaseVisible} transparent animationType="slide" onRequestClose={() => setPurchaseVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.purchaseModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.purchaseTitle}>Confirm Purchase</Text>
            {selectedPack && (
              <>
                <View style={styles.purchaseDetails}>
                  <Ionicons name="logo-bitcoin" size={40} color={COLORS.accentGold} />
                  <Text style={styles.purchaseCoins}>{selectedPack.coins.toLocaleString()} Coins</Text>
                  {selectedPack.bonus && <Text style={styles.purchaseBonus}>{selectedPack.bonus}</Text>}
                  <Text style={styles.purchasePrice}>{selectedPack.price}</Text>
                </View>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setPurchaseVisible(false);
                }}>
                  <Text style={styles.confirmBtnText}>Purchase Now</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.cancelPurchase} onPress={() => setPurchaseVisible(false)}>
              <Text style={styles.cancelPurchaseText}>Cancel</Text>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 26 },
  headerSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  coinDisplay: { backgroundColor: COLORS.accentGoldDim, borderRadius: 20, borderWidth: 1, borderColor: COLORS.accentGold + "40", paddingHorizontal: 12, paddingVertical: 8 },
  sectionTabs: { flexDirection: "row", backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: COLORS.glassBorder },
  sectionTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  sectionTabActive: { backgroundColor: COLORS.accent },
  sectionTabText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  sectionTabTextActive: { color: COLORS.textPrimary },
  activeSubCard: { gap: 14, borderColor: COLORS.accentGold + "40" },
  activeSubTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  activeSubTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  activeSubSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  activeSubBadge: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.accentGreen + "15", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.accentGreen + "30" },
  activeSubBadgeText: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  premiumHero: { gap: 20 },
  premiumHeroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  premiumIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.accentGold + "20", borderWidth: 1, borderColor: COLORS.accentGold + "40", alignItems: "center", justifyContent: "center" },
  premiumHeroTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  premiumHeroSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  premiumFeatures: { gap: 14 },
  premiumFeature: { flexDirection: "row", alignItems: "center", gap: 12 },
  premiumFeatureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center" },
  premiumFeatureInfo: {},
  premiumFeatureLabel: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  premiumFeatureDesc: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  trialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.accentGold, borderRadius: 16, padding: 16 },
  trialBtnText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 16 },
  trialNote: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  adContainer: { padding: 12, borderRadius: 10, backgroundColor: COLORS.bgTertiary, borderWidth: 1, borderColor: COLORS.glassBorder, borderStyle: "dashed" },
  adLabel: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 10, marginBottom: 2 },
  adText: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12 },
  sectionNote: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  themesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  themeCard: { width: "47%", borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.glassBorder, overflow: "hidden", backgroundColor: COLORS.bgCard },
  themeCardSelected: { borderColor: COLORS.accent },
  themePreview: { height: 80, alignItems: "flex-end", justifyContent: "flex-start", padding: 8, position: "relative" },
  themeAccentLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3 },
  themeAccentDot: { width: 16, height: 16, borderRadius: 8 },
  themeLockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  themeInfo: { padding: 12, gap: 4 },
  themeNameRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "space-between" },
  themeName: { color: COLORS.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  themeDesc: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12 },
  premiumThemeBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: COLORS.accentGold + "20", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  premiumThemeBadgeText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 10 },
  unlockThemesBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: COLORS.accentGold + "50", borderRadius: 16, padding: 14, backgroundColor: COLORS.accentGold + "10" },
  unlockThemesBtnText: { color: COLORS.accentGold, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  coinBalanceCard: { borderColor: COLORS.accentGold + "30", gap: 12 },
  coinBalanceRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  coinBalanceVal: { color: COLORS.accentGold, fontFamily: "Inter_700Bold", fontSize: 36 },
  coinBalanceLabel: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  coinUsageHint: { backgroundColor: COLORS.bgTertiary, borderRadius: 10, padding: 10 },
  coinUsageText: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  coinPacks: { gap: 10 },
  coinPack: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 16, position: "relative", overflow: "hidden" },
  coinPackPopular: { borderColor: COLORS.accentGold + "60", backgroundColor: COLORS.accentGold + "08" },
  popularBadge: { position: "absolute", top: 0, right: 0, backgroundColor: COLORS.accentGold, paddingHorizontal: 10, paddingVertical: 3, borderBottomLeftRadius: 10 },
  popularText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 10 },
  coinPackLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  coinPackAmount: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  coinPackBonus: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  coinPackBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  coinPackPrice: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15 },
  earnList: { gap: 8 },
  earnItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  earnLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  earnIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.accentDim, alignItems: "center", justifyContent: "center" },
  earnLabel: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  earnRight: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: COLORS.accentGold + "15", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  earnCoins: { color: COLORS.accentGold, fontFamily: "Inter_700Bold", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  trialModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 20 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  trialModalHeader: { alignItems: "center", gap: 8 },
  trialModalIcon: { width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.accentGold + "20", borderWidth: 1, borderColor: COLORS.accentGold + "40", alignItems: "center", justifyContent: "center" },
  trialModalTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24 },
  trialModalSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  trialFeatureList: { gap: 12, backgroundColor: COLORS.bgTertiary, borderRadius: 16, padding: 16 },
  trialFeatureItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  trialFeatureText: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  trialPricingBox: { backgroundColor: COLORS.bgTertiary, borderRadius: 14, padding: 14, gap: 6 },
  trialPricingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trialPricingPeriod: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  trialPricingFree: { color: COLORS.accentGreen, fontFamily: "Inter_700Bold", fontSize: 16 },
  trialPricingPrice: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  startTrialBtn: { backgroundColor: COLORS.accentGold, borderRadius: 16, padding: 16, alignItems: "center" },
  startTrialText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 17 },
  maybeLaterBtn: { alignItems: "center", paddingVertical: 10 },
  maybeLaterText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
  purchaseModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  purchaseTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  purchaseDetails: { alignItems: "center", gap: 8, backgroundColor: COLORS.bgTertiary, borderRadius: 16, padding: 20 },
  purchaseCoins: { color: COLORS.accentGold, fontFamily: "Inter_700Bold", fontSize: 28 },
  purchaseBonus: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold", fontSize: 14 },
  purchasePrice: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  confirmBtn: { backgroundColor: COLORS.accent, borderRadius: 16, padding: 16, alignItems: "center" },
  confirmBtnText: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  cancelPurchase: { alignItems: "center", paddingVertical: 10 },
  cancelPurchaseText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
});
