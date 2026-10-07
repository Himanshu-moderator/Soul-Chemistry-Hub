import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { Button, Card, SectionTitle, Sheet } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, radius, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { COIN_PACKS, DAILY_REWARDS, PERKS, type CoinPack } from "./content";

// Coins: your balance, daily rewards, packs and Premium. All of it is a demo
// economy (no real payments).
export default function CoinsScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const { coins, profile, dailyCheckinDone, isPremium, trialActive, startTrial, buyCoins } = useApp();

  const [pack, setPack] = useState<CoinPack | null>(null);
  const [trial, setTrial] = useState(false);
  const [busy, setBusy] = useState(false);

  // How many days of the 3-day cycle are done (today counts once you've checked in).
  const cycleDone = profile.streak === 0 ? 0 : ((profile.streak - 1) % 3) + 1;

  const choose = (p: CoinPack) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (p.free) void buyCoins(p.coins);
    else setPack(p);
  };

  const confirmPurchase = async () => {
    if (!pack) return;
    setBusy(true);
    await buyCoins(pack.coins);
    setBusy(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPack(null);
  };

  const beginTrial = async () => {
    setBusy(true);
    await startTrial();
    setBusy(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTrial(false);
  };

  return (
    <CosmicBackground>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 120, gap: 26 }}>
        <View>
          <Text style={styles.title}>Coins</Text>
          <Text style={styles.sub}>Earn them, spend them, show off</Text>
        </View>

        <LinearGradient colors={["rgba(251,191,36,0.28)", "rgba(249,115,22,0.12)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balance}>
          <View style={styles.coinIcon}>
            <Ionicons name="heart" size={28} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.balanceLabel}>Your balance</Text>
            <Text style={styles.balanceValue}>{coins.toLocaleString()}</Text>
          </View>
        </LinearGradient>

        <View>
          <SectionTitle title="Daily rewards" />
          <View style={styles.days}>
            {DAILY_REWARDS.map((r) => {
              const today = !dailyCheckinDone && r.day === (cycleDone % 3) + 1;
              const done = r.day <= cycleDone && !today;
              return (
                <View key={r.day} style={[styles.day, done && { backgroundColor: "rgba(52,211,153,0.14)" }, today && { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
                  <Text style={styles.dayLabel}>Day {r.day}</Text>
                  <Text style={styles.dayCoins}>+{r.coins}</Text>
                  {done ? <Ionicons name="checkmark-circle" size={18} color={colors.success} /> : <Text style={[styles.dayNote, today && { color: colors.accent }]}>{today ? "Today" : " "}</Text>}
                </View>
              );
            })}
          </View>
          <Text style={styles.hint}>Check in from Explore to claim today's reward and keep your streak.</Text>
        </View>

        <View>
          <SectionTitle title="Coin packs" />
          <View style={styles.packs}>
            {COIN_PACKS.map((p) => (
              <Pressable key={p.id} onPress={() => choose(p)} style={({ pressed }) => [styles.pack, p.tag === "Popular" && { borderColor: colors.gold }, pressed && { transform: [{ scale: 0.97 }] }]}>
                {p.tag && (
                  <View style={[styles.tag, { backgroundColor: p.free ? colors.success : colors.gold }]}>
                    <Text style={styles.tagText}>{p.tag}</Text>
                  </View>
                )}
                <View style={styles.packCoins}>
                  <Ionicons name="heart" size={15} color={colors.gold} />
                  <Text style={styles.packValue}>{p.coins.toLocaleString()}</Text>
                </View>
                <Text style={styles.packPrice}>{p.note ?? p.price}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <SectionTitle title="Premium" />
          <Card padding={18}>
            <View style={{ gap: 14 }}>
              {PERKS.map((perk) => (
                <View key={perk.label} style={styles.perk}>
                  <Ionicons name={perk.icon} size={20} color={perk.free || isPremium ? colors.accent : colors.textTertiary} />
                  <Text style={[styles.perkLabel, !perk.free && !isPremium && { color: colors.textSecondary }]}>{perk.label}</Text>
                  <Ionicons name={perk.free || isPremium ? "checkmark-circle" : "lock-closed"} size={18} color={perk.free || isPremium ? colors.success : colors.textTertiary} />
                </View>
              ))}
            </View>
            <View style={{ marginTop: 18 }}>
              {isPremium ? (
                <Text style={styles.premiumOn}>{trialActive ? "✨ Your 14-day free trial is active" : "✨ Premium is on"}</Text>
              ) : (
                <Button label="Try Premium free for 14 days" onPress={() => setTrial(true)} />
              )}
            </View>
          </Card>
        </View>
      </ScrollView>

      <Sheet visible={!!pack} onClose={() => setPack(null)} title="Get coins">
        {pack && (
          <>
            <View style={styles.purchase}>
              <View style={styles.coinIcon}>
                <Ionicons name="heart" size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.purchaseCoins}>{pack.coins.toLocaleString()} coins</Text>
              <Text style={styles.sub}>{pack.price}</Text>
            </View>
            <Button label="Get coins (demo)" onPress={confirmPurchase} loading={busy} />
            <Text style={styles.hint}>Prototype: no real payment is taken.</Text>
          </>
        )}
      </Sheet>

      <Sheet visible={trial} onClose={() => setTrial(false)} title="Try Premium free">
        <Text style={styles.sub}>14 days free · no charge today. Unlocks premium themes and advanced insights.</Text>
        <Card padding={16}>
          <View style={styles.price}>
            <Text style={styles.perkLabel}>Days 1–14</Text>
            <Text style={[styles.perkLabel, { color: colors.success }]}>Free</Text>
          </View>
          <View style={[styles.price, { marginTop: 10 }]}>
            <Text style={styles.perkLabel}>After the trial</Text>
            <Text style={styles.perkLabel}>$9.99 / month</Text>
          </View>
        </Card>
        <Button label="Start free trial" onPress={beginTrial} loading={busy} />
        <Text style={styles.hint}>Prototype: nothing is ever charged.</Text>
      </Sheet>
    </CosmicBackground>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    title: { ...type.display, color: c.text, fontSize: 32 },
    sub: { ...type.body, color: c.textSecondary, marginTop: 2 },
    balance: { flexDirection: "row", alignItems: "center", gap: 16, padding: 22, borderRadius: radius.xl },
    coinIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#F59E0B", alignItems: "center", justifyContent: "center" },
    balanceLabel: { color: c.textSecondary, fontFamily: font.medium, fontSize: 13.5 },
    balanceValue: { color: c.text, fontFamily: font.bold, fontSize: 40, letterSpacing: -1 },
    days: { flexDirection: "row", gap: 10 },
    day: { flex: 1, alignItems: "center", gap: 4, paddingVertical: 14, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: "transparent" },
    dayLabel: { color: c.textSecondary, fontFamily: font.medium, fontSize: 12 },
    dayCoins: { color: c.text, fontFamily: font.bold, fontSize: 20 },
    dayNote: { color: c.textTertiary, fontFamily: font.semibold, fontSize: 12 },
    hint: { ...type.caption, color: c.textTertiary, marginTop: 10, textAlign: "center" },
    packs: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    pack: { width: "30.6%", flexGrow: 1, alignItems: "center", gap: 6, paddingVertical: 18, paddingHorizontal: 8, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: "transparent" },
    tag: { position: "absolute", top: -9, paddingHorizontal: 9, paddingVertical: 2, borderRadius: 999 },
    tagText: { color: "#1B1305", fontFamily: font.bold, fontSize: 10 },
    packCoins: { flexDirection: "row", alignItems: "center", gap: 5 },
    packValue: { color: c.text, fontFamily: font.bold, fontSize: 18 },
    packPrice: { color: c.textSecondary, fontFamily: font.regular, fontSize: 12.5 },
    perk: { flexDirection: "row", alignItems: "center", gap: 12 },
    perkLabel: { flex: 1, color: c.text, fontFamily: font.medium, fontSize: 15 },
    premiumOn: { color: c.success, fontFamily: font.semibold, fontSize: 15, textAlign: "center" },
    purchase: { alignItems: "center", gap: 8, paddingVertical: 10 },
    purchaseCoins: { color: c.text, fontFamily: font.bold, fontSize: 28 },
    price: { flexDirection: "row", justifyContent: "space-between" },
  });
