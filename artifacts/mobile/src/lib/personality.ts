// Personality helpers shared by the screens: which types click, a Big Five sketch,
// and an illustrative chemistry score between two types. (Finding your type lives in
// lib/mbti for the questionnaire and lib/persona for the AI chat.)

// Pairings commonly cited as the easiest fits (a rule of thumb, not science).
export const COMPATIBLE_TYPES: Record<string, [string, string]> = {
  INTJ: ["ENFP", "ENTP"], INTP: ["ENTJ", "ESTJ"], ENTJ: ["INTP", "INFP"], ENTP: ["INFJ", "INTJ"],
  INFJ: ["ENFP", "ENTP"], INFP: ["ENFJ", "ENTJ"], ENFJ: ["INFP", "ISFP"], ENFP: ["INFJ", "INTJ"],
  ISTJ: ["ESFP", "ESTP"], ISFJ: ["ESFP", "ESTP"], ESTJ: ["ISTP", "INTP"], ESFJ: ["ISFP", "ISTP"],
  ISTP: ["ESTJ", "ESFJ"], ISFP: ["ENFJ", "ESFJ"], ESTP: ["ISFJ", "ISTJ"], ESFP: ["ISTJ", "ISFJ"],
};

const FLIP: Record<string, string> = { E: "I", I: "E", S: "N", N: "S", T: "F", F: "T", J: "P", P: "J" };

// Three chemistry pairings for a type. The scores are illustrative (this is a
// prototype with no real matching data); the pairings themselves come from
// COMPATIBLE_TYPES, plus the "opposite" type as the complementary match.
export function bestPairs(mbti: string) {
  const [first, second] = COMPATIBLE_TYPES[mbti] ?? ["ENFP", "INFJ"];
  const opposite = mbti.split("").map((c) => FLIP[c] ?? c).join("");
  return [
    { type1: mbti, type2: first, score: 96, label: "Golden Pair" },
    { type1: mbti, type2: second, score: 88, label: "Stimulating" },
    { type1: mbti, type2: opposite, score: 84, label: "Complementary" },
  ];
}

// A rough Big Five sketch implied by an MBTI type (illustrative only: the two
// models overlap but are not the same thing). Neuroticism isn't measured by
// MBTI, so it stays neutral.
export function bigFiveFor(mbti: string) {
  return {
    O: mbti.includes("N") ? 84 : 40,
    C: mbti.includes("J") ? 82 : 44,
    E: mbti.startsWith("E") ? 80 : 32,
    A: mbti.includes("F") ? 76 : 46,
    N: 50,
  };
}

// An illustrative chemistry score between two types (0 to 100). Same rule of thumb
// as COMPATIBLE_TYPES: the two listed pairings score highest, the "opposite" type is
// the complementary match, anything else scales with how many letters you share.
// `salt` (e.g. a name length) nudges equal scores apart so the deck isn't uniform.
export function chemistryBetween(mine: string, theirs: string, salt = 0): number {
  if (!mine || !theirs) return 70;
  const [first, second] = COMPATIBLE_TYPES[mine] ?? [];
  if (theirs === first) return 94;
  if (theirs === second) return 90;
  const opposite = mine.split("").map((c) => FLIP[c] ?? c).join("");
  if (theirs === opposite) return 86;
  const shared = mine.split("").filter((c, i) => c === theirs[i]).length;
  return 62 + shared * 6 + (salt % 5);
}
