import type { Axis, Letter } from "./axes";

// The classic-style questionnaire: statements you agree or disagree with on a
// five-point scale. Each statement points to one pole of one axis.
//
// This is an original questionnaire built on the same four Jungian preference
// scales the MBTI uses (like the open OEJTS and Keirsey-style sorters). It is
// NOT the official, copyrighted MBTI instrument.
//
// Every axis has 10 statements, balanced 5 and 5 between its poles. 8 are asked up
// front; the last 2 (marked `reserve`) are only asked when an axis is too close to
// call, to settle it.

export interface Question {
  id: string;
  axis: Axis;
  key: Letter; // agreeing with the statement points to this pole
  text: string;
  reserve?: boolean;
}

export const QUESTIONS: Question[] = [
  // ---- E / I: energy
  { id: "ei1", axis: "EI", key: "E", text: "I feel energised after an evening with a big group of people." },
  { id: "ei2", axis: "EI", key: "I", text: "I need time alone to recharge after a lot of social activity." },
  { id: "ei3", axis: "EI", key: "E", text: "I usually think out loud and work out what I think while I am talking." },
  { id: "ei4", axis: "EI", key: "I", text: "I prefer to think things through quietly before I say them." },
  { id: "ei5", axis: "EI", key: "E", text: "I start conversations with strangers easily." },
  { id: "ei6", axis: "EI", key: "I", text: "I am happiest with a few close friends rather than a wide circle." },
  { id: "ei7", axis: "EI", key: "E", text: "I would rather be in the middle of what is happening than watching from the side." },
  { id: "ei8", axis: "EI", key: "I", text: "Lots of small talk tends to wear me out." },
  { id: "ei9", axis: "EI", key: "E", text: "I make new friends quickly wherever I go.", reserve: true },
  { id: "ei10", axis: "EI", key: "I", text: "I keep my plans and feelings to myself until I am sure about them.", reserve: true },

  // ---- S / N: information
  { id: "sn1", axis: "SN", key: "S", text: "I trust facts and concrete experience more than hunches." },
  { id: "sn2", axis: "SN", key: "N", text: "I am drawn to patterns, theories and the big picture." },
  { id: "sn3", axis: "SN", key: "S", text: "I notice practical details that other people miss." },
  { id: "sn4", axis: "SN", key: "N", text: "I often daydream about what could be possible in the future." },
  { id: "sn5", axis: "SN", key: "S", text: "I prefer clear, step-by-step instructions to working it out as I go." },
  { id: "sn6", axis: "SN", key: "N", text: "I get bored doing the same task the same way again and again." },
  { id: "sn7", axis: "SN", key: "S", text: "I would rather use a proven method than try something untested." },
  { id: "sn8", axis: "SN", key: "N", text: "I trust my sense of how things connect even when I cannot prove it." },
  { id: "sn9", axis: "SN", key: "S", text: "I describe things literally and in detail.", reserve: true },
  { id: "sn10", axis: "SN", key: "N", text: "I enjoy brainstorming wild ideas more than improving existing ones.", reserve: true },

  // ---- T / F: decisions
  { id: "tf1", axis: "TF", key: "T", text: "When I decide something, logic comes before how people will feel." },
  { id: "tf2", axis: "TF", key: "F", text: "When I decide something, I first think about how it affects people." },
  { id: "tf3", axis: "TF", key: "T", text: "I would rather be seen as fair and objective than as warm." },
  { id: "tf4", axis: "TF", key: "F", text: "I find it hard to be blunt if it might hurt someone." },
  { id: "tf5", axis: "TF", key: "T", text: "The truth matters more to me than keeping the peace." },
  { id: "tf6", axis: "TF", key: "F", text: "Harmony in a group matters more to me than being proved right." },
  { id: "tf7", axis: "TF", key: "T", text: "I weigh pros and cons carefully and systematically before I choose." },
  { id: "tf8", axis: "TF", key: "F", text: "I decide mostly by my values and by what feels right to me." },
  { id: "tf9", axis: "TF", key: "T", text: "I am uncomfortable when an argument is driven by emotion instead of evidence.", reserve: true },
  { id: "tf10", axis: "TF", key: "F", text: "I naturally notice when someone in the room is upset.", reserve: true },

  // ---- J / P: lifestyle
  { id: "jp1", axis: "JP", key: "J", text: "I like to have a plan and stick to it." },
  { id: "jp2", axis: "JP", key: "P", text: "I like to keep my options open for as long as I can." },
  { id: "jp3", axis: "JP", key: "J", text: "I finish tasks well before the deadline." },
  { id: "jp4", axis: "JP", key: "P", text: "I do my best work in a last-minute burst of energy." },
  { id: "jp5", axis: "JP", key: "J", text: "I feel uneasy when things are left undecided." },
  { id: "jp6", axis: "JP", key: "P", text: "I adapt easily when plans change." },
  { id: "jp7", axis: "JP", key: "J", text: "A tidy, organised space helps me think." },
  { id: "jp8", axis: "JP", key: "P", text: "I treat rules and schedules as flexible guidelines." },
  { id: "jp9", axis: "JP", key: "J", text: "I make lists and enjoy ticking things off.", reserve: true },
  { id: "jp10", axis: "JP", key: "P", text: "I enjoy a spontaneous trip with no itinerary.", reserve: true },
];
