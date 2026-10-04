# LinkedIn Launch — local demo flow

The `/linkedin-export` page now renders `LocalLinkedInLaunch.tsx`. It uses only `templates.ts`; there is no generation request, AI provider, scraping, key, or server dependency.

## Where to edit
- `templates.ts`: 10 interest categories, their headlines/About/first-post templates, 30 project ideas (exactly three per interest), project descriptions and skill choices. `buildLocalProfileKit` inserts selected project/field/skills into predefined text and returns the existing `LinkedInProfileKit` shape.
- `LocalLinkedInLaunch.tsx`: interest select → skill chips → one project → Generate → 2.1-second local loading transition → five-section kit. Changing selections clears the previous draft. Copy buttons reuse the existing `copyText` and `sectionText` helpers. Copy All contains only Headline, About, Featured Project, Skills and Suggested First Post. Feedback lasts 1.8 seconds, and clipboard failure offers manual copying.
- `localLaunch.css`: isolated compact styling, responsive project cards, visible keyboard focus and reduced motion. Reduced motion stops the pulsing dots and entrance movement; the short loading messages still display.
- `src/pages/LinkedInExport.tsx`: thin route wrapper using the existing page layout; URL and navigation are unchanged.

Suggestions are project ideas, not the student's completed work. Generated text uses planning/exploring language and never invents employment, awards, companies, impact or mentorship. Skills reflect only selected supported options; recommended project skills remain editable template metadata and are not automatically claimed.

## Preserved older work
The older `LinkedInLaunch`, adapter, generic generator, API client, source types and server/API files are retained for compatibility and their existing tests. They are not imported by the current page's generation flow. Mentor Match and shared infrastructure were not changed. The new flow does not export actual LinkUp project history or mentor data; it is deliberately a guided project-idea/template demo.

## Checks
`npm run build`, `npm test`, `npm run typecheck:backend`, and `node scripts/test-local-linkedin.mjs`.
The browser script blocks APIs and tests Engineering → Chemistry regeneration, project changes, skills, all ten suggestion sets, the three loading messages, all five copy controls, Copy All, clipboard failure, mobile overflow, accessibility and reduced motion. Screenshots go into ignored `test-results/`.

No new packages are required. Existing API tests use mocks; no live provider calls or API credits are needed.
