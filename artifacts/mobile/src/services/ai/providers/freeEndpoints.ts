import type { AiProvider, AiRequest } from "../types";

// Last resort, needs no key and no setup: free community endpoints that speak the
// OpenAI chat format. They are best-effort (free services come and go, and a busy one
// can be slow), which is why the edge function and the Gemini key come first.
interface Endpoint {
  name: string;
  url: string;
  model: string;
}

const ENDPOINTS: Endpoint[] = [
  { name: "llm7", url: "https://api.llm7.io/v1/chat/completions", model: "DeepSeek-V4-Flash-0731" },
  { name: "pollinations", url: "https://text.pollinations.ai/openai", model: "openai" },
];

// (No JSON mode here: some of these services fail when asked for it, so the prompt asks
// for JSON and the caller parses it.)
async function ask(endpoint: Endpoint, { system, messages, temperature, signal }: AiRequest): Promise<string> {
  const response = await fetch(endpoint.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      model: endpoint.model,
      temperature: temperature ?? 0.4,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!response.ok) throw new Error(`${endpoint.name} ${response.status}`);
  const body = await response.json();
  const text = body?.choices?.[0]?.message?.content;
  if (!text || typeof text !== "string") throw new Error(`${endpoint.name} empty reply`);
  return text;
}

export const freeEndpointsProvider: AiProvider = {
  name: "free endpoints",
  available: () => true,
  async complete(request) {
    const errors: string[] = [];
    for (const endpoint of ENDPOINTS) {
      try {
        return await ask(endpoint, request);
      } catch (e) {
        errors.push(e instanceof Error ? e.message : String(e));
      }
    }
    throw new Error(errors.join("; "));
  },
};
