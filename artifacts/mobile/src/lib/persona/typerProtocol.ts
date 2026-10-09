import { AXES, type Axis, type Letter } from "@/lib/mbti";

// Reading and judging the model's replies during the typing interview. The model
// proposes; this file decides. The final type is always computed here from the
// model's per-dichotomy reads, never taken on trust from free text.

export const MIN_ANSWERS = 5; // never finish before hearing this many answers
export const MAX_ANSWERS = 7; // never ask more than this many questions
export const CONFIDENT = 75; // every dichotomy needs at least this much confidence

export interface AxisRead {
  lean: Letter;
  confidence: number;
  evidence: string;
}

export interface TyperTurn {
  message: string;
  axes: Record<Axis, AxisRead>;
  ready: boolean;
}

export type Decision = "ask-more" | "finish";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Pulls the first JSON object out of the reply (models sometimes wrap it in text or
// code fences) and checks it has everything we need. Returns null if it does not.
export function parseTurn(raw: string): TyperTurn | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const obj = data as { message?: unknown; ready?: unknown; axes?: Record<string, { lean?: unknown; confidence?: unknown; evidence?: unknown }> };
  if (typeof obj.message !== "string" || !obj.axes) return null;

  const axes = {} as Record<Axis, AxisRead>;
  for (const a of AXES) {
    const read = obj.axes[a.axis];
    const lean = typeof read?.lean === "string" ? read.lean.toUpperCase() : "";
    if (lean !== a.first && lean !== a.second) return null;
    axes[a.axis] = { lean: lean as Letter, confidence: clamp(Number(read?.confidence ?? 50)), evidence: typeof read?.evidence === "string" ? read.evidence : "" };
  }
  return { message: obj.message.trim(), axes, ready: obj.ready === true };
}

// The dichotomies still below the confidence bar, weakest first.
export function weakAxes(turn: TyperTurn): Axis[] {
  return AXES.map((a) => a.axis)
    .filter((axis) => turn.axes[axis].confidence < CONFIDENT)
    .sort((x, y) => turn.axes[x].confidence - turn.axes[y].confidence);
}

// Should we stop and show the result, or ask another question?
// - never before MIN_ANSWERS
// - always at MAX_ANSWERS (use the best read we have)
// - otherwise only when every dichotomy is confident, whether or not the model said "ready"
export function decide(turn: TyperTurn, answers: number): Decision {
  if (answers < MIN_ANSWERS) return "ask-more";
  if (answers >= MAX_ANSWERS) return "finish";
  return weakAxes(turn).length === 0 ? "finish" : "ask-more";
}

export const typeOf = (turn: TyperTurn): string => AXES.map((a) => turn.axes[a.axis].lean).join("");
