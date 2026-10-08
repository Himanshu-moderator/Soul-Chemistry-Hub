import { AXES, type Axis, type AxisInfo, type Letter } from "./axes";
import { QUESTIONS, type Question } from "./questions";

// Pure scoring for the classic questionnaire: no React, no storage, so it is easy to
// test and to reuse.

// 1 = strongly disagree ... 5 = strongly agree.
export type Answer = 1 | 2 | 3 | 4 | 5;
export type Answers = Record<string, Answer>;

export type Clarity = "slight" | "moderate" | "clear" | "very clear";

export interface AxisResult {
  axis: Axis;
  letter: Letter; // the pole you lean to
  other: Letter;
  percent: number; // how strongly you lean to `letter`, 50 to 100
  clarity: Clarity;
  answered: number;
}

export interface TestResult {
  type: string;
  axes: AxisResult[];
}

const TIE_LETTER: Record<Axis, Letter> = { EI: "I", SN: "N", TF: "F", JP: "P" }; // the usual MBTI tie rule
const CLOSE_CALL = 10; // within this many points of 50% an axis gets its two extra questions

const forAxis = (axis: Axis, ids: string[]): Question[] => QUESTIONS.filter((q) => q.axis === axis && ids.includes(q.id));

const clarityOf = (percent: number): Clarity => (percent < 60 ? "slight" : percent < 70 ? "moderate" : percent < 85 ? "clear" : "very clear");

// Score one axis. Each answered statement adds (answer - 3) points to the pole it
// points to, so the total runs from -2n to +2n; the sign says which pole wins.
export function scoreAxis(info: AxisInfo, answers: Answers): AxisResult {
  const questions = forAxis(info.axis, Object.keys(answers));
  let raw = 0;
  let strongFirst = 0;
  let strongSecond = 0;
  for (const q of questions) {
    const points = answers[q.id] - 3;
    const towardFirst = q.key === info.first ? points : -points;
    raw += towardFirst;
    if (Math.abs(points) === 2) {
      if (towardFirst > 0) strongFirst++;
      else strongSecond++;
    }
  }
  const n = questions.length;
  const percentFirst = n === 0 ? 50 : 50 + (50 * raw) / (2 * n);

  let letter: Letter;
  if (raw > 0) letter = info.first;
  else if (raw < 0) letter = info.second;
  else if (strongFirst !== strongSecond) letter = strongFirst > strongSecond ? info.first : info.second; // more decisive answers win
  else letter = TIE_LETTER[info.axis];

  const percent = Math.max(50, Math.round(letter === info.first ? percentFirst : 100 - percentFirst));
  return { axis: info.axis, letter, other: letter === info.first ? info.second : info.first, percent, clarity: clarityOf(percent), answered: n };
}

export function scoreTest(answers: Answers): TestResult {
  const axes = AXES.map((a) => scoreAxis(a, answers));
  return { type: axes.map((a) => a.letter).join(""), axes };
}

// The statements to ask, in order: every main statement first (mixed across axes),
// then the two extra statements for any axis that is a close call.
export function questionOrder(answers: Answers): Question[] {
  const main = QUESTIONS.filter((q) => !q.reserve);
  const perAxis = AXES.map((a) => main.filter((q) => q.axis === a.axis));
  const mixed = Array.from({ length: perAxis[0].length }, (_, i) => perAxis.map((list) => list[i])).flat();

  const mainDone = mixed.every((q) => answers[q.id] !== undefined);
  if (!mainDone) return mixed;

  const extra = AXES.filter((a) => Math.abs(scoreAxis(a, answers).percent - 50) < CLOSE_CALL).flatMap((a) => QUESTIONS.filter((q) => q.axis === a.axis && q.reserve));
  return [...mixed, ...extra];
}

export const isFinished = (answers: Answers): boolean => questionOrder(answers).every((q) => answers[q.id] !== undefined);
