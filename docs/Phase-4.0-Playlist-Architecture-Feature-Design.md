# Phase 4.0 — Playlist Architecture & Feature Design

## Executive Summary

این فاز، طرح معماری کامل Feature Playlist را بدون پیاده‌سازی کد ارائه می‌کند. هدف، افزودن Playlist به عنوان یک feature اول-class در Castaminofen است، بدون تغییر در مالکیت فعلی Player، Queue، Library، Search، Auth یا Episode/Podcast. 

معماری پیشنهادی بر اساس اصول موجود پروژه است:
- Feature-based ownership
- Separation of concerns
- Minimal dependency direction
- Preservation of current runtime ownership
- Extensibility برای فازهای آینده

Playlist در این طراحی، مالک اصلی CRUD، metadata، ordering، UI و queries/mutations مربوط به خود خواهد بود. اما هیچ‌وقت مالک runtime پخش، Queue، Player state یا موتور پخش نخواهد بود.

---

## Current Architecture Review

### معماری فعلی پروژه

پروژه در حال حاضر بر پایه‌ی اصول زیر عمل می‌کند:
- Feature-based frontend structure
- Feature ownership در سطح UI و data access
- Player runtime ownership متمرکز در feature Player
- Library به‌عنوان feature presentation-oriented، بدون مالکیت runtime پخش
- Search، Auth، Podcast و Episode هرکدام در مرزهای مشخص خود قرار دارند

### الگوی قابل‌استفاده برای Playlist

Playlist باید از همان الگوی Feature Ownership پیروی کند که برای Library و Player در فازهای قبلی تثبیت شده است:
- Playlist feature مسئول داده، UI، state و mutations مرتبط با خود است
- Playlist از Player فقط از طریق interfaceهای موجود استفاده می‌کند
- Playlist هیچ‌وقت به‌صورت مستقیم با runtime Player یا Queue state برخورد نمی‌کند

### نتیجه‌ی طراحی

Playlist باید یک feature مستقل و کاملاً feature-owned باشد، اما در لبه‌ی همکاری با Player و Queue، از قراردادهای موجود استفاده کند.

---

## Feature Ownership

### Playlist باید مالک باشد

- ایجاد، ویرایش و حذف Playlist
- metadata Playlist مانند عنوان، توضیح، تصویر، visibility، ترتیب
- مدیریت items Playlist
- ordering داخلی آیتم‌ها
- UI مربوط به Playlist
- routes و pages Playlist
- queries و mutations Playlist
- optimistic updates و local UI state مرتبط با Playlist

### Playlist نباید مالک باشد

- Episode CRUD
- Podcast CRUD
- Player runtime
- Queue runtime
- playback state
- repeat/shuffle state
- listening history persistence
- downloads
- search indexing
- authentication
- subscriptions

### Ownership Boundaries

| حوزه | مالک | توضیح |
|---|---|---|
| Playlist CRUD | Playlist | کاملاً feature-owned |
| Playlist UI | Playlist | کاملاً feature-owned |
| Queue state | Player | فقط Player مالک runtime است |
| Playback control | Player | Playlist فقط درخواست پخش می‌دهد |
| Episode metadata | Episodes | Playlist فقط ارجاع می‌کند |
| Podcast metadata | Podcasts | Playlist فقط ارجاع می‌کند |
| Search | Search | Playlist در Search نه در MVP و نه در فاز اولیه مالک نیست |
| Auth | Auth | Playlist فقط نیازمند auth context است |

---

## Backend Architecture

### Backend Module Structure

پیشنهاد ساختار بک‌اند:
- apps/api/src/playlists/
  - playlists.module.ts
  - playlists.controller.ts
  - playlists.service.ts
  - dto/
    - create-playlist.dto.ts
    - update-playlist.dto.ts
    - add-playlist-item.dto.ts
    - remove-playlist-item.dto.ts
    - reorder-playlist-items.dto.ts
    - playlist-response.dto.ts
    - playlist-item-response.dto.ts
  - types/
  - validators/

### Responsibility Boundaries

#### PlaylistController
- دریافت requestها
- اعتبارسنجی سطح HTTP
- تبدیل داده به DTO
- فراخوانی Service
- بازگرداندن response استاندارد
- هیچ منطق business logic ندارد

#### PlaylistService
- انجام منطق Playlist CRUD
- مدیریت رابطه با User و Episode
- مدیریت ordering و unique constraints
- اجرای validation business rules
- اجرای permission checks بر اساس user
- همکاری با Prisma

### Dependency Direction

- Playlist -> User
- Playlist -> Episode
- Playlist -> Prisma
- Playlist -> Player contract only via API layer (not direct runtime dependency)

### Forbidden Dependency Direction

- Player باید به Playlist وابسته نباشد
- Playlist باید به Player وابسته نباشد
- Playlist نباید به Search یا Library برای منطق اصلی خود متکی باشد

---

## Database Design

### Prisma Models

```prisma
model Playlist {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  imageUrl    String?
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       PlaylistItem[]

  @@index([userId, updatedAt])
  @@index([isPublic, updatedAt])
}

model PlaylistItem {
  id          String   @id @default(cuid())
  playlistId  String
  episodeId   String
  position    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  playlist    Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  episode     Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)

  @@unique([playlistId, episodeId])
  @@unique([playlistId, position])
  @@index([playlistId, position])
  @@index([episodeId])
}
```

### Why Each Field Exists

- id: identifier اصلی برای Playlist و PlaylistItem
- userId: مالکیت Playlist را به کاربر مرتبط می‌کند
- title: عنوان اصلی Playlist
- description: اطلاعات متا و UX بهتر
- imageUrl: آینده‌ی cover، branding و preview
- isPublic: پشتیبانی از فازهای آینده public/shared playlists
- createdAt/updatedAt: audit و UI state management
- deletedAt: آماده‌سازی برای soft-delete در آینده
- playlistId/episodeId: رابطه‌ی مستقیم میان Playlist و Episode
- position: ترتیب داخلی آیتم‌ها

### Ordering Strategy

ترتیب آیتم‌ها بر اساس field position حفظ می‌شود. این انتخاب به‌خاطر:
- reorder ساده
- عدم وابستگی به timestamp برای ترتیب
- پشتیبانی برای drag-drop و bulk actions در آینده

### Unique Constraints

- هر episode فقط یک‌بار در یک Playlist می‌تواند وجود داشته باشد
- هر position در یک Playlist باید یکتا باشد

### Cascade Behavior

- حذف Playlist → تمام PlaylistItemهای آن حذف شوند
- حذف Episode → آیتم‌های مرتبط از Playlist حذف شوند
- حذف User → Playlistهای کاربر حذف شوند

### Index Strategy

- index روی userId + updatedAt برای list queries کاربر
- index روی isPublic + updatedAt برای آینده‌ی public playlists
- index روی playlistId + position برای reorder و fetch ordered items

---

## REST API Design

### Endpoints

#### GET /playlists
- دریافت لیست Playlistهای کاربر
- Response: array of PlaylistResponseDto
- Status: 200

#### GET /playlists/:id
- دریافت جزئیات یک Playlist با items
- Response: PlaylistDetailResponseDto
- Status: 200 / 404

#### POST /playlists
- ایجاد Playlist جدید
- Request: CreatePlaylistDto
- Response: PlaylistResponseDto
- Status: 201

#### PATCH /playlists/:id
- ویرایش title/description/image/isPublic
- Request: UpdatePlaylistDto
- Response: PlaylistResponseDto
- Status: 200 / 404

#### DELETE /playlists/:id
- حذف Playlist
- Status: 204

#### POST /playlists/:id/items
- افزودن اپیزود به Playlist
- Request: AddPlaylistItemDto
- Response: PlaylistItemResponseDto
- Status: 201

#### DELETE /playlists/:id/items/:episodeId
- حذف اپیزود از Playlist
- Status: 200 / 204

#### PATCH /playlists/:id/items/reorder
- بازآرایی آیتم‌ها
- Request: ReorderPlaylistItemsDto
- Response: PlaylistDetailResponseDto
- Status: 200

### DTO Structure

#### CreatePlaylistDto
- title: string
- description?: string
- imageUrl?: string
- isPublic?: boolean

#### UpdatePlaylistDto
- title?: string
- description?: string
- imageUrl?: string
- isPublic?: boolean

#### AddPlaylistItemDto
- episodeId: string

#### ReorderPlaylistItemsDto
- items: Array<{ episodeId: string; position: number }>

#### PlaylistResponseDto
- id
- title
- description
- imageUrl
- isPublic
- itemCount
- createdAt
- updatedAt

#### PlaylistItemResponseDto
- id
- episodeId
- position
- episodeTitle
- podcastTitle
- artworkUrl
- duration
- createdAt

### Authorization Expectations

- همه‌ی endpoints باید برای authenticated user در دسترس باشند
- هر Playlist فقط به مالک آن دسترسی دارد مگر در آینده public/shared playlists فعال شود
- ownership check باید در Service انجام شود

---

## Frontend Architecture

### Frontend Feature Structure

پیشنهاد ساختار در فرانت‌اند:

```text
apps/web/src/features/playlists/
├── components/
├── hooks/
├── types/
├── utils/
├── index.ts
```

### Responsibilities

#### components/
- PlaylistPage
- PlaylistList
- PlaylistCard
- PlaylistHeader
- PlaylistEpisodeList
- PlaylistEmptyState
- PlaylistLoadingState
- PlaylistErrorState
- PlaylistActionBar
- PlaylistItemRow

#### hooks/
- usePlaylists
- usePlaylist
- useCreatePlaylist
- useUpdatePlaylist
- useDeletePlaylist
- useAddPlaylistItem
- useRemovePlaylistItem
- useReorderPlaylistItems
- usePlaylistPlayback

#### types/
- Playlist
- PlaylistItem
- PlaylistFormValues
- PlaylistQueryParams
- PlaylistMutationResult

#### utils/
- playlist-sort
- playlist-item-helpers
- playlist-route-helpers
- playlist-state-formatters

#### index.ts
- export سطح feature
- نگهداری barrel exports برای استفاده ساده‌تر در app

### Ownership Principle

کامپوننت‌های Playlist فقط مسئول UI و composition مرتبط با Playlist باشند. هیچ کامپوننت Playlist نباید خود runtime Player را مدیریت کند.

---

## Folder Structure

```text
apps/web/src/features/playlists/
├── components/
├── hooks/
├── types/
├── utils/
└── index.ts
```

در کنار این، route-level composition در app/ باید به‌صورت feature-owned نگهداری شود، بدون ساخت componentهای غیرضروری در root-level folders.

---

## Route Design

### Suggested Routes

- /playlists
  - صفحه‌ی لیست Playlistها
  - ownership: Playlist feature

- /playlists/:id
  - صفحه‌ی جزئیات Playlist
  - ownership: Playlist feature

- /new-playlist (optional)
  - فرم ساخت Playlist جدید
  - ownership: Playlist feature

### Route Ownership

- تمام این routeها در feature Playlist مدیریت می‌شوند
- هر route باید فقط composition و navigation ارائه دهد
- منطق داده و mutation در feature hooks و services قرار گیرد

---

## React Query Strategy

### Query Keys

- ['playlists']
- ['playlist', id]
- ['playlist', id, 'items']

### Ownership

- React Query cache متعلق به Playlist feature است
- cache باید توسط Playlist hooks مدیریت شود
- Playlist نباید یک cache جداگانه برای Player یا Library ایجاد کند

### Invalidation Strategy

- بعد از create/update/delete playlist → invalidate ['playlists']
- بعد از add/remove/reorder item → invalidate ['playlist', id] و ['playlist', id, 'items']
- در صورت نیاز، invalidate related list views

### Optimistic Updates

- create/update/delete playlist
- add/remove reorder items

### Mutation Strategy

- mutationها در Playlist feature owned هستند
- Player فقط در زمان play action از Playlist استفاده می‌کند
- هیچ mutationی برای playback runtime در Playlist feature قرار نمی‌گیرد

---

## State Strategy

### Local State

برای موارد زیر:
- form state
- dialog open/close
- temporary reorder UI
- local selection

### React Query

برای داده‌های سرور و cache playlist:
- playlists list
- single playlist detail
- playlist items

### URL State

برای موارد زیر:
- selected filter
- current playlist view
- optional route-based modal/query param

### Global State

Playlist نباید یک Zustand store جدید معرفی کند. دلیل اصلی:
- Playlist state در سطح feature و server-driven است
- Player state و Queue state باید در ownership فعلی Player باقی بماند
- افزودن store جدید، complexity و maintenance cost را افزایش می‌دهد

### Why No New Zustand Store

- منطق Playlist بیشتر query-driven و feature-scoped است
- stateهای سراسری موجود برای Player و auth کافی هستند
- new global store برای Playlist فقط در صورتی justified است که نیاز به cross-feature collaboration واقعی وجود داشته باشد؛ در این طراحی چنین نیازی وجود ندارد

---

## Player Integration

### Allowed Integration

Playlist می‌تواند با Player همکاری کند به‌صورت زیر:
- request playback
- replace queue
- play all items
- play from selected episode

### Not Allowed Ownership

Playlist نباید مالک باشد:
- runtime playback
- queue engine
- playback state
- repeat/shuffle
- audio element lifecycle
- media-session handling

### Integration Contract

Playlist فقط یک action یا request به Player می‌فرستد، مثلاً:
- playPlaylist({ playlistId, startEpisodeId })
- playPlaylistItems({ items, mode: 'replace' })

Player مسئول اجرای واقعی این request است.

---

## Queue Integration

### Play Playlist
- Playlist یک list از items را به Player می‌دهد
- Player queue را replace می‌کند
- playback از episode انتخاب‌شده شروع می‌شود

### Play Next
- Playlist می‌تواند یک episode را به queue فعلی اضافه کند
- ownership: Player

### Replace Queue
- Playlist فقط درخواست replace queue را می‌دهد
- ownership: Player

### Append Queue
- Playlist می‌تواند از طریق Player action append queue استفاده کند
- ownership: Player

### Ownership Clarification

- Playlist: prepares the playback intent and item order
- Player: executes queue and playback runtime

---

## Library Integration

### Boundary Design

Library و Playlist باید جدا باشند:
- Library مسئول presentation of saved/subscribed/continue-listening content
- Playlist مسئول collection و ordering user-defined lists

### What Library Should Not Own

- Playlist CRUD
- Playlist state
- Playlist sorting logic
- Playlist mutation flow

### What Playlist Should Not Own

- subscriptions
- library-specific data model
- continue-listening logic

### Integration Model

در آینده، Library می‌تواند یک entry point به Playlist ارائه دهد، مثلاً button “Add to Playlist” یا preview of playlists، اما مالکیت داده و runtime در Playlist باقی می‌ماند.

---

## Search Integration

### Initial Position

Search در MVP Playlist را بازنمی‌گرداند.

### Future Compatibility

در آینده، Search می‌تواند با یک افزونه‌ی ساده از نوع result type یا facet برای Playlist پشتیبانی کند، بدون اینکه Playlist به Search ownership بدهد. این طراحی باعث می‌شود:
- Search unchanged remains
- Playlist feature remains independent
- future compatibility without architectural drift

---

## UI Composition

### Playlist Page
- مسئول نمایش list of playlists
- ownership: Playlist feature

### Playlist Details
- نمایش metadata و items
- ownership: Playlist feature

### Playlist Header
- title، actions، play button، rename/delete actions
- ownership: Playlist feature

### Episode List
- نمایش items با ترتیب مشخص
- ownership: Playlist feature

### Empty State
- نمایش وقتی Playlist خالی است
- ownership: Playlist feature

### Loading State
- نمایش برای initial fetch
- ownership: Playlist feature

### Error State
- نمایش خطاهای query/mutation
- ownership: Playlist feature

### Action Bar
- play all، add episode، reorder، delete
- ownership: Playlist feature

### Section Ownership Summary

- Page and layout: Playlist feature
- Data fetching: Playlist hooks
- Runtime control: Player feature
- Shared UI primitives: shared/components

---

## Accessibility

### Expectations

- همه‌ی actions از طریق keyboard قابل دسترسی باشند
- buttonها label واضح داشته باشند
- focus state برای list items، dialogs و action buttons حفظ شود
- semantic headings و landmarks استفاده شوند
- screen reader برای empty/loading/error states پیام مناسب ارائه دهد
- reorder UX در آینده باید keyboard-accessible باشد

### Recommended Patterns

- use semantic button elements
- use aria-label for icon-only actions
- use list semantics for playlist items
- use aria-live for dynamic updates such as reorder or mutation feedback

---

## Responsive Strategy

### Mobile
- لیست Playlistها و items به‌صورت vertical stack
- action bar sticky یا bottom-safe
- play button و add/remove actions ساده و دسترس‌پذیر

### Tablet
- layout دو ستون برای overview + detail در صورت نیاز
- فضای بیشتر برای action buttons و metadata

### Desktop
- list و detail به‌صورت هم‌زمان قابل نمایش باشند
- sidebar یا split view برای مدیریت playlists و content

---

## Future Compatibility

معماری پیشنهادی باید برای موارد زیر آماده باشد:
- Favorites
- Smart Playlists
- Collaborative Playlists
- Public Playlists
- Private Playlists
- Playlist Sharing
- Offline Playlists
- Downloads
- Drag & Drop Reordering
- Bulk Actions

### Extensibility Strategy

- مدل Playlist و PlaylistItem به‌صورت قابل‌گسترش طراحی شده‌اند
- isPublic و metadata fields برای future visibility features آماده‌اند
- position-based ordering برای reorder و drag-drop مناسب است
- Playlist feature به‌صورت مستقل باقی می‌ماند و در آینده بدون بازنویسی کل سیستم توسعه می‌یابد

---

## Risk Assessment

### Architecture Risks

- risk: accidental ownership drift از Playlist به Player
- mitigation: strict boundary doc و contracts

### Ownership Risks

- risk: Playlist شروع به مدیریت queue runtime کند
- mitigation: Player remains sole runtime owner; Playlist only sends requests

### State Risks

- risk: duplicated state between React Query و Zustand
- mitigation: no new Zustand store; use React Query + local state only

### Performance Risks

- risk: large playlist item lists causing unnecessary re-renders
- mitigation: pagination, selective query keys, small list components

### Caching Risks

- risk: stale playlist item order after reorder
- mitigation: invalidate relevant keys immediately and use optimistic updates

### Future Maintenance Risks

- risk: feature grows into a monolith
- mitigation: keep feature boundaries, isolate hooks/components/utils, preserve simple API contract

---

## Final Recommendation

Playlist باید به‌عنوان یک feature مستقل و feature-owned طراحی شود که:
- CRUD و UI خود را در اختیار داشته باشد
- از Player فقط برای playback intent و queue interaction استفاده کند
- از Library و Search به‌صورت مستقل و بدون ownership overlap عمل کند
- از React Query و local state برای state management استفاده کند
- بدون ایجاد Zustand store جدید و بدون تغییر در runtime ownership فعلی، به‌سرعت در معماری موجود ادغام شود

این طراحی، تعادل مناسبی بین ساده‌سازی MVP و آماده‌سازی برای توسعه‌ی آینده فراهم می‌کند.

---

ARCHITECTURE COMPLETED: YES

FEATURE OWNERSHIP VERIFIED: YES

READY FOR VALIDATION: YES

READY FOR PHASE 4.1: YES
