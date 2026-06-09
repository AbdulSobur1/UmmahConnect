# Ummah Connect

A professional career network for Muslim professionals in Nigeria.

## Stack
- Next.js 14 App Router
- Neon (Postgres)
- Auth.js (authentication)
- Drizzle ORM
- React Query
- TypeScript (strict)
- Tailwind CSS
- Zod
- Paystack (payments)

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your values
2. Run `npm install`
3. Run `npm run dev`

## Environment Variables
See `.env.example` for all required variables with descriptions.

## Key Conventions
- All API routes use `withHandler` from `src/lib/api/helpers.ts`
- All inputs validated with Zod schemas from `src/lib/validation.ts`
- Authentication via `@/lib/auth` — use `auth()` server-side, `useSession()` client-side
- All database queries use Drizzle ORM via `@/lib/db`
- Public routes: `/profiles`, `/posts`, `/communities`, `/jobs`, `/events`
- Protected routes: `/feed`, `/messages`, `/notifications`, `/settings`, `/mentorship`

## Phase 1 Market
Nigeria — Muslims only, all cities supported.
