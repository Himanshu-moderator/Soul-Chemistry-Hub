import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatMessage } from "@/components/chat/MessageBubble";
import { CONNECTIONS } from "@/data/mockData";
import { personById, SOUL_PEOPLE, type SoulPerson } from "@/data/people";
import { useApp } from "@/state/AppContext";
import { useAuth } from "@/state/AuthContext";
import { font } from "@/theme/tokens";

// The Soul deck and everything that follows from it: passing, liking, requests,
// the three-message limit before someone accepts, Superchat, and the chats that
// result. Sample people only (the prototype has no real matching backend), saved on
// this device for the current demo or account.

export const FIRST_MESSAGE_LIMIT = 3;
export const SUPERCHAT_COST = 50;

type Kind = "like" | "message" | "superchat";
export interface SentRequest {
  id: string; // person id
  kind: Kind;
  at: number;
  accepted: boolean;
}
export interface ReceivedRequest {
  id: string; // person id
  at: number;
  message?: string;
}

interface Saved {
  passed: string[];
  sent: SentRequest[];
  received: ReceivedRequest[];
  connected: string[]; // people you can chat with without limits
  threads: Record<string, ChatMessage[]>;
}

const HOUR = 3_600_000;
const initial = (): Saved => ({
  passed: [],
  sent: [],
  received: SOUL_PEOPLE.filter((p) => p.likesYou).map((p, i) => ({ id: p.id, at: Date.now() - (i + 1) * 2 * HOUR, message: p.likesYou?.message })),
  connected: [],
  threads: {},
});

export type Status = "none" | "pending" | "connected";
export type LikeResult = "match" | "sent";
export type SendResult = { ok: true } | { ok: false; reason: "limit" | "empty" };
export type SuperchatResult = { ok: true } | { ok: false; reason: "coins" };

interface SoulContextType {
  deck: SoulPerson[];
  passedCount: number;
  pass: (id: string) => void;
  undoPass: () => void;
  canUndo: boolean;
  resetDeck: () => void;

  like: (id: string) => LikeResult;
  sent: SentRequest[];
  received: ReceivedRequest[];
  accept: (id: string) => void;
  decline: (id: string) => void;

  status: (id: string) => Status;
  threadFor: (id: string) => ChatMessage[];
  messagesLeft: (id: string) => number;
  send: (id: string, text: string) => SendResult;
  superchat: (id: string, text?: string) => Promise<SuperchatResult>;
  typing: (id: string) => boolean;
  // People you can chat with freely, newest first (for the Chats list).
  connectedPeople: SoulPerson[];
  lastMessage: (id: string) => ChatMessage | undefined;
}

const SoulContext = createContext<SoulContextType | null>(null);

const REPLIES = ["Haha, I was thinking the same thing 😄", "Tell me more!", "That's a great point.", "Ha, fair enough 🙌", "Love that. Talk soon!"];
const clock = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const uid = (p: string) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e4)}`;
const isSample = (id: string) => CONNECTIONS.some((c) => c.id === id);

export function SoulProvider({ children }: { children: React.ReactNode }) {
  const { mode, user } = useAuth();
  const { spendCoins, resetTick } = useApp();
  const [saved, setSaved] = useState<Saved>(initial);
  const [typingIds, setTypingIds] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const latest = useRef(saved);
  const ready = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const storageKey = `soul:${mode}:${user?.id ?? ""}`;

  // Load whatever was saved for this demo or account.
  useEffect(() => {
    ready.current = false;
    let cancelled = false;
    (async () => {
      let next = initial();
      try {
        const raw = mode === "none" ? null : await AsyncStorage.getItem(storageKey);
        if (raw) next = { ...next, ...(JSON.parse(raw) as Partial<Saved>) };
      } catch {
        // unreadable storage: start fresh
      }
      if (cancelled) return;
      latest.current = next;
      setSaved(next);
      ready.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, storageKey, resetTick]);

  const commit = useCallback(
    (patch: (s: Saved) => Partial<Saved>) => {
      const next = { ...latest.current, ...patch(latest.current) };
      latest.current = next;
      setSaved(next);
      if (ready.current && mode !== "none") AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
    },
    [mode, storageKey]
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const addMessage = useCallback(
    (id: string, m: ChatMessage) => commit((s) => ({ threads: { ...s.threads, [id]: [...(s.threads[id] ?? []), m] } })),
    [commit]
  );

  // A friendly scripted reply, as if they were typing.
  const reply = useCallback(
    (id: string, text?: string) => {
      setTypingIds((t) => (t.includes(id) ? t : [...t, id]));
      later(1300, () => {
        addMessage(id, { id: uid("them"), mine: false, text: text ?? REPLIES[Math.floor(Math.random() * REPLIES.length)], at: clock() });
        setTypingIds((t) => t.filter((x) => x !== id));
      });
    },
    [addMessage]
  );

  const connect = useCallback(
    (id: string, openingFromThem?: string) => {
      commit((s) => ({
        connected: s.connected.includes(id) ? s.connected : [id, ...s.connected],
        received: s.received.filter((r) => r.id !== id),
        sent: s.sent.map((r) => (r.id === id ? { ...r, accepted: true } : r)),
      }));
      if (openingFromThem) addMessage(id, { id: uid("them"), mine: false, text: openingFromThem, at: clock() });
    },
    [addMessage, commit]
  );

  // Some people accept your request a few seconds after you send it.
  useEffect(() => {
    const t = setInterval(() => {
      latest.current.sent.forEach((r) => {
        if (r.accepted || Date.now() - r.at < 7000) return;
        const p = personById(r.id);
        if (!p?.autoAccept) return;
        connect(r.id, "Hey! Thanks for reaching out 😊");
        setNotice(`${p.name} accepted your request`);
      });
    }, 2000);
    return () => clearInterval(t);
  }, [connect]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3200);
    return () => clearTimeout(t);
  }, [notice]);

  const connectedIds = saved.connected;
  const status = useCallback(
    (id: string): Status => (connectedIds.includes(id) || isSample(id) ? "connected" : saved.sent.some((r) => r.id === id) ? "pending" : "none"),
    [connectedIds, saved.sent]
  );

  const messagesLeft = useCallback(
    (id: string) => {
      if (status(id) === "connected") return Infinity;
      const mine = (saved.threads[id] ?? []).filter((m) => m.mine).length;
      return Math.max(0, FIRST_MESSAGE_LIMIT - mine);
    },
    [saved.threads, status]
  );

  const like = useCallback(
    (id: string): LikeResult => {
      const p = personById(id);
      if (p?.likesYou) {
        connect(id, p.likesYou.message ?? "Hey! I liked you first 😄");
        return "match";
      }
      commit((s) => (s.sent.some((r) => r.id === id) ? {} : { sent: [{ id, kind: "like", at: Date.now(), accepted: false }, ...s.sent] }));
      return "sent";
    },
    [commit, connect]
  );

  const send = useCallback(
    (id: string, raw: string): SendResult => {
      const text = raw.trim();
      if (!text) return { ok: false, reason: "empty" };
      const cur = latest.current;
      const connected = cur.connected.includes(id) || isSample(id);
      if (!connected) {
        const used = (cur.threads[id] ?? []).filter((m) => m.mine).length;
        if (used >= FIRST_MESSAGE_LIMIT) return { ok: false, reason: "limit" };
        commit((s) =>
          s.sent.some((r) => r.id === id)
            ? {}
            : { sent: [{ id, kind: "message", at: Date.now(), accepted: false }, ...s.sent] }
        );
      }
      addMessage(id, { id: uid("me"), mine: true, text, at: clock() });
      if (connected) reply(id);
      return { ok: true };
    },
    [addMessage, commit, reply]
  );

  const superchat = useCallback(
    async (id: string, raw?: string): Promise<SuperchatResult> => {
      if (!(await spendCoins(SUPERCHAT_COST))) return { ok: false, reason: "coins" };
      const text = raw?.trim();
      commit((s) => ({
        connected: s.connected.includes(id) ? s.connected : [id, ...s.connected],
        received: s.received.filter((r) => r.id !== id),
        sent: s.sent.some((r) => r.id === id) ? s.sent.map((r) => (r.id === id ? { ...r, accepted: true } : r)) : [{ id, kind: "superchat", at: Date.now(), accepted: true }, ...s.sent],
      }));
      if (text) {
        addMessage(id, { id: uid("me"), mine: true, text, at: clock() });
        reply(id);
      }
      return { ok: true };
    },
    [addMessage, commit, reply, spendCoins]
  );

  const accept = useCallback(
    (id: string) => {
      const req = latest.current.received.find((r) => r.id === id);
      connect(id, req?.message);
    },
    [connect]
  );
  const decline = useCallback((id: string) => commit((s) => ({ received: s.received.filter((r) => r.id !== id) })), [commit]);

  const pass = useCallback((id: string) => commit((s) => ({ passed: s.passed.includes(id) ? s.passed : [...s.passed, id] })), [commit]);
  const undoPass = useCallback(() => commit((s) => ({ passed: s.passed.slice(0, -1) })), [commit]);
  const resetDeck = useCallback(() => commit(() => ({ passed: [] })), [commit]);

  const value = useMemo<SoulContextType>(() => {
    const touched = new Set([...saved.passed, ...saved.sent.map((r) => r.id), ...saved.connected]);
    return {
      deck: SOUL_PEOPLE.filter((p) => !touched.has(p.id)),
      passedCount: saved.passed.length,
      pass,
      undoPass,
      canUndo: saved.passed.length > 0,
      resetDeck,
      like,
      sent: saved.sent,
      received: saved.received,
      accept,
      decline,
      status,
      threadFor: (id) => saved.threads[id] ?? [],
      messagesLeft,
      send,
      superchat,
      typing: (id) => typingIds.includes(id),
      connectedPeople: saved.connected.map((id) => personById(id)).filter((p): p is SoulPerson => !!p),
      lastMessage: (id) => (saved.threads[id] ?? []).slice(-1)[0],
    };
  }, [accept, decline, like, messagesLeft, pass, resetDeck, saved, send, status, superchat, typingIds, undoPass]);

  return (
    <SoulContext.Provider value={value}>
      {children}
      <Notice text={notice} />
    </SoulContext.Provider>
  );
}

// A small banner for things that happen in the background ("Anushka accepted your request").
function Notice({ text }: { text: string | null }) {
  const insets = useSafeAreaInsets();
  if (!text) return null;
  return (
    <View pointerEvents="none" style={[styles.notice, { top: insets.top + 10 }]}>
      <Text style={styles.noticeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 60 },
  noticeText: {
    color: "#FFFFFF",
    fontFamily: font.semibold,
    fontSize: 14,
    backgroundColor: "#1E1B3A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
});

export function useSoul() {
  const ctx = useContext(SoulContext);
  if (!ctx) throw new Error("useSoul must be used inside SoulProvider");
  return ctx;
}
