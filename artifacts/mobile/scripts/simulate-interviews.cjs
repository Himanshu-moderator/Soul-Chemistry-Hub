#!/usr/bin/env node
/*
 * Simulated PersonaAI interviews: how accurate is the typing chat, and how many
 * questions does it need?
 *
 * One model plays PersonaAI exactly as the app does (the real prompt from
 * src/lib/persona and the real stopping rules). A second call plays a person of a
 * KNOWN type who answers the questions. We compare the type PersonaAI ends on with
 * the type we started from.
 *
 * Usage (from artifacts/mobile):
 *   GEMINI_KEY=your-key node scripts/simulate-interviews.cjs            # 8 types
 *   GEMINI_KEY=your-key node scripts/simulate-interviews.cjs --all      # all 16
 *   GEMINI_KEY=your-key node scripts/simulate-interviews.cjs INTJ ENFP  # chosen types
 *   add --save to write each transcript to scripts/out/<TYPE>.json
 *   --check compiles the app code and exits (no key, no model calls)
 *
 * Windows PowerShell:  $env:GEMINI_KEY="your-key"; node scripts/simulate-interviews.cjs
 *
 * The key is read from the environment only; it is never written anywhere. The free
 * Gemini tier allows roughly 10-15 requests a minute, so the script pauses between
 * calls: a full run of 8 types takes about 10 minutes.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execSync } = require("child_process");

const KEY = process.env.GEMINI_KEY;
// Tried in order; when one is busy (HTTP 503) or rate limited the next one is used.
const MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ["gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
const PAUSE_MS = Number(process.env.PAUSE_MS || 4500);

if (!KEY && !process.argv.includes("--check")) {
  console.error("Set GEMINI_KEY first, e.g.  GEMINI_KEY=your-key node scripts/simulate-interviews.cjs");
  process.exit(1);
}

// ---- compile the app's own persona code so we test exactly what ships --------------
const root = path.resolve(__dirname, "..");
const out = path.join(os.tmpdir(), "pdb-sim-build");
fs.rmSync(out, { recursive: true, force: true });
try {
  execSync(`npx tsc src/lib/persona/index.ts src/lib/mbti/index.ts --outDir "${out}" --module commonjs --target es2020 --skipLibCheck`, { cwd: root, stdio: "ignore" });
} catch {
  // tsc reports the @/ alias as unresolved but still writes the files; patched just below
}
if (!fs.existsSync(path.join(out, "persona", "typerProtocol.js"))) {
  console.error("Could not compile the app code. Run this from artifacts/mobile after pnpm install.");
  process.exit(1);
}
const protocolFile = path.join(out, "persona", "typerProtocol.js");
fs.writeFileSync(protocolFile, fs.readFileSync(protocolFile, "utf8").replace('require("@/lib/mbti")', 'require("../mbti")'));
const P = require(path.join(out, "persona"));
if (process.argv.includes("--check")) {
  // dry run: confirms the app code compiles and loads, without calling any model
  console.log("OK: persona code loaded (limits:", P.MIN_ANSWERS, "to", P.MAX_ANSWERS, "answers, confidence", P.CONFIDENT + ")");
  process.exit(0);
}

// ---- people to play ------------------------------------------------------------------
const PERSONAS = {
  INTJ: "private, strategic, long-term planner, logical and independent, dislikes small talk, recharges alone, thinks in systems and future possibilities, decisive, likes clear plans and efficiency",
  INTP: "analytical, curious, loves theories and ideas, quiet, questions everything, logical over emotional, flexible and often procrastinates, absent-minded about practical details, needs lots of alone time",
  ENTJ: "commanding, outgoing, goal-driven, organises people and projects, logical and direct, thinks about strategy and the future, decisive, loves efficiency, plans ahead and hits deadlines early",
  ENTP: "witty, loves debating and brainstorming, sees possibilities everywhere, energised by people and ideas, logical but contrarian, hates routine, starts many things, improvises, leaves tasks for the last minute",
  INFJ: "quiet, insightful, idealistic, reads people deeply, drawn to meaning and the future, decides by values, private, plans things and likes closure, needs solitude after socialising, wants to help people",
  INFP: "introspective, idealistic, creative, guided by personal values, sensitive, daydreamer, needs alone time, loves meaning and symbolism, flexible and procrastinates, avoids harsh conflict",
  ENFJ: "warm, charismatic, organises and inspires others, tuned to feelings, values harmony and growth, speaks easily to groups, plans ahead, likes closure, sees potential in people",
  ENFP: "enthusiastic, talkative, loves new people and ideas, thinks out loud, drawn to possibilities and meaning, decides by values and feelings, spontaneous, starts many projects, hates rigid schedules",
  ISTJ: "dependable, practical, detail-oriented, follows rules and proven methods, reserved, loves routine and lists, logical and fair, finishes things early, dislikes surprises and vague plans",
  ISFJ: "warm, dependable, detail-oriented, remembers practical details and traditions, likes routines and plans, cares for people quietly, recharges at home, prefers proven methods, avoids conflict",
  ESTJ: "organised, decisive, loves order and rules, takes charge, practical and logical, blunt, likes clear schedules and traditions, social and busy, finishes tasks before deadlines",
  ESFJ: "sociable, caring, organised, hosts gatherings, tuned to others' feelings, values harmony and tradition, practical, likes plans and routines, gives lots of help and likes appreciation",
  ISTP: "calm, private, hands-on problem solver, practical and logical, likes fixing and building things, prefers doing over talking, spontaneous, flexible, dislikes rules and emotional drama",
  ISFP: "gentle, artistic, lives in the moment, sensitive to beauty and feelings, private, values personal freedom, flexible and spontaneous, dislikes conflict and being tied to plans, shows love through actions",
  ESTP: "energetic, hands-on, lives in the moment, loves action and people, practical, logical in a blunt way, spontaneous, handles crises well, bored by theory, keeps options open",
  ESFP: "fun-loving, outgoing, loves being around people and the spotlight, lives in the moment, warm, practical, spontaneous, hates planning and lectures, makes things lively, decides by feelings",
};
const DEFAULT_TYPES = ["INTJ", "ENFP", "ISFJ", "ESTP", "INFP", "ENTJ", "ISTP", "ESFJ"];

// ---- talking to Gemini ----------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gemini(system, messages, json) {
  await sleep(PAUSE_MS);
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    generationConfig: { temperature: json ? 0.3 : 0.9, ...(json ? { responseMimeType: "application/json" } : {}) },
  });
  for (let round = 0; round < 5; round++) {
    for (const model of MODELS) {
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": KEY },
          body,
        });
        if (r.status === 503 || r.status === 429 || r.status === 404 || r.status === 500) {
          console.log(`   (${model} busy: HTTP ${r.status}, trying the next one)`);
          continue;
        }
        if (!r.ok) throw new Error("HTTP " + r.status + " " + (await r.text()).slice(0, 200));
        const data = await r.json();
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
        if (text) return text;
      } catch (e) {
        console.log("   (error:", e.message.slice(0, 120) + ")");
      }
    }
    await sleep(15000); // every model was busy: wait a bit and go round again
  }
  throw new Error("The model could not be reached");
}

// ---- one interview, following the same rules as the app's usePersonaTyper hook -------
const withReminder = (h) => h.map((m, i) => (i === h.length - 1 && m.role === "user" ? { ...m, content: `${m.content} ${P.JSON_REMINDER}` } : m));

async function requestTurn(history) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await gemini(P.TYPER_SYSTEM_PROMPT, withReminder(history), true);
    const turn = P.parseTurn(raw);
    if (turn) return { raw, turn };
  }
  throw new Error("unreadable reply from PersonaAI");
}

async function interview(type) {
  const personaSystem = `You are a real person with these traits: ${PERSONAS[type]}. A chatbot is interviewing you. Answer each question the way this person really would: 1 to 3 casual sentences with concrete personal details. Never mention MBTI, letters, "type" or these traits by name.`;
  const history = [{ role: "user", content: P.TYPER_OPENING_REQUEST }];
  const transcript = [];
  let answers = 0;
  let turn;

  for (let step = 0; step < 12; step++) {
    let raw;
    ({ raw, turn } = await requestTurn(history));
    if (answers > 0 && P.decide(turn, answers) === "finish") break;
    if (turn.ready && answers < P.MAX_ANSWERS) {
      history.push({ role: "assistant", content: raw }, { role: "user", content: P.typerKeepGoingNote(P.weakAxes(turn)) });
      ({ raw, turn } = await requestTurn(history));
      history.splice(-2, 2);
    }
    history.push({ role: "assistant", content: raw });
    transcript.push({ from: "PersonaAI", text: turn.message });

    // the simulated person answers (they see PersonaAI's messages as the other side)
    const view = history
      .filter((m) => !m.content.startsWith("("))
      .map((m) => ({ role: m.role === "assistant" ? "user" : "assistant", content: m.role === "assistant" ? P.parseTurn(m.content)?.message ?? m.content : m.content }));
    const reply = await gemini(personaSystem, view, false);
    history.push({ role: "user", content: reply.trim() });
    transcript.push({ from: type, text: reply.trim() });
    answers++;
    if (answers >= P.MAX_ANSWERS) {
      ({ turn } = await requestTurn(history)); // one last read after the final answer
      break;
    }
  }
  return { guess: P.typeOf(turn), answers, turn, transcript };
}

// ---- run -------------------------------------------------------------------------------
(async () => {
  const args = process.argv.slice(2);
  const save = args.includes("--save");
  const names = args.filter((a) => !a.startsWith("--")).map((a) => a.toUpperCase());
  const types = names.length ? names : args.includes("--all") ? Object.keys(PERSONAS) : DEFAULT_TYPES;

  const rows = [];
  for (const type of types) {
    if (!PERSONAS[type]) {
      console.log("Unknown type", type);
      continue;
    }
    process.stdout.write(`${type} ... `);
    try {
      const r = await interview(type);
      const wrong = [...type].map((c, i) => (c === r.guess[i] ? "" : `${c}->${r.guess[i]}`)).filter(Boolean);
      const conf = Object.values(r.turn.axes).map((a) => `${a.lean}${a.confidence}`).join(" ");
      console.log(`${r.guess}  ${r.guess === type ? "CORRECT" : "WRONG (" + wrong.join(", ") + ")"}  after ${r.answers} answers  [${conf}]`);
      rows.push({ type, ...r });
      if (save) {
        fs.mkdirSync(path.join(__dirname, "out"), { recursive: true });
        fs.writeFileSync(path.join(__dirname, "out", `${type}.json`), JSON.stringify(r, null, 2));
      }
    } catch (e) {
      console.log("ERROR", e.message);
    }
  }

  const right = rows.filter((r) => r.guess === r.type).length;
  const avg = rows.length ? (rows.reduce((s, r) => s + r.answers, 0) / rows.length).toFixed(1) : "-";
  const letters = rows.reduce((s, r) => s + [...r.type].filter((c, i) => c === r.guess[i]).length, 0);
  console.log("\n==== summary ====");
  console.log(`Exactly right: ${right}/${rows.length}`);
  console.log(`Letters right: ${letters}/${rows.length * 4}`);
  console.log(`Average answers needed: ${avg} (limit ${P.MAX_ANSWERS}, minimum ${P.MIN_ANSWERS})`);
  if (save) console.log("Transcripts saved in scripts/out/");
})();
