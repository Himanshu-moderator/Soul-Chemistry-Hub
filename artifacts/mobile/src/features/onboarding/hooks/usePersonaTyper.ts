import { useCallback, useEffect, useRef, useState } from "react";
import { AXES } from "@/lib/mbti";
import {
  decide,
  JSON_REMINDER,
  MAX_ANSWERS,
  parseTurn,
  TYPER_OPENING_REQUEST,
  TYPER_SYSTEM_PROMPT,
  typeOf,
  typerKeepGoingNote,
  weakAxes,
  type TyperTurn,
} from "@/lib/persona";
import { AiUnavailableError, chat, type AiMessage } from "@/services/ai";
import type { EvidenceLine } from "../components/TypeResult";

export interface ChatLine {
  id: string;
  from: "ai" | "user";
  text: string;
}

export type TyperStatus = "thinking" | "your-turn" | "done" | "error";

export interface TyperResult {
  type: string;
  axes: EvidenceLine[];
}

const MAX_REPLY_CHARS = 700;

// Adds a hidden reminder to the last user message so the model keeps answering in JSON.
const withReminder = (history: AiMessage[]): AiMessage[] =>
  history.map((m, i) => (i === history.length - 1 && m.role === "user" ? { ...m, content: `${m.content} ${JSON_REMINDER}` } : m));

// Runs the PersonaAI typing interview: asks the model for each turn, checks its
// answer (lib/persona), and decides whether to ask another question or finish.
export function usePersonaTyper(onProgress: (fraction: number) => void) {
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [status, setStatus] = useState<TyperStatus>("thinking");
  const [result, setResult] = useState<TyperResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // What the model sees: the hidden opening request, its own replies (as JSON) and the user's answers.
  const history = useRef<AiMessage[]>([{ role: "user", content: TYPER_OPENING_REQUEST }]);
  const answers = useRef(0);
  const alive = useRef(true);
  const started = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const say = (from: ChatLine["from"], text: string) => setLines((l) => [...l, { id: `${from}-${l.length}`, from, text }]);

  // One round trip: get a valid turn from the model (retrying once if it was not JSON).
  const requestTurn = useCallback(async (): Promise<{ raw: string; turn: TyperTurn }> => {
    for (let attempt = 0; attempt < 2; attempt++) {
      const raw = await chat({ system: TYPER_SYSTEM_PROMPT, messages: withReminder(history.current), json: true, temperature: 0.3 });
      const turn = parseTurn(raw);
      if (turn) return { raw, turn };
    }
    throw new Error("The AI answered in a format I could not read.");
  }, []);

  const finish = useCallback(
    (turn: TyperTurn) => {
      const axes: EvidenceLine[] = AXES.map((a) => ({ axis: a.axis, letter: turn.axes[a.axis].lean, percent: Math.max(55, turn.axes[a.axis].confidence), note: turn.axes[a.axis].evidence }));
      say("ai", turn.ready && turn.message ? turn.message : "Thanks, that tells me what I needed. I have a clear picture of you now.");
      setResult({ type: typeOf(turn), axes });
      setStatus("done");
      onProgress(0.8);
    },
    [onProgress]
  );

  // Ask the model for its next move and act on it.
  const advance = useCallback(async () => {
    setStatus("thinking");
    setError(null);
    try {
      let { raw, turn } = await requestTurn();
      const given = answers.current;

      // The model wants to stop, or there is nothing left to ask: let the protocol judge.
      if (given > 0 && decide(turn, given) === "finish") {
        if (!alive.current) return;
        history.current.push({ role: "assistant", content: raw });
        finish(turn);
        return;
      }
      // The model said "ready" too soon: send it back for one more question.
      if (turn.ready && given < MAX_ANSWERS) {
        history.current.push({ role: "assistant", content: raw }, { role: "user", content: typerKeepGoingNote(weakAxes(turn)) });
        ({ raw, turn } = await requestTurn());
        history.current.splice(-2, 2);
      }
      if (!alive.current) return;
      history.current.push({ role: "assistant", content: raw });
      say("ai", turn.message);
      onProgress(0.2 + (Math.min(given, MAX_ANSWERS) / MAX_ANSWERS) * 0.55);
      setStatus("your-turn");
    } catch (e) {
      if (!alive.current) return;
      setError(e instanceof AiUnavailableError ? "I could not reach my brain just now. Check your connection and try again." : e instanceof Error ? e.message : "Something went wrong.");
      setStatus("error");
    }
  }, [finish, onProgress, requestTurn]);

  // Open the conversation once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void advance();
  }, [advance]);

  const send = useCallback(
    (text: string) => {
      const clean = text.trim().slice(0, MAX_REPLY_CHARS);
      if (!clean || status !== "your-turn") return;
      say("user", clean);
      history.current.push({ role: "user", content: clean });
      answers.current += 1;
      void advance();
    },
    [advance, status]
  );

  return { lines, status, result, error, send, retry: advance, answers: answers.current };
}
