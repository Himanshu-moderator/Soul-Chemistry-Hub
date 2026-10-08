import React, { useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { Button } from "@/components/ui";
import type { SoulPerson } from "@/data/people";
import { DirectChat } from "@/features/chats/components/DirectChat";
import { useSoul } from "@/state/SoulContext";
import { useStyles, useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import type { Colors } from "@/theme/themes";
import { ActionDock } from "./components/ActionDock";
import { MessageSheet } from "./components/MessageSheet";
import { ProfileCard } from "./components/ProfileCard";

// Soul: a deck of people, one at a time. Scroll down a profile to learn about them;
// the floating buttons pass (X), message (chat) or like (heart).
export default function SoulScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const soul = useSoul();

  const person = soul.deck[0];
  const [messaging, setMessaging] = useState<SoulPerson | null>(null);
  const [chatWith, setChatWith] = useState<SoulPerson | null>(null);
  const [matched, setMatched] = useState<SoulPerson | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The card slides out, the action runs, the next card fades in.
  const card = useRef(new Animated.Value(1)).current;
  const dir = useRef(1);
  const busy = useRef(false);
  const advance = (direction: 1 | -1, action: () => void) => {
    if (busy.current) return;
    busy.current = true;
    dir.current = direction;
    Animated.timing(card, { toValue: 0, duration: 170, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      action();
      Animated.timing(card, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
        busy.current = false;
      });
    });
  };

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const onPass = () => person && advance(-1, () => soul.pass(person.id));
  const onLike = () => {
    if (!person) return;
    advance(1, () => {
      const r = soul.like(person.id);
      if (r === "match") setMatched(person);
      else showToast(`Like sent to ${person.name}. See it in Requests.`);
    });
  };

  const bottomInset = Math.max(insets.bottom, 12) + 64 + 120;

  return (
    <Sky variant="subtle">
      {person ? (
        <>
          <Animated.View
            style={{
              flex: 1,
              opacity: card,
              transform: [{ translateX: card.interpolate({ inputRange: [0, 1], outputRange: [dir.current * 40, 0] }) }],
            }}
          >
            <ProfileCard
              key={person.id}
              person={person}
              bottomInset={bottomInset}
              topAction={
                soul.canUndo ? (
                  <Pressable accessibilityRole="button" accessibilityLabel="Undo pass" onPress={() => advance(-1, soul.undoPass)} style={styles.undo}>
                    <Feather name="rotate-ccw" size={18} color="#FFFFFF" />
                  </Pressable>
                ) : null
              }
            />
          </Animated.View>
          <ActionDock onPass={onPass} onLike={onLike} onMessage={() => setMessaging(person)} />
        </>
      ) : (
        <View style={[styles.empty, { paddingTop: insets.top }]}>
          <Text style={styles.emptyEmoji}>🌌</Text>
          <Text style={styles.emptyTitle}>You have seen everyone for now</Text>
          <Text style={styles.emptySub}>New people join all the time. Meanwhile, check who liked you.</Text>
          {soul.passedCount > 0 && <Button label={`Bring back ${soul.passedCount} you passed`} variant="secondary" onPress={soul.resetDeck} />}
        </View>
      )}

      {toast && (
        <View pointerEvents="none" style={[styles.toast, { bottom: Math.max(insets.bottom, 12) + 64 + 100 }]}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      <MessageSheet person={messaging} onClose={() => setMessaging(null)} onSuperchat={setChatWith} />
      <DirectChat contact={chatWith} onClose={() => setChatWith(null)} />

      <Modal visible={!!matched} transparent animationType="fade" onRequestClose={() => setMatched(null)}>
        <View style={styles.matchRoot}>
          <LinearGradient colors={[colors.accent + "55", "transparent"]} style={StyleSheet.absoluteFill} />
          <Ionicons name="heart" size={56} color={colors.accent} />
          <Text style={styles.matchTitle}>It is a match!</Text>
          <Text style={styles.matchSub}>{matched?.name} liked you too. You can chat right away.</Text>
          <View style={{ width: "100%", gap: 10, marginTop: 14 }}>
            <Button
              label={`Say hi to ${matched?.name.split(" ")[0]}`}
              onPress={() => {
                const p = matched;
                setMatched(null);
                if (p) setChatWith(p);
              }}
            />
            <Button label="Keep browsing" variant="ghost" onPress={() => setMatched(null)} />
          </View>
        </View>
      </Modal>
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    undo: { alignSelf: "flex-end", width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(10,8,24,0.55)", alignItems: "center", justifyContent: "center" },
    empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
    emptyEmoji: { fontSize: 54 },
    emptyTitle: { ...type.title, color: c.text, textAlign: "center" },
    emptySub: { ...type.body, color: c.textSecondary, textAlign: "center", marginBottom: 10 },
    toast: { position: "absolute", left: 20, right: 20, alignItems: "center" },
    toastText: { color: "#FFFFFF", fontFamily: font.semibold, fontSize: 14, backgroundColor: "#1E1B3A", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, overflow: "hidden", textAlign: "center" },
    matchRoot: { flex: 1, backgroundColor: c.overlay, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 8 },
    matchTitle: { ...type.display, color: c.text },
    matchSub: { ...type.body, color: c.textSecondary, textAlign: "center" },
  });
