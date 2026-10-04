# LinkedIn Launch

The existing `/linkedin-export` route renders this feature inside LinkUp's shared layout. `LinkedInExport.tsx` lists only opportunities created by the current `User`. It snapshots the selected IDs when the user clicks **Generate profile kit**, maps only those opportunities with `adaptLinkUpData`, and sends the normalized payload to `POST /api/linkedin-launch/generate`. The separate **Full example** tab is an explicitly fictional fixture; it is never mixed into the current user's export.

## Actual data and privacy

LinkUp currently stores a user's name, grade, bio, interests, and skills, plus in-memory opportunities with type, field, short/full descriptions, creator, location, requested teammate skills and roles. It has no stored school, career goals, verified completed-work status, awards, experience, mentors, authentication, or database. The optional one-time goal entered on this page is not saved to LinkUp. Opportunity listings are treated as ideas; requested teammate skills and roles are not attributed to the student.

The browser's normalizer and the server's whitelist pass only name, grade when present, bio, interests, the one-time goal, listed skills, selected project facts, and optional verified experience/honors and mentors marked `shareInExport: true`. Contact details, credentials, hidden mentor records, and unrelated object keys are removed. No profile payload is logged. Once LinkUp has authentication and persisted profile data, the server must verify ownership and add rate limits before public deployment.

## AI and fallback

The Node server in `server/` calls Groq Chat Completions with strict JSON Schema output on `openai/gpt-oss-20b`. The provider writes headline, About, suggested post, and descriptions for exactly the supplied projects and experiences. The server retains factual titles, dates, links, awards, skills, and shareable mentor details from sanitized input. It rejects mismatched project IDs, unsupported skills, introduced numbers, and several unsupported claim words. These checks reduce risk but cannot prove every sentence true; students should review the kit before copying it.

If the API key is missing, the provider fails, or the model output is malformed, the browser uses `generateLinkedInProfile` on the same selected LinkUp data. Copy by section, Copy all, and Open LinkedIn remain manual. Nothing is posted to LinkedIn automatically.

## Local setup

1. Run `npm ci`.
2. Copy `.env.example` to `.env` in the LinkUp root.
3. Put a real key only in the ignored `.env`: `GROQ_API_KEY=your_key_here`. Never use `VITE_GROQ_API_KEY` or commit `.env`.
4. Optionally change `GROQ_MODEL`; its default is `openai/gpt-oss-20b`.
5. Run `npm run dev`, then open `http://127.0.0.1:5173/linkedin-export`.

Without a key, generation still works through the fallback. `npm run build` type-checks and bundles the client. For a built app, run `npm run start` after building; `npm run preview` serves only Vite's static output, so AI requests there fall back. The server and provider use Node's built-in HTTP/fetch APIs, so no new SDK package is required.

The existing feature tests are in `tests/linkedinLaunch.test.ts`; the server tests are in `tests/linkedinApi.test.mjs`. All provider tests use mocks and spend no API credits. A future authenticated app can pass a real `User` to `<LinkedInExport user={currentUser} />` and shareable Mentor Match records as `mentors` without changing Mentor Match itself.
