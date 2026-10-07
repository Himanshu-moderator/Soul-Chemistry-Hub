// Turns the PersonaAI chat answers into an MBTI type. Each answer nudges the
// four dimensions; the higher side of each pair wins. Ties go to the first
// letter listed in TIE_BREAK so the result is always deterministic.

type Dim = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
type Votes = Partial<Record<Dim, number>>;

// Answers to the three real questions, in the order they are asked.
// (The opening "Ready?" answer carries no personality signal.)
const WEEKEND: Votes[] = [
  { I: 1, N: 1, F: 1 }, // deep conversation with a close friend
  { E: 2 }, // big party with lots of new people
  { I: 2, N: 1, P: 1 }, // solo creative project
  { E: 1, S: 1, P: 2 }, // adventure trip
];
const DECISION: Votes[] = [
  { T: 2, J: 1 }, // pros and cons list
  { F: 1, P: 1, S: 1 }, // gut feeling
  { F: 1, E: 1 }, // ask trusted people
  { T: 1, J: 1, I: 1 }, // research extensively
];
const FRIENDS: Votes[] = [
  { I: 1, N: 1, T: 1 }, // the deep thinker
  { E: 2, F: 1 }, // the social butterfly
  { S: 1, J: 1, I: 1 }, // the reliable one
  { N: 2, P: 1 }, // the creative visionary
];

const PAIRS: [Dim, Dim][] = [
  ["I", "E"],
  ["N", "S"],
  ["F", "T"],
  ["P", "J"],
];

export function typeFromAnswers(weekend: number, decision: number, friends: number): string {
  const totals: Votes = {};
  for (const votes of [WEEKEND[weekend], DECISION[decision], FRIENDS[friends]]) {
    for (const [dim, n] of Object.entries(votes ?? {}) as [Dim, number][]) {
      totals[dim] = (totals[dim] ?? 0) + n;
    }
  }
  return PAIRS.map(([first, second]) => ((totals[second] ?? 0) > (totals[first] ?? 0) ? second : first)).join("");
}

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
