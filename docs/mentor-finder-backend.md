# LinkUp mentor finder backend

This guide covers the stateless AI Mentor Finder API used by the LinkUp Mentor Match page.

## Setup and test

Use Node 22.11+ or Node 24 and npm:

```sh
npm ci
cp .env.example .env.local
```

Edit `.env.local` and set `GROQ_API_KEY` to a key from the [Groq Console](https://console.groq.com/keys). The model defaults to `openai/gpt-oss-20b`; override with `GROQ_MODEL` if needed. The selected model must support Groq browser search and structured outputs. Keep the key out of source control and chat. `.env.local` is ignored.

The `/mentor-match` page can load a project from Your Projects and calls the same-origin `/api/find-mentors` function with its title, description, skills, and location. Created projects are stored in this browser; the app has no student accounts or shared database. To use the page locally, load the key into the shell running Vercel and open `http://localhost:3000/mentor-match`:

```sh
set -a
source .env.local
set +a
npm run dev:vercel -- --listen 3000
```

Run the frontend and backend checks independently:

```sh
npm run dev                     # existing Vite frontend
npm run dev:vercel -- --listen 3000  # local functions; separate terminal
npm run build                   # existing frontend production build
npm run typecheck:backend
npm test
npm run mentor:test-live        # makes real provider/search requests
```

The mocked tests need no key and no network. The live test needs a valid Groq key and may consume API quota or credits. The local Vercel server can run with `--local`; project environment variables are not pulled, so the API reads `.env.local` through the live-test script, while Vercel local functions use the environment loaded by your shell/linked project. Export the key in that shell when testing local functions.

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

The response always includes `mentors` as an array of up to five evidence-supported potential matches. Each match contains a deterministic weighted score and breakdown, limitations, professional contact route, public source links, and verification status. A person’s willingness to mentor is never implied. A 400 response indicates invalid input; other errors use `{ "error": { "code", "message", "requestId" } }`. The API does not persist search inputs; created projects are stored locally in the browser.

For a frontend calling a separately hosted backend, set `ALLOWED_ORIGINS` to exact comma-separated frontend origins. The default allows `http://localhost:3000`; same-origin calls do not need CORS. CORS does not provide authentication or prevent API quota abuse.

## Pipeline and constraints

The framework-independent `findMentors` engine analyzes the project, plans 5–8 searches, performs web search through the selected provider, extracts and deduplicates candidates, independently searches to verify candidates, evaluates component matches, calculates normalized scores in TypeScript, filters weak or location-incompatible results, and generates explanations from supplied evidence. Unknown facts stay unknown. Public emails are returned only when literally present in cited professional evidence; the backend never guesses emails. No scraping, database, or email-enrichment tool is used.

Location weights: none 0%, low 3%, medium 10%, high 18%, in-person required 25%. In-person requests require evidence-supported proximity and a supplied location. A search typically uses two grounded research calls and six structured model calls. The default deadline is 110 seconds, and `vercel.json` allows up to 120 seconds for the function. Enable Vercel Fluid Compute for this configuration, especially on Hobby plans where functions without Fluid Compute have a shorter maximum duration. Eight serial model calls may still exceed 110 seconds when Groq is slow. A Groq 429 ends the search immediately without extra retry requests; check Groq's rate-limit headers or console to distinguish a temporary limit from exhausted daily quota.

Grounding, source classification, identity resolution, and evidence interpretation depend on Groq's model and browser search tool. The adapter resolves line citations in model output to the cited lines returned by Groq's `browser.open` tool; search result URLs alone are not treated as evidence. Candidates without usable citations are dropped. Groq cannot be guaranteed to return citations or contact details for every person. A cited professional profile can serve as the contact route when no public email is verified; candidates without a verified profile or contact page are excluded. It does not fetch source pages independently. Review source pages before outreach and preserve source links in the result UI.

## Vercel deployment

The repository already contains a Vite frontend. Deploy this branch as the existing Vite project so its `build` command and `dist` output remain active; `vercel.json` adds only the function duration. Add `GROQ_API_KEY` as a sensitive Vercel environment variable for the desired environments. Set `GROQ_MODEL`, `MENTOR_SEARCH_TIMEOUT_MS`, `MIN_MENTOR_MATCH_SCORE`, and `ALLOWED_ORIGINS` as regular server configuration. Never use a public-prefixed variable for a secret. Keep Vite’s existing `npm run dev` command; backend local functions use `npm run dev:vercel`.

## Implementation references

- `api/find-mentors.ts` and `api/health.ts`: thin Vercel adapters.
- `src/mentor/index.ts`: injectable, framework-independent pipeline.
- `src/groq/client.ts` and `grounding.ts`: Groq Responses API and inline citation adapter.
- `src/mentor/schemas.ts` and `prompts.ts`: input/model-output validation and centralized safety prompts.
- `tests/`: offline mocked checks for validation, evidence, location scoring, pipeline, HTTP errors, retries and timeouts.
