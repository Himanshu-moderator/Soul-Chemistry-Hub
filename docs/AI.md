# How PersonaAI works, and what you set up

Pdb has two ways to find your type and one AI chat. Both AI features use the same
small service layer, so they behave the same everywhere.

## The two ways to find your type (onboarding)

| | Classic questionnaire | PersonaAI chat |
|---|---|---|
| Code | `src/lib/mbti` + `features/onboarding/steps/QuizStep.tsx` | `src/lib/persona` + `src/services/ai` + `features/onboarding/steps/AiChatStep.tsx` |
| Needs internet / AI | No | Yes |
| How it works | 32 statements (up to 40) you agree or disagree with on a 5-point scale. Each axis is scored from -2 to +2 per statement. An axis that lands too close to call gets 2 extra statements. | A real conversation with a language model. It asks a few open questions, reads your answers and names your type only when it is confident. |

### The classic questionnaire

- 4 axes (E/I, S/N, T/F, J/P) with 10 statements each, 5 per pole. 8 per axis are always
  asked, the other 2 only if that axis is within 10 points of 50%.
- Result screen shows how strongly you lean on each side (slight, moderate, clear, very clear).
- Ties follow the usual MBTI rule (I, N, F, P).
- It is an original questionnaire on the same Jungian scales as the MBTI, similar to the
  open OEJTS. It is **not** the official, copyrighted MBTI instrument; the app says so.

### The PersonaAI interview

`src/lib/persona/typerPrompt.ts` holds the instructions given to the model. The rules that
make it accurate:

1. One open, story-based question at a time. No multiple choice, no "are you an introvert?".
2. Each question is chosen to reveal several axes at once and targets the weakest one.
3. The model returns JSON with a lean and a confidence (0 to 100) for each axis.
4. **The app, not the model, decides when to stop** (`typerProtocol.ts`): never before 4
   answers, never after 7, and otherwise only when every axis is at 75 or more. If the model
   says it is done too early it is sent back for another question.
5. The final type is computed in code from the four leans; the result screen shows the
   evidence the model gave for each axis.

The Profile > Insights chat uses the same service with a plain-text prompt
(`insightsPrompt.ts`).

## Where the model is reached (`src/services/ai`)

Tried in this order; the first that is set up and answers wins:

1. **Supabase Edge Function** `persona-ai` (best). Your Gemini key stays on the server.
2. **Direct Gemini key** (`EXPO_PUBLIC_GEMINI_API_KEY`). Simple, but the key is visible in a
   web build, so restrict it to your site (below) and keep billing off.
3. **Free keyless endpoints**. No setup, but free community services rate-limit and come and
   go, so treat this as a safety net only.

If all fail, the chat shows "try again" and offers the classic questionnaire.

## Your part (all free)

### 1. Get a free Gemini API key (2 minutes)

1. Open <https://aistudio.google.com/apikey> and sign in with a Google account.
2. Click **Create API key**. Copy it. The free tier needs no card and no billing.

### 2a. Recommended: put it on a Supabase Edge Function

You need a Supabase project anyway for the real backend (see the README).

```bash
npm i -g supabase                      # or use npx supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set GEMINI_API_KEY=PASTE_YOUR_KEY_HERE
supabase functions deploy persona-ai
```

Nothing else: the app calls the function through the Supabase URL and anon key it already
uses (`artifacts/mobile/.env`).

### 2b. Or: put the key straight in the app (quick, less safe)

1. In Google Cloud Console > APIs & Services > Credentials, open the key and set
   **Application restrictions: Websites** to `https://himanshu-moderator.github.io/*`
   (and `http://localhost:*` while developing). Under **API restrictions** allow only the
   Generative Language API.
2. Add to `artifacts/mobile/.env`:

```
EXPO_PUBLIC_GEMINI_API_KEY=your-key
# EXPO_PUBLIC_GEMINI_MODEL=gemini-flash-latest   (optional)
```

3. Rebuild the web app. The key ends up in the public JavaScript; the referrer restriction
   and the free-tier quota are what protect it.

## Changing how it behaves

- Tone, questions, what counts as evidence: `src/lib/persona/typerPrompt.ts`
- When it is allowed to finish (thresholds): `src/lib/persona/typerProtocol.ts`
- The questionnaire items: `src/lib/mbti/questions.ts`
- Which models/providers are used: `src/services/ai/`
