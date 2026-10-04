# LinkUp frontend foundation

A React + TypeScript frontend for students to discover opportunities and build together. All five sample opportunities and both sample people are fictional.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://127.0.0.1:5173).

```sh
npm run build
npm run preview
```

`build` checks TypeScript and creates the production files in `dist`. `preview` serves that build locally. Use Node.js 22.12+ or Node.js 24. Hosting must send unknown page URLs to `index.html` so directly opening a page works with browser routing.

## Team ownership

- `frontend-ui`: shared frontend foundation.
- `mentor-match`: replace `src/pages/MentorMatch.tsx`; keep its named `MentorMatch` export.
- `linkedin-export`: replace `src/pages/LinkedInExport.tsx`; keep its named `LinkedInExport` export.
- `main`: eventual combined site.

The shared repository is https://github.com/vishuparam/LinkUp.git, named `origin` locally. The foundation lives on `frontend-ui`; `main` is reserved for a later team merge. Start feature branches from this foundation. Use separate local clones or Git worktrees if agents run simultaneously: switching branches in the same working folder changes files for everyone.

For teammates starting fresh, clone the foundation into a separate folder:

```sh
git clone --branch frontend-ui https://github.com/vishuparam/LinkUp.git
cd LinkUp
git switch -c mentor-match
npm ci
npm run dev
```

The LinkedIn Export teammate should use `git switch -c linkedin-export` instead. If your feature branch already exists remotely, fetch and switch to that existing branch instead of creating a replacement. Commit and push your own feature branch when ready; coordinate before merging into `main`.

Keep feature-specific components inside their own feature folders. Coordinate edits to `src/App.tsx`, `src/main.tsx`, `src/styles.css`, `src/components`, `src/types`, and package/configuration files. The existing placeholder routes are already wired, so replacing either page needs no routing changes. Do not implement a second navbar or page shell inside feature pages.

## Routes

| URL | Page file in `src/pages` |
| --- | --- |
| `/` | `Landing.tsx` |
| `/discover` | `Discover.tsx` |
| `/saved` | `Saved.tsx` |
| `/create` | `Create.tsx` |
| `/your-projects` | `YourProjects.tsx` |
| `/profile` | `Profile.tsx` |
| `/projects/:id` | `ProjectDetails.tsx` |
| `/mentor-match` | `MentorMatch.tsx` |
| `/linkedin-export` | `LinkedInExport.tsx` |
| Any other URL | `NotFound.tsx` |

## Where things live

- `src/types/index.ts`: shared `User`, `OpportunityType`, and `Opportunity` definitions. Import with `import type { Opportunity, User } from '../types'` from a page. `creator` is a full `User`; grade is a number; application questions are optional strings.
- `src/data/demo.ts`: five fictional opportunities and the demo student.
- `src/context/DemoContext.tsx`: shares in-memory opportunities and saved IDs across pages. `useDemo()` returns `opportunities`, `savedIds`, `toggleSaved`, and `addOpportunity`.
- `src/components`: small reusable building blocks. `Layout` supplies navigation, footer, and the page area; `PageContainer` supplies a page heading and description.
- `src/App.tsx`: matches each URL to a page.
- `src/main.tsx`: starts React and connects routing and shared demo state.
- `src/styles.css`: Tailwind import and common form/button styling.

The demo supports searching, filtering by opportunity type/field/skill, saving/unsaving, and creating an opportunity with optional questions. Created opportunities are saved in this browser; saves and other demo state reset on refresh. Profile is a read-only fictional example. Applying only shows a demo notice. Mentor Match uses the separate Vercel API described below and can fill its form from an idea in Your Projects. Real account creation, authentication, databases, and LinkedIn export are outside this step. Framer Motion provides lightweight interface animation.

## Packages

- `react` and `react-dom`: build and display the interface.
- `react-router-dom`: maps browser URLs to pages without a full reload.
- `typescript`: checks data shapes and code before building.
- `@types/react` and `@types/react-dom`: help TypeScript understand React.
- `vite`: local development server and production builder.
- `@vitejs/plugin-react`: connects React to Vite.
- `tailwindcss` and `@tailwindcss/vite`: reusable styling classes and Vite integration.

`package-lock.json` records exact installed versions so teammates get consistent dependencies. `.gitignore` excludes installed packages, generated builds, and local environment files.

## Browser verification

`scripts/smoke-test.mjs` clicks through all nine pages in installed Chrome at desktop (1440px), tablet (768px), and phone (390px) widths. It checks combined filters, save/unsave, demo creation and questions, profile projects, demo Apply feedback, keyboard navigation, reduced motion, page reloads, missing pages, horizontal overflow, common accessibility issues, and browser errors. It saves screenshots to ignored `test-results/`.

To repeat these checks with the dev server running:

```sh
npm install --no-save --package-lock=false playwright @axe-core/playwright
node scripts/smoke-test.mjs
```

Playwright controls a browser for testing and Axe checks common accessibility issues. Both are optional and are not included in the application or permanent dependencies. `public/favicon.svg` supplies the small browser-tab icon.

## Visual design

Framer Motion supplies short section reveals, card hover/press feedback, hero scroll movement, and mobile menu transitions. Animations honor reduced-motion preferences. Read [DESIGN-HANDOFF.md](DESIGN-HANDOFF.md) for the exact shared-file changes, animation explanations, and teammate integration notes.

## AI Mentor Finder backend

A stateless Vercel API for evidence-based potential mentor discovery powers the `/mentor-match` form through Groq and its browser search tool. Setup, API request format, local testing, deployment configuration, and security limits are documented in [docs/mentor-finder-backend.md](docs/mentor-finder-backend.md). For local matching, put `GROQ_API_KEY` in ignored `.env.local`, export it in the terminal running `npm run dev:vercel -- --listen 3000`, and open `http://localhost:3000/mentor-match`. The Vite-only `npm run dev` server does not serve `/api/find-mentors`.
