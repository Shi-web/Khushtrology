# Design Sync Notes — Khushtrology

## Setup quirks

- **Not a library package** — this is a React app (`khushtrology-frontend`), not a published npm library. The package doesn't self-install in `node_modules/`. Always pass `--entry frontend/src/components/index.jsx` to the converter so `PKG_DIR` resolves to `frontend/` (by walking up from the entry file to find `frontend/package.json`) rather than crashing looking for `frontend/node_modules/khushtrology-frontend/`.
- **componentSrcMap is required** — because there are no `.d.ts` files (JSX-only codebase), `exportedNames()` always returns empty. All 8 components plus `"MemoryRouter": null` must remain in `cfg.componentSrcMap`.
- **CSS entry is compiled Tailwind** — `cssEntry: "dist/styles.css"` is the Tailwind CLI output, NOT `src/styles/globals.css`. Before each re-sync, rebuild it: `cd frontend && npx tailwindcss -i src/index.css -o dist/styles.css --minify`. If Tailwind is not rebuilt, component previews lose all utility class styling.
- **MemoryRouter in barrel** — `frontend/src/components/index.jsx` exports `MemoryRouter` from `react-router-dom`. This is intentional: Navbar and Footer use `Link`/`useLocation` from the bundled react-router-dom; previews must use the same module instance or the Router context won't connect. Don't remove this export.
- **No TypeScript / no .d.ts** — all components are `.jsx`. Type contracts are stubs. `.d.ts` parse check is skipped.

## Known render warnings

- **ConstellationLoader** — renders nearly invisible in headless Chromium because GSAP's `useEffect` fires synchronously on mount, setting `opacity: 0` on all SVG dots and lines before the screenshot. The label text is faintly visible. This is correct behavior — the animation starts at opacity:0 and draws in on the timeline. Not a bug; noted here so re-sync doesn't re-flag it.
- **ZodiacWheel** — zodiac glyphs (♈♉♊…) appear as colored boxes in headless because Google Fonts (Playfair Display SC) aren't loaded. The ring structure, colors, and positions are all correct. `[FONT_REMOTE]` is expected — fonts load from Google at runtime.

## Re-sync risks

- **Tailwind CSS must be rebuilt** before re-syncing if any JSX was changed (new Tailwind classes added). Drift here produces a CSS mismatch between the preview cards and the real app.
- **`index.jsx` barrel** — if new components are added to `frontend/src/components/`, update both the barrel (`index.jsx`) and `cfg.componentSrcMap` in `.design-sync/config.json`.
- **Build assumed Node 20 / npm 10** — re-sync on a different Node version may produce a slightly different bundle hash; a full re-verify will run.
- **Playwright** — installed at `/Users/khushigauli/Library/Caches/ms-playwright/chromium_headless_shell-1228`. If the cache is cleared, re-install: `npm i -D playwright && npx playwright install chromium`.
