import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MY_PROFILE, CONNECTIONS, FAMOUS_PEOPLE } from "@/data/mockData";

type AppContextType = {
  profile: typeof MY_PROFILE;
  updateProfile: (updates: Partial<typeof MY_PROFILE>) => void;
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
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(MY_PROFILE);
  const [coins, setCoins] = useState(MY_PROFILE.coins);
  const [dailyCheckinDone, setDailyCheckinDone] = useState(false);
  const [followedPeople, setFollowedPeople] = useState<string[]>(
    FAMOUS_PEOPLE.filter((p) => p.isFollowing).map((p) => p.id)
  );
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(["c1", "c3", "c8"]);
  const [selectedTheme, setSelectedTheme] = useState("t1");
  const [isPremium, setIsPremium] = useState(false);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("appState");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.coins) setCoins(parsed.coins);
        if (parsed.followedPeople) setFollowedPeople(parsed.followedPeople);
        if (parsed.joinedCommunities) setJoinedCommunities(parsed.joinedCommunities);
        if (parsed.selectedTheme) setSelectedTheme(parsed.selectedTheme);
        if (parsed.isPremium) setIsPremium(parsed.isPremium);
        if (parsed.dailyCheckinDone) setDailyCheckinDone(parsed.dailyCheckinDone);
      }
    })();
  }, []);

  const save = async (key: string, val: unknown) => {
    const existing = await AsyncStorage.getItem("appState");
    const parsed = existing ? JSON.parse(existing) : {};
    await AsyncStorage.setItem("appState", JSON.stringify({ ...parsed, [key]: val }));
  };

  const addCoins = (n: number) => {
    setCoins((c) => {
      const next = c + n;
      save("coins", next);
      return next;
    });
  };

  const updateProfile = (updates: Partial<typeof MY_PROFILE>) => {
    setProfile((p) => ({ ...p, ...updates }));
  };

  const toggleFollow = (id: string) => {
    setFollowedPeople((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save("followedPeople", next);
      return next;
    });
  };

  const toggleCommunity = (id: string) => {
    setJoinedCommunities((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      save("joinedCommunities", next);
      return next;
    });
  };

  const handleSetTheme = (id: string) => {
    setSelectedTheme(id);
    save("selectedTheme", id);
  };

  const handleSetPremium = (v: boolean) => {
    setIsPremium(v);
    save("isPremium", v);
  };

  const handleSetCheckin = (v: boolean) => {
    setDailyCheckinDone(v);
    save("dailyCheckinDone", v);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        coins,
        addCoins,
        dailyCheckinDone,
        setDailyCheckinDone: handleSetCheckin,
        followedPeople,
        toggleFollow,
        joinedCommunities,
        toggleCommunity,
        selectedTheme,
        setSelectedTheme: handleSetTheme,
        isPremium,
        setIsPremium: handleSetPremium,
        trialActive,
        setTrialActive,
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
