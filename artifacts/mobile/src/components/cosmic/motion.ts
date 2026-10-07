import { Platform, StyleSheet, type ViewStyle } from "react-native";

// On the web, React Native's Animated has no native driver: every frame of every
// animation runs on the JavaScript thread, and the sky has dozens of them. CSS
// animations are handled by the browser itself (on the GPU, off the JS thread), so
// on the web the sky uses these helpers instead. Phones keep using Animated with
// the native driver, which is already off the JS thread.

export const IS_WEB = Platform.OS === "web";

type Frames = Record<string, ViewStyle>;

interface LoopOptions {
  iterations?: "infinite" | number;
  direction?: "normal" | "alternate";
  easing?: string;
  fill?: "none" | "backwards" | "both";
}

// A style that plays the given keyframes. Duration and delay are set separately
// with `timing`, so one set of keyframes can be shared by many elements.
export function keyframes(frames: Frames, { iterations = "infinite", direction = "normal", easing = "linear", fill = "none" }: LoopOptions = {}): ViewStyle {
  const style = {
    animationKeyframes: [frames],
    animationIterationCount: iterations,
    animationDirection: direction,
    animationTimingFunction: easing,
    animationFillMode: fill,
  };
  return StyleSheet.create({ fx: style as ViewStyle }).fx;
}

// Duration and (optionally negative, to start mid-way) delay of a keyframe style.
export function timing(durationMs: number, delayMs = 0): ViewStyle {
  return { animationDuration: `${Math.round(durationMs)}ms`, animationDelay: `${Math.round(delayMs)}ms` } as ViewStyle;
}
