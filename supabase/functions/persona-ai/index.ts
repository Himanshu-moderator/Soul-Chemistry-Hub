// PersonaAI edge function: a thin, safe proxy to Google Gemini.
//
// The app sends { system, messages, json, temperature }; this function adds the
// Gemini API key (a server secret, never shipped in the app) and returns { text }.
//
// Setup (see docs/AI.md):
//   supabase secrets set GEMINI_API_KEY=your-free-key
//   supabase functions deploy persona-ai

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// Tried in order: when one is busy (503) or over quota (429) the next is used.
const MODELS = (Deno.env.get("GEMINI_MODELS") ?? "gemini-flash-latest,gemini-flash-lite-latest,gemini-2.0-flash").split(",").map((m) => m.trim());

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Limits keep one visitor from burning the free quota.
const MAX_SYSTEM_CHARS = 12_000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 4_000;

interface Incoming {
  system?: unknown;
  messages?: unknown;
  json?: unknown;
  temperature?: unknown;
}

const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply({ error: "Use POST" }, 405);
  if (!GEMINI_API_KEY) return reply({ error: "GEMINI_API_KEY is not set on the server" }, 500);

  let body: Incoming;
  try {
    body = await req.json();
  } catch {
    return reply({ error: "Invalid JSON" }, 400);
  }

  const system = typeof body.system === "string" ? body.system : "";
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (!system || system.length > MAX_SYSTEM_CHARS) return reply({ error: "Bad system prompt" }, 400);
  if (messages.length === 0 || messages.length > MAX_MESSAGES) return reply({ error: "Bad messages" }, 400);

  const contents = [];
  for (const m of messages as { role?: unknown; content?: unknown }[]) {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || m.content.length > MAX_MESSAGE_CHARS) {
      return reply({ error: "Bad message" }, 400);
    }
    contents.push({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] });
  }

  const temperature = typeof body.temperature === "number" ? Math.max(0, Math.min(1.2, body.temperature)) : 0.4;

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents,
    generationConfig: { temperature, ...(body.json === true ? { responseMimeType: "application/json" } : {}) },
  });

  let upstream: Response | null = null;
  for (const model of MODELS) {
    upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      body: payload,
    });
    if (upstream.ok || ![429, 500, 503, 404].includes(upstream.status)) break;
  }

  if (!upstream || !upstream.ok) {
    // Pass the status through (429 means the free quota is used up for now) but not the details.
    return reply({ error: `Gemini returned ${upstream?.status ?? "nothing"}` }, upstream?.status === 429 ? 429 : 502);
  }

  const data = await upstream.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text) return reply({ error: "Empty reply from the model" }, 502);
  return reply({ text });
});
