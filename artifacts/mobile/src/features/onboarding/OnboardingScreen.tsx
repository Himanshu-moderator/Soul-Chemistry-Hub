import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Sky } from "@/components/cosmic/Sky";
import { IconButton } from "@/components/ui";
import { COMMUNITIES } from "@/data/mockData";
import { useApp } from "@/state/AppContext";
import { useAuth } from "@/state/AuthContext";
import { useStyles } from "@/theme/ThemeProvider";
import type { Colors } from "@/theme/themes";
import { AiChatStep } from "./steps/AiChatStep";
import { BasicsStep, type Basics } from "./steps/BasicsStep";
import { CommunitiesStep } from "./steps/CommunitiesStep";
import { DoneStep } from "./steps/DoneStep";
import { FinderStep } from "./steps/FinderStep";
import { QuizStep } from "./steps/QuizStep";
import { TypeGridStep } from "./steps/TypeGridStep";

type Step = "basics" | "finder" | "ai" | "quiz" | "grid" | "communities" | "done";

// Where the progress bar sits for steps that don't report their own progress.
const PROGRESS: Record<Step, number> = { basics: 0.1, finder: 0.25, ai: 0.3, quiz: 0.3, grid: 0.5, communities: 0.85, done: 1 };

// Where "back" goes from each step. The first step leaves onboarding altogether.
const BACK: Partial<Record<Step, Step>> = { finder: "basics", ai: "finder", quiz: "finder", grid: "finder", communities: "finder", done: "communities" };

const isPlaceholderName = (n: string) => n === "Alex Rivera";
const isPlaceholderUser = (u: string) => !u || u === "@new_member" || u === "@alex_rivera";

// Onboarding: profile basics, find your type, join communities, done.
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(makeStyles);
  const { profile, saveProfile, updateProfile, isUsernameFree, joinedCommunities, toggleCommunity, setOnboarded } = useApp();

  const { signOut } = useAuth();
  const [step, setStep] = useState<Step>("basics");
  const [type, setType] = useState("");

  const progress = useRef(new Animated.Value(PROGRESS.basics)).current;
  const moveProgress = (to: number) => Animated.timing(progress, { toValue: to, duration: 450, useNativeDriver: false }).start();
  const go = (next: Step) => {
    setStep(next);
    moveProgress(PROGRESS[next]);
  };
  useEffect(() => moveProgress(PROGRESS[step]), []); // eslint-disable-line react-hooks/exhaustive-deps

  const initialBasics: Basics = {
    name: isPlaceholderName(profile.name) ? "" : profile.name,
    username: isPlaceholderUser(profile.username) ? "" : profile.username.replace(/^@/, ""),
    bio: "",
  };

  const submitBasics = async (v: Basics): Promise<string | null> => {
    const name = v.name.trim();
    const username = v.username.replace(/^@/, "").trim().toLowerCase();
    if (!name) return "Tell us what to call you.";
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return "Usernames are 3 to 20 characters: letters, numbers or underscores.";
    if (!(await isUsernameFree(username))) return "That username is already taken.";
    const result = await saveProfile({ name, username: "@" + username, bio: v.bio.trim() });
    if (!result.ok) return result.error;
    go("finder");
    return null;
  };

  const onType = (picked: string) => {
    setType(picked);
    updateProfile({ mbti: picked });
    go("communities");
  };

  const communitiesFor = (): string[] => {
    const own = COMMUNITIES.find((c) => c.code === type)?.id;
    return own && !joinedCommunities.includes(own) ? [...joinedCommunities, own] : joinedCommunities;
  };

  const onCommunities = (picked: string[]) => {
    COMMUNITIES.forEach((c) => {
      if (picked.includes(c.id) !== joinedCommunities.includes(c.id)) toggleCommunity(c.id);
    });
    go("done");
  };

  const back = BACK[step];
  // Going back from the very first step returns to the welcome screen (this signs out of a demo or a fresh account).
  const goBack = () => (back ? go(back) : void signOut());

  return (
    <Sky variant="starry">
      <View style={[styles.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
        <View style={styles.top}>
          <IconButton icon="arrow-left" label="Back" onPress={goBack} />
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }]} />
          </View>
          <View style={{ width: 40 }} />
        </View>

        {step === "basics" && <BasicsStep initial={initialBasics} onSubmit={submitBasics} />}
        {step === "finder" && <FinderStep onChoose={(m) => go(m === "ai" ? "ai" : m === "quiz" ? "quiz" : "grid")} />}
        {step === "ai" && <AiChatStep onResult={onType} onProgress={moveProgress} />}
        {step === "quiz" && <QuizStep onResult={onType} onProgress={moveProgress} />}
        {step === "grid" && <TypeGridStep onPick={onType} />}
        {step === "communities" && <CommunitiesStep key={type} initial={communitiesFor()} onDone={onCommunities} />}
        {step === "done" && <DoneStep type={type || profile.mbti} onEnter={() => setOnboarded(true)} />}
      </View>
    </Sky>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1 },
    top: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingBottom: 6 },
    track: { flex: 1, height: 5, borderRadius: 3, backgroundColor: c.surfaceStrong, overflow: "hidden" },
    fill: { height: "100%", borderRadius: 3, backgroundColor: c.accent },
  });
