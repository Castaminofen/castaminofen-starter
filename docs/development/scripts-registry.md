# Scripts Registry

## pnpm --filter @castaminofen/api build

Purpose:
Build NestJS backend.

Used in:
Phase 1.5
Phase 2.1
Phase 2.2

Last Verified:
2026-07-17


---

## pnpm --filter @castaminofen/web build

Purpose:
Build Next.js frontend.

Used in:
Phase 2.4
Phase 2.4.3

Last Verified:
2026-07-17

---

## prisma generate

Purpose:
Generate Prisma client after schema changes.

Used in:
Database migration phases.

---

## pnpm --filter @castaminofen/web lint

Purpose:
Verify the Next.js frontend passes ESLint after UI integration changes.

Used in:
Phase 2.4.3
Phase 3.8

Last Verified:
2026-07-26

---

## pnpm --filter @castaminofen/web exec vitest run src/features/player/runtime/playerRuntime.test.ts

Purpose:
Run the Player runtime regression suite covering queue, resume, and playback-state behavior.

Used in:
Phase 3.8

Last Verified:
2026-07-26
