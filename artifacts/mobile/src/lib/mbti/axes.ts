// The four MBTI dichotomies. Each axis has two poles (letters); the first pole is
// the one a positive score points to (see scoring.ts).

export type Axis = "EI" | "SN" | "TF" | "JP";
export type Letter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface AxisInfo {
  axis: Axis;
  first: Letter;
  second: Letter;
  name: string; // what the axis is about, for people
  firstLabel: string;
  secondLabel: string;
}

export const AXES: AxisInfo[] = [
  { axis: "EI", first: "E", second: "I", name: "Where you get your energy", firstLabel: "Extraversion", secondLabel: "Introversion" },
  { axis: "SN", first: "S", second: "N", name: "How you take in information", firstLabel: "Sensing", secondLabel: "Intuition" },
  { axis: "TF", first: "T", second: "F", name: "How you make decisions", firstLabel: "Thinking", secondLabel: "Feeling" },
  { axis: "JP", first: "J", second: "P", name: "How you live your outer life", firstLabel: "Judging", secondLabel: "Perceiving" },
];

export const axisInfo = (axis: Axis): AxisInfo => AXES.find((a) => a.axis === axis) as AxisInfo;

export const letterLabel = (letter: Letter): string => {
  for (const a of AXES) {
    if (a.first === letter) return a.firstLabel;
    if (a.second === letter) return a.secondLabel;
  }
  return letter;
};
