# Phase 3.4 — Search Readiness Audit

## Executive Summary

Current Search implementation is not a completed feature. The frontend has only a route placeholder at `apps/web/src/app/search/page.tsx`, while backend search support exists only as podcast search through `GET /api/v1/podcasts?search=...`.

Search currently lives as a podcast capability, not as a dedicated Search feature. The project is therefore not ready to enter a full Search implementation phase without first clarifying Search ownership, completing the `/search` route implementation, and adding the missing episode search contract.

## Current Architecture

- Frontend structure follows the project pattern: `app/` for routes, `features/` for feature implementations, `components/` for shared UI, `lib/` for data access, and `shared/` for shared infrastructure.
- Backend structure follows feature-based folders under `apps/api/src/`.
- The current Search experience is split:
  - Placeholder route: `apps/web/src/app/search/page.tsx`
  - Podcast search query support: `apps/web/src/lib/podcasts.ts`, `apps/web/src/features/podcasts/hooks/usePodcasts.ts`
  - Podcast search API: `apps/api/src/podcasts/podcasts.controller.ts`, `apps/api/src/podcasts/podcasts.service.ts`, `apps/api/src/podcasts/dto/get-podcasts-query.dto.ts`
- There is no dedicated `features/search` frontend folder and no `search` module in backend.

## Frontend Audit

### Search Pages

- `apps/web/src/app/search/page.tsx` is a route placeholder using `RoutePlaceholder`.
- It does not execute API calls, manage search input, or display search results.
- The page is currently foundation-only and not a functional Search experience.

### Search Components & Hooks

- No dedicated Search components or hooks exist.
- Existing search behavior is embedded in the Podcast list page and Podcast feature hook.
- `usePodcasts` supports `search` as a query parameter, but this is a Podcast feature hook, not a Search feature hook.

### API Usage

- No Search-specific API client or endpoint is consumed from the Search route.
- Podcast search is consumed from `apps/web/src/app/podcasts/page.tsx` via `getPodcasts({ search })`.
- `apps/web/src/lib/podcasts.ts` provides the transport for podcast search.

### React Query Integration

- Podcast search is supported by React Query via `usePodcasts`.
- The hook uses stable query keys with `search`, `page`, `limit`, and `sort`.
- Coverage is only for the Podcast list page.

### State Management

- Search term state exists only in the Podcast list page.
- The actual Search route has no local or shared search state.

### Loading / Empty / Error States

- The Podcast page includes loading and error states through `LoadingState` and `ErrorState`.
- The Search route placeholder has no real data states beyond the generic route placeholder UI.

### Routing

- `/search` route exists and is linked from navigation.
- The route is currently foundation-only and not integrated with search query parameters or results.

### UI Composition

- The Search page uses `RoutePlaceholder`, which is appropriate for route foundation.
- It does not yet compose a search experience from UI primitives or business components.

### Findings

- Placeholder route exists, but Search UI is unfinished.
- Search is currently implemented as Podcast search, not as a dedicated Search feature.
- A dedicated `features/search` boundary and page behavior are missing.
- No episode search UI exists.

## Backend Audit

### Search Endpoints

- Backend search support is available only through `GET /api/v1/podcasts`.
- The global API prefix is set in `apps/api/src/main.ts`.
- There is no dedicated `GET /api/v1/search` or `/search` backend endpoint.

### Search Service & Query Implementation

- `apps/api/src/podcasts/podcasts.service.ts` builds `where` conditions using Prisma `contains` on `title` and `description`.
- Search is case-insensitive but not PostgreSQL full-text search.
- `orderBy` supports only `newest`.

### DTOs and Validation

- `GetPodcastsQueryDto` validates `page`, `limit`, `search`, and `sort`.
- `page` and `limit` are normalized with defaults and bounds.
- `search` is optional and validated as a string.

### Pagination

- `findAll()` returns `data` and `pagination` metadata.
- Backend pagination is implemented correctly for podcast search.

### Filtering & Sorting

- Filtering is limited to the `search` text parameter.
- Sorting is only `newest`.

### Performance Considerations

- Current search is implemented using `contains`, which is sufficient for small MVP data volumes.
- It does not use PostgreSQL full-text search or indexes optimized for search.
- This implementation is acceptable for an initial MVP, but it diverges from `docs/tech-stack.md` recommendation for PostgreSQL search.

### Findings

- Backend supports Podcast search but not Episode search.
- Search is a podcast-level capability, not a generic search module.
- No search-specific backend route or service exists.

## Ownership Review

### Which files own Search?

- Frontend ownership is currently split:
  - `apps/web/src/app/search/page.tsx` owns route foundation.
  - `apps/web/src/lib/podcasts.ts` and `apps/web/src/features/podcasts/hooks/usePodcasts.ts` own the actual search query logic.
- Backend ownership is within the Podcast module:
  - `apps/api/src/podcasts/podcasts.controller.ts`
  - `apps/api/src/podcasts/podcasts.service.ts`
  - `apps/api/src/podcasts/dto/get-podcasts-query.dto.ts`

### Feature-Based Architecture

- Search does not currently follow a dedicated feature-based boundary.
- The route is placeholder-only and lacks its own feature folder.
- Actual search logic is contained within Podcast, so Search is not a standalone feature yet.

### Ownership Boundaries

- Boundary is respected for podcast search: Podcast feature owns the behavior.
- Boundary is broken for a dedicated Search feature: the Search route is not linked to a Search feature boundary.

### Dependencies on Podcast / Episode / Other Features

- Current search behavior depends on Podcast.
- There is no Episode search implementation.
- Search does not depend on Player.
- Search does not require Auth for read queries.

## Dependency Analysis

| Dependency | Search Role | Status |
|---|---|---|
| Auth | Not required for public search | Unnecessary for current read-only Search |
| Podcast | Source of search endpoint and feature logic | Required |
| Episode | Not used by current search implementation | Unnecessary |
| Player | Not used by current search implementation | Unnecessary |
| Shared packages (`api-client`, `RoutePlaceholder`, `React Query`) | Required infrastructure | Required |
| Search route placeholder | Required for route foundation | Required but incomplete |

## Risks

### Critical

- None found that block the current audit.

### High

- Search feature is not implemented beyond a placeholder route. The next phase cannot proceed safely without defining Search ownership and actual page behavior.
- Episode search is missing. If MVP requires both podcast and episode search, current backend and frontend are not sufficient.

### Medium

- Backend uses Prisma `contains` search rather than PostgreSQL full-text search, creating a divergence from documented search strategy.
- Frontend Search route is not wired to any API, so the route cannot currently be validated as a search experience.
- There is no dedicated Search feature boundary, so future implementation may begin with ambiguous ownership.

### Low

- Search page uses the route foundation pattern correctly, but still needs business-specific composition.
- Shared search state is absent, which is expected until the Search feature is implemented.

## MVP Readiness

### What is complete?

- Podcast search query support exists in backend and frontend Podcast list.
- Pagination metadata is available for search results.
- Search route placeholder exists and is linked from navigation.
- Search-related DTO validation and query handling are already implemented for podcasts.

### What is missing?

- Dedicated Search feature boundary in frontend.
- Functional `/search` page with query input, result rendering, loading/empty/error states, and URL query handling.
- Dedicated backend search endpoint for generic search or episode search.
- Episode search implementation.
- Search-specific UI components, hooks, and feature routing.
- Alignment between docs recommendation of PostgreSQL search and current Prisma `contains` implementation.

### What should NOT be implemented yet?

- Advanced search features such as semantic search, voice search, recommendations, or AI-enhanced search.
- Search platform migrations such as Elasticsearch/Meilisearch.
- Search-dependent Player or playlist features.
- Any backend or frontend changes that are not directly needed to establish the Search feature boundary and MVP search behavior.

## Recommended Scope for Phase 3.4

### Included in Phase 3.4

- Establish a dedicated Search feature boundary in frontend.
- Implement a functional `/search` page using the existing `GET /api/v1/podcasts?search=...` contract.
- Reuse existing Podcast search query support via `apps/web/src/lib/podcasts.ts` and `apps/web/src/features/podcasts/hooks/usePodcasts.ts`.
- Add UI states for loading, empty results, and errors on the Search page.
- Ensure navigation to `/search` preserves existing routes and page structure.
- Keep Search read-only and public; do not introduce auth requirements for search.
- Keep search scope MVP-focused: podcast search only, unless episode search contract is explicitly added.

### Out of Scope

- Search backend migration to PostgreSQL full-text search or external search engines.
- Advanced search filters, facets, suggestions, ranking algorithms, or AI search.
- Episode search implementation until backend and product requirements clearly require it.
- Player integration, playlist search, library search, or profile search.
- Any change that alters the current API contract for `GET /api/v1/podcasts`.

## Validation

- Existing routes are preserved: `/search` exists as a placeholder route and can continue to exist as the Search entry point.
- Current API contract remains compatible: Search should reuse `GET /api/v1/podcasts?search=...`.
- Feature boundaries are not yet fully established for Search, but the route foundation is in place.
- Runtime behavior is unchanged by this audit because no code was modified.
- The backend search contract is stable, but it is still podcast-only and therefore only partially aligned with MVP Search expectations.

## Final Conclusion

Search is partially present as a Podcast search capability, but the dedicated Search feature is not ready. The current state is sufficient to support a first MVP-level podcast search implementation, yet it lacks the Search page behavior, Search feature ownership, and episode search contract needed for a complete Phase 3.4 implementation.

PROJECT UNDERSTOOD: YES

READY FOR PHASE 3.4: NO
