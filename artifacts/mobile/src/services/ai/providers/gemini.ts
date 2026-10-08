import type { AiProvider } from "../types";

// Second option: call Google Gemini straight from the app with a free API key.
// A key in a web app is visible to anyone, so only use one that is restricted to your
// site's address in Google AI Studio / Cloud Console (HTTP referrer restriction) and
// has no billing attached; see docs/AI.md.
const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-flash-latest";

export const geminiProvider: AiProvider = {
  name: "gemini",
  available: () => Boolean(key),
  async complete({ system, messages, json, temperature, signal }) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature: temperature ?? 0.4, ...(json ? { responseMimeType: "application/json" } : {}) },
      }),
    });
    if (!response.ok) throw new Error(`Gemini ${response.status}`);
    const body = await response.json();
    const text = body?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("");
    if (!text) throw new Error("Empty reply");
    return text;
  },
};
