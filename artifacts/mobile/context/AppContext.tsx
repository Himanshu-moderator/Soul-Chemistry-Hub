import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MY_PROFILE, FAMOUS_PEOPLE } from "@/data/mockData";

const STORAGE_KEY = "appState";

type Profile = typeof MY_PROFILE;

// Everything that survives a reload. One object, always written whole, so
// concurrent updates can never overwrite each other's keys.
type Persisted = {
  profile: Profile;
  coins: number;
  followedPeople: string[];
  joinedCommunities: string[];
  selectedTheme: string;
  isPremium: boolean;
  trialActive: boolean;
  lastCheckinDate: string | null;
  onboarded: boolean;
};

const defaults = (): Persisted => ({
  profile: MY_PROFILE,
  coins: MY_PROFILE.coins,
  followedPeople: FAMOUS_PEOPLE.filter((p) => p.isFollowing).map((p) => p.id),
  joinedCommunities: ["c1", "c3", "c8"],
  selectedTheme: "t1",
  isPremium: false,
  trialActive: false,
  lastCheckinDate: null,
  onboarded: false,
});

// Local calendar day, so the daily check-in resets at the user's midnight.
const todayKey = () => new Date().toLocaleDateString("en-CA");

type AppContextType = {
  // False until saved data has been read; screens that redirect should wait for it.
  hydrated: boolean;
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  coins: number;
  addCoins: (n: number) => void;
  dailyCheckinDone: boolean;
  setDailyCheckinDone: (v: boolean) => void;
  followedPeople: string[];
  toggleFollow: (id: string) => void;
  joinedCommunities: string[];
  toggleCommunity: (id: string) => void;
  selectedTheme: string;
  setSelectedTheme: (id: string) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  trialActive: boolean;
  setTrialActive: (v: boolean) => void;
  // Wipes saved data and returns to a fresh start (used by "Reset demo").
  resetApp: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>(defaults);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef<Persisted>(state);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<Persisted>;
          const base = defaults();
          const merged: Persisted = {
            profile: { ...base.profile, ...(parsed.profile ?? {}) },
            coins: typeof parsed.coins === "number" ? parsed.coins : base.coins,
            followedPeople: Array.isArray(parsed.followedPeople) ? parsed.followedPeople : base.followedPeople,
            joinedCommunities: Array.isArray(parsed.joinedCommunities) ? parsed.joinedCommunities : base.joinedCommunities,
            selectedTheme: parsed.selectedTheme ?? base.selectedTheme,
            isPremium: !!parsed.isPremium,
            trialActive: !!parsed.trialActive,
            lastCheckinDate: parsed.lastCheckinDate ?? null,
            onboarded: !!parsed.onboarded,
          };
          latest.current = merged;
          setState(merged);
        }
      } catch {
        // Corrupt or unavailable storage: carry on with defaults.
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const update = useCallback((patch: Partial<Persisted>) => {
    const next = { ...latest.current, ...patch };
    latest.current = next;
    setState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const resetApp = useCallback(async () => {
    const fresh = defaults();
    latest.current = fresh;
    setState(fresh);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // nothing saved to remove
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        hydrated,
        onboarded: state.onboarded,
        setOnboarded: (v) => update({ onboarded: v }),
        profile: state.profile,
        updateProfile: (updates) => update({ profile: { ...latest.current.profile, ...updates } }),
        coins: state.coins,
        addCoins: (n) => update({ coins: latest.current.coins + n }),
        dailyCheckinDone: state.lastCheckinDate === todayKey(),
        setDailyCheckinDone: (v) => update({ lastCheckinDate: v ? todayKey() : null }),
        followedPeople: state.followedPeople,
        toggleFollow: (id) => update({ followedPeople: toggle(latest.current.followedPeople, id) }),
        joinedCommunities: state.joinedCommunities,
        toggleCommunity: (id) => update({ joinedCommunities: toggle(latest.current.joinedCommunities, id) }),
        selectedTheme: state.selectedTheme,
        setSelectedTheme: (id) => update({ selectedTheme: id }),
        isPremium: state.isPremium,
        setIsPremium: (v) => update({ isPremium: v }),
        trialActive: state.trialActive,
        setTrialActive: (v) => update({ trialActive: v }),
        resetApp,
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
