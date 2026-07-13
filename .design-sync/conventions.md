# Khushtrology Design System — Usage Conventions

## Wrapping and setup

Components that use routing (`Navbar`, `Footer`, `PageTransition`) require a router context. `MemoryRouter` is exported from the bundle:

```jsx
import { Navbar, Footer, MemoryRouter } from 'khushtrology-frontend';

function App() {
  return (
    <MemoryRouter>
      <Navbar />
      <main>…</main>
      <Footer />
    </MemoryRouter>
  );
}
```

No other provider is required. GSAP is bundled — `ConstellationLoader` and `ZodiacWheel` animate on mount without any setup.

## Styling idiom

Two layers work together: **CSS custom properties** (always available via `styles.css`) and **component utility classes** (defined in `_ds_bundle.css`, already `@import`ed from `styles.css`).

**Color tokens** — use these, never hardcoded hex values:

| Token | Role |
|---|---|
| `var(--color-void)` | Page background (`#1a0f3c`) |
| `var(--color-void-deep)` | Deeper background (`#0f0922`) |
| `var(--color-gold)` | Primary accent / interactive (`#d4a843`) |
| `var(--color-gold-pale)` | Subtle gold (`#e8c87a`) |
| `var(--color-parchment)` | Light card surfaces (`#e8dcc8`) |
| `var(--color-ink)` | Text on light surfaces (`#2c1810`) |
| `var(--color-verdigris)` | Secondary accent (`#4a9b8e`) |
| `var(--color-text)` | Body text on dark (`#d8cfc4`) |
| `var(--color-muted)` | Subdued text (`#8a7f74`) |

**Font tokens:**

| Token | Use |
|---|---|
| `var(--font-display)` | Headings (Playfair Display SC, small-caps) |
| `var(--font-body)` | Body copy (IM Fell English, serif) |
| `var(--font-label)` | Labels, nav, captions (Cormorant Garamond) |

**Component classes** — apply to your own layout elements:

| Class | What it does |
|---|---|
| `.btn-celestial` | Transparent button with gold border, fills gold on hover (canonical) |
| `.btn-gold` | Solid gold-fill button variant |
| `.btn-cosmic` | Alias for `.btn-celestial` (backward-compat) |
| `.glass` | Dark void surface with amber border — use for panels, cards |
| `.parchment-card` | Aged-paper card (light bg `--color-parchment`, ink text) — use for reading output |
| `.input-cosmic` | Dark input field with gold focus ring |
| `.divider` | Ornamental section divider with fading gold lines |
| `.constellation-loader` | Layout wrapper for `<ConstellationLoader>` — centers the SVG + label |

**Constraints:** no `backdrop-filter`, no `border-radius > 4px` — breaks the antiquarian aesthetic.

## Where the truth lives

- `styles.css` — the full import closure (tokens + fonts + Tailwind utilities + component classes). This is what every design receives.
- Per-component API: `components/general/<Name>/<Name>.d.ts` and `<Name>.prompt.md`.

## Idiomatic build snippet

```jsx
import { ZodiacWheel, ConstellationLoader, MemoryRouter } from 'khushtrology-frontend';

export default function ReadingPage() {
  return (
    <MemoryRouter>
      <div style={{ background: 'var(--color-void)', minHeight: '100vh', padding: '4rem 2rem' }}>
        <div className="glass" style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-gold)' }}>
            Your Birth Chart
          </h2>
          <ZodiacWheel />
          <div className="divider" style={{ margin: '2rem 0' }} />
          <ConstellationLoader label="Interpreting your chart…" />
        </div>
      </div>
    </MemoryRouter>
  );
}
```
