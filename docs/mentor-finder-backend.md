# LinkUp mentor finder backend

This guide covers the stateless AI Mentor Finder API added to the LinkUp application. It does not alter the existing React pages or replace the frontend README.

## Setup and test

Use Node 22.11+ or Node 24 and npm:

```sh
npm ci
cp .env.example .env.local
```

Edit `.env.local` and set `GEMINI_API_KEY` to a key from [Google AI Studio](https://aistudio.google.com/app/apikey). Keep the key out of source control and chat. `.env.local` is ignored. Set `GEMINI_MODEL` only if you need to select a different supported model; the example default is `gemini-3.8-flash`.

Run the existing frontend and backend checks independently:

```sh
npm run dev                     # existing Vite frontend
npm run dev:vercel -- --listen 3000  # local functions; separate terminal
npm run build                   # existing frontend production build
npm run typecheck:backend
npm test
npm run mentor:test-live        # makes real Gemini/Search requests
```

The mocked tests need no key and no network. The live test needs a valid key and may consume Gemini quota. The local Vercel server can run with `--local`; project environment variables are not pulled, so the API reads `.env.local` through the live-test script, while Vercel local functions use the environment loaded by your shell/linked project. Export the key in that shell when testing local functions.

For a local API smoke test, run the Vercel command in one terminal and:

```sh
curl -i http://localhost:3000/api/health
curl -i http://localhost:3000/api/find-mentors \
  -H 'Content-Type: application/json' \
  --data '{"projectTitle":"AI project","projectDescription":"I am building an image classifier and need help designing a research experiment."}'
```

## API

`GET /api/health` returns service status without exposing configuration.

`POST /api/find-mentors` accepts JSON with required `projectTitle` and `projectDescription` and optional skills, help needs, mentor type, research requirement, location, remote preference, compensation, competition context, and additional preferences. See the standalone backend schema in `src/mentor/schemas.ts` for exact validation limits and enums.

The response always includes `mentors` as an array of up to five evidence-supported potential matches. Each match contains a deterministic weighted score and breakdown, limitations, professional contact route, public source links, and verification status. A person’s willingness to mentor is never implied. A 400 response indicates invalid input; other errors use `{ "error": { "code", "message", "requestId" } }`. No student data is persisted. Gemini Interactions requests set `store: false`.

For a frontend calling a separately hosted backend, set `ALLOWED_ORIGINS` to exact comma-separated frontend origins. The default allows `http://localhost:3000`; same-origin calls do not need CORS. CORS does not provide authentication or prevent API quota abuse.

## Pipeline and constraints

The framework-independent `findMentors` engine analyzes the project, plans 5–8 searches, performs Google Search grounding through Gemini, extracts and deduplicates candidates, independently verifies candidates, evaluates component matches, calculates normalized scores in TypeScript, filters weak or location-incompatible results, and generates explanations from supplied evidence. Unknown facts stay unknown. Public emails are returned only when literally present in cited professional evidence; the backend never guesses emails. No scraping, database, or email-enrichment tool is used.

Location weights: none 0%, low 3%, medium 10%, high 18%, in-person required 25%. In-person requests require evidence-supported proximity and a supplied location. A search typically uses two grounded research calls and six structured model calls, so it can take up to the configured 60-second deadline. The Vercel function configuration allows up to 120 seconds; confirm that duration against the deployment plan. Eight serial model calls can be slower than the application deadline; increase `MENTOR_SEARCH_TIMEOUT_MS` carefully if needed, to at most 110 seconds.

Grounding, source classification, identity resolution, and evidence interpretation depend on Gemini. The implementation drops candidates without usable citation annotations, but it does not fetch source pages independently. Review source pages before outreach. Search grounding can return provider redirect URLs. Google Search grounding has display requirements; preserve source links and consult the [official grounding guide](https://ai.google.dev/gemini-api/docs/google-search) when building the result UI.

## Vercel deployment

The repository already contains a Vite frontend. Deploy this branch as the existing Vite project so its `build` command and `dist` output remain active; `vercel.json` adds only the function duration. Add `GEMINI_API_KEY` as a sensitive Vercel environment variable for the desired environments. Set `GEMINI_MODEL`, `MENTOR_SEARCH_TIMEOUT_MS`, `MIN_MENTOR_MATCH_SCORE`, and `ALLOWED_ORIGINS` as regular server configuration. Never use a public-prefixed variable for the secret. Keep Vite’s existing `npm run dev` command; backend local functions use `npm run dev:vercel`.

## Implementation references

- `api/find-mentors.ts` and `api/health.ts`: thin Vercel adapters.
- `src/mentor/index.ts`: injectable, framework-independent pipeline.
- `src/gemini/client.ts`: official `@google/genai` Interactions and Google Search grounding adapter.
- `src/mentor/schemas.ts` and `prompts.ts`: input/model-output validation and centralized safety prompts.
- `tests/`: offline mocked checks for validation, evidence, location scoring, pipeline, HTTP errors, retries and timeouts.
