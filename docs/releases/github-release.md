# Castaminofen MVP Release v1.0.0-mvp

## Highlights

This release marks the first MVP package for Castaminofen, focused on the core podcast experience for discovery, browsing, playback, and personal libraries.

## Features

- Authentication and protected access
- Podcast and episode browsing
- Search experience
- Library and continue-listening flows
- Playlist support
- Player runtime with queue, repeat, and shuffle
- Backend and frontend integration for the MVP scope

## Architecture

The repository remains organized around a monorepo structure with a Next.js frontend, a NestJS backend, shared types, and documentation-driven release validation.

## Build Status

Verified successfully with:

- pnpm lint
- pnpm build
- pnpm --filter @castaminofen/web test

## Notes

This is a documentation and release-preparation package for the current MVP implementation. No application logic or architecture changes were introduced during this phase.

## Known Limitations

- refresh/session UX can still be improved
- broader end-to-end coverage remains a future enhancement
- additional runtime hardening may be added in later iterations

## Future Plans

Future work may focus on product polish, testing, lifecycle hardening, and broader release automation.
