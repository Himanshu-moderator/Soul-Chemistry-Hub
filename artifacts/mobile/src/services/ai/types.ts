// Shared shapes for talking to a language model. Everything in services/ai speaks
// these, so the rest of the app never needs to know which provider answered.

export type Role = "user" | "assistant";

export interface AiMessage {
  role: Role;
  content: string;
}

export interface AiRequest {
  // The instructions that define who the AI is and what it must do.
  system: string;
  messages: AiMessage[];
  // Ask for a JSON object back (the typing interview does; free chat does not).
  json?: boolean;
  temperature?: number;
  signal?: AbortSignal;
}

// One way of reaching a model. `available` says whether it is configured in this build.
export interface AiProvider {
  name: string;
  available: () => boolean;
  complete: (request: AiRequest) => Promise<string>;
}

// Every provider failed or none is configured.
export class AiUnavailableError extends Error {
  constructor(public readonly causes: string[]) {
    super("The AI could not be reached.");
    this.name = "AiUnavailableError";
  }
}
