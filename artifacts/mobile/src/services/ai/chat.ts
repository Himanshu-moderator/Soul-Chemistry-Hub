import { edgeFunctionProvider } from "./providers/edgeFunction";
import { freeEndpointsProvider } from "./providers/freeEndpoints";
import { geminiProvider } from "./providers/gemini";
import { AiUnavailableError, type AiProvider, type AiRequest } from "./types";

// Providers in order of preference. The first one that is configured and answers wins.
const PROVIDERS: AiProvider[] = [edgeFunctionProvider, geminiProvider, freeEndpointsProvider];

const TIMEOUT_MS = 30_000;

// Send a conversation to the best available model and return its reply text.
// Throws AiUnavailableError (with the reasons) if every provider fails.
export async function chat(request: AiRequest): Promise<string> {
  const causes: string[] = [];
  for (const provider of PROVIDERS.filter((p) => p.available())) {
    const timer = new AbortController();
    const stop = setTimeout(() => timer.abort(), TIMEOUT_MS);
    try {
      return await provider.complete({ ...request, signal: request.signal ?? timer.signal });
    } catch (e) {
      causes.push(`${provider.name}: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      clearTimeout(stop);
    }
  }
  throw new AiUnavailableError(causes);
}
