import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, RadialGradient, Stop } from "react-native-svg";
import type { SoulPerson } from "@/data/people";

interface Props {
  person: SoulPerson;
  // Which of the person's photos to show (0, 1, 2...).
  index: number;
}

// A person's photo from `person.photos`. If there is none (or it cannot load), it
// draws an illustrated portrait in the person's colours instead.
export function PersonPhoto({ person, index }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [failed, setFailed] = useState<string[]>([]);
  const uri = person.photos[index];
  // A picture that fails to load (offline, say) falls back to the illustrated portrait.
  if (uri && !failed.includes(uri)) {
    const onError = () => setFailed((f) => [...f, uri]);
    // A face is a square picture: show all of it at the top and let it melt into the
    // person's colours below, instead of cropping it to a tall frame.
    if (uri.includes("pravatar")) {
      return (
        <View style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
          <LinearGradient colors={["#0A0818", "#0A0818", person.tones[1] + "99"]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
          {box.w > 0 && (
            <>
              <Image source={{ uri }} style={{ position: "absolute", top: 0, left: 0, width: box.w, height: box.w }} resizeMode="cover" onError={onError} />
              <LinearGradient colors={["rgba(10,8,24,0)", "#0A0818"]} style={{ position: "absolute", top: box.w * 0.55, left: 0, right: 0, height: box.w * 0.46 }} />
            </>
          )}
        </View>
      );
    }
    return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={onError} />;
  }

  const [a, b] = person.tones;
  const flip = index % 2 === 1;
  const pose = [
    { x: 0.5, scale: 1 },
    { x: 0.58, scale: 1.12 },
    { x: 0.42, scale: 0.94 },
  ][index % 3];

  const { w, h } = box;
  const cx = w * pose.x;
  const r = w * 0.19 * pose.scale;
  const headY = h * 0.4;
  const neckY = headY + r * 1.45;
  const half = w * 0.42 * pose.scale;

  return (
    <View style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      <LinearGradient colors={flip ? [b, a] : [a, b]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
      {w > 0 && (
        <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
            </RadialGradient>
            <SvgGradient id="body" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.62} />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0.3} />
            </SvgGradient>
          </Defs>
          <Circle cx={cx} cy={headY + r} r={w * 0.62} fill="url(#halo)" />
          <Circle cx={flip ? w * 0.18 : w * 0.84} cy={h * 0.16} r={w * 0.1} fill="#FFFFFF" opacity={0.1} />
          <Circle cx={flip ? w * 0.88 : w * 0.12} cy={h * 0.58} r={w * 0.06} fill="#FFFFFF" opacity={0.08} />
          <Circle cx={cx} cy={headY} r={r} fill="url(#body)" />
          <Path
            d={`M ${cx - half} ${h} C ${cx - half} ${neckY + h * 0.12} ${cx - half * 0.55} ${neckY} ${cx} ${neckY} C ${cx + half * 0.55} ${neckY} ${cx + half} ${neckY + h * 0.12} ${cx + half} ${h} Z`}
            fill="url(#body)"
          />
        </Svg>
      )}
    </View>
  );
}
