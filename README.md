# ✦ Khushtrology

An astrology web app that computes real natal charts with the Swiss Ephemeris and generates AI-powered readings. Readings are free — there's an optional donation to support the project.

**Live demo**: _(coming soon)_ · **Contact**: [khushigauli@gmail.com](mailto:khushigauli@gmail.com)

## About this project

Khushtrology is a passion project. I've been fascinated by astrology since middle school, and this app is where that interest finally met my computer science degree — a full-stack site built end-to-end, from ephemeris math to payment webhooks to the antiquarian design system.


**Stack**: React + Vite (frontend) · FastAPI + pyswisseph (backend) · Groq (Llama 3.3 70B) · Supabase (auth, saved charts, donations) · Stripe Checkout · Nominatim (location autocomplete) · timezonefinder (local→UTC conversion) · GSAP 3 (animations)

## Features

1. **Calculate Chart** — enter your name, date, local birth time, and location (autocomplete powered by Nominatim). The app auto-detects the birth timezone, converts local time to UTC, and computes your natal chart via Swiss Ephemeris. Results show:
   - Planetary positions (sign, degree, house placement, retrograde status) — stagger-animated on reveal
   - Chart angles (ASC, MC, DSC, IC)
   - All 12 house cusps with their signs
2. **AI Reading** — choose a reading type (Natal Overview, Love & Relationships, Career & Purpose, or Spiritual Path) and get a personalised ~300–400 word interpretation powered by Groq (Llama 3.3 70B), displayed on a medieval parchment scroll card. Prompts are engineered to cite exact placements — no generic sun-sign filler.
3. **Accounts & saved charts** — sign up via Supabase auth, save charts to your account, and reload them later with their readings intact (readings persist per-chart in a `jsonb` column). Includes a full password-reset email flow.
4. **Today's Sky** — for logged-in users: today's transiting planets placed into your natal houses, a most-activated-house callout, and an optional AI transit reading that refreshes daily.
5. **Donate** — optional tip-jar donation via Stripe Checkout with a signed, idempotent webhook; running total shown on the donate page.

## Technical highlights

A few pieces of this codebase that go beyond CRUD:

- **Timezone-correct astronomy** (`backend/app/services/astro.py`) — birth times are entered as local time, resolved to an IANA timezone from coordinates via `timezonefinder`, and converted to UTC with `zoneinfo` before the Julian day calculation. This correctly handles historical DST rules for any birth date — skipping this step silently produces wrong house cusps.
- **LLM prompt engineering** (`backend/app/services/claude.py`) — every system prompt forces the model to name the exact planet, sign, degree, and house for each claim and forbids sentences that could apply to any chart, preventing drift into generic horoscope prose.
- **Idempotent Stripe webhooks** (`backend/app/routers/donations.py`) — donations are logged with a unique `stripe_session_id`, so Stripe's automatic retries can never double-count a payment.
- **Per-endpoint rate limiting** (`slowapi`) — every endpoint is IP rate-limited (e.g. AI readings at 5/min and 20/day) except the Stripe webhook, which is authenticated by signature instead.
- **Session-scoped caching** — charts, readings, and daily transits are cached in `sessionStorage` with day-boundary and per-chart invalidation, and every key is wiped on sign-out so a shared browser never leaks one user's chart to the next.
- **Custom design system** (`frontend/src/styles/globals.css`) — an "antiquarian celestial" aesthetic built from CSS tokens and component classes (parchment scroll cards with CSS-only roller bars, a GSAP constellation loader with computed stroke lengths, an SVG grain texture) — no UI library.

---

## Local setup

### Backend

Requires Python 3.12+.

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # then fill in your keys
python run.py          # http://localhost:8000
```

**Environment variables** (`backend/.env`):

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key (`gsk_...`) — free tier at console.groq.com |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (see below) |
| `FRONTEND_URL` | `http://localhost:5173` for dev |
| `SUPABASE_URL` | Supabase project URL — auth, saved charts, and donations |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server-side only, never expose to the frontend) |

### Frontend

Requires Node 18+.

```bash
cd frontend
npm install
cp .env.example .env   # then fill in your keys
npm run dev            # http://localhost:5173
```

**Environment variables** (`frontend/.env`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | `/api` for local dev (uses Vite proxy) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...` for dev) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

---

## Testing donations locally

The donation flow uses Stripe Checkout and requires a running webhook listener so donations are logged to the database.

1. Install the Stripe CLI: `brew install stripe/stripe-cli/stripe-cli`
2. Login: `stripe login`
3. In a separate terminal, start the listener:
   ```bash
   stripe listen --forward-to localhost:8000/donate/webhook
   ```
4. Copy the printed `whsec_...` into `backend/.env` as `STRIPE_WEBHOOK_SECRET`
5. Restart the backend to pick up the new secret
6. Use test card `4242 4242 4242 4242`, any future expiry, any CVC

> The `whsec_...` from `stripe listen` is temporary — it changes each run, so re-paste it each dev session.

---

## Deployment

### Frontend → Vercel

- Build command: `npm run build`, output: `dist/`
- All routes rewrite to `index.html` (configured in `vercel.json`)
- Set `VITE_API_URL` to your Railway backend URL in Vercel's environment settings

### Backend → Railway

- Builder: Nixpacks, start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check: `GET /health`
- Set all env vars from `backend/.env.example` in Railway's environment settings

### Production Stripe webhook checklist

- [ ] Stripe Dashboard → Developers → Webhooks → **Add endpoint**
  - URL: `https://<your-railway-app>.railway.app/donate/webhook`
  - Event: `checkout.session.completed`
- [ ] Copy the endpoint's signing secret into Railway as `STRIPE_WEBHOOK_SECRET`
- [ ] Switch `STRIPE_SECRET_KEY` to your live key (`sk_live_...`)
- [ ] Set `FRONTEND_URL` to your Vercel production URL

---

## License

Copyright © 2026 Khushi Gauli. All rights reserved.

The source code is available for viewing and learning purposes. You may not use, copy, modify, or distribute it — commercially or otherwise — without written permission.

---

*✦ For entertainment and reflection — the stars suggest, they don't decide. ✦*
