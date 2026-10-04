# LinkedIn Launch integration

`/linkedin-export` already exists in LinkUp's router and navbar. `src/pages/LinkedInExport.tsx` renders this feature inside the shared page layout.

The default tab maps LinkUp's current fictional `demoUser` and in-memory opportunities through `adaptLinkUpData`. Only opportunities created by that user are included. They are labeled as ideas because an opportunity listing does not prove completed work, employment, or ownership of its requested skills. Creating an opportunity in LinkUp updates this tab until the page is refreshed. The **Full example** tab uses only `demo.ts`, a separate fictional fixture with leadership, awards, nonprofit work, and shareable mentor learning information.

To connect a real signed-in user later, pass that `User` to `<LinkedInExport user={currentUser} />` in the route, or call `adaptLinkUpData(currentUser, userOpportunities)` and render `<LinkedInLaunch user={source} />`. The feature-local `LinkedInLaunchSource` accepts richer verified projects, experiences, honors, dates, and links when those models exist. Map them here rather than changing shared LinkUp types just for export.

Mentor Match can pass `<LinkedInExport mentors={shareableMentors} />` or `<LinkedInLaunch mentors={shareableMentors} />`. Only mentor records with `shareInExport: true` are exported. The normalizer reads only name, organization, learning focus, and summary; it never reads contact fields. Mentor data stays in the Mentorship & Learning section.

The deterministic service in `generate.ts` works offline. `normalize.ts` keeps exportable facts and removes email addresses and phone numbers from free text. `export.ts` formats plain text and uses the Clipboard API. If the clipboard is unavailable, the page shows an error and leaves the text selectable. No AI service, LinkedIn credentials, API integration, or environment variables are required. Nothing is posted to LinkedIn automatically.

Run `npm run build` for the app's TypeScript check and production build. The focused tests live in `tests/linkedinLaunch.test.ts` and can be run with a TypeScript test runner, for example `node --import tsx --test tests/linkedinLaunch.test.ts` when `tsx` is available. No test package was added to LinkUp.
