# Local Mentor Match — team handoff

## What it does
Mentor Match now defaults to a curated local directory. It needs no API key, paid inference, server, or live web search to rank people. The original `/api/find-mentors` backend remains in place. No LinkedIn Export implementation was changed.

## Directory and evidence
- `src/data/mentorDirectory.ts`: 98 real professionals, with published roles, expertise, professional locations, profile links and sources.
- `docs/mentor-source-audit.json`: every checked official URL, retrieval status and snapshot date (October 4, 2026).
- Sources: MIT EECS, MIT Civil and Environmental Engineering, MIT Sloan, University of Illinois Mechanical Science and Engineering, Stanford Profiles, NVIDIA and AMD official profiles.
- 31 matching categories: AI, computer science, software, cybersecurity, data science, robotics, electrical/mechanical/biomedical/civil engineering, healthcare, medicine, biology, chemistry, physics, environment, climate/sustainability, agriculture, business, entrepreneurship, finance, economics, education, design, UX, product development, research, social impact, public health, mathematics and materials science.
- Tags and suggested project types are editorial matching labels based on published expertise. They do not assert that these people offer mentorship or have worked on a particular student project.
- 69 professional emails were copied only where explicitly published as that person's contact on their official profile. Stanford/Sloan contacts use the official contact/profile page instead, avoiding assistant/admin emails. No inferred email patterns or private contact information.
- Remote availability is unknown and deliberately omitted. City/state refers to an institutional workplace, not a home address. Corporate locations are omitted where not verified.
- Satya Nadella and Scott Guthrie were excluded: their attempted official profile requests returned HTTP 403. We did not invent data to reach 100.
- Verification is a dated source snapshot, not continuous monitoring or confirmation that someone will respond. The directory favors US university researchers; it is not a comprehensive worldwide mentor list.

## Matching rules
`src/services/localMentorMatcher.ts` evaluates every record, deterministically, then returns up to three relevant matches. It uses whole-word/phrase topic synonyms (so “AI” does not match “chair”), project title/description/field/tags, needed and current skills, suggested project type, requested help, notes, mentor type and location.

Normal weighting: topic 30, help 25, skills 20, research 10, mentor type 10, location 5. When the project field is recognized and represented, candidates must overlap that field. The topic component gives the main field 65% and other project topics 35%, so incidental design/coding tags cannot overwhelm an environmental project. Each part contributes 0–1 times its weight; the sum is rounded to 0–100. Needed skills take 80% of the skills component; current skills take 20%. Research overlap uses published research phrases. Optional notes adjust the help component using topic overlap. Mentor type is a preference, not a hard exclusion; technical/scientific preferences also consider relevant expertise, not just job titles.

Location:
- Remote/no preference: identical location points for everyone, so geography cannot change their ordering. This does not assert remote availability.
- Prefer nearby: up to 5 points, same city 100%, same state 35%, elsewhere 0%.
- Very important: location gets 15 points; topic/help/skills/research/type weights become 25/23/18/9/10.
- In-person required: both city and state must be entered; records outside the matching workplace city/state are excluded. Champaign/Urbana is treated as one local area. This is text matching, not a travel-distance calculation.
- Unsupported topics or strict location constraints can yield fewer than three or no matches. The UI explains how to broaden the search; it never pads results with arbitrary people.

Tie order: score, topic overlap, skill overlap, research overlap, then stable record ID. Explanations mention only metadata stored in the record. Scores describe relevance, not an AI confidence score or likelihood of mentoring.

## Service and UI
- `src/types/mentor.ts`: mentor, category, preference, search input/result and source definitions. Existing User/Opportunity definitions are unchanged.
- `src/services/mentorService.ts`: `findMentors(project, preferences)` defaults to local. Explicit `{ mode: 'live' }` retains the API path and normalizes responses. Non-success HTTP responses (including 429/402), network/timeout failures, malformed/empty results fall back locally. Live mode is opt-in; the current page never requests it.
- `src/pages/MentorMatch.tsx`: project selection → help areas → location → mentor type + optional notes → matching → potential mentors. It preserves `?projectId=` links and browser-created opportunities.
- `src/features/mentorMatch/MentorResults.tsx`: seven stages over 4.9 seconds; ranking completes before the visual sequence. This is a presentation of local matching, not a live web search. Results enter 100ms apart and scores count up over 450ms.
- `src/features/mentorMatch/mentorMatch.css`: isolated page styling, keyboard focus and responsive columns. Reduced motion disables motion and shortens stage presentation to 0.8 seconds.

## Shared changes
- `src/App.tsx`: only Mentor Match is loaded on demand, keeping its dataset out of the initial application download. Route names stay the same.
- `src/components/Layout.tsx`: footer now distinguishes fictional student demo data from real professional mentor records.
- No global style file, shared opportunity/user type, API/backend implementation, package file, lockfile, or LinkedIn page was edited for this task. Six pre-existing backend/server modifications were preserved.

## Checks and commands
- `npm run build`: TypeScript check plus production bundle.
- `npm run typecheck:backend`: strict existing backend TypeScript check.
- `npm test`: existing tests plus `tests/localMentorMatcher.test.ts`; 112 tests.
- `node scripts/test-local-mentors.mjs`: Chrome end-to-end tests at 1440/768/390 pixels, seven stages, validation, five different subject areas, city/state filtering, deep links, scores/reasons/links, reduced motion, accessibility and existing routes; asserts zero mentor API requests.
- Browser screenshots are in ignored `test-results/mentor-*.png`.
- Source research used Python with Beautiful Soup installed only under ignored `test-results/research-tools`, not as an application dependency. Existing temporary Playwright/axe tools run browser checks; no new runtime packages.

The only layout issue found was the global full-width input rule affecting radios. A narrowly scoped mentor CSS rule fixes that without changing other forms. TypeScript's stricter optional-value checks were fixed in the new matching/service code. No live paid-provider call or real email was sent.
