# Phase 4.0.1 — Playlist Architecture Validation

## Executive Summary

بررسی معماری پیشنهادی Playlist در برابر ساختار فعلی ریپو نشان می‌دهد که این طراحی با اصول مالکیت Feature در Castaminofen سازگار است و هیچ انحراف معماری جدی ایجاد نمی‌کند. طراحی پیشنهادی، Playlist را به‌عنوان یک feature مستقل و feature-owned نگه می‌دارد، در حالی که مالکیت Player runtime، Queue، Library، Podcast، Episode، Search و Auth در مرزهای فعلی باقی می‌ماند.

نتیجه‌ی اصلی:
- طراحی Playlist با معماری فعلی هم‌خوانی دارد.
- هیچ تغییر لازم در ساختار فعلی برای شروع پیاده‌سازی دیده نمی‌شود.
- پیاده‌سازی باید فقط در حد Playlist CRUD، metadata، ordering، UI و queries/mutations باقی بماند و از Player/Queue runtime به‌صورت مستقیم جدا شود.

---

## Backend Validation

### Module Boundaries
طرح پیشنهادی برای پوشه‌ی backend در مسیر apps/api/src/playlists/ با ساختار feature-based فعلی پروژه سازگار است. این مسیر با الگوی موجود برای podcasts، episodes، library و users هم‌خوانی دارد.

### Controller Responsibilities
Controller پیشنهادی باید مسئولیت‌های زیر را داشته باشد:
- دریافت درخواست HTTP
- تبدیل داده به DTO
- فراخوانی Service
- بازگرداندن پاسخ استاندارد

این سطح از مسئولیت با الگوی فعلی در controllers موجود، به‌ویژه podcasts و episodes، سازگار است. هیچ منطق کسب‌وکار نباید در Controller قرار گیرد.

### Service Responsibilities
Service باید مالک منطق کسب‌وکار Playlist باشد:
- CRUD Playlist
- مدیریت آیتم‌های Playlist
- validation منطق کسب‌وکار
- permission checks بر اساس user
- مدیریت ordering و unique constraints
- تعامل با Prisma

این الگو با ساختار فعلی backend هم‌راستا است.

### DTO Organization
ساختار DTOهای پیشنهادی شامل create/update/add/remove/reorder و response DTOها با الگوی موجود در پروژه سازگار است. این رویکرد با DTOهای podcasts و episodes تطابق دارد.

### Validation Layer
اعتبارسنجی باید با class-validator و ValidationPipe سراسری در main.ts انجام شود. این روش در کد فعلی بالفعل استفاده می‌شود و برای Playlist نیز مناسب است.

### Dependency Direction
جهت‌وابستگی پیشنهادی صحیح است:
- Playlist -> User
- Playlist -> Episode
- Playlist -> Prisma

وابستگی مستقیم به Player، Queue، Library، Search یا Auth برای منطق اصلی Playlist نباید ایجاد شود. این مورد با معماری فعلی و مستندات project rules سازگار است.

### Ownership Rules
- User و Episode به‌عنوان owners خارجی باقی می‌مانند.
- Playlist Service مالک منطق Playlist است، نه مالک runtime پخش.
- Prisma فقط لایه‌ی persistence است و نه مالک منطق کسب‌وکار.

نتیجه: طراحی backend از نظر مرزها و جهت‌وابستگی مناسب است.

---

## Prisma Validation

### Model Compatibility
مدل‌های پیشنهادی Playlist و PlaylistItem با مدل‌های موجود in Prisma فعلی سازگارند. رابطه‌ی Playlist به User و PlaylistItem به Playlist و Episode، با ساختار فعلی project consistent است.

### Relations
- Playlist باید به User مربوط شود.
- PlaylistItem باید به Playlist و Episode مرتبط شود.

این رابطه‌ها با مدل‌های موجود User، Podcast و Episode در schema فعلی هماهنگ است.

### Foreign Keys
استفاده از foreign keys مستقیم برای playlistId، episodeId و userId از نظر معماری صحیح است و با الگوی Prisma موجود در پروژه سازگار است.

### Indexes
ایندکس‌های پیشنهادی برای:
- userId + updatedAt
- isPublic + updatedAt
- playlistId + position

مناسب‌اند و برای queryهای آینده‌ی list/search و reorder مفید خواهند بود.

### Unique Constraints
- uniqueness روی (playlistId, episodeId): برای جلوگیری از تکرار آیتم در یک Playlist مناسب است.
- uniqueness روی (playlistId, position): برای جلوگیری از تداخل ordering مناسب است.

### Cascade Behavior
- حذف Playlist → حذف PlaylistItemهای آن: مناسب است.
- حذف Episode → حذف آیتم‌های مرتبط: مناسب است.
- حذف User → حذف Playlistهای کاربر: مناسب است.

این رفتار با الگوی موجود در schema فعلی برای UserSubscription و ListeningHistory هم‌خوانی دارد.

### Ordering Strategy
استفاده از field position برای ترتیب آیتم‌ها منطقی است و برای reorder، drag-drop و bulk actions آینده مناسب است.

### Soft-delete Compatibility
وجود deletedAt در طراحی پیشنهاد شده با مفهوم soft-delete آینده سازگار است. این اضافه شدن بدون ایجاد تضاد با schema فعلی انجام می‌شود.

### Future Extensibility
فیلدهای مثل isPublic، imageUrl، description برای آینده‌ی public/shared playlists و UI بهتر مناسب‌اند.

نتیجه: Prisma design از نظر schema، relations و constraints مشکلی ندارد.

---

## REST API Validation

### Endpoint Naming
endpointها با الگوی موجود در پروژه سازگارند:
- GET /playlists
- GET /playlists/:id
- POST /playlists
- PATCH /playlists/:id
- DELETE /playlists/:id
- POST /playlists/:id/items
- DELETE /playlists/:id/items/:episodeId
- PATCH /playlists/:id/items/reorder

این نام‌گذاری RESTful و با سبک فعلی پروژه هماهنگ است.

### REST Conventions
استفاده از resource-based routes و HTTP verbs استاندارد با الگوی ساختار فعلی هم‌خوانی دارد.

### DTO Consistency
استفاده از DTOهای جداگانه برای create/update/add/remove/reorder و responseها با الگوی موجود در backend سازگار است.

### Authorization Expectations
درخواست‌های Playlist باید با JwtAuthGuard و GetUser('id') محافظت شوند. این سبک با کنترلرهای Auth، Podcasts، Episodes و Library در حال حاضر یکسان است.

### Ownership
Playlist باید فقط داده‌های خود را مدیریت کند و به‌صورت مستقیم به مالکیت کاربر محدود شود. این اصل با مدل User-owned resource در پروژه سازگار است.

### Response Structure
پاسخ‌ها باید با ساختار استاندارد API و controller pattern فعلی یکسان باشند. این طراحی بدون نیاز به بازطراحی API قابل پیاده‌سازی است.

نتیجه: طراحی REST API مناسب و با سبک پروژه هم‌خوان است.

---

## Frontend Validation

### Feature Structure
پیشنهاد ساختار apps/web/src/features/playlists/ با الگوی feature-based فعلی پروژه سازگار است. این ساختار مشابه Library و Player است و به‌خوبی با feature ownership model هماهنگ می‌شود.

### Expected Internal Organization
پیشنهاد شامل:
- components
- hooks
- types
- utils
- index.ts

این ساختار با الگوی فعلی در Library و Player سازگار است و از ایجاد ساختارهای root-level غیرضروری جلوگیری می‌کند.

### Ownership Fit
Playlist به‌عنوان یک feature مستقل، مالک UI، data hooks، queries و mutations خود خواهد بود. این رویکرد با یافته‌های فعلی در Library و Player هم‌خوان است.

نتیجه: Frontend feature architecture مناسب است.

---

## Route Validation

### Proposed Routes
- /playlists
- /playlists/:id
- optional create page

این مسیرها با App Router فعلی سازگارند و در همان الگوی page-based current app قرار می‌گیرند.

### App Router Compatibility
استفاده از routeهای ساده و composable با Next.js App Router فعلی سازگار است.

### ProtectedRoute Usage
اگر صفحات Playlist نیاز به دسترسی کاربر واردشده داشته باشند، استفاده از ProtectedRoute با الگوی صفحه‌های podcasts، episodes و library سازگار است.

### AppShell Compatibility
Playlist pages می‌توانند در AppShell فعلی render شوند بدون نیاز به تغییر معماری shell.

### BottomNavigation Compatibility
اگر Playlist در navigation دیده شود، باید به‌صورت افزودنی و بدون تغییر ساختار shell انجام شود. این تغییر، یک extension ساده است و باعث drift نمی‌شود.

نتیجه: طراحی route مناسب و بدون نیاز به redesign است.

---

## Feature Ownership Validation

### Playlist Should Own
- Playlist CRUD
- Playlist metadata
- Playlist ordering
- Playlist UI
- Playlist queries
- Playlist mutations
- Playlist presentation

### Playlist Should Not Own
- Player runtime
- Queue runtime
- playback state
- Podcast logic
- Episode logic
- Search
- Library subscriptions
- Auth logic

این مرزها در طراحی پیشنهادی روشن و قابل‌قبول‌اند. Playlist فقط در لبه‌ی همکاری با Player، از طریق intentهای پخش (play/queue/append) عمل می‌کند؛ نه مالک runtime پخش.

نتیجه: مالکیت Feature به‌خوبی حفظ شده است.

---

## React Query Validation

### Expected Query Keys
طرح پیشنهادی با query keys زیر با سبک فعلی پروژه سازگار است:
- ['playlists']
- ['playlist', id]
- ['playlist', id, 'items']

### Cache Ownership
کش Playlist باید feature-scoped باشد و در scope خود باقی بماند. این روش با الگوی فعلی useQuery در Library و Podcasts سازگار است.

### Invalidation Strategy
درvalidation باید به‌صورت feature-local انجام شود و از invalidateQueries مربوط به Playlist استفاده کند. این رویکرد از تداخل با Library، Search و Player جلوگیری می‌کند.

### Optimistic Updates
Optimistic updates در سطح hooks Playlist قابل‌قبول است، اما باید به‌صورت محدود و feature-local انجام شود.

نتیجه: React Query strategy مناسب و بدون drift است.

---

## State Validation

### Local Component State
state محلی برای فرم‌ها، UI interaction و transient interactionها مناسب است.

### React Query
برای data و server state، React Query مناسب است.

### URL State
برای page/filters/selectionهای ساده، state در URL یا route params قابل استفاده است.

### Global State
نیازی به Zustand store جدید برای Playlist وجود ندارد. این موضوع با معماری فعلی Player/Library هم‌خوانی دارد.

نتیجه: ownership state واضح و مناسب است.

---

## Player Integration Validation

Playlist باید فقط انجام دهد:
- درخواست پخش
- درخواست replace queue
- درخواست append queue
- درخواست play-all

Playlist نباید مالک باشد:
- runtime
- queue lifecycle
- playback state
- repeat/shuffle
- media session
- audio engine

این قسمت با معماری فعلی Player کاملاً سازگار است. Player باید تک مالک runtime باقی بماند.

نتیجه: در لبه‌ی همکاری با Player، مرز مالکیت حفظ می‌شود.

---

## Queue Validation

Playlist فقط باید intent پخش را آماده کند؛ Queue lifecycle، order و execution باید توسط Player مدیریت شوند. این رویکرد با معماری فعلی Queue و Player سازگار است.

نتیجه: Queue ownership حفظ می‌شود.

---

## Library Validation

Library باید مستقل بماند و Playlist نباید مالک Library subscriptions یا continue listening باشد. این مرز در طراحی پیشنهادی روشن است و با معماری فعلی Library هم‌خوانی دارد.

نتیجه: overlap ownership ایجاد نمی‌شود.

---

## Search Validation

Search در این طراحی دست‌نخورده باقی می‌ماند. Playlist نباید به Search به‌عنوان یک dependency اصلی یا مالک برای منطق خود متکی شود. این موضوع با مرز فعلی Search سازگار است.

نتیجه: Search ownership بدون تغییر باقی می‌ماند.

---

## UI Composition Validation

اجزای پیشنهادی مثل:
- PlaylistPage
- PlaylistHeader
- PlaylistList
- PlaylistCard
- PlaylistEpisodeList
- PlaylistActionBar
- Loading
- Empty
- Error

در صورتی که business logic در hooks و presentation در components نگه داشته شوند، با الگوی فعلی Library/Player سازگار خواهند بود.

نتیجه: این بخش از طراحی مناسب است، مشروط بر اینکه logic در hooks بماند.

---

## Accessibility Validation

طراحی Playlist باید برای دسترسی‌پذیری شامل موارد زیر باشد:
- keyboard navigation
- semantic headings
- aria labels
- list semantics
- focus management
- screen reader support

این موارد با استانداردهای فعلی پروژه و UI foundation سازگار است و در پیاده‌سازی بعدی باید رعایت شوند.

نتیجه: از نظر معماری، مانعی برای دسترسی‌پذیری وجود ندارد.

---

## Responsive Validation

پیشنهاد Playlist با ساختار mobile-first فعلی سازگار است. چون AppShell و MobileContainer از قبل وجود دارند، این feature بدون نیاز به redesign برای mobile/tablet/desktop قابل اجراست.

نتیجه: استراتژی responsive با معماری فعلی سازگار است.

---

## Future Compatibility Validation

طرح پیشنهادی برای قابلیت‌های آینده مثل:
- Favorites
- Smart Playlists
- Public/Private Playlists
- Sharing
- Offline
- Downloads
- Drag & Drop
- Bulk Actions

قابل‌قبول و بدون block معماری است. این طراحی به‌خوبی مرزهای فعلی را حفظ می‌کند و به‌صورت تدریجی قابل توسعه است.

نتیجه: هیچ blocker آینده‌ای در معماری دیده نمی‌شود.

---

## Risk Assessment

### Risk 1 — Medium
- Description: اگر Playlist به‌اشتباه به‌طور مستقیم به Player runtime یا Zustand store Player دسترسی پیدا کند، ownership drift ایجاد می‌شود.
- Impact: تداخل مالکیت، وابستگی‌های حلقوی و دشوار شدن نگهداری.
- Mitigation: Playlist فقط از قراردادهای موجود برای درخواست پخش/queue استفاده کند و از direct runtime dependency خودداری کند.

### Risk 2 — Low
- Description: اگر reorder و duplicate prevention فقط در UI انجام شود، ordering و consistency در backend دچار مشکل می‌شود.
- Impact: موقعیت‌های نامنظمی در لیست، رفتار غیرقابل‌پیش‌بینی و مشکلات UX.
- Mitigation: unique constraints و service-level reorder enforcement در backend اعمال شود.

### Risk 3 — Low
- Description: اگر Playlist pages به‌جای استفاده از ProtectedRoute، به‌صورت مستقیم در دسترس کاربر غیرمجاز قرار گیرند، مرز Auth و feature ownership مخدوش می‌شود.
- Impact: inconsistency در auth experience و عدم تطابق با الگوی فعلی.
- Mitigation: از ProtectedRoute و auth pattern فعلی استفاده شود.

---

## Minimal Safe Fixes (if any)

هیچ اصلاح معماری حداقلی و بحرانی لازم نبود. هیچ تغییر کد تولیدی، هیچ تغییر فایل منبع و هیچ اصلاح runtime در این بررسی انجام نشد.

تنها نکته‌ی اجرایی که باید در پیاده‌سازی بعدی رعایت شود:
- Playlist باید feature-owned باقی بماند و collaborator با Player فقط از طریق قراردادهای موجود انجام شود.

---

## Final Recommendation

پیشنهاد Playlist در Phase 4.0 از نظر معماری با ساختار فعلی Castaminofen سازگار است و می‌توان آن را به‌عنوان یک طراحی قابل‌قبول برای ورود به مرحله‌ی پیاده‌سازی در نظر گرفت.

پیشنهاد نهایی:
- Proceed with implementation.
- Keep Playlist scoped to its own CRUD/UI/query/mutation responsibilities.
- Preserve Player as the sole runtime owner.
- Preserve current ownership boundaries for Library, Search, Podcast, Episode, and Auth.
