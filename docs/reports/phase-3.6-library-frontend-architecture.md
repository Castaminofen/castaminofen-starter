---
title: Phase 3.6 — Library Frontend Architecture & Feature Design
date: 2026-07-26
phase: 3.6
status: ARCHITECTURE_COMPLETE
tag: v0.4.0
---

# Phase 3.6 — Library Frontend Architecture & Feature Design

## Executive Summary

این مستند طراحی کامل frontend برای feature `Library` را ارائه می‌دهد. هدف اصلی، تعریف مالکیت و چرخش‌های معماری بدون پیاده‌سازی یا refactor است. طرح پیشنهادی بر اساس ساختار موجود `apps/web/src`، route `/library` فعلی، patternهای auth/protected route، React Query و Zustand موجود تنظیم شده است.

نتیجه این است که Library باید یک feature کاملاً مصرف‌کننده باشد که:
- route و صفحه‌ی `/library` را مالکیت می‌کند
- user-specific library data را از backend واکشی می‌کند
- UI Library را می‌سازد ولی playback، podcast data و auth را کنترل نمی‌کند
- به جای zustand برای content state از React Query استفاده می‌کند

## Current Architecture Review

### Frontend وضعیت فعلی

- route `/library` در `apps/web/src/app/library/page.tsx` وجود دارد و به‌صورت placeholder نمایش داده می‌شود.
- bottom navigation فعلی `apps/web/src/components/layout/bottom-navigation.tsx` شامل لینک `/library` است.
- هیچ `features/library` فعلی در `apps/web/src/features` موجود نیست.
- auth guard موجود است و `ProtectedRoute` در `apps/web/src/features/auth/components/ProtectedRoute.tsx` پیاده‌سازی شده است.
- React Query در سراسر پروژه با provider مرکزی در `apps/web/src/providers/react-query-provider.tsx` و config در `apps/web/src/shared/lib/react-query.ts` استفاده می‌شود.
- Podcast feature از query keys مجزا (`['podcasts']`, `['podcast', id]`) و mutation invalidation استفاده می‌کند.
- Player feature در `apps/web/src/features/player` state global را با Zustand نگه می‌دارد.

### Feature ownership patterns

- auth: session state، login/register، protected route
- podcasts: podcast listing، podcast detail و podcast CRUD
- episodes: episode detail، episode form و upload
- search: search query و results presentation
- player: playback runtime، queue، current item

این الگو نشان می‌دهد که Library باید به‌صورت consumer طراحی شود و از سایر featureها سرویس بگیرد.

## Feature Ownership

### Library should own

- route page و route composition برای `/library`
- user-specific library UI و صفحه‌بندی‌های وابسته
- fetch و نمایش `subscriptions` و `continue listening`
- library-specific actionها مثل subscribe/unsubscribe و update listening progress
- local UI state مربوط به library page (tab selection، view mode، section collapsed state)
- presentation wrappers برای podcast/episode items در context library
- empty/loading/error states مخصوص library

### Library must never own

- auth state یا auth guard logic
- podcast CRUD logic و podcast data production
- episode playback engine یا playback queue
- global playback state (current item، isPlaying، queue)
- search indexing یا search result management
- offline download persistence
- storage/upload logic

### Dependency directions

```
Library → Auth
Library → Podcasts
Library → Episodes
Library → Player
Library → Search
```

Library تنها مصرف‌کننده است؛ داده‌های podcast/episode را مصرف می‌کند اما logic آن‌ها را تولید نمی‌کند.

## Folder Structure

پیشنهاد ساختار کامل feature-owned برای Library:

```text
apps/web/src/features/library/
├── components/
│   ├── library-page.tsx
│   ├── sections/
│   │   ├── continue-listening-section.tsx
│   │   ├── subscriptions-section.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-state.tsx
│   │   └── error-state.tsx
│   ├── library-podcast-card.tsx
│   └── library-episode-row.tsx
├── hooks/
│   ├── useLibraryOverview.ts
│   ├── useLibrarySubscriptions.ts
│   ├── useContinueListening.ts
│   ├── useSubscribePodcast.ts
│   ├── useUnsubscribePodcast.ts
│   └── useUpdateListeningHistory.ts
├── types/
│   └── library.ts
├── utils/
│   └── library-mappers.ts
└── index.ts
```

### نکات ساختار

- `app/library/page.tsx` باید فقط route composition باشد و view/container را از `features/library` وارد کند.
- API contract و client می‌تواند در `apps/web/src/lib/library.ts` یا `apps/web/src/lib` مشترک تعریف شود، اما query hooks و UI ownership در `features/library` باقی می‌مانند.
- componentهای generic UI مانند `Card`، `PageState`، `Skeleton` در `components/` یا `shared/` استفاده می‌شوند، اما library-specific wrappers در `features/library/components` نگهداری می‌شوند.

## Route Design

### Route ownership

- `/library` متعلق به feature `Library` است.
- route page باید در `apps/web/src/app/library/page.tsx` تعریف شود و view/container را از feature استفاده کند.
- page باید user-specific باشد و با auth فراخوانی شود.

### Layout ownership

- هیچ layout جدید app-level لازم نیست؛ `Library` از `app/layout.tsx` و `AppShell` موجود استفاده می‌کند.
- در صورت نیاز به nested library routes در آینده، می‌توان `apps/web/src/app/library/layout.tsx` اضافه کرد و آن را به library feature مالکیت داد.
- برای MVP، layout اصلی از `AppShell` و `BottomNavigation` مشترک استفاده می‌کند.

### Navigation integration

- bottom navigation فعلی باید بدون تغییر ساختار route `/library` را نشان دهد.
- `Library` باید با `/library` به عنوان یک تب اصلی در navigation باقی بماند.
- اگر کاربر هنوز auth نشده باشد، انتخاب `/library` باید به `ProtectedRoute` منتهی شود یا کاربر را به login هدایت کند.

### Protected route behavior

- پشتیبانی auth باید از feature `Auth` باشد.
- `Library` باید `ProtectedRoute` یا همان wrapper auth را در صفحه‌ی route خودش مصرف کند.
- route page از `useSession` و `useAuthStore` استفاده نمی‌کند مگر برای نمایش loader / redirect auth.
- رفتار پیشنهادی:
  - وقتی user auth نشده است، `ProtectedRoute` از `Auth` برای redirect به login یا نمایش state مناسب استفاده کند.
  - وقتی user auth شده است، library page داده‌های شخصی را بارگذاری کند.

## React Query Strategy

### Query hooks

برای Library MVP باید query hooks مشخص و feature-owned وجود داشته باشد:

- `useLibrarySubscriptions()` → `['library', 'subscriptions']`
- `useContinueListening()` → `['library', 'continue-listening']`
- `useLibraryOverview()` → `['library', 'overview']` (اختیاری برای ترکیب خلاصه)

### Mutation hooks

- `useSubscribePodcast()` → mutation روی `POST /api/v1/library/subscriptions/:podcastId`
- `useUnsubscribePodcast()` → mutation روی `DELETE /api/v1/library/subscriptions/:podcastId`
- `useUpdateListeningHistory()` → mutation روی `PATCH /api/v1/library/history/:episodeId`

### Cache ownership

- Library data cache باید با query keys اختصاصی نگهداری شود. `['library', ...]` کلید اصلی ownership است.
- این cache نباید از cache internal feature دیگری مثل `['podcasts']` به عنوان منبع حقیقت content استفاده کند.
- Library می‌تواند از `queryClient.getQueryData(['podcast', id])` یا `queryClient.setQueryData` هنگام نمایش جزئیات مشترک استفاده کند، اما باید به query keyهای رسمی و export شده تکیه کند.

### Invalidation strategy

- پس از subscribe/unsubscribe: invalidate `['library', 'subscriptions']` و `['library', 'overview']`.
- در صورت استفاده از `PodcastCard` که `isSubscribed` نشان می‌دهد، باید `['podcasts']` یا `['podcast', podcastId]` را نیز refresh یا update کرد، ولی `Library` فقط کاربرمحور است و نباید podcast cache را به‌صورت طولانی‌مدت مدیریت کند.
- پس از update listening history: invalidate `['library', 'continue-listening']`.
- در صورت نیاز به refresh page-level library overview، `queryClient.invalidateQueries({ queryKey: ['library'] })` می‌تواند به‌عنوان الگوی عمومی استفاده شود.

### Relationship with Podcast cache

- Library باید از `Podcast` types مشترک استفاده کند و در صورت نیاز presentational components را بازتولید نکند.
- اگر podcast details در cache `['podcast', id]` موجود بود، library می‌تواند آن را به‌عنوان secondary source بخواند، اما نه به‌عنوان source of truth برای لیست اشتراک‌ها.
- برای نمایش اشتراک‌ها، `Library` باید به API `library/subscriptions` تکیه کند؛ این query متن user-specific دارد و مستقل از `podcasts` است.

### Relationship with Player cache

- Library باید از player state تنها برای اعلان UI استفاده کند، نه برای نگهداری داده‌های library.
- `Library` می‌تواند selectorهایی از `usePlayerStore` بخواند تا نشان دهد کدام episode/playlist در حال پخش است.
- Library نباید queue player را خودش بسازد؛ تنها triggerهایی مانند `setCurrentItem` را فراخوانی کند.

## UI Composition

### صفحه Library

Library page باید به‌صورت زیر سازمان‌دهی شود:

- Header / page title
- Page-level status (loading / error / empty)
- Continue Listening section
- Subscribed Podcasts section
- Action CTA برای مرور podcast‌ها یا جستجو

### Sections

- `Continue Listening`
  - نمایش اپیزودهای در حال پیشرفت
  - call-to-action برای resume یا باز کردن جزئیات
- `Subscribed Podcasts`
  - نمایش پادکست‌های ذخیره‌شده
  - امکان unsubscribe مستقیم
- `Empty State`
  - وقتی هیچ subscription یا continue listening وجود ندارد
- `Loading`
  - skeleton برای هر دو بخش
- `Error`
  - پیام خطا و دکمه retry

### Ownership

- `LibraryPage` (container/page) باید از hooks استفاده کند و بخش‌ها را compose کند.
- `ContinueListeningSection` و `SubscriptionsSection` باید feature-owned باشند.
- `LibraryEmptyState`, `LibraryLoadingState`, `LibraryErrorState` باید در feature library تعریف شوند، اما می‌توانند از shared generic UI reuse کنند.
- `LibraryPodcastCard` باید قطعه‌ی presentation wrapper برای داده‌ی podcast باشد و فقط props ضروری بپذیرد.
- `LibraryEpisodeRow` برای `continue listening` و resume action باید wrapper feature-owned باشد.

## Component Ownership

### Feature-owned components

- `LibraryPage` / `LibraryPageView`
- `LibrarySubscriptionsSection`
- `LibraryContinueListeningSection`
- `LibraryEmptyState`
- `LibraryLoadingState`
- `LibraryErrorState`
- `LibraryPodcastCard` (wrapper around Podcast presentation)
- `LibraryEpisodeRow` (wrapper around Episode presentation)
- `LibrarySectionHeader`
- `LibraryTabBar` or `LibraryFilterBar` if tabbed view is needed
- `SubscriptionActionButton`

### Shared components

- `Card`, `Button`, `Skeleton`, `PageState`, `Badge`, `Avatar`
- `RoutePlaceholder` only for temporary route placeholders; actual Library page should not use it long-term.
- shared layout components مثل `AppShell` و `BottomNavigation`

### Responsibilities

- `LibraryPage`: load library queries, handle auth guard, choose section visibility
- `SubscriptionsSection`: render subscribed podcast list, manage unsubscribe action
- `ContinueListeningSection`: render listening progress items, map library progress to episode row UI
- `LibraryPodcastCard`: present podcast card data in library context, consume `onToggleSubscription` prop
- `LibraryEpisodeRow`: present episode item with resume action and current playback indicator
- `LibraryEmptyState`: show CTA based on missing data (no subscriptions or no continue listening)
- `LibraryLoadingState`: skeletons and section placeholders for initial load
- `LibraryErrorState`: show retry and refresh actions on API failure

## State Strategy

### Local state

- فقط UI state مرتبط با page rendering:
  - active tab or section expand/collapse
  - sort/filter mode within library sections
  - client-only view mode (grid/list)
- این state باید در کامپوننت محلی یا hookهای library نگهداری شود.

### React Query

- داده‌های اصلی library باید در React Query نگهداری شوند.
- query ownership برای data fetch و cache invalidation بر عهده feature library است.
- library page باید `useLibrarySubscriptions` و `useContinueListening` را مصرف کند.

### URL state

- برای MVP، URL state باید محدود به بخش‌های قابل اشتراک‌گذاری باشد:
  - `/library?tab=subscriptions`
  - `/library?tab=continue`
- URL state فقط برای view selection و pagination/filters مفید است.
- actual library data نباید در URL قرار بگیرد.

### Global state

- `Library` نباید خود یک Zustand store عمومی برای data source داشته باشد.
- global state باید محدود به auth و player بماند.
- اگر library نیاز به هماهنگی cross-route با Player داشت، فقط `usePlayerStore` selector یا action استفاده شود.

### Why not Zustand for library content

- library content data user-specific و API-backed است.
- React Query بهترین fit برای cache، refetch و stale handling است.
- استفاده از Zustand برای content می‌تواند duplication و stale data ایجاد کند.
- Zustan should remain reserved for UI/feature state that is not fetched data and for player/auth global concerns.

## Player Integration

### What Library may do

- open episode details or start resume playback when user taps a continue listening item
- call player actions such as `setCurrentItem` or `replaceQueue` with a single episode
- annotate current playing item in library item UI using `usePlayerStore` selectors

### What Library must NOT do

- own the playback engine or media session
- own the player queue
- manage player playback state such as `isPlaying`, `currentPosition`, `repeatMode`
- implement seek/playback logic

### Integration pattern

- `LibraryEpisodeRow` باید یک callback `onPlay` صادر کند که episode data را به player feature می‌دهد.
- Library may provide `PlayableItem` shape from episode data and call `playerStore.setCurrentItem(item)`.
- page should remain passive about playback state beyond visual indication.
- if library needs resume progress, it should request `updateListeningHistory` mutation and then trigger player open/resume.

## Podcast Integration

### Reuse strategy

- reuse existing podcast presentation UI where possible, but keep library wrappers small.
- `LibraryPodcastCard` can compose Podcast feature presentation components if they expose stable props.
- `Library` should not import Podcast feature internal hooks like `usePodcasts` for its own data fetch.

### Which Podcast components can be reused

- presentational components that render podcast metadata: title, artwork, author, description snippet
- small card components that are generic enough for list views

### Which should remain Podcast-owned

- full podcast detail page
- podcast create/edit forms
- podcast search hooks and list page behavior
- podcast CRUD mutation hooks
- deep podcast data fetching logic

### Which new wrappers should exist

- `LibraryPodcastCard` as a lightweight library-specific wrapper around shared podcast presentation
- `SubscriptionActionButton` for follow/unfollow behavior in library context
- `LibraryPodcastList` that arranges cards into grid/list with library-specific CTA

## Empty State Design

### Empty Library

- پیام واضح برای کاربر: "پادکستی ذخیره نشده است"
- CTA: "پادکست‌ها را مرور کن" یا "جستجو کن"
- از همان shared `PageState` یا `LibraryEmptyState` استفاده شود.

### No Subscriptions

- نمایش یک بخش خالی اختصاصی با لینک به صفحه‌ی `Podcasts` یا `Search`
- نگه داشتن CTA ساده و بدون بارگذاری اضافه

### No Continue Listening

- توضیح کوتاه: "هیچ اپیزودی در حال ادامه وجود ندارد"
- لینک به اشتراک‌های ذخیره‌شده یا پادکست‌های پیشنهادی

### Loading

- skeleton برای هر بخش، نه spinner کل صفحه
- هنگام بارگذاری اولیه، sections placeholders نشان داده شوند
- query state سراسری `isLoading` و `isFetching` مدیریت شوند

### API Error

- خطای سطح صفحه با دکمه retry
- پیام خطا نباید data UI را مخفی کند مگر زمانی که query نتواند هیچ داده‌ای نمایش دهد
- در صورت داشتن partial data، فقط بخش خطا باید محدود شود.

### Offline future compatibility

- طراحی باید آماده‌ی fallback به cached data باشد.
- وقتی offline است، library می‌تواند از query cache استفاده کند و پیام واضح نمایش دهد.
- componentهای library باید برای نمایش "داده‌های آفلاین" یا "مشکلی در اتصال" آماده باشند.
- این آماده‌سازی نباید پیاده‌سازی offline کامل باشد، بلکه باید ساختار UI را به‌گونه‌ای نگه دارد که بعداً بتوان offline state را در همان sections حفظ کرد.

## Future Compatibility

### Playlists

- Library page باید به‌گونه‌ای طراحی شود که در آینده بخش `Playlists` را بدون بازطراحی کلی اضافه کند.
- architecture پیشنهادی: sections مستقل برای `Continue Listening`, `Subscriptions`, `Playlists`.
- هر section container می‌تواند query hook مخصوص به خود داشته باشد.

### Favorites

- Favorites باید به‌عنوان یک section دیگر در Library یا feature مجزا تعریف شود.
- library page نباید `Favorites` را اکنون ترکیب کند، اما باید ساختار `Section` را طوری نگه دارد که بخش جدید به‌سادگی اضافه شود.

### Downloads

- Library باید برای future `Downloads` section آماده باشد تا از همان page shell و state pattern استفاده کند.
- هرگونه داده offline/downloaded باید query key مجزا داشته باشد.

### Offline

- library page باید از query cache و error handling استفاده کند تا در آینده به offline compatibility برسد.
- session-specific library data باید به‌سادگی قابل extension به `IndexedDB`/cache storage باشد، اما فعلاً مبتنی بر backend باقی می‌ماند.

### History

- `Continue Listening` یک نوع اولیه از history است.
- architecture باید آماده‌ی جدا شدن `History` به section مستقل یا feature مجزا باشد.
- با نگهداری query hooks جداگانه، افزودن `listening-history` endpoint آینده بدون تغییر ساختار کلی امکان‌پذیر است.

## Risk Assessment

### Architecture risks

- خطر coupling بیش از حد با `Podcasts` اگر library از internal podcast hooks یا cache keys استفاده کند.
- خطر stale data اگر subscription state در query keys library و podcast جداگانه همگام نشود.
- خطر عدم محافظت route اگر auth guard درست پیاده‌سازی نشود.

### Coupling risks

- استفاده مستقیم از Podcast feature internal components می‌تواند library را به تغییرات داخلی podcast حساس کند.
- اگر `Library` اطلاعات playback را در zustand نگه دارد، خطر دو منبع حقیقت ایجاد می‌شود.

### State risks

- `Library` نباید zustand را برای fetched data استفاده کند؛ در غیر این صورت stale cache و رگرسیون رخ می‌دهد.
- نگهداری محلی یا URL state بیش از حد می‌تواند پیچیدگی navigation را بالا ببرد.

### Rendering risks

- رندر لیست اشتراک‌ها یا continue listening بزرگ می‌تواند performance را کاهش دهد؛ با MVP ساده، مقدار پیش‌فرض 20 مورد یا lazy-loading پیشنهاد می‌شود.
- اگر page-level loading و section-level loading با هم ترکیب شود، ممکن است UI confusing شود؛ باید مرز واضح بین skeleton sections و page loading وجود داشته باشد.

### Caching risks

- subscription status ممکن است بعد از یک mutation باید invalidate شود.
- اگر library به query cache `['podcast', id]` برای subscription status متکی باشد، احتمال inconsistency بالاتر است.

### Navigation risks

- `/library` route یک entry point کاربرمحور است؛ اگر auth guard نباشد، ممکن است داده‌های شخصی بدون login در صفحه نمایش داده شود.
- نمایش `Library` در bottom navigation باید همیشه ثابت بماند تا تجربه native tab حفظ شود.

### Future maintenance risks

- اگر `Library` به جای wrapper، کپی از `PodcastCard` انجام دهد، بعداً نگهداری دو نسخه دشوار می‌شود.
- اگر بخش‌های library در یک کامپوننت بزرگ پیچیده شوند، آپدیت‌های بعدی و افزودن playlists/favorites سخت خواهد شد.

## Final Recommendation

### نتیجه

Library frontend باید به‌عنوان یک feature جدید و consumer-oriented در `apps/web/src/features/library` پیاده‌سازی شود. route `/library` باید به صفحه library اختصاص یابد و از auth-protected route استفاده کند. داده‌‌ها باید با React Query مدیریت شوند و Zustand فقط برای player/auth و UI state غیر-fetch شده باقی بماند.

### Ready for implementation

- feature ownership تعریف شده است
- folder structure مشخص شده است
- route ownership مشخص شده است
- component ownership مشخص شده است
- React Query strategy مشخص شده است
- state ownership مشخص شده است
- player integration و podcast integration مشخص شده است
- risks مستند شده‌اند

### پیشنهاد فاز بعدی

فاز 3.6.1 باید پیاده‌سازی برنامه‌ریزی شده‌سازی frontend Library را آغاز کند: ایجاد `features/library` structure، route composition، query hooks، و protected page behavior.

---

ARCHITECTURE COMPLETED: YES

FEATURE OWNERSHIP VERIFIED: YES

READY FOR IMPLEMENTATION: YES

READY FOR PHASE 3.6.1: YES
