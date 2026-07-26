---
title: Phase 3.5 — Library Readiness Audit
date: 2026-07-25
phase: 3.5
status: AUDIT_COMPLETE
tag: v0.4.0
---

# Phase 3.5 — Library Readiness Audit

## Executive Summary

The Library feature is **architecture-ready but data-model incomplete** for MVP scope. The frontend structure is established (placeholder route exists), feature ownership boundaries can be clearly defined following the Search and Player precedents, and the Player/Podcast/Episode features are stable enough to provide consumption patterns. However, the backend lacks the necessary data relationships (user subscriptions, saved podcasts, listening history) that Library will need to query.

**Recommendation:** Proceed to Phase 3.6 (Library Backend Readiness) to define and implement the data models before Library feature implementation.

---

## 1. Current Library State

### Frontend

**Location:** `apps/web/src/app/library/page.tsx`

**Status:** Placeholder only

```tsx
import { RoutePlaceholder } from '@/components/layout/route-placeholder';

export default function LibraryPage() {
  return (
    <RoutePlaceholder
      title="کتابخانه"
      description="..."
      // Generic empty state placeholder
    />
  );
}
```

**Observations:**
- Route structure exists and is integrated into navigation (BottomNavigation references `/library`)
- Page is reachable at `/library`
- No feature folder exists yet (no `apps/web/src/features/library/`)
- No API integration or state management exists
- No data loading or presentation logic

### Backend

**Status:** No Library-specific endpoints or services exist

**Current Endpoints:**
- `GET /api/v1/podcasts` — search all public podcasts (no user subscription context)
- `GET /api/v1/podcasts/:id` — podcast details
- `GET /api/v1/podcasts/:id/episodes` — episodes for a podcast
- `POST /api/v1/podcasts` — create podcast (requires auth)
- `GET /api/v1/episodes` — not implemented (all episodes globally)

**Missing for Library:**
- `GET /api/v1/users/:userId/library` — user's saved/subscribed podcasts
- `POST /api/v1/users/:userId/library/:podcastId` — subscribe to podcast
- `DELETE /api/v1/users/:userId/library/:podcastId` — unsubscribe
- `GET /api/v1/users/:userId/listening-history` — recently played episodes
- `GET /api/v1/users/:userId/continue-listening` — resume progress

### Database Schema

**Current User-Podcast Relationships:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  hashedRefreshToken String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  podcasts  Podcast[]  // User can PUBLISH podcasts (creator)
}

model Podcast {
  id         String    @id @default(cuid())
  title      String
  rssUrl     String    @unique
  description String?
  website    String?
  artworkUrl String?
  ownerId    String?   // Podcast author/creator
  owner      User?     @relation(fields: [ownerId], references: [id])
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  episodes   Episode[]
}
```

**Analysis:**
- ✅ User-Podcast relationship exists but ONLY for **creators** (`ownerId`)
- ❌ NO subscription/save relationship for regular users
- ❌ NO listening history model
- ❌ NO continue-listening progress tracking
- ❌ NO favorited/liked podcasts
- ❌ NO playlist model

---

## 2. Existing Ownership & Feature Boundaries

### Defined Feature Boundaries (Stable)

Following the patterns established in Phase 2.6.4 and Phase 2.7 (Auth, Podcast, Episode), ownership is well-defined:

| Feature | Owns | Does NOT Own |
|---------|------|-------------|
| **Auth** | Login/Register UI, session state, token management | Podcast/Episode logic, shared layout |
| **Podcasts** | Podcast listing, podcast form, podcast card UI, podcast search | Episode details, playback, auth |
| **Episodes** | Episode form, episode detail UI, audio upload | Playback state, podcast search, auth |
| **Player** | Playback state, queue, audio engine, mini player UI | Podcast data, episode data, auth |
| **Search** | Search form UI, results presentation, pagination | Podcast logic, storage, auth |

### Library Feature (Proposed)

**Should Own:**
- Library page and routing
- User subscription state/toggle UI
- Saved podcasts listing and filtering
- Continue-listening collection and UI
- Favorite episodes and playlist management (future)
- Library-specific view modes (grid, list, sections)
- Library composition and page lifecycle

**Should NOT Own:**
- Podcast data and logic (consumed from Podcasts feature)
- Episode playback and player state (consumed from Player feature)
- Authentication (consumed from Auth feature)
- Search functionality (consumed from Search feature)
- Audio download logic (consumed from Storage/Offline feature, when implemented)

**Dependency Direction:**
```
Library → Podcasts → Auth
     ↘ Player ↗
     ↘ Search ↗
```

Library is a **consumer** of other features, never a provider. It orchestrates UI presentation of user library data.

---

## 3. Data Sources for Library MVP

### What Library Needs (Data Points)

| Data | Current Status | Backend Ready? | Frontend Ready? |
|------|---|---|---|
| **User's subscribed podcasts** | ❌ No subscription model | No | No |
| **Continue listening (last played episodes)** | ❌ No listening history | No | No |
| **Listening history** | ❌ No history tracking | No | No |
| **Favorite episodes** | ❌ No favorite model | No | No |
| **Downloaded episodes** | ❌ No download model | No | No |
| **Recently played** | ❌ No play log | No | No |
| **Playback position** | ❌ No progress tracking | No | No |

### What DOES Exist Today

✅ **User Authentication State**
- Current user ID available via `useAuthStore()`
- Auth feature fully operational

✅ **Podcast Search & Discovery**
- `GET /api/v1/podcasts?search=...&page=...&limit=...`
- `GET /api/v1/podcasts/:id` with episodes included
- Frontend API integration complete

✅ **Episode Details**
- `GET /api/v1/podcasts/:id/episodes`
- Playlist episode listing exists

✅ **Player State**
- Global Zustand store with current item, queue, playback status
- Playback events can be observed for library history tracking

### Data Modeling Gap

**The critical gap:** No many-to-many relationship between User and Podcast for subscriptions.

```prisma
// MISSING:
model UserSubscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  podcastId String
  podcast   Podcast  @relation(fields: [podcastId], references: [id])
  subscribedAt DateTime @default(now())
  
  @@unique([userId, podcastId])
  @@index([userId])
}

// Also MISSING:
model ListeningHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  episodeId String
  episode   Episode  @relation(fields: [episodeId], references: [id])
  playedAt  DateTime @default(now())
  duration  Int?      // seconds
  position  Int?      // seconds when last paused
  completed Boolean? @default(false)
  
  @@index([userId, playedAt])
}
```

---

## 4. Backend Readiness

### Current API Readiness

#### ✅ Stable & Reusable

- **Podcasts Service** (`apps/api/src/podcasts/podcasts.service.ts`)
  - `findAll()` with search and pagination
  - `findById()` with episodes included
  - All operations already use proper Prisma queries
  - Ready to be called from Library endpoints

- **Episodes Service** (`apps/api/src/episodes/episodes.service.ts`)
  - Episode retrieval by podcast
  - Audio URL exposure already implemented
  - Ready for listening history association

- **Authentication** (`apps/api/src/auth/`)
  - User context injection via `@GetUser()` decorator
  - JWT validation in `JwtAuthGuard`
  - Ready for user-scoped endpoints

#### ❌ Requires Implementation

**User-Scoped Library Endpoints:**

```text
POST   /api/v1/users/:userId/library/:podcastId
       → Subscribe user to podcast
       → Requires: UserSubscription model
       → Returns: { success: true, subscribed: true }

DELETE /api/v1/users/:userId/library/:podcastId
       → Unsubscribe user from podcast
       → Requires: UserSubscription model
       → Returns: { success: true, subscribed: false }

GET    /api/v1/users/:userId/library
       → List all subscribed podcasts with latest episodes
       → Requires: UserSubscription model + populate
       → Returns: { data: [...], pagination: {...} }

GET    /api/v1/users/:userId/continue-listening
       → Resume episodes ranked by recency
       → Requires: ListeningHistory model
       → Returns: { data: [...] }

POST   /api/v1/episodes/:episodeId/listening-history
       → Log listening event (position, completed)
       → Requires: ListeningHistory model
       → Returns: { position: 123, completed: false }
```

### Backend Structure Assessment

**Strengths:**
- Clean separation: Controllers → Services → Prisma
- Auth guard system ready for user scoping
- DTO validation pattern established
- Pagination logic in place

**Gaps:**
- No user-scoped module yet (all current features are global or creator-scoped)
- No listening history or subscription services
- No user profile endpoint that includes library metadata

---

## 5. Frontend Readiness

### ✅ Foundation in Place

**Reusable Patterns (from Search & Player):**
- React Query integration (`useQuery`, `useMutation`, pagination)
- Feature folder structure (`apps/web/src/features/search`)
- API client layer (`apps/web/src/lib/podcasts.ts`)
- State management (`playerStore.ts` for player state)
- UI components (`PodcastCard`, `EpisodeRow`, `SkeletonLoader`, `EmptyState`)
- Loading/error/empty state patterns
- RTL-ready Tailwind layout

**Query Pattern (from Search):**
```typescript
// apps/web/src/lib/podcasts.ts already does this:
export async function getPodcasts(query: GetPodcastsQuery = {}): Promise<PaginatedResponse<Podcast>> {
  return apiFetch<PaginatedResponse<Podcast>>('podcasts', { method: 'GET', query });
}

// Library can follow the same pattern:
export async function getUserLibrary(userId: string, query?: GetLibraryQuery): Promise<PaginatedResponse<Podcast>> {
  return apiFetch<PaginatedResponse<Podcast>>(`users/${userId}/library`, { method: 'GET', query });
}
```

### ❌ Requires Implementation

**Library Feature Boundary:**
```text
apps/web/src/features/library/
  ├── components/
  │   ├── LibraryPage.tsx
  │   ├── SubscribedPodcastsList.tsx
  │   ├── ContinueListeningSection.tsx
  │   └── LibraryTabs.tsx (tabs: subscribed, history, favorites)
  ├── hooks/
  │   ├── useLibrary.ts (wrapper around useQuery)
  │   ├── useSubscribe.ts (mutation for subscribe/unsubscribe)
  │   └── useContinueListening.ts
  ├── types.ts
  └── index.ts
```

**Missing API Layer:**
```typescript
// apps/web/src/lib/library.ts (NEW)
export async function getUserLibrary(userId: string): Promise<...>;
export async function subscribeToPodcast(userId: string, podcastId: string): Promise<...>;
export async function unsubscribeFromPodcast(userId: string, podcastId: string): Promise<...>;
export async function getContinueListening(userId: string): Promise<...>;
```

**Missing Hooks:**
- `useLibrary()` — wrapper around `useQuery` for library data
- `useSubscribe()` — subscribe/unsubscribe mutations
- `useContinueListening()` — listening history queries

### React Query Structure

**Recommended Query Keys:**
```typescript
const libraryKeys = {
  all: ['library'],
  subscribed: (userId: string) => [...libraryKeys.all, 'subscribed', userId],
  history: (userId: string) => [...libraryKeys.all, 'history', userId],
  item: (userId: string, podcastId: string) => [...libraryKeys.subscribed(userId), podcastId],
};

// Usage:
const { data, isLoading } = useQuery({
  queryKey: libraryKeys.subscribed(currentUserId),
  queryFn: () => getUserLibrary(currentUserId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 6. Feature Ownership Rules (Defined)

### Library Feature Owns

| Item | Rationale |
|------|-----------|
| `apps/web/src/features/library/` | Feature-specific UI and composition |
| `/library` route composition | Page lifecycle and data orchestration |
| Subscription toggle UI | User interaction with "Add to Library" |
| Library view modes | Grid, list, sections (how subscribed podcasts are displayed) |
| Continue-listening section | Presentation logic (which episodes show, order) |
| Favorite/playlist toggles | If marking episodes as favorites within library context |

### Library Does NOT Own

| Item | Owner | Rationale |
|------|-------|-----------|
| `Podcast` data and logic | Podcasts feature | Library just displays; Podcasts owns the domain |
| `Episode` playback | Player feature | Library shows resume state, Player owns playback |
| User subscription DB model | Backend Users module | Data layer responsibility |
| Search results | Search feature | Library might link to search, but doesn't own it |
| Audio download | Storage/Offline feature (future) | Download logic separate |
| Authentication | Auth feature | Library consumes `useAuthStore().userId` |

### Dependency Graph

```
┌─────────────────────────────────────┐
│         Library Page (/library)     │ ← Library owns route + composition
└────────┬────────────────────────────┘
         │
         ├─→ Podcasts Feature ────→ Auth ✓ (read-only consumer)
         │     (display subscribed)
         │
         ├─→ Player Store ────────→ Auth ✓ (read playback state)
         │     (display resume status)
         │
         ├─→ Search Feature ──────→ Auth ✓ (link to search)
         │     (find more podcasts)
         │
         └─→ Auth Store ──────────→ Auth ✓ (get current userId)
               (for scoped queries)

No circular dependencies. All directions point inward toward Auth (foundation).
```

---

## 7. Architectural Risks

### 🟠 Data Model Risk — CRITICAL

**Issue:** Library feature will fail without UserSubscription and ListeningHistory models.

**Impact:** Cannot implement MVP without backend support.

**Mitigation:** Phase 3.6 must design and create these models **before** feature implementation.

### 🟡 Coupling Risk — MODERATE

**Issue:** Library shares extensive UI with Podcasts (PodcastCard, pagination, search-like patterns).

**Potential Problem:** If Podcasts feature owns the card, Library cannot style it differently for its context.

**Mitigation:** 
- PodcastCard remains in shared components (generic)
- Library can compose a `LibraryPodcastRow` specific to its layout needs
- Reuse data, not UI components (follow pattern from Search MVP)

### 🟡 State Synchronization Risk — MODERATE

**Issue:** If a user subscribes via Library, and then navigates to Podcasts, subscription state might not sync.

**Potential Problem:** React Query cache invalidation needed after mutations.

**Mitigation:**
```typescript
// After subscribe/unsubscribe mutation succeeds:
queryClient.invalidateQueries({ queryKey: libraryKeys.subscribed(userId) });
queryClient.invalidateQueries({ queryKey: ['podcasts'] }); // If Podcasts shows subscription status
```

### 🟢 Player Interaction — LOW

**Issue:** Library might show "continue listening" episodes; Player owns playback.

**Potential Problem:** If user plays an episode from Library, Player state must update correctly.

**Mitigation:** Player is designed as a global singleton; no special handling needed. Library just loads episode and calls `playerRuntime.loadItem()`.

---

## 8. MVP Scope Recommendation

### Minimum Viable Library (Phase 3.5 Implementation)

#### ✅ Included

**1. Subscribed Podcasts Section**
- List all podcasts user has subscribed to
- Show podcast card with title, artwork, episode count
- Unsubscribe button (toggle)
- Pagination if >12 podcasts
- Empty state: "No subscriptions yet. Go to search to add podcasts."
- Loading state: Skeleton cards

**2. Continue Listening Section**
- Show last 5 episodes from subscribed podcasts that user has started
- Display resume position (progress bar with "Play from 23:45" label)
- Play button goes straight to resume point
- Empty state: "You haven't started listening to any episodes yet."
- 2–3 recent episodes max

**3. Subscribe/Unsubscribe Interaction**
- Heart icon or "Save to Library" button on podcast from Search → adds to Library
- Unsubscribe button in Library removes from list
- Optimistic UI update
- Error toast on failure

**4. Accessibility & RTL**
- ARIA labels for buttons
- Semantic HTML
- RTL-ready (Tailwind logical properties)
- Keyboard navigation

**Data Contract:**
```typescript
GET /api/v1/users/:userId/library
→ {
    data: [{ id, title, description, artworkUrl, episodeCount, ... }],
    pagination: { page, limit, total, totalPages }
  }

GET /api/v1/users/:userId/continue-listening
→ {
    data: [{ episodeId, podcastId, title, position, duration, ... }],
    pagination: { page, limit, total, totalPages }
  }

POST /api/v1/users/:userId/library/:podcastId
→ { success: true }

DELETE /api/v1/users/:userId/library/:podcastId
→ { success: true }
```

#### ❌ Out of MVP Scope (Future)

- Favorites / liked episodes
- Playlists
- Listening history (full timeline)
- Statistics (how many hours listened, etc.)
- Podcast recommendations based on subscriptions
- Download indicators in library
- Advanced filtering (by date, duration, etc.)
- Library sharing
- Sort/filter by custom criteria

#### ❌ Not in Scope (Defer to Phase 3.6+)

- Comments on podcasts (social feature)
- Following podcasters (user-to-user)
- Ratings or reviews
- Notifications for new episodes
- Automatic episode downloads

---

## 9. Current Architecture Compliance

### ✅ Follows MVP-First Development

- Single responsibility: Library is a **view** of user subscriptions, not a generic collection manager
- No over-engineering: No recommendation engine, no suggestion algorithm, no analytics
- Reuses existing patterns: Auth boundary, Podcast consumption, Player interaction

### ✅ Follows Feature Ownership

- Clear boundary: Library owns pages and UI composition
- Does not own: Podcast data, Player logic, Auth mechanisms
- Dependency direction: Inward (Library consumes, never provides)

### ✅ Follows Clean Architecture

- API-first: Endpoints are user-scoped (`/api/v1/users/:userId/library`)
- Transport layer separate: `apps/web/src/lib/library.ts` is just an adapter
- Feature boundary respected: `apps/web/src/features/library/` exists in isolation
- Shared foundation reused: React Query, Tailwind, design system

### ✅ Follows Backend Structure

- NestJS module-based: Users module will own library service
- Service ownership: UserService or dedicated LibraryService handles queries
- Middleware ready: JwtAuthGuard ensures only authenticated users query their library

---

## 10. Gaps & Blockers

### 🔴 CRITICAL BLOCKERS

1. **UserSubscription Model Missing**
   - Without it, no way to persist user → podcast subscriptions
   - Must be created before backend endpoint implementation
   - Estimated effort: 1–2 hours (schema design + migration)

2. **ListeningHistory Model Missing**
   - Without it, "continue listening" feature cannot work
   - Must be created before listening history endpoints
   - Estimated effort: 1–2 hours (schema design + migration)

### 🟠 HIGH PRIORITY

1. **User-Scoped Library Endpoints Not Implemented**
   - GET `/api/v1/users/:userId/library`
   - POST `/api/v1/users/:userId/library/:podcastId`
   - DELETE `/api/v1/users/:userId/library/:podcastId`
   - Estimated effort: 2–4 hours (controller + service)

2. **Listening History Endpoint Not Implemented**
   - POST to log when episode is played/paused
   - GET to retrieve listening history for library
   - Estimated effort: 1–2 hours

### 🟡 MEDIUM PRIORITY

1. **Frontend Feature Folder Not Created**
   - `apps/web/src/features/library/` exists in plans only
   - Will be created in Phase 3.5 implementation
   - Estimated effort: 3–5 hours

2. **React Query Integration**
   - Library hooks need to be written
   - Estimated effort: 1–2 hours

---

## 11. Final Recommendations

### Before Phase 3.5 Implementation, Complete Phase 3.6:

**Phase 3.6 — Library Backend Readiness** (Audit only, no implementation)

1. Design UserSubscription and ListeningHistory Prisma models
2. Document library endpoints contract
3. Identify which Users service or new LibraryService owns operations
4. Estimate backend implementation effort
5. Create Phase 3.6 readiness report

**Then, proceed to Phase 3.5.1 (Backend Implementation):**

1. Create and migrate UserSubscription model
2. Create and migrate ListeningHistory model
3. Implement UserLibraryController and UserLibraryService
4. Implement listening history endpoints
5. Add authorization rules (user can only query own library)

**Then, proceed to Phase 3.5.2 (Frontend Implementation):**

1. Create `apps/web/src/features/library/` folder structure
2. Implement hooks and API client layer
3. Implement Library page and components
4. Add subscribe/unsubscribe mutations
5. Validate against Podcast and Player features

---

## 12. Checklist for Phase 3.5 Go/No-Go

| Item | Status | Notes |
|------|--------|-------|
| **Data Models Defined** | ❌ NO | Requires Phase 3.6 |
| **Backend Endpoints Designed** | ❌ NO | Requires Phase 3.6 |
| **API Contract Documented** | ✅ Partial | Summary in §8, needs full spec |
| **Feature Ownership Clear** | ✅ YES | Documented in §6 |
| **Frontend Structure Ready** | ✅ YES | Route exists, features pattern established |
| **Reusable Components Ready** | ✅ YES | PodcastCard, SkeletonLoader, EmptyState |
| **React Query Ready** | ✅ YES | Integrated in Search/Podcasts |
| **Player Integration Ready** | ✅ YES | Player is global singleton |
| **Risks Identified** | ✅ YES | See §7 |
| **MVP Scope Clear** | ✅ YES | See §8 |

---

## 13. Audit Conclusion

### PROJECT UNDERSTOOD: **YES**

✅ Architecture is well-documented and established via phases 2.5–3.4.
✅ Feature boundaries follow proven patterns (Auth, Podcasts, Episodes, Search, Player).
✅ Ownership model is clear and non-circular.
✅ MVP scope is achievable and minimal.

### LIBRARY READY: **NO**

❌ Backend data models undefined (UserSubscription, ListeningHistory).
❌ Backend endpoints not implemented.
❌ Frontend feature folder not created.
❌ API layer not defined.

### READY FOR ARCHITECTURE DEFINITION: **YES**

✅ All architectural decisions are clear and documented.
✅ Ownership boundaries are well-defined.
✅ Dependency graph is acyclic and minimal.
✅ MVP scope is bounded and realistic.
✅ Risks are identified and mitigations proposed.

**RECOMMENDATION:** Proceed to Phase 3.6 (Library Backend Readiness Audit) to complete data model and endpoint design. Library implementation (phases 3.5.1–3.5.2) can then proceed with confidence.

---

## 14. Next Phase: Phase 3.6

**Phase 3.6 — Library Backend Readiness**

**Objective:** Documentation only.

**Tasks:**
1. Design UserSubscription model with migrations
2. Design ListeningHistory model with migrations
3. Specify all library endpoints (5–6 endpoints total)
4. Define authorization rules and ownership
5. Create implementation plan for Phase 3.5.1 (Backend)
6. Create Phase 3.6 readiness report

**Deliverable:** `docs/reports/phase-3.6-library-backend-readiness-report.md`

---

## Appendix A: API Contract (Draft)

### User Library Endpoints

```
Endpoint: GET /api/v1/users/:userId/library
Method: GET
Auth: Required (JWT)
Query Params: page=1, limit=20, sort=newest
Response:
{
  data: [
    {
      id: string,
      title: string,
      description: string,
      artworkUrl: string,
      rssUrl: string,
      episodeCount: number,
      subscribedAt: ISO8601,
      latestEpisode?: { id, title, publishedAt }
    }
  ],
  pagination: { page, limit, total, totalPages }
}

Endpoint: GET /api/v1/users/:userId/continue-listening
Method: GET
Auth: Required (JWT)
Query Params: limit=10
Response:
{
  data: [
    {
      episodeId: string,
      podcastId: string,
      podcastTitle: string,
      episodeTitle: string,
      position: number,  // seconds
      duration: number,  // seconds
      artworkUrl: string,
      lastPlayedAt: ISO8601
    }
  ]
}

Endpoint: POST /api/v1/users/:userId/library/:podcastId
Method: POST
Auth: Required (JWT)
Body: {}
Response: { subscribed: true, subscribedAt: ISO8601 }

Endpoint: DELETE /api/v1/users/:userId/library/:podcastId
Method: DELETE
Auth: Required (JWT)
Response: { subscribed: false }

Endpoint: POST /api/v1/episodes/:episodeId/listening-history
Method: POST
Auth: Required (JWT)
Body: { position: number, completed?: boolean }
Response: { success: true, position: number }
```

---

## Appendix B: Component Hierarchy (Draft)

```
LibraryPage
├── LibraryTabs (or Sections)
│   ├── SubscribedPodcastsSection
│   │   ├── PodcastCard (from shared)
│   │   ├── UnsubscribeButton (Library-owned)
│   │   └── Pagination
│   │
│   └── ContinueListeningSection
│       ├── EpisodeResumeRow (Library-owned)
│       └── PlayButton
│
└── LoadingState | EmptyState | ErrorState
```

---

**Audit Complete: 2026-07-25**
