# LinkUp: a network coming to life

The ordinary app is React. The landing page has one isolated Three.js scene for its cinematic entry. All graphics code lives in `src/components/landing`. The functional app pages and shared data definitions were not redesigned or renamed.

## New libraries

- `three`: draws 3D geometry with the browser's graphics system.
- `@react-three/fiber`: connects that renderer to React and manages its canvas lifecycle.
- `gsap`: coordinates a single scroll timeline. Its included `ScrollTrigger` plugin pins the scene and scrubs the timeline forward/backward with native scrolling.
- `@types/three`: development-only definitions so TypeScript can check Three.js code.

Framer Motion remains responsible for masked text entrance, section reveals, hover panels, and pointer tilt on project-wall cards. Drei, postprocessing, Bloom, and Lenis were not installed. Soft glow is drawn by a small point shader; scrolling stays native.

## Important files

- `LandingExperience.tsx`: loads the scene, reads device preferences, tracks pointer input, creates/cleans up the GSAP timeline, and overlays the hero, role labels, and real opportunity links.
- `NetworkScene.tsx`: the only file importing Three.js and React Three Fiber. Contains a reusable point buffer, a line buffer, a tiny glow shader, camera movement, context-loss/error handling, and offscreen/hidden-tab rendering controls.
- `networkModel.ts`: deterministic positions and nearest-neighbor edges, shared with the fallback.
- `NetworkFallback.tsx`: static SVG constellation, displayed if WebGL is unavailable or reduced motion is enabled. SVG is a scalable drawing made from lines and shapes.
- `LandingSections.tsx`: bright discover/connect/build panels, asymmetric fictional project wall, SVG skill connections, and final CTA. Existing opportunity IDs and detail URLs are reused.
- `landing.css`: scoped landing styles; it does not change the calm application design.
- `scripts/test-network.mjs`: Chrome checks for actual WebGL nodes, pointer rotation, increasing edges, reversible pinned scroll, screenshots, offscreen pause, mobile layout, reduced motion, and a forced no-WebGL fallback.

## Shared files changed

- `src/pages/Landing.tsx`: now composes the two dedicated landing components.
- `src/App.tsx`: the landing route loads on demand, so direct app-page visits don't load GSAP or the 3D scene. URLs are unchanged.
- `src/components/Layout.tsx`: adds `cinematic-shell` only on `/`, allowing a dark landing header/footer without changing their logic.
- `package.json` / `package-lock.json`: added the graphics packages while retaining all teammate backend dependencies/scripts.
- `scripts/smoke-test.mjs`: updated landing selectors and reduced-motion checks, with the existing application regression tests retained.
- `README.md`: links this handoff and the extra graphics test command.

The Vercel setup was committed separately during the requested pause. `vercel.json` contains the requested SPA rewrite and preserves the teammate's existing function-duration setting. New teammate work on `frontend-ui` was fetched and merged rather than overwritten. An inherited lockfile inconsistency was repaired so installation/build could continue. A backup stash of the original in-progress scene was retained during integration.

## The scroll story

On desktop/tablet above 767px, the scene stays pinned for 2.6 viewport heights of scrolling. A normalized progress value moves from 0 to 1. Node positions first contract, nearby connections increase, the camera moves closer, and the network opens outward. HTML role labels appear over the scene. At the final stage, ordinary React opportunity cards move into view and the canvas dims. No 3D HTML cards are needed. Scrolling backward reverses this story.

The hero heading rises from behind clipping containers. This is a mask reveal: text exists normally, but part of it is hidden until it moves into view.

## Performance and accessibility

- 84 deterministic desktop nodes, 40 on phones; no random regeneration on React renders.
- Each node connects to its three nearest neighbors, with duplicate edges removed, computed once per node-count change.
- Points and lines use reusable typed arrays and geometries. Per-frame changes do not trigger React renders.
- Maximum device pixel ratio 1.5 desktop, 1 mobile. No shadows, textures, 3D models, or full-screen postprocessing passes.
- The entire landing and then its graphics renderer are separately lazy-loaded.
- Rendering pauses when the scene leaves the viewport or the tab is hidden. Graphics resources are disposed on cleanup.
- Tiny canvas data attributes expose node/edge/rotation/frame values for browser tests, updated at most four times per second; they are not shown to users.
- Mobile has no pinned sequence or pointer-camera interaction; its content flows normally with single-column cards.
- Reduced motion uses a static SVG constellation, no WebGL rendering loop, no pinning, and no intense camera/section movement.
- All calls to action remain ordinary links. Decorative graphics cannot intercept pointer input. The normal navbar still supports keyboard controls.

The 3D renderer adds a large separately loaded asset. Vite reports its size as a warning; it is not a build error. The scene is isolated from app-page loads rather than hiding the warning. Real-device performance still depends on graphics hardware; tests use Chrome software WebGL when necessary.

## Verification commands

```sh
npm run build
npm test
npm run typecheck:backend
npm install --no-save --package-lock=false playwright @axe-core/playwright
node scripts/test-network.mjs
node scripts/smoke-test.mjs
```

The app must be running at http://127.0.0.1:5173 for browser tests. Playwright/Axe are temporary test tools, not application packages. Screenshots go in the ignored `test-results` folder.
