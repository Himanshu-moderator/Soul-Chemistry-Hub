import { TYPE_INSIGHTS } from "@/data/typeInsights";

// Scripted PersonaAI answers built from the per-type notes, so they match
// whichever type the user actually has. Swap this for a real model later.
export function personaReply(mbti: string, query: string): string {
  const info = TYPE_INSIGHTS[mbti];
  if (!info) return `I don't have notes on ${mbti} yet. Try the Soul tab for chemistry insights.`;
  const q = query.toLowerCase();
  if (q.includes("compat") || q.includes("match") || q.includes("love")) return `For an ${mbti}: ${info.love}`;
  if (q.includes("strength")) return `Your top strength as an ${mbti}: ${info.strength}.`;
  if (q.includes("weak") || q.includes("growth")) return `A growth area for ${mbti}: ${info.growth}.`;
  if (q.includes("career") || q.includes("job")) return `Careers that suit an ${mbti}: ${info.career}.`;
  return `Good question! Try asking about your strengths, growth areas, compatible types or careers as an ${mbti}.`;
}
