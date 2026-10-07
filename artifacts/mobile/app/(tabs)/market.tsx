import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { GlassCard } from "@/components/GlassCard";

const COIN_PACKS = [
  { id: "p0", coins: 10, price: "Free", free: true, tag: "Free", label: "Watch a video" },
  { id: "p1", coins: 80, price: "₹85.00", free: false, tag: null, label: null },
  { id: "p2", coins: 450, price: "₹210.00", free: false, tag: null, label: null },
  { id: "p3", coins: 950, price: "₹410.00", free: false, tag: "POPULAR", label: null },
  { id: "p4", coins: 2000, price: "₹820.00", free: false, tag: null, label: null },
  { id: "p5", coins: 5500, price: "₹2,050.00", free: false, tag: null, label: null },
];

// A three-day reward cycle that follows your real check-in streak.
const DAILY_REWARDS = [
  { day: 1, coins: 5 },
  { day: 2, coins: 7 },
  { day: 3, coins: 10 },
];

const PREMIUM_PERKS = [
  { id: "k1", icon: "sparkles", label: "Personality insights", free: true, premium: true },
  { id: "k2", icon: "eye", label: "See who visited you", free: false, premium: true },
  { id: "k3", icon: "heart", label: "See who liked you", free: false, premium: true },
  { id: "k4", icon: "infinite", label: "Unlimited connections", free: false, premium: true },
  { id: "k5", icon: "shield-checkmark", label: "No ads experience", free: false, premium: true },
  { id: "k6", icon: "analytics", label: "Advanced type insights", free: false, premium: true },
];

export default function MarketScreen() {
  const insets = useSafeAreaInsets();
  const { coins, isPremium, startTrial, buyCoins, profile, dailyCheckinDone } = useApp();
  const cycleDone = profile.streak === 0 ? 0 : ((profile.streak - 1) % 3) + 1;
  const [buying, setBuying] = useState(false);
  const [trialVisible, setTrialVisible] = useState(false);
  const [openFriends, setOpenFriends] = useState(true);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  const handlePackPress = (pack: typeof COIN_PACKS[0]) => {
    if (pack.free) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      void buyCoins(pack.coins);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchaseId(pack.id);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 4 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coins & Perks</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}>
        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.coinIcon}>
              <Ionicons name="heart" size={22} color="#FFF" />
            </View>
            <Text style={styles.balanceAmount}>{coins.toLocaleString()}</Text>
            <TouchableOpacity style={styles.refreshBtn}>
              <Feather name="refresh-cw" size={16} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.transactionsBtn}>
              <Text style={styles.transactionsText}>Transactions</Text>
              <Feather name="chevron-right" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Packs */}
        <Text style={styles.sectionTitle}>Packs</Text>
        <View style={styles.packsGrid}>
          {COIN_PACKS.map((pack) => (
            <TouchableOpacity
              key={pack.id}
              style={[styles.packCard, pack.tag === "POPULAR" && styles.packCardPopular]}
              onPress={() => handlePackPress(pack)}
              activeOpacity={0.75}
            >
              {pack.tag && (
                <View style={[styles.packTag, pack.tag === "POPULAR" && styles.packTagPopular]}>
                  <Text style={[styles.packTagText, pack.tag === "POPULAR" && styles.packTagTextPopular]}>{pack.tag}</Text>
                </View>
              )}
              <View style={styles.packCoinRow}>
                <View style={styles.packCoinIcon}>
                  <Ionicons name="heart" size={16} color="#FFF" />
                </View>
                <Text style={styles.packCoins}>{pack.coins.toLocaleString()}</Text>
              </View>
              <Text style={[styles.packPrice, pack.free && styles.packPriceFree]}>
                {pack.label || pack.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Free Daily Rewards */}
        <Text style={styles.sectionTitle}>Free Daily Rewards</Text>
        <View style={styles.dailyRow}>
          {DAILY_REWARDS.map((base) => {
            const available = !dailyCheckinDone && base.day === (cycleDone % 3) + 1;
            const reward = { ...base, available, claimed: base.day <= cycleDone && !available };
            return (
            <View
              key={reward.day}
              style={[
                styles.dailyCard,
                reward.claimed && styles.dailyCardClaimed,
                reward.available && styles.dailyCardAvailable,
              ]}
            >
              <View style={styles.dailyCoinRow}>
                <View style={[styles.dailyCoinIcon, { backgroundColor: reward.claimed ? "#E8813A" : reward.available ? "#F59E0B" : COLORS.bgTertiary }]}>
                  <Ionicons name="heart" size={12} color="#FFF" />
                </View>
                <Text style={styles.dailyCoins}>{reward.coins}</Text>
              </View>
              {reward.claimed && <Ionicons name="checkmark" size={16} color={COLORS.accentGreen} style={{ marginTop: 4 }} />}
              {reward.available && <Text style={styles.dailyNote}>Today</Text>}
              {!reward.claimed && !reward.available && <View style={{ height: 20 }} />}
            </View>
            );
          })}
        </View>

        {/* Premium Perks comparison */}
        <View style={styles.perksHeader}>
          <Text style={styles.sectionTitle}>Premium perks</Text>
          <View style={styles.perksHeaderRight}>
            <Text style={styles.freeLabel}>Free</Text>
            <TouchableOpacity onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setTrialVisible(true);
            }}>
              <Text style={styles.premiumLabel}>Premium</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.perksList}>
          {PREMIUM_PERKS.map((perk, idx) => (
            <TouchableOpacity
              key={perk.id}
              style={[styles.perkRow, idx < PREMIUM_PERKS.length - 1 && styles.perkRowBorder]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (!perk.free) setTrialVisible(true);
              }}
            >
              <View style={styles.perkLeft}>
                <View style={styles.perkIconWrap}>
                  <Ionicons name={perk.icon as any} size={18} color={COLORS.textSecondary} />
                </View>
                <Text style={styles.perkLabel}>{perk.label}</Text>
              </View>
              <View style={styles.perkRight}>
                <View style={styles.perkCheck}>
                  {perk.free && <Ionicons name="checkmark" size={18} color={COLORS.accentGreen} />}
                </View>
                <View style={styles.perkCheck}>
                  {perk.premium && <Ionicons name="checkmark" size={18} color={COLORS.accentGreen} />}
                </View>
                <Feather name="chevron-right" size={14} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Open to new friends */}
        <GlassCard style={styles.friendsCard}>
          <View style={styles.friendsTop}>
            <Text style={styles.friendsTitle}>Open to make new friends</Text>
            <Switch
              value={openFriends}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOpenFriends(v);
              }}
              trackColor={{ false: COLORS.bgTertiary, true: COLORS.accentGreen }}
              thumbColor="#FFF"
            />
          </View>
          <Text style={styles.friendsSub}>Let new friends discover you. You can turn this off anytime if you need space.</Text>
        </GlassCard>
      </ScrollView>

      {/* Trial Modal */}
      <Modal visible={trialVisible} transparent animationType="slide" onRequestClose={() => setTrialVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.trialModal}>
            <View style={styles.modalHandle} />
            <View style={styles.trialIconWrap}>
              <Ionicons name="star" size={36} color={COLORS.accentGold} />
            </View>
            <Text style={styles.trialTitle}>Try Premium Free</Text>
            <Text style={styles.trialSub}>14 days free · Cancel anytime · No charge today</Text>
            <View style={styles.trialPricing}>
              <View style={styles.trialPricingRow}>
                <Text style={styles.trialPricingPeriod}>Days 1–14</Text>
                <Text style={styles.trialPricingFree}>Free</Text>
              </View>
              <View style={[styles.trialPricingRow, { borderTopWidth: 1, borderTopColor: COLORS.glassBorder, paddingTop: 10, marginTop: 8 }]}>
                <Text style={styles.trialPricingPeriod}>After trial</Text>
                <Text style={styles.trialPricingPrice}>$9.99 / month</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.startBtn} onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              void startTrial();
              setTrialVisible(false);
            }}>
              <Text style={styles.startBtnText}>Start Free Trial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTrialVisible(false)} style={styles.maybeLaterBtn}>
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Purchase confirm modal */}
      <Modal visible={!!purchaseId} transparent animationType="slide" onRequestClose={() => setPurchaseId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.purchaseModal}>
            <View style={styles.modalHandle} />
            <Text style={styles.purchaseTitle}>Confirm Purchase</Text>
            {purchaseId && (() => {
              const p = COIN_PACKS.find((x) => x.id === purchaseId);
              if (!p) return null;
              return (
                <>
                  <View style={styles.purchaseDetails}>
                    <View style={styles.purchaseCoinIcon}><Ionicons name="heart" size={32} color="#FFF" /></View>
                    <Text style={styles.purchaseCoins}>{p.coins.toLocaleString()} Coins</Text>
                    <Text style={styles.purchasePrice}>{p.price}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.confirmBtn, buying && { opacity: 0.6 }]}
                    disabled={buying}
                    onPress={async () => {
                      setBuying(true);
                      await buyCoins(p.coins);
                      setBuying(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      setPurchaseId(null);
                    }}
                  >
                    <Text style={styles.confirmBtnText}>{buying ? "Adding..." : "Get coins (demo)"}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: COLORS.textTertiary, fontSize: 12, textAlign: "center" }}>
                    Prototype: no real payment is taken.
                  </Text>
                </>
              );
            })()}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setPurchaseId(null)}>
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10 },
  headerTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18 },
  content: { paddingHorizontal: 20, gap: 16 },
  balanceSection: { gap: 8 },
  balanceLabel: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  balanceRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  coinIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E8813A", alignItems: "center", justifyContent: "center" },
  balanceAmount: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 36 },
  refreshBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: "center", justifyContent: "center" },
  transactionsBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  transactionsText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 13 },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 17 },
  packsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  packCard: { width: "30%", flex: undefined, backgroundColor: COLORS.bgCard, borderRadius: 16, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 12, gap: 10, minHeight: 90, position: "relative", overflow: "hidden" },
  packCardPopular: { borderColor: COLORS.accentGold + "50" },
  packTag: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: COLORS.accentGreen, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, alignItems: "center" },
  packTagPopular: { backgroundColor: COLORS.accentGold + "25" },
  packTagText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 10 },
  packTagTextPopular: { color: COLORS.accentGold },
  packCoinRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 18 },
  packCoinIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#E8813A", alignItems: "center", justifyContent: "center" },
  packCoins: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 15 },
  packPrice: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13 },
  packPriceFree: { color: COLORS.accentGreen, fontFamily: "Inter_600SemiBold" },
  dailyRow: { flexDirection: "row", gap: 10 },
  dailyCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.glassBorder, padding: 10, alignItems: "center", gap: 4, minHeight: 70 },
  dailyCardClaimed: { borderColor: COLORS.accentGreen + "60" },
  dailyCardAvailable: { borderColor: COLORS.accentGold + "60" },
  dailyCoinRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dailyCoinIcon: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  dailyCoins: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  dailyCountdown: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "center", lineHeight: 14 },
  dailyNote: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 11 },
  perksHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  perksHeaderRight: { flexDirection: "row", gap: 20 },
  freeLabel: { color: COLORS.textTertiary, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  premiumLabel: { color: COLORS.accent, fontFamily: "Inter_700Bold", fontSize: 13 },
  perksList: { backgroundColor: COLORS.bgCard, borderRadius: 18, borderWidth: 1, borderColor: COLORS.glassBorder, overflow: "hidden" },
  perkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  perkRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.glassBorder },
  perkLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  perkIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.bgTertiary, alignItems: "center", justifyContent: "center" },
  perkLabel: { color: COLORS.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14 },
  perkRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  perkCheck: { width: 44, alignItems: "center" },
  friendsCard: { gap: 10 },
  friendsTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  friendsTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  friendsSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.88)", justifyContent: "flex-end" },
  trialModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 14, alignItems: "center" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: "center", marginBottom: 4 },
  trialIconWrap: { width: 70, height: 70, borderRadius: 20, backgroundColor: COLORS.accentGold + "20", borderWidth: 1, borderColor: COLORS.accentGold + "40", alignItems: "center", justifyContent: "center" },
  trialTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 24 },
  trialSub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center" },
  trialPricing: { width: "100%", backgroundColor: COLORS.bgTertiary, borderRadius: 14, padding: 14 },
  trialPricingRow: { flexDirection: "row", justifyContent: "space-between" },
  trialPricingPeriod: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  trialPricingFree: { color: COLORS.accentGreen, fontFamily: "Inter_700Bold", fontSize: 16 },
  trialPricingPrice: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  startBtn: { backgroundColor: COLORS.accentGold, borderRadius: 50, paddingVertical: 16, width: "100%", alignItems: "center" },
  startBtnText: { color: COLORS.bg, fontFamily: "Inter_700Bold", fontSize: 16 },
  maybeLaterBtn: { paddingVertical: 10 },
  maybeLaterText: { color: COLORS.textTertiary, fontFamily: "Inter_500Medium", fontSize: 14 },
  purchaseModal: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: COLORS.glassBorder, padding: 24, gap: 16 },
  purchaseTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 22 },
  purchaseDetails: { alignItems: "center", gap: 8, backgroundColor: COLORS.bgTertiary, borderRadius: 16, padding: 20 },
  purchaseCoinIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#E8813A", alignItems: "center", justifyContent: "center" },
  purchaseCoins: { color: COLORS.accentGold, fontFamily: "Inter_700Bold", fontSize: 28 },
  purchasePrice: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  confirmBtn: { backgroundColor: COLORS.accent, borderRadius: 16, padding: 16, alignItems: "center" },
  confirmBtnText: { color: "#FFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 10, borderRadius: 16, borderWidth: 1, borderColor: COLORS.glassBorder, paddingHorizontal: 20 },
  cancelText: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
