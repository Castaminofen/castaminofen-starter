---
title: Phase 3.4.1 — Search Architecture & Ownership Definition
---

# Phase 3.4.1 — Search Architecture & Ownership Definition

Executive Summary
-----------------

- **Goal:** Produce a documentation-only, implementation-free architecture definition for the Search feature that preserves existing runtime behavior, follows the project's Feature-Based and Clean Architecture principles, and targets a minimal MVP.
- **Key decision (MVP):** Reuse the existing podcast search contract (`GET /api/v1/podcasts?search=...`) for the initial MVP Search experience (podcast-only). Introduce a dedicated Search feature boundary on the frontend that composes and reuses existing Podcast transport and hooks. Episode search is explicitly deferred unless backend contract is added.

Current Situation
-----------------

- The repository contains a placeholder route at [apps/web/src/app/search/page.tsx](apps/web/src/app/search/page.tsx#L1). The real search transport exists inside the Podcast feature and backend only exposes podcast search via `GET /api/v1/podcasts?search=...` (see [docs/reports/phase-3.4-search-readiness-audit.md](docs/reports/phase-3.4-search-readiness-audit.md#L1)).
- No `features/search` folder or search-specific backend endpoint exists today. Episode search backend support is missing.
- Project rules: Feature-Based Architecture, Clean Architecture, MVP-first, Avoid Over Engineering — preserve all existing routes and API contracts.

Ownership Definition
--------------------

Search owns (feature responsibilities):

- Search experience and page composition (the `/search` entry point UI).
- Search UI primitives and feature-owned composition components (search input, results list, result cards, loading/empty/error states for the page).
- Search state lifecycle for the page (query param → view state → UI rendering).
- Search-specific hooks and feature-level query adapters (e.g., `useSearch()` inside `features/search` that composes existing transport hooks).
- Result composition and presentation decisions (which result types to render, how to display mixed results in the UI layer).

Search does NOT own:

- Podcast business logic, domain models, or transport implementations (these remain owned by the `podcasts` feature and shared `lib` transport).
- Episode business logic or episode search transport until an API contract is added.
- Player, authentication plumbing, or global shared infrastructure (React Query provider, shared API client, Zustand stores).
- Backend API surface — the Search feature must respect existing API contracts.

Feature Boundary
----------------

Frontend feature boundary (logical only, no code change in this phase):

- Entry point: route at `/search` (the existing placeholder page). The feature will live under `apps/web/src/features/search`.
- Public surface (feature-owned): `SearchPage` composition, `SearchInput`, `SearchResults`, `SearchResultCard`, `useSearch()` hook, local view models.
- Internal components: result renderers (podcast card, optional actor for episodes when introduced). These renderers reuse shared UI primitives located in `apps/web/src/components`.
- Integration hooks: `useSearch()` adapts the shared transport `getPodcasts()` rather than reimplementing transport logic. It should avoid direct dependence on the Podcast feature hook `usePodcasts()` whenever possible, because that hook belongs to the Podcast feature boundary.
- Shared infra usage: React Query for server state, shared `api-client`/`lib` transports, shared UI primitives (LoadingState, ErrorState, EmptyState), and routing provided by App Router.

Backend boundary:

- For MVP, no new backend module is required — the Search feature will reuse podcast search transport. If a dedicated backend `search` route is later introduced it will be added as a separate module under `apps/api/src/search` and be clearly specified in a later phase.

Data Flow
---------

User
↓
Search UI (`/search`)
↓
Feature hook `useSearch()` (feature-owned adapter)
↓
Shared transport (reused): `getPodcasts({ search, page, limit, sort })`
↓
Backend `GET /api/v1/podcasts?search=...` (podcast module)
↓
Backend response (data + pagination)
↓
React Query caches response (server state)
↓
Search feature receives data → composes `SearchResults` → UI renders

Ownership at each layer:

- UI layer: Search feature owns composition and presentation.
- Hook/adapter layer: Search feature owns `useSearch()` and should depend on the shared transport layer rather than internal Podcast feature hooks.
- Transport layer: Shared `lib` owns public HTTP client adapters such as `getPodcasts()`.
- Backend: Podcast module owns query implementation; Search feature is a consumer for MVP.

Search Dependency Direction
---------------------------

For MVP, the preferred dependency direction is:

Search Feature
↓
Shared Transport (`getPodcasts()`)
↓
Backend API

This preserves feature ownership by keeping Search as a consumer of a public transport contract instead of binding it to Podcast feature internals.

Search must avoid the alternative direction:

Search Feature
↓
Podcast Feature Hook (`usePodcasts()`)
↓
Backend API

Because `usePodcasts()` is owned by the Podcast feature and encodes podcast-list-specific query keys and lifecycle decisions, depending on it would create unwanted feature coupling and leak Podcast implementation details into Search.

API Strategy (MVP decision)
---------------------------

Options considered:

- Option A — Reuse `GET /api/v1/podcasts?search=...` (no backend change).
- Option B — Introduce `GET /api/v1/search` (new backend endpoint, eventual multi-type results).

Decision: Option A (Reuse `GET /api/v1/podcasts?search=...`) as the MVP strategy.

Rationale and trade-offs:

- Simplicity: Reusing the existing contract keeps the MVP minimal and avoids backend/API changes, matching the project's rule to avoid over engineering.
- Preserves runtime behavior and API compatibility (no breaking changes to clients or backend).
- Aligns with current code: frontend already has `getPodcasts` transport and `usePodcasts` hook that support `search`.
- Trade-offs: This choice limits MVP Search to podcast-only results. If product requires mixed-type search (podcast + episode) the backend will need a `search` endpoint in a later phase; however that is explicit future work and out-of-scope for this MVP.

URL Contract
------------

- Route: `/search`
- Query parameter: `q` (search text). Rationale: `q` is conventional and concise; map `q` → backend `search` query when building transport calls.
- Pagination params (optional): `page`, `limit` (as currently used by `getPodcasts`).
- Browser navigation: Search page must reflect query params in the URL and update them on input submission. Navigating back/forward restores the previous query and results via React Query/cached keys.
- Deep linking: `/search?q=something&page=2` should fully reproduce the search UI state when opened directly.
- Refresh behavior: Full page refresh with same query params must re-run the query and restore UI state (loading → results/empty/error) without relying on ephemeral in-memory state.

URL contract examples:

- `/search?q=nestjs`
- `/search?q=podcast+react&page=2`

Search State Management Strategy
-------------------------------

State classification and ownership:

- Server state (React Query): search results, pagination metadata, cached responses. Reason: results are immutable (per query key) and benefit from React Query features (caching, stale TTL, background refetch).
- Route state (URL): canonical source for the current search text and pagination (`q`, `page`, `limit`). Reason: preserves deep linking, browser navigation, bookmarking.
- Local ephemeral UI state: input draft, focused state, local ephemeral UI flags (e.g., whether suggestions panel is open) — remain component-local.
- Global UI state (Zustand): reserved for truly cross-feature state such as player or auth snapshots. Search should NOT introduce global Zustand state for query text or results in MVP.

Should Search use Zustand?

- No for MVP. Rationale: using React Query + URL-first approach keeps the design simple, preserves global stores for cross-cutting concerns (player/auth), and avoids unnecessary global state that would complicate ownership and testing. Zustand remains reserved for player/auth only.

UI Composition
--------------

Top-level page composition (feature-owned):

- `SearchPage` (feature): - Header / SearchInput (feature) - `SearchResults` (feature) — uses shared `List` primitives - `LoadingState`, `EmptyState`, `ErrorState` (shared primitives)

Reusable components (shared primitives):

- `LoadingState`, `EmptyState`, `ErrorState` (apps/web/src/components)
- `PodcastCard` (shared or podcast feature-provided presentational component)
- `Pagination` control (shared primitive)

Feature-owned components:

- `SearchInput` (manages URL updates on submit/enter, exposes controlled/uncontrolled modes) - `SearchResults` (receives data from `useSearch()` and selects renderer per result type - `SearchResultCard` (composition wrapper that chooses `PodcastCard` or future `EpisodeCard`)

Interaction With Existing Features
---------------------------------

Dependencies and classification:

- Podcast transport (`apps/web/src/lib/podcasts.ts`) — Required (MVP). Search will call into this transport via feature adapter.
- Podcast presentational components (e.g., `PodcastCard`) — Optional (prefer reuse if available).
- Episode transport / feature — Optional for future; Forbidden for MVP unless backend contract is added.
- Player (`apps/web/src/stores/playerStore` and player components) — Optional integration only. Search must not own player behavior. Player actions (play buttons) in result cards are allowed but should call existing player APIs; player store remains owner.
- Auth — Forbidden for read-only search (Search must remain public for MVP). Do not require authentication.
- Shared infra (React Query, API client, UI primitives) — Required.

Dependency table (short):

- Podcast: Required
- Episode: Optional / Future (Forbidden for MVP)
- Player: Optional (integration only)
- Auth: Forbidden for Search MVP
- Shared infra: Required

Future Evolution (architecture only)
-----------------------------------

Current MVP architecture is intentionally podcast-only because the existing backend contract is `GET /api/v1/podcasts?search=...`. This does not mean Search must remain podcast-only forever. It means the MVP uses the current supported backend capability and postpones multi-type search until the product and backend contract are approved.

Current MVP:

Search
└── Podcasts

Future (not part of this phase):

Search
├── Podcasts
├── Episodes
├── Playlists
└── Users

Search should own result composition and delegate rendering to domain-specific components when additional types are introduced. The current MVP design should remain simple while leaving the feature extensible for future result types.

Backend Ownership
------------------

Current ownership:

Podcast Module
↓
Provides `GET /api/v1/podcasts?search=...` and handles podcast search logic.

Future ownership direction:

A generic Search backend module may be introduced only if product requirements justify it. In that case, a new `Search` module would consume domain services such as:

- Podcast service
- Episode service
- Other feature services

That Search module would orchestrate cross-feature search results without owning domain-specific business logic. This is an architectural direction only and does not change the current API contract.

MVP Scope (Phase 3.4)
----------------------

Included in Phase 3.4 (MVP):

- Create `features/search` documentation and explicit frontend feature boundary (no code changes in this phase — documentation-only definition). Implementation-ready plan.
- Implement a Search page (implementation in later phase) that reuses `GET /api/v1/podcasts?search=...` via existing transports and React Query.
- UX basics: input → submit → results, plus loading, empty, and error states, and pagination.
- URL-first behavior (`/search?q=...`), deep linking, and refresh recovery.

Out of Scope (Phase 3.4 MVP):

- Episode search backend and frontend rendering (defer until explicit backend contract is added).
- Semantic/AI/voice search, suggestions, history, server-side full-text search migration, or new search engines (Elasticsearch/Meilisearch).
- Search analytics, ranking algorithms, relevance tuning beyond simple `contains` behavior.
- Any API contract changes.

Migration Plan (from placeholder to MVP)
--------------------------------------

All steps are documentation-only here; they describe how future implementation should proceed. Each step is independently verifiable and preserves runtime behavior until implemented.

Step 1 — Documentation & Acceptance (this phase)
- Deliver this architecture doc and get approval from stakeholders (product + engineering). Verify that `apps/web/src/app/search/page.tsx` remains a placeholder and routes are preserved.

Step 2 — Feature scaffold (implementation phase; no API changes)
- Add `apps/web/src/features/search` folder with `index.tsx`, `SearchPage`, `useSearch()` adapter that composes `usePodcasts()`.
- Ensure the scaffold reads URL `q` param and uses React Query keys `["search", q, page]`.

Step 3 — Reuse transport (implementation)
- Implement `useSearch()` to call existing `getPodcasts({ search: q, page, limit })` through the shared transport. No new API routes.

Step 4 — Compose UI (implementation)
- Build `SearchInput`, `SearchResults`, `SearchResultCard`. Use shared Loading/Empty/Error primitives and `PodcastCard` presentational component.

Step 5 — QA & runtime verification (implementation)
- Manual tests: route preservation, deep link reproduction, back/forward navigation, refresh behavior, pagination, loading/empty/error UI.
- Lint & build must pass.

Step 6 — Optional follow-up (future)
- If product requires mixing episodes in results, add backend `GET /api/v1/search` contract in a subsequent backend-only phase, then update `useSearch()` to call the new endpoint and expand result renderers.

Validation Plan
---------------

Pre-implementation validations (documentation phase):

- Confirm route presence: `/search` placeholder exists at [apps/web/src/app/search/page.tsx](apps/web/src/app/search/page.tsx#L1).
- Confirm transport availability: `getPodcasts` and `usePodcasts` exist and accept `search` parameter (see [docs/reports/phase-3.4-search-readiness-audit.md](docs/reports/phase-3.4-search-readiness-audit.md#L1)).

Post-implementation validation checklist (to run after implementation):

- Route preservation: navigating to `/search` still works and no other routes are altered.
- API compatibility: calls use `GET /api/v1/podcasts?search=...` and backend responses match expected shapes (data + pagination).
- Feature boundary verification: `features/search` owns page composition and `useSearch()` adapter; podcast transport remains in `lib/podcasts`.
- Runtime preservation: No breaking changes to existing pages or navigation; existing Podcast page continues to operate.
- Lint & Build: `pnpm --filter @castaminofen/web build` and monorepo lint pass.
- Manual test checklist:
  - Enter text in `SearchInput`, submit → loading → results.
  - Direct open `/search?q=term` → renders same results.
  - Browser refresh on `/search?q=term` reproduces results.
  - Pagination links preserve `q` and allow navigation/back-forward.

Final Recommendation
--------------------

- Approve the Search architecture as defined here for Phase 3.4 MVP with the explicit decision to reuse `GET /api/v1/podcasts?search=...` and to keep Search MVP podcast-only.
- Defer episode search and any backend changes to a later phase triggered by product acceptance.
- Keep Search state URL-first + React Query; avoid adding Zustand state for search.

Notes and Constraints
---------------------

- I attempted to read `copilot-instructions.md` as required by the phase preconditions, but no such file was found in the repository root. I relied on the project's architecture docs and the Phase 3.4 Search Readiness Audit to prepare this document. If `copilot-instructions.md` exists elsewhere, provide its path and I will re-check for any additional constraints.

PROJECT UNDERSTOOD: YES

SEARCH ARCHITECTURE APPROVED: YES

READY FOR IMPLEMENTATION: YES
