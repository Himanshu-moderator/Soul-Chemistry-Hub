import type { AiProvider } from "../types";

// Second option: call Google Gemini straight from the app with a free API key.
// A key in a web app is visible to anyone, so only use one that is restricted to your
// site's address in Google AI Studio / Cloud Console (HTTP referrer restriction) and
// has no billing attached; see docs/AI.md.
const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Tried in order: when one is busy (503) or over quota (429) the next is used.
const models = (process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-flash-latest,gemini-flash-lite-latest,gemini-2.0-flash").split(",").map((m: string) => m.trim());

export const geminiProvider: AiProvider = {
  name: "gemini",
  available: () => Boolean(key),
  async complete({ system, messages, json, temperature, signal }) {
    const body = JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: temperature ?? 0.4, ...(json ? { responseMimeType: "application/json" } : {}) },
    });
    let response: Response | null = null;
    for (const model of models) {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: "POST", headers: { "Content-Type": "application/json" }, signal, body });
      if (response.ok || ![429, 500, 503, 404].includes(response.status)) break;
    }
    if (!response || !response.ok) throw new Error(`Gemini ${response?.status ?? "no reply"}`);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    if (!text) throw new Error("Empty reply");
    return text;
  },
};
