import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatShell } from "@/components/chat/ChatShell";
import { ChatThemeSheet } from "@/components/chat/ChatThemeSheet";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { CosmicBackground } from "@/components/cosmic/CosmicBackground";
import { Button } from "@/components/ui";
import { COMMUNITIES } from "@/data/mockData";
import { supabase } from "@/services/supabase";
import { useApp } from "@/state/AppContext";
import { useTheme } from "@/theme/ThemeProvider";
import { font, type } from "@/theme/tokens";
import { withAlpha } from "@/theme/themes";

type Row = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { display_name: string; mbti: string | null } | { display_name: string; mbti: string | null }[] | null;
};

// A message as the database returns it, turned into what the chat UI draws.
const fromRow = (r: Row, myId: string): ChatMessage => {
  const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
  return {
    id: String(r.id),
    mine: r.user_id === myId,
    text: r.body,
    at: r.created_at,
    author: { name: p?.display_name ?? "Member", mbti: p?.mbti ?? null },
  };
};

// A few friendly sample messages so the demo room doesn't open empty.
const seedMessages = (code: string): ChatMessage[] => {
  const at = (minsAgo: number) => new Date(Date.now() - minsAgo * 60_000).toISOString();
  const them = (id: string, name: string, mbti: string, text: string, mins: number): ChatMessage => ({ id, mine: false, text, at: at(mins), author: { name, mbti } });
  return [
    them("s1", "Aria Chen", "INFJ", `Welcome to the ${code} community! 👋`, 95),
    them("s2", "Marcus Webb", "ENTP", "Quick poll: how did you find out your type?", 62),
    them("s3", "Zoe Park", "ENFP", "A friend sent me a quiz at 2am and it went downhill from there 😂", 48),
    them("s4", "Leo Castellano", "INTJ", "Reading about cognitive functions. Highly recommend.", 20),
  ];
};

// One community's live chat room (real-time for accounts, a local sample for the demo).
export default function CommunityRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { mode, profile, joinedCommunities, toggleCommunity } = useApp();
  const community = COMMUNITIES.find((c) => c.id === id);
  const joined = !!community && joinedCommunities.includes(community.id);
  const account = mode === "account" && !!supabase;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [members, setMembers] = useState<number | null>(null);
  const [themeOpen, setThemeOpen] = useState(false);
  const names = useRef<Record<string, { name: string; mbti: string | null }>>({});

  const add = useCallback((m: ChatMessage) => setMessages((cur) => (cur.some((x) => x.id === m.id) ? cur : [...cur, m])), []);

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
        let saved: ChatMessage[] = [];
        try {
          const raw = await AsyncStorage.getItem(`room:${community.id}`);
          if (raw) saved = JSON.parse(raw) as ChatMessage[];
        } catch {
          // ignore unreadable local data
        }
        if (cancelled) return;
        setMessages([...seedMessages(community.code), ...saved]);
        setLoading(false);
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
        const rows = (history.data ?? []) as unknown as Row[];
        rows.forEach((r) => {
          const m = fromRow(r, profile.id);
          if (m.author) names.current[r.user_id] = m.author;
        });
        setMessages(rows.map((r) => fromRow(r, profile.id)).reverse());
      }
      setMembers((stats.data as { members: number } | null)?.members ?? null);
      setLoading(false);
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
          add({ id: String(r.id), mine: r.user_id === profile.id, text: r.body, at: r.created_at, author: who });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase!.removeChannel(channel);
    };
  }, [community, joined, account, add, profile.id]);

  const send = async () => {
    const body = text.trim();
    if (!body || sending || !community) return;
    setSending(true);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const me = { name: profile.name, mbti: profile.mbti };
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
        names.current[profile.id] = me;
        add({ id: String(data.id), mine: true, text: data.body, at: data.created_at, author: me });
      } else {
        const m: ChatMessage = { id: `me-${Date.now()}`, mine: true, text: body, at: new Date().toISOString(), author: me };
        add(m);
        const mine = [...messages.filter((x) => x.mine), m].slice(-100);
        AsyncStorage.setItem(`room:${community.id}`, JSON.stringify(mine)).catch(() => {});
      }
      setText("");
    } finally {
      setSending(false);
    }
  };

  const leave = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/chats"));

  if (!community) {
    return (
      <CosmicBackground>
        <View style={styles.center}>
          <Text style={styles.title}>This community doesn't exist.</Text>
          <Button label="Go back" onPress={leave} />
        </View>
      </CosmicBackground>
    );
  }

  const count = account ? members : community.members;
  const subtitle = `${count != null ? `${count.toLocaleString()} member${count === 1 ? "" : "s"}` : "Community"} · ${account ? "live" : "demo"}`;
  const badge = (
    <View style={[styles.badge, { backgroundColor: withAlpha(community.color, 0.22) }]}>
      <Text style={{ color: community.color, fontFamily: font.bold, fontSize: 11 }}>{community.code}</Text>
    </View>
  );

  if (!joined || loading) {
    return (
      <CosmicBackground>
        <ChatHeader title={community.name} subtitle={subtitle} leading={badge} onBack={leave} onTheme={() => setThemeOpen(true)} />
        <View style={styles.center}>
          {!joined ? (
            <>
              <Text style={styles.title}>Join to chat</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>{community.description}</Text>
              <Button label={`Join ${community.name}`} onPress={() => toggleCommunity(community.id)} />
            </>
          ) : (
            <ActivityIndicator color={colors.accent} />
          )}
        </View>
        <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
      </CosmicBackground>
    );
  }

  return (
    <>
      <ChatShell
        header={<ChatHeader title={community.name} subtitle={subtitle} leading={badge} onBack={leave} onTheme={() => setThemeOpen(true)} />}
        messages={messages}
        showAuthors
        value={text}
        onChange={setText}
        onSend={send}
        sending={sending}
        placeholder={`Message ${community.name}`}
        error={error}
        empty={
          <>
            <Text style={{ fontSize: 40 }}>💬</Text>
            <Text style={styles.title}>It's quiet in here</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>Be the first to say hi.</Text>
          </>
        }
      />
      <ChatThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  title: { ...type.heading, color: "#F4F3FA", textAlign: "center" },
  body: { ...type.body, textAlign: "center" },
  badge: { minWidth: 46, height: 38, paddingHorizontal: 6, borderRadius: 13, alignItems: "center", justifyContent: "center" },
});
