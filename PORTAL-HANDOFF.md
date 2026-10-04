# LinkUp portal landing handoff

The old Three.js dot network has been replaced by the supplied Higgsfield portal and the Figma Hero, Mid-Transition, and Product Reveal direction.

## How it works
- `src/components/landing/LandingExperience.tsx`: real headline text, one silent MP4, matching loading poster, spring-smoothed mouse tilt capped at six degrees, and a reversible GSAP scroll timeline. The video does not loop. Scroll seeks its finite eight-second camera move after media metadata loads. Seeks are limited to browser animation frames and wait for pending seeks. Hidden tabs do not seek.
- `src/components/landing/LandingSections.tsx`: light product reveal using the existing fictional Sprout Map listing and unchanged routes. Mentor Match and LinkedIn Export remain labeled coming soon.
- `src/components/landing/landing.css`: styles scoped to the landing page. Space Grotesk and Inter are stored locally, with their licenses.
- `public/assets/linkup-hero/`: supplied MP4, poster, portal PNG, full hero design reference, and fonts. The full hero PNG is NOT rendered as a webpage; all text and actions remain real HTML. The reference PNGs are not loaded by the landing page.

Desktop: scrolling holds the hero in place, expands the portal frame, reveals the second message, and dissolves the dark background into the light product section. The portrait video remains portrait inside the wider green backdrop. Native scrolling is preserved. Pointer movement controls only a small tilt.

At widths up to 900px, reduced-motion preferences, or video loading failure, the matching poster replaces the clip. Mobile content stacks and has no pinned sequence. No WebGL support is required.

## Collaboration
Only landing components/styles, browser-check scripts, this handoff, and package files changed. `three`, `@react-three/fiber`, and `@types/three` were removed because they served only the deleted network scene. GSAP and Framer Motion are reused; no new runtime packages were installed. Shared types, routes, navbar logic, all application pages, teammate API/backend code, and Vercel configuration remain unchanged.

## Checks
Run `npm run dev`, then `node scripts/test-portal.mjs` and `node scripts/smoke-test.mjs`. These use temporary Playwright and axe packages installed with `npm install --no-save --package-lock=false playwright @axe-core/playwright`. Portal checks cover real forward/reverse video seeking, pointer tilt, screenshots, tablet/mobile, reduced motion, and intentionally blocked media. Smoke checks cover every route, search/combined filters, save/unsave, form questions, creation, keyboard menu, horizontal overflow, and accessibility. Run `npm run build` for the production build.
