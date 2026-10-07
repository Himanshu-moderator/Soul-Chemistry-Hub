// The coin shop's catalogue. Prices are for show: nothing is charged anywhere.

export interface CoinPack {
  id: string;
  coins: number;
  price: string;
  free?: boolean;
  tag?: string;
  note?: string;
}

// The `coins` values must match the packs accepted by the demo_purchase_coins
// database function (see supabase/migrations).
export const COIN_PACKS: CoinPack[] = [
  { id: "p0", coins: 10, price: "Free", free: true, tag: "Free", note: "Watch a video" },
  { id: "p1", coins: 80, price: "₹85" },
  { id: "p2", coins: 450, price: "₹210" },
  { id: "p3", coins: 950, price: "₹410", tag: "Popular" },
  { id: "p4", coins: 2000, price: "₹820" },
  { id: "p5", coins: 5500, price: "₹2,050", tag: "Best value" },
];

// Three-day reward cycle that follows the user's check-in streak.
export const DAILY_REWARDS = [
  { day: 1, coins: 5 },
  { day: 2, coins: 7 },
  { day: 3, coins: 10 },
];

export const PERKS: { icon: "sparkles" | "eye" | "heart" | "color-palette" | "shield-checkmark" | "analytics"; label: string; free: boolean }[] = [
  { icon: "sparkles", label: "Personality insights", free: true },
  { icon: "color-palette", label: "Free themes (Nebula, Aurora)", free: true },
  { icon: "color-palette", label: "Premium themes", free: false },
  { icon: "eye", label: "See who visited you", free: false },
  { icon: "analytics", label: "Advanced type insights", free: false },
  { icon: "shield-checkmark", label: "No ads", free: false },
];
