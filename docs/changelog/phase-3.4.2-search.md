---
date: 2026-07-25
phase: 3.4.2
type: feat
summary: Implement Search MVP (podcast-only) using existing transport
files:
  - apps/web/src/features/search/index.tsx
  - apps/web/src/features/search/SearchPage.tsx
  - apps/web/src/features/search/components/SearchInput.tsx
  - apps/web/src/features/search/components/SearchResults.tsx
  - apps/web/src/features/search/components/SearchResultCard.tsx
  - apps/web/src/features/search/hooks/useSearch.ts
  - apps/web/src/app/search/page.tsx

details: |
  Implemented the Search MVP front-end feature under `features/search`.
  The feature consumes the existing `getPodcasts()` transport and uses React Query
  for server state. URL contract `/search?q=...` implemented. No backend changes.
