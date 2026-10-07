// The words and options used by onboarding, kept apart from the screens so
// they are easy to find and edit.

export const TYPE_ROWS = [
  ["INTJ", "INTP", "ENTJ", "ENTP"],
  ["INFJ", "INFP", "ENFJ", "ENFP"],
  ["ISTJ", "ISFJ", "ESTJ", "ESFJ"],
  ["ISTP", "ISFP", "ESTP", "ESFP"],
] as const;

export const TYPE_EMOJIS: Record<string, string> = {
  INTJ: "🧐", INTP: "🤓", ENTJ: "👑", ENTP: "💡",
  INFJ: "🔮", INFP: "🌙", ENFJ: "🌟", ENFP: "✨",
  ISTJ: "📋", ISFJ: "🌺", ESTJ: "⚖️", ESFJ: "🤝",
  ISTP: "🔧", ISFP: "🎨", ESTP: "⚡", ESFP: "🎉",
};

// Quick quiz: one question per MBTI dimension. `dim` is the letter each answer adds.
export const QUIZ_QUESTIONS = [
  { q: "After a long day, you feel most recharged by...", a: ["Time alone reflecting", "Being with friends"], dim: ["I", "E"] },
  { q: "You prefer working with...", a: ["Abstract ideas & possibilities", "Concrete facts & reality"], dim: ["N", "S"] },
  { q: "When deciding, you rely more on...", a: ["Logic & objective analysis", "Feelings & personal values"], dim: ["T", "F"] },
  { q: "Your daily life is better when...", a: ["You have a clear plan", "Things flow spontaneously"], dim: ["J", "P"] },
] as const;

// The PersonaAI chat: the first message is just "ready?", the next three are
// the real questions (see lib/personality.ts for how answers become a type).
export interface AiStep {
  text: string;
  options?: string[];
}

export const AI_FLOW: AiStep[] = [
  { text: "Hey! I'm PersonaAI 🔮 I'll find your personality type through a quick chat. Ready?", options: ["Let's go!", "How does this work?"] },
  {
    text: "Great! When you imagine a perfect weekend, what sounds most appealing?",
    options: ["Deep conversations with a close friend", "A big party with lots of new people", "Solo creative project at home", "Adventure trip somewhere new"],
  },
  {
    text: "Interesting! When you face a tough decision, what do you do first?",
    options: ["Make a pros and cons list", "Go with my gut feeling", "Ask trusted people for input", "Research extensively before deciding"],
  },
  {
    text: "Almost there! How would your friends describe you?",
    options: ["The deep thinker", "The social butterfly", "The reliable one", "The creative visionary"],
  },
  { text: "Perfect! Working out your type now... 🧠✨" },
];
