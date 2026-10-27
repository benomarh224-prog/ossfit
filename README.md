# Atlas Coach — Online Personal Trainer Platform

Premium online personal training platform for a coach in **Tetouan, Morocco**,
serving clients across all of Morocco. Built with Next.js 16 (App Router),
TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Prisma (SQLite),
NextAuth, Recharts, and a trilingual i18n system (English / French / Arabic
with full RTL support).

## Features

- **Marketing landing page** (`/`) — cinematic hero, Meet Your Coach, Why
  Choose, Services, How It Works, Transformation Gallery, Packages (MAD
  pricing), Testimonials, FAQ, final CTA, premium footer.
- **Authentication & onboarding** — NextAuth credentials, role-based
  (CLIENT/COACH), Moroccan phone validation, 4-step fitness assessment.
- **Client dashboard** — overview, workouts, nutrition, progress photos &
  weekly check-ins, coach messaging, subscription + bank-transfer payment
  proof upload, consultation booking, profile + privacy/data-export notice.
- **Coach admin dashboard** — clients approval, workout/nutrition plan
  assignment with day-builders, full CRUD for packages/services/testimonials/
  transformations/FAQ, site content editor, consultation slot management,
  payment verification (auto-activates subscriptions), analytics with Recharts.
- **WhatsApp integration** — floating button + prefilled inquiry messages;
  number configurable from admin.
- **Payments (Morocco)** — manual bank transfer in MAD, proof upload, coach
  verification workflow, invoice numbers, payment history. No fake card
  payments.
- **i18n** — EN/FR/AR with live RTL flip. UI chrome fully translated; marketing
  body copy is coach-editable (single-language).
- **SEO** — metadata, OpenGraph/Twitter, dynamic sitemap, robots, JSON-LD
  structured data.

## Tech stack

- Next.js 16 (App Router) + TypeScript 5
- Tailwind CSS 4 + shadcn/ui (New York) + Lucide icons
- Framer Motion (animations), Recharts (charts)
- Prisma ORM (SQLite), NextAuth.js v4 (credentials, JWT, roles)
- Zustand (client state), TanStack Query (server state), react-hook-form + zod
- next-themes (dark-first premium theme)

## Setup

```bash
# 1. Install dependencies
bun install            # or: npm install / pnpm install

# 2. Copy env and set secrets
cp .env.example .env
#   - set NEXTAUTH_SECRET to a long random string
#   - set COACH_SEED_PASSWORD and DEMO_CLIENT_SEED_PASSWORD to unique values
#   - optionally set COACH_SEED_EMAIL (your coach login)

# 3. Create the SQLite database and push the schema
bun run db:push

# 4. Seed demo content (coach + demo client + services/packages/FAQ/etc.)
bun run scripts/seed.ts

# 5. Start the dev server
bun run dev
#   open http://localhost:3000
```

## Seeded accounts

- **Coach (admin):** `COACH_SEED_EMAIL` / `COACH_SEED_PASSWORD`
- **Demo client:** `client@demo.ma` / `DEMO_CLIENT_SEED_PASSWORD`

Keep the passwords in your local `.env` file. The seed script requires both
passwords and does not print them.

> Demo transformations & testimonials are clearly marked as DEMO
> (`consent: false`). Replace them with real, consented client content from the
> admin dashboard before going live. Never publish a client's photos or story
> without explicit consent.

## Architecture notes

- **Single visible route:** only `/` is user-visible. `src/app/page.tsx` is a
  server component that uses `getServerSession` and renders:
  - role `COACH` → `<AdminApp/>`
  - role `CLIENT` → `<ClientApp/>` (with an onboarding gate if not onboarded)
  - else → `<LandingPage/>` (SSR, good for SEO)
  Login via NextAuth redirects to `/`, re-rendering the right view server-side.
- **API:** everything else is an API route under `src/app/api/` with zod
  validation and role guards (`requireCoach` / `requireClient` / `requireAuth`
  in `src/lib/server-utils.ts`).
- **List fields** in the Prisma schema are JSON-encoded strings (SQLite does
  not support native arrays/enums); helpers `parseJSON`/`toJSON` handle them.
- **Uploads** are stored locally in `public/uploads/` via `POST /api/upload`
  (image-only, validated, max 6 MB). Swap for Cloudinary/S3 in production.
- **Payments** are manual bank-transfer with proof verification. The system is
  architected to later integrate a verified Morocco-compatible gateway (CMI).

## Project structure

```
prisma/schema.prisma         # full database schema
scripts/seed.ts             # demo seed (coach, client, content)
scripts/gen-images.ts       # regenerates marketing imagery via z-ai SDK
src/app/page.tsx            # role-based server entry
src/app/layout.tsx          # fonts + providers + SEO metadata
src/app/api/...             # all API routes (auth, content, admin, ...)
src/components/marketing/   # landing page sections
src/components/site/        # header, footer, whatsapp, language switcher
src/components/auth/        # auth modal + onboarding
src/components/dashboard/   # client dashboard + sections
src/components/admin/       # coach admin dashboard + sections
src/lib/auth.ts             # NextAuth config (roles)
src/lib/db.ts               # Prisma client
src/lib/server-utils.ts     # guards, JSON helpers, whatsapp link, site content
src/lib/i18n/               # trilingual dictionary + provider + formatMAD
```

## Deployment

- Set the env vars (production `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, DB path).
- For a real Morocco payment gateway, integrate CMI (or another eligible
  provider) and replace the manual-transfer flow once tested.
- Run `prisma db push` on deploy, then seed or import real content.
- The site is dark-first; ensure the reverse proxy passes the `Accept-Language`
  and WebSocket headers (not required for the marketing site).

## License / attribution

Imagery is AI-generated (z-ai image-generation skill) for demo purposes —
replace with the coach's real, licensed photographs before launch.
