import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MY_PROFILE, FAMOUS_PEOPLE } from "@/data/mockData";
import { supabase } from "@/services/supabase";
import { useAuth } from "@/state/AuthContext";

const DEMO_KEY = "appState";

type Profile = typeof MY_PROFILE;

export type SaveResult = { ok: true } | { ok: false; error: string };

// Everything the screens read. In demo mode it is saved on this device; in an
// account it is mirrored from the backend (see the account helpers below).
type State = {
  profile: Profile;
  coins: number;
  followedPeople: string[];
  joinedCommunities: string[];
  selectedTheme: string;
  chatTheme: string;
  isPremium: boolean;
  trialActive: boolean;
  lastCheckinDate: string | null;
  onboarded: boolean;
};

const demoDefaults = (): State => ({
  profile: MY_PROFILE,
  coins: MY_PROFILE.coins,
  followedPeople: FAMOUS_PEOPLE.filter((p) => p.isFollowing).map((p) => p.id),
  joinedCommunities: ["c1", "c3", "c8"],
  selectedTheme: "t1",
  chatTheme: "nebula",
  isPremium: false,
  trialActive: false,
  lastCheckinDate: null,
  onboarded: false,
});

// Demo uses the device's local day; accounts use the server's (UTC) day.
const localDay = () => new Date().toLocaleDateString("en-CA");
const utcDay = () => new Date().toISOString().slice(0, 10);
const dayBefore = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};

// ---- account helpers: map between backend rows and the shape the UI uses ----
type ProfileRow = {
  id: string;
  display_name: string;
  username: string | null;
  bio: string;
  mbti: string | null;
  enneagram: string | null;
  socionics: string | null;
  selected_theme: string;
  chat_theme: string;
  onboarded: boolean;
  coins: number;
  xp: number;
  streak: number;
  last_checkin: string | null;
  is_premium: boolean;
  trial_started_at: string | null;
  created_at: string;
};

function profileFromRow(r: ProfileRow, followingCount: number): Profile {
  const badges = ["Early Adopter"];
  if (r.streak >= 7) badges.push("7-Day Streak");
  return {
    ...MY_PROFILE,
    id: r.id,
    name: r.display_name,
    username: r.username ? `@${r.username}` : "@new_member",
    bio: r.bio,
    mbti: r.mbti ?? "INFP",
    enneagram: r.enneagram ?? "—",
    socionics: r.socionics ?? "—",
    followers: 0,
    following: followingCount,
    matches: 0,
    coins: r.coins,
    isPremium: r.is_premium,
    joinedDate: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    streak: r.streak,
    level: 1 + Math.floor(r.xp / 500),
    xp: r.xp,
    badges,
  };
}

// The few profile fields a person can edit, mapped to their columns.
function columnsFor(updates: Partial<Profile>): Record<string, unknown> {
  const cols: Record<string, unknown> = {};
  if (updates.name !== undefined) cols.display_name = updates.name.trim();
  if (updates.username !== undefined) cols.username = updates.username.replace(/^@/, "").trim().toLowerCase() || null;
  if (updates.bio !== undefined) cols.bio = updates.bio.trim();
  if (updates.mbti !== undefined) cols.mbti = updates.mbti;
  if (updates.enneagram !== undefined) cols.enneagram = updates.enneagram === "—" ? null : updates.enneagram;
  if (updates.socionics !== undefined) cols.socionics = updates.socionics === "—" ? null : updates.socionics;
  return cols;
}

function friendlyDbError(message: string, code?: string): string {
  if (code === "23505" || message.toLowerCase().includes("duplicate")) return "That username is already taken.";
  if (code === "23514" || message.toLowerCase().includes("check constraint"))
    return "Use 3 to 20 letters, numbers or underscores for your username.";
  if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network"))
    return "Couldn't reach the server. Check your connection and try again.";
  return message;
}

type AppContextType = {
  mode: "none" | "demo" | "account";
  // False until saved data has been read; screens that redirect should wait for it.
  hydrated: boolean;
  loadError: string | null;
  retryLoad: () => void;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  saveProfile: (updates: Partial<Profile>) => Promise<SaveResult>;
  isUsernameFree: (username: string) => Promise<boolean>;
  coins: number;
  dailyCheckinDone: boolean;
  claimCheckin: (reward: number) => Promise<void>;
  buyCoins: (amount: number) => Promise<void>;
  followedPeople: string[];
  toggleFollow: (id: string) => void;
  joinedCommunities: string[];
  toggleCommunity: (id: string) => void;
  selectedTheme: string;
  setSelectedTheme: (id: string) => void;
  chatTheme: string;
  setChatTheme: (id: string) => void;
  isPremium: boolean;
  startTrial: () => Promise<void>;
  trialActive: boolean;
  // Wipes the demo's saved data and returns to a fresh start.
  resetDemo: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { mode, user } = useAuth();
  const [state, setState] = useState<State>(demoDefaults);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const latest = useRef<State>(state);

  const userId = user?.id ?? null;
  // Data counts as loaded only for the exact mode/user it was loaded for, so a
  // sign-in never briefly shows the previous (default) data as if it were real.
  const key = `${mode}:${userId ?? ""}:${reloadTick}`;
  const hydrated = loadedKey === key;

  // (Re)load whenever the mode or the signed-in user changes.
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);

    const apply = (next: State) => {
      if (cancelled) return;
      latest.current = next;
      setState(next);
      setLoadedKey(key);
    };

    (async () => {
      if (mode === "account" && supabase && userId) {
        try {
          const [p, f, m] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", userId).single(),
            supabase.from("follows").select("person_id"),
            supabase.from("community_members").select("community_id"),
          ]);
          if (p.error) throw p.error;
          if (f.error) throw f.error;
          if (m.error) throw m.error;
          const row = p.data as ProfileRow;
          const follows = (f.data ?? []).map((x: { person_id: string }) => x.person_id);
          apply({
            profile: profileFromRow(row, follows.length),
            coins: row.coins,
            followedPeople: follows,
            joinedCommunities: (m.data ?? []).map((x: { community_id: string }) => x.community_id),
            selectedTheme: row.selected_theme,
            chatTheme: row.chat_theme ?? "nebula",
            isPremium: row.is_premium,
            trialActive: !!row.trial_started_at,
            lastCheckinDate: row.last_checkin,
            onboarded: row.onboarded,
          });
        } catch (e) {
          if (cancelled) return;
          setLoadError(e instanceof Error ? e.message : "Couldn't load your profile.");
          setLoadedKey(key);
        }
        return;
      }

      // Demo (or signed out): local data on this device.
      const base = demoDefaults();
      if (mode === "demo") {
        try {
          const saved = await AsyncStorage.getItem(DEMO_KEY);
          if (saved) {
            const parsed = JSON.parse(saved) as Partial<State>;
            apply({
              profile: { ...base.profile, ...(parsed.profile ?? {}) },
              coins: typeof parsed.coins === "number" ? parsed.coins : base.coins,
              followedPeople: Array.isArray(parsed.followedPeople) ? parsed.followedPeople : base.followedPeople,
              joinedCommunities: Array.isArray(parsed.joinedCommunities) ? parsed.joinedCommunities : base.joinedCommunities,
              selectedTheme: parsed.selectedTheme ?? base.selectedTheme,
              chatTheme: parsed.chatTheme ?? base.chatTheme,
              isPremium: !!parsed.isPremium,
              trialActive: !!parsed.trialActive,
              lastCheckinDate: parsed.lastCheckinDate ?? null,
              onboarded: !!parsed.onboarded,
            });
            return;
          }
        } catch {
          // corrupt or unavailable storage: fall back to defaults
        }
      }
      apply(base);
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, userId, reloadTick, key]);

  // Local update: React state always; device storage only in demo mode.
  const update = useCallback(
    (patch: Partial<State>) => {
      const next = { ...latest.current, ...patch };
      latest.current = next;
      setState(next);
      if (mode === "demo") AsyncStorage.setItem(DEMO_KEY, JSON.stringify(next)).catch(() => {});
    },
    [mode]
  );

  const account = mode === "account" && !!supabase && !!userId;

  // Replace local state with the row the backend returned (used by the economy functions).
  const applyRow = useCallback((row: ProfileRow) => {
    const prev = latest.current;
    const next: State = {
      ...prev,
      profile: profileFromRow(row, prev.followedPeople.length),
      coins: row.coins,
      isPremium: row.is_premium,
      trialActive: !!row.trial_started_at,
      lastCheckinDate: row.last_checkin,
    };
    latest.current = next;
    setState(next);
  }, []);

  const saveProfile = useCallback(
    async (updates: Partial<Profile>): Promise<SaveResult> => {
      const previous = latest.current.profile;
      update({ profile: { ...previous, ...updates } });
      if (!account) return { ok: true };
      const cols = columnsFor(updates);
      if (Object.keys(cols).length === 0) return { ok: true };
      const { error } = await supabase!.from("profiles").update(cols).eq("id", userId!);
      if (error) {
        update({ profile: previous });
        return { ok: false, error: friendlyDbError(error.message, error.code) };
      }
      return { ok: true };
    },
    [account, update, userId]
  );

  const updateProfile = useCallback((updates: Partial<Profile>) => void saveProfile(updates), [saveProfile]);

  const isUsernameFree = useCallback(
    async (username: string) => {
      const clean = username.replace(/^@/, "").trim().toLowerCase();
      if (!account) return true;
      const { data } = await supabase!.from("profiles").select("id").eq("username", clean).neq("id", userId!).limit(1);
      return !data || data.length === 0;
    },
    [account, userId]
  );

  const setOnboarded = useCallback(
    (v: boolean) => {
      update({ onboarded: v });
      // Query builders only run when awaited, so attach a handler to fire the request.
      if (account) supabase!.from("profiles").update({ onboarded: v }).eq("id", userId!).then(() => {});
    },
    [account, update, userId]
  );

  const toggleFollow = useCallback(
    (id: string) => {
      const prev = latest.current.followedPeople;
      const adding = !prev.includes(id);
      update({ followedPeople: adding ? [...prev, id] : prev.filter((x) => x !== id) });
      if (!account) return;
      const op = adding
        ? supabase!.from("follows").insert({ person_id: id })
        : supabase!.from("follows").delete().eq("person_id", id);
      void op.then(({ error }) => {
        if (error) update({ followedPeople: prev });
      });
    },
    [account, update]
  );

  const toggleCommunity = useCallback(
    (id: string) => {
      const prev = latest.current.joinedCommunities;
      const adding = !prev.includes(id);
      update({ joinedCommunities: adding ? [...prev, id] : prev.filter((x) => x !== id) });
      if (!account) return;
      const op = adding
        ? supabase!.from("community_members").insert({ community_id: id })
        : supabase!.from("community_members").delete().eq("community_id", id);
      void op.then(({ error }) => {
        if (error) update({ joinedCommunities: prev });
      });
    },
    [account, update]
  );

  const setSelectedTheme = useCallback(
    (id: string) => {
      update({ selectedTheme: id });
      if (account) supabase!.from("profiles").update({ selected_theme: id }).eq("id", userId!).then(() => {});
    },
    [account, update, userId]
  );

  const setChatTheme = useCallback(
    (id: string) => {
      update({ chatTheme: id });
      if (account) supabase!.from("profiles").update({ chat_theme: id }).eq("id", userId!).then(() => {});
    },
    [account, update, userId]
  );

  const claimCheckin = useCallback(
    async (reward: number) => {
      if (account) {
        const { data, error } = await supabase!.rpc("claim_daily_checkin", { reward });
        if (!error && data) applyRow(data as ProfileRow);
        return;
      }
      const cur = latest.current;
      const today = localDay();
      if (cur.lastCheckinDate === today) return;
      const streak = cur.lastCheckinDate === dayBefore(today) ? cur.profile.streak + 1 : 1;
      update({
        coins: cur.coins + reward,
        lastCheckinDate: today,
        profile: { ...cur.profile, streak, xp: cur.profile.xp + 10, coins: cur.coins + reward },
      });
    },
    [account, applyRow, update]
  );

  const buyCoins = useCallback(
    async (amount: number) => {
      if (account) {
        const { data, error } = await supabase!.rpc("demo_purchase_coins", { pack_coins: amount });
        if (!error && data) applyRow(data as ProfileRow);
        return;
      }
      update({ coins: latest.current.coins + amount });
    },
    [account, applyRow, update]
  );

  const startTrial = useCallback(async () => {
    if (account) {
      const { data, error } = await supabase!.rpc("start_trial");
      if (!error && data) applyRow(data as ProfileRow);
      return;
    }
    update({ isPremium: true, trialActive: true });
  }, [account, applyRow, update]);

  const resetDemo = useCallback(async () => {
    const fresh = demoDefaults();
    latest.current = fresh;
    setState(fresh);
    try {
      await AsyncStorage.removeItem(DEMO_KEY);
    } catch {
      // nothing saved to remove
    }
  }, []);

  const today = account ? utcDay() : localDay();

  return (
    <AppContext.Provider
      value={{
        mode,
        hydrated,
        loadError,
        retryLoad: () => setReloadTick((n) => n + 1),
        onboarded: state.onboarded,
        setOnboarded,
        profile: state.profile,
        updateProfile,
        saveProfile,
        isUsernameFree,
        coins: state.coins,
        dailyCheckinDone: state.lastCheckinDate === today,
        claimCheckin,
        buyCoins,
        followedPeople: state.followedPeople,
        toggleFollow,
        joinedCommunities: state.joinedCommunities,
        toggleCommunity,
        selectedTheme: state.selectedTheme,
        setSelectedTheme,
        chatTheme: state.chatTheme,
        setChatTheme,
        isPremium: state.isPremium,
        startTrial,
        trialActive: state.trialActive,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
