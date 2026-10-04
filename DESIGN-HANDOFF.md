# LinkUp visual redesign

## Shared files changed

- `package.json`, `package-lock.json`: added `framer-motion`, the only new application dependency.
- `src/styles.css`: warm neutral/green palette, typography, reusable surfaces, buttons, cards, form sections, desktop/tablet/phone layouts, focus styles, and reduced-motion overrides. Existing Tailwind utilities remain available. Uses system sans-serif fonts, with no external font requests.
- `src/components/Button.tsx`: uses a Framer Motion button for a small press response. Accepts motion-compatible button properties. Existing `variant`, `className`, event handlers, and labels continue working.
- `src/components/Tag.tsx`: uses the shared `tag` visual style.
- `src/components/Navbar.tsx`: same route destinations, desktop links, collapsible mobile navigation below 1200px, Escape handling, and menu close on navigation/desktop resize.
- `src/components/Layout.tsx`: shared page/footer styling, short page entrance fade, route titles, scroll reset, and focus moved to the main content after navigation.
- `src/components/PageContainer.tsx`: shared heading hierarchy and spacing. Props unchanged.
- `src/components/OpportunityCard.tsx`: type symbol, field, skills, creator, location, hover lift, save feedback. Opportunity prop and saved-state behavior unchanged.
- `src/components/Motion.tsx` (new): small `Reveal` wrapper for once-only section entrance animation.
- `scripts/smoke-test.mjs`: desktop, tablet, phone, filter combinations, creation/questions, saved state, profile projects, demo Apply notice, keyboard menu, reduced motion, overflow, and automated accessibility checks.
- `README.md`: updated testing instructions and linked this handoff.

## Page changes

- `Landing.tsx`: editorial hero with three fictional opportunity mini-cards and three concise story sections.
- `Discover.tsx`: search plus type buttons, field/skill dropdowns, result count, clear filters. All conditions combine with AND, so a result must match every selected filter.
- `Create.tsx`: five form sections, optional add/remove questions (up to five), required-field validation, deduplicated comma-separated skills/roles. Still writes only to the existing in-memory demo state.
- `ProjectDetails.tsx`: main information area and a stacked-on-mobile side card. Apply only shows a clear demo notice; it does not submit or store applications.
- `Profile.tsx`: student profile cover, skills/interests, and opportunities owned by the demo student.
- `MentorMatch.tsx`, `LinkedInExport.tsx`: visual placeholder styling and copy only. No feature logic added.
- Saved and Your Projects inherit the redesigned shared components without changes to their page files.

`src/App.tsx`, `src/main.tsx`, `src/types/index.ts`, `src/data/demo.ts`, and `src/context/DemoContext.tsx` remain unchanged. No routes or shared data fields were renamed. No backend, authentication, real applications, or external account connections were added.

## How motion works

Framer Motion changes ordinary visual properties. Reveal fades opacity from 0 to 1 and moves content upward 18px in 0.45 seconds. Hero cards enter once with a small rotation and staggered delays. Desktop/tablet hero cards move up at most 65px as the hero scrolls away. Phone cards stay in the normal page layout without scroll movement. Hover raises opportunity cards 5px; pressing a button scales it to 97%. The mobile menu opens/closes over 0.18 seconds. Page changes fade in over 0.2 seconds.

`useReducedMotion()` checks the person's device/browser preference. It disables reveals, movement, rotation, hover lifts, and press scaling when reduced motion is requested. CSS transitions are also disabled in that mode. There are no continuous animation loops, animated blur effects, downloaded images, video backgrounds, or 3D libraries.

## Teammates

Mentor Match still owns `/mentor-match` and the named `MentorMatch` export. LinkedIn Export still owns `/linkedin-export` and the named `LinkedInExport` export. Keep those names when replacing the placeholders. Shared types and demo state access remain the same. The shared layout already supplies navigation, footer, and a page fade. Reuse `PageContainer`, `Button`, and `Tag`; coordinate global style changes.

Before adopting this commit, commit your own work, fetch `origin`, and merge `origin/frontend-ui` into your feature branch. Resolve any overlapping edits deliberately. Use separate working folders for parallel developers.

## Test tooling

Playwright drives installed Chrome. Axe checks common accessibility issues such as text contrast and missing labels; automated checks are not a guarantee of complete accessibility. Both are temporary developer tools, not application dependencies. Screenshots are saved in the ignored `test-results` folder. The production build runs TypeScript checks before bundling the app.

Verified in Chrome at 1440px, 768px, and 390px: all nine pages, combined search/filters, save/unsave, required form fields, question add/remove, creation appearing in Discover/Your Projects/Profile, refresh reset, missing pages, demo Apply notice, keyboard menu and Escape, reduced motion, visible keyboard focus, and no horizontal overflow. Axe reported no violations for the checked WCAG A/AA rules on all main pages and landing sections. Screenshots were visually reviewed. Browser console/runtime checks and the production build passed. A contrast issue on form section numbers was found and fixed. Prettier was run temporarily to format changed code for readability; it is not an application dependency.
