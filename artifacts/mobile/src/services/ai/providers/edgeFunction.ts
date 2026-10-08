import { supabase } from "@/services/supabase";
import type { AiProvider } from "../types";

// Best option: a Supabase Edge Function (supabase/functions/persona-ai) that holds the
// Gemini key as a server secret, so no key ever ships in the app.
export const edgeFunctionProvider: AiProvider = {
  name: "edge function",
  available: () => supabase !== null,
  async complete({ system, messages, json, temperature }) {
    if (!supabase) throw new Error("Backend not configured");
    const { data, error } = await supabase.functions.invoke("persona-ai", { body: { system, messages, json: !!json, temperature } });
    if (error) throw new Error(error.message);
    const text = (data as { text?: string } | null)?.text;
    if (!text) throw new Error("Empty reply");
    return text;
  },
};
