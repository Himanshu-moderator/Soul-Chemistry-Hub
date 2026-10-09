// PersonaAI edge function: a thin, safe proxy to Google Gemini.
//
// The app sends { system, messages, json, temperature }; this function adds the
// Gemini API key and returns { text }. The key never reaches the app. It comes from the
// GEMINI_API_KEY function secret if one is set, otherwise from Supabase Vault (a secret
// named GEMINI_API_KEY, read through the service-role-only function public.get_gemini_key).
// See docs/AI.md.

import { createClient } from "jsr:@supabase/supabase-js@2";

let cachedKey: string | null = Deno.env.get("GEMINI_API_KEY") ?? null;

async function geminiKey(): Promise<string | null> {
  if (cachedKey) return cachedKey;
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await admin.rpc("get_gemini_key");
  cachedKey = typeof data === "string" && data ? data : null;
  return cachedKey;
}

// Tried in order: when one is busy (503) or over quota (429) the next is used. The lite model
// comes first because its free daily quota is far bigger (about 500 requests a day against 20
// for the full model, as of Oct 2026), and one interview takes about 6 requests.
const MODELS = (Deno.env.get("GEMINI_MODELS") ?? "gemini-flash-lite-latest,gemini-flash-latest").split(",").map((m) => m.trim());

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
  const apiKey = await geminiKey();
  if (!apiKey) return reply({ error: "The Gemini key is not set on the server" }, 500);

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
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
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
