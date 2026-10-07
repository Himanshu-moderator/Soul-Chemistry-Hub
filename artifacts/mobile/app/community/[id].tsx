import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS } from "@/constants/colors";
import { COMMUNITIES } from "@/data/mockData";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { AvatarCircle } from "@/components/AvatarCircle";
import { TypeBadge } from "@/components/TypeBadge";

type Msg = {
  id: string;
  userId: string;
  name: string;
  mbti: string | null;
  text: string;
  at: string; // ISO time
};

type Row = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { display_name: string; mbti: string | null } | { display_name: string; mbti: string | null }[] | null;
};

const fromRow = (r: Row): Msg => {
  const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
  return { id: String(r.id), userId: r.user_id, name: p?.display_name ?? "Member", mbti: p?.mbti ?? null, text: r.body, at: r.created_at };
};

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// A few friendly sample messages so the demo room doesn't open empty.
const seedMessages = (code: string): Msg[] => {
  const now = Date.now();
  const at = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
  return [
    { id: "s1", userId: "s-aria", name: "Aria Chen", mbti: "INFJ", text: `Welcome to the ${code} community! 👋`, at: at(95) },
    { id: "s2", userId: "s-marcus", name: "Marcus Webb", mbti: "ENTP", text: "Quick poll: how did you find out your type?", at: at(62) },
    { id: "s3", userId: "s-zoe", name: "Zoe Park", mbti: "ENFP", text: "A friend sent me a quiz at 2am and it went downhill from there 😂", at: at(48) },
    { id: "s4", userId: "s-leo", name: "Leo Castellano", mbti: "INTJ", text: "Reading about cognitive functions. Highly recommend.", at: at(20) },
  ];
};

export default function CommunityRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { mode, profile, joinedCommunities, toggleCommunity } = useApp();
  const community = COMMUNITIES.find((c) => c.id === id);
  const joined = !!community && joinedCommunities.includes(community.id);
  const account = mode === "account" && !!supabase;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState<number | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);
  const names = useRef<Record<string, { name: string; mbti: string | null }>>({});

  const scrollEnd = useCallback(() => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60), []);

  const add = useCallback(
    (m: Msg) => {
      setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m]));
      scrollEnd();
    },
    [scrollEnd]
  );

  // Load history (and, for accounts, listen live) once you are a member.
  useEffect(() => {
    if (!community || !joined) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (!account) {
      (async () => {
        let saved: Msg[] = [];
        try {
          const raw = await AsyncStorage.getItem(`room:${community.id}`);
          if (raw) saved = JSON.parse(raw) as Msg[];
        } catch {
          // ignore unreadable local data
        }
        if (cancelled) return;
        setMessages([...seedMessages(community.code), ...saved]);
        setLoading(false);
        scrollEnd();
      })();
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      const [history, stats] = await Promise.all([
        supabase!
          .from("community_messages")
          .select("id, body, created_at, user_id, profiles(display_name, mbti)")
          .eq("community_id", community.id)
          .order("created_at", { ascending: false })
          .limit(60),
        supabase!.from("community_stats").select("members").eq("community_id", community.id).maybeSingle(),
      ]);
      if (cancelled) return;
      if (history.error) {
        setError("Couldn't load this chat. Check your connection and try again.");
      } else {
        const list = ((history.data ?? []) as unknown as Row[]).map(fromRow).reverse();
        list.forEach((m) => (names.current[m.userId] = { name: m.name, mbti: m.mbti }));
        setMessages(list);
      }
      setMembers((stats.data as { members: number } | null)?.members ?? null);
      setLoading(false);
      scrollEnd();
    })();

    const channel = supabase!
      .channel(`room-${community.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `community_id=eq.${community.id}` },
        async (payload) => {
          const r = payload.new as { id: number; body: string; created_at: string; user_id: string };
          let who = names.current[r.user_id];
          if (!who) {
            const { data } = await supabase!.from("profiles").select("display_name, mbti").eq("id", r.user_id).maybeSingle();
            who = { name: data?.display_name ?? "Member", mbti: data?.mbti ?? null };
            names.current[r.user_id] = who;
          }
          add({ id: String(r.id), userId: r.user_id, name: who.name, mbti: who.mbti, text: r.body, at: r.created_at });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase!.removeChannel(channel);
    };
  }, [community, joined, account, add, scrollEnd]);

  const myId = account ? profile.id : "me";

  const send = async () => {
    const body = text.trim();
    if (!body || sending || !community) return;
    setSending(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (account) {
        const { data, error: err } = await supabase!
          .from("community_messages")
          .insert({ community_id: community.id, body })
          .select("id, body, created_at, user_id")
          .single();
        if (err) {
          setError(err.message.includes("too fast") ? "Slow down a little." : "Couldn't send that. Try again.");
          return;
        }
        names.current[profile.id] = { name: profile.name, mbti: profile.mbti };
        add({ id: String(data.id), userId: data.user_id, name: profile.name, mbti: profile.mbti, text: data.body, at: data.created_at });
      } else {
        const m: Msg = { id: `me-${Date.now()}`, userId: "me", name: profile.name, mbti: profile.mbti, text: body, at: new Date().toISOString() };
        add(m);
        const mine = [...messages.filter((x) => x.userId === "me"), m].slice(-100);
        AsyncStorage.setItem(`room:${community.id}`, JSON.stringify(mine)).catch(() => {});
      }
      setText("");
    } finally {
      setSending(false);
    }
  };

  if (!community) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.muted}>This community doesn't exist.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.joinBtn}>
          <Text style={styles.joinBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const memberCount = account ? members : community.members;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          accessibilityLabel="Back"
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/chats"))}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: community.color + "25", borderColor: community.color + "60" }]}>
          <Text style={{ color: community.color, fontFamily: "Inter_700Bold", fontSize: 11 }}>{community.code}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{community.name}</Text>
          <Text style={styles.sub}>
            {memberCount != null ? `${memberCount.toLocaleString()} member${memberCount === 1 ? "" : "s"}` : "Community"}
            {account ? " · live" : " · demo"}
          </Text>
        </View>
      </View>

      {!joined ? (
        <View style={[styles.center, { flex: 1, padding: 32, gap: 16 }]}>
          <Text style={styles.joinTitle}>Join to chat</Text>
          <Text style={[styles.muted, { textAlign: "center" }]}>{community.description}</Text>
          <TouchableOpacity style={styles.joinBtn} onPress={() => toggleCommunity(community.id)}>
            <Text style={styles.joinBtnText}>Join {community.name}</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={[styles.center, { flex: 1 }]}>
          <ActivityIndicator color={COLORS.accent} />
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={[styles.center, { flex: 1, gap: 8 }]}>
                <Text style={{ fontSize: 40 }}>💬</Text>
                <Text style={styles.joinTitle}>It's quiet in here</Text>
                <Text style={styles.muted}>Be the first to say hi.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const mine = item.userId === myId;
              return (
                <View style={[styles.msgRow, mine && styles.msgRowMine]}>
                  {!mine && <AvatarCircle name={item.name} size={32} mbti={item.mbti ?? undefined} />}
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    {!mine && (
                      <View style={styles.authorRow}>
                        <Text style={styles.author}>{item.name}</Text>
                        {item.mbti && <TypeBadge type={item.mbti} size="sm" />}
                      </View>
                    )}
                    <Text style={[styles.msgText, mine && { color: "#FFF" }]}>{item.text}</Text>
                    <Text style={[styles.time, mine && { color: "rgba(255,255,255,0.7)" }]}>{timeLabel(item.at)}</Text>
                  </View>
                </View>
              );
            }}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={`Message ${community.name}`}
              placeholderTextColor={COLORS.textTertiary}
              maxLength={500}
              multiline
              onSubmitEditing={send}
            />
            <TouchableOpacity
              accessibilityLabel="Send"
              style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]}
              onPress={send}
              disabled={!text.trim() || sending}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
  },
  backBtn: { width: 32, height: 36, justifyContent: "center" },
  badge: { width: 48, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 16 },
  sub: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 1 },
  muted: { color: COLORS.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  joinTitle: { color: COLORS.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20 },
  joinBtn: { backgroundColor: "#7C4DFF", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24 },
  joinBtnText: { color: "#FFF", fontFamily: "Inter_600SemiBold", fontSize: 15 },
  msgRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", maxWidth: "88%" },
  msgRowMine: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  bubble: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, flexShrink: 1 },
  bubbleTheirs: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.glassBorder, borderBottomLeftRadius: 4 },
  bubbleMine: { backgroundColor: "#7C4DFF", borderBottomRightRadius: 4 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  author: { color: COLORS.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  msgText: { color: COLORS.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 21 },
  time: { color: COLORS.textTertiary, fontFamily: "Inter_400Regular", fontSize: 10, marginTop: 3, alignSelf: "flex-end" },
  error: { color: COLORS.accentRed, textAlign: "center", paddingVertical: 4, fontSize: 13 },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    backgroundColor: COLORS.bgCard,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#7C4DFF", alignItems: "center", justifyContent: "center" },
});
