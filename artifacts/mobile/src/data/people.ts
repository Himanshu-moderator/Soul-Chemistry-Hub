// Sample people for the Soul deck. This is a prototype with no real matching
// backend, so these profiles are invented. Swap `photos` for real image URLs and the
// deck shows them instead of the illustrated portraits.

export type InterestKind = "Hobby" | "Music" | "Food" | "Travel" | "Value";

export interface Interest {
  kind: InterestKind;
  label: string;
  emoji: string;
}

export interface SoulPerson {
  id: string;
  name: string;
  age: number;
  city: string;
  flag: string;
  mbti: string;
  enneagram: string;
  relationship: string; // what they are looking for
  askMe: string;
  about: string;
  verified: boolean;
  isNew: boolean;
  isOnline: boolean;
  lastSeen: string;
  // Two colours for the illustrated portrait, used when `photos` is empty.
  tones: [string, string];
  photos: string[];
  interests: Interest[];
  // They have already liked you: liking them back is an instant match.
  likesYou?: { message?: string };
  // They accept your request a few seconds after you send it (demo behaviour).
  autoAccept?: boolean;
}

const h = (label: string, emoji: string): Interest => ({ kind: "Hobby", label, emoji });
const m = (label: string, emoji: string): Interest => ({ kind: "Music", label, emoji });
const f = (label: string, emoji: string): Interest => ({ kind: "Food", label, emoji });
const t = (label: string, emoji: string): Interest => ({ kind: "Travel", label, emoji });
const v = (label: string, emoji: string): Interest => ({ kind: "Value", label, emoji });

export const SOUL_PEOPLE: SoulPerson[] = [
  {
    id: "s1", name: "Anushka", age: 22, city: "Uttar Pradesh", flag: "🇮🇳", mbti: "ISTJ", enneagram: "6w5",
    relationship: "Consigliere", askMe: "What gives life meaning",
    about: "I know suturing. So better see what you speak. Quiet planner, loud laugh once you know me.",
    verified: true, isNew: true, isOnline: true, lastSeen: "now", tones: ["#7C5CFF", "#F472B6"], photos: [],
    interests: [h("Science", "🔬"), h("Philosophy", "🏛️"), h("Medicine", "🩺"), m("Lo-fi music", "🎧"), h("Video games", "🎮"), h("Art", "🎨"), t("Hiking", "🥾"), h("Swimming", "🏊"), h("Dogs", "🐕")],
    likesYou: { message: "Your type caught my eye. Hi!" }, autoAccept: true,
  },
  {
    id: "s2", name: "Kabir", age: 25, city: "Mumbai", flag: "🇮🇳", mbti: "ENTP", enneagram: "7w8",
    relationship: "Partner in crime", askMe: "My worst startup idea",
    about: "Will argue about anything for fun. Terrible at replying fast, great at showing up.",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#22D3EE", "#6366F1"], photos: [],
    interests: [h("Startups", "🚀"), h("Stand-up comedy", "🎤"), m("Indie rock", "🎸"), f("Street food", "🌮"), t("Road trips", "🚗"), h("Chess", "♟️")],
    autoAccept: true,
  },
  {
    id: "s3", name: "Meera", age: 23, city: "Bengaluru", flag: "🇮🇳", mbti: "INFJ", enneagram: "4w5",
    relationship: "Deep conversations", askMe: "The book that changed me",
    about: "Tea, rain and long voice notes. I notice small things about people.",
    verified: true, isNew: false, isOnline: false, lastSeen: "1h ago", tones: ["#34D399", "#0EA5E9"], photos: [],
    interests: [h("Reading", "📚"), h("Journaling", "📓"), f("Chai", "🍵"), m("Classical", "🎻"), h("Photography", "📷"), t("Mountains", "🏔️"), v("Kindness", "🌱")],
    likesYou: { message: "Do you also overthink your own type? 😅" },
  },
  {
    id: "s4", name: "Rohan", age: 27, city: "Delhi", flag: "🇮🇳", mbti: "INTJ", enneagram: "5w6",
    relationship: "Study buddy", askMe: "How I plan my week",
    about: "Systems nerd. Will happily explain the plot of any strategy game. Coffee snob.",
    verified: false, isNew: true, isOnline: true, lastSeen: "now", tones: ["#F59E0B", "#EF4444"], photos: [],
    interests: [h("Strategy games", "🎲"), h("Coding", "💻"), f("Coffee", "☕"), m("Synthwave", "🎹"), h("Cycling", "🚴"), v("Honesty", "🧭")],
  },
  {
    id: "s5", name: "Isha", age: 21, city: "Pune", flag: "🇮🇳", mbti: "ENFP", enneagram: "7w6",
    relationship: "New friends", askMe: "My weirdest hobby",
    about: "Collects hobbies like trading cards. Currently learning pottery and the ukulele (badly).",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#F472B6", "#FB923C"], photos: [],
    interests: [h("Pottery", "🏺"), m("Ukulele", "🎶"), h("Dancing", "💃"), f("Baking", "🧁"), t("Beaches", "🏖️"), h("Cats", "🐈"), v("Curiosity", "✨")],
    likesYou: {},
    autoAccept: true,
  },
  {
    id: "s6", name: "Arjun", age: 26, city: "Hyderabad", flag: "🇮🇳", mbti: "ISFP", enneagram: "9w8",
    relationship: "Something slow and real", askMe: "My favourite quiet place",
    about: "Sketchbook in my bag, headphones on. Prefer one good conversation to ten loud ones.",
    verified: true, isNew: false, isOnline: false, lastSeen: "3h ago", tones: ["#A78BFA", "#38BDF8"], photos: [],
    interests: [h("Sketching", "✏️"), m("Lo-fi", "🎧"), h("Film photography", "🎞️"), f("Biryani", "🍛"), t("Night walks", "🌙"), v("Calm", "🕊️")],
  },
  {
    id: "s7", name: "Tara", age: 24, city: "Kolkata", flag: "🇮🇳", mbti: "ENFJ", enneagram: "2w3",
    relationship: "Soulmate", askMe: "What I'd do with a free year",
    about: "I host dinner parties for people who just met. Ask me for a playlist.",
    verified: true, isNew: true, isOnline: true, lastSeen: "now", tones: ["#FB7185", "#8B5CF6"], photos: [],
    interests: [h("Hosting", "🍽️"), m("Jazz", "🎷"), h("Theatre", "🎭"), f("Cooking", "🍳"), t("Old cities", "🏛️"), v("Loyalty", "🤝")],
    autoAccept: true,
  },
  {
    id: "s8", name: "Vihaan", age: 28, city: "Jaipur", flag: "🇮🇳", mbti: "ISTP", enneagram: "8w7",
    relationship: "Adventure partner", askMe: "My last repair disaster",
    about: "Fixes bikes, breaks plans. Happiest on a highway with no destination.",
    verified: false, isNew: false, isOnline: false, lastSeen: "yesterday", tones: ["#0EA5E9", "#14B8A6"], photos: [],
    interests: [h("Motorbikes", "🏍️"), h("Mechanics", "🔧"), t("Deserts", "🏜️"), m("Rock", "🤘"), f("Dhaba food", "🥘"), v("Freedom", "🦅")],
  },
  {
    id: "s9", name: "Naina", age: 22, city: "Chennai", flag: "🇮🇳", mbti: "INFP", enneagram: "4w3",
    relationship: "Pen pal to partner", askMe: "A song I can't skip",
    about: "Writes poems nobody asked for. Will remember your birthday and your favourite colour.",
    verified: true, isNew: false, isOnline: true, lastSeen: "now", tones: ["#C084FC", "#F472B6"], photos: [],
    interests: [h("Poetry", "🪶"), m("Indie folk", "🪕"), h("Stargazing", "🔭"), f("Filter coffee", "☕"), h("Anime", "🌸"), v("Empathy", "💜")],
  },
  {
    id: "s10", name: "Dev", age: 29, city: "Ahmedabad", flag: "🇮🇳", mbti: "ESTJ", enneagram: "1w9",
    relationship: "Serious relationship", askMe: "My five-year plan",
    about: "Organised, dependable, secretly a softie. Looking for someone who laughs at my spreadsheets.",
    verified: true, isNew: false, isOnline: false, lastSeen: "2h ago", tones: ["#F59E0B", "#10B981"], photos: [],
    interests: [h("Finance", "📈"), h("Cricket", "🏏"), h("Fitness", "🏋️"), f("Home cooking", "🍲"), t("Family trips", "🧳"), v("Reliability", "⚓")],
  },
];

export const personById = (id: string) => SOUL_PEOPLE.find((p) => p.id === id);
