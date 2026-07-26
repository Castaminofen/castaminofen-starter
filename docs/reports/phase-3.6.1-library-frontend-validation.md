# Phase 3.6.1 — Library Frontend Architecture Validation

## Executive Summary

این گزارش به‌صورت validation-only، معماری frontend پیشنهادی برای Feature Library را بر اساس ساختار فعلی ریپو بررسی کرده است. بررسی‌ها بر پایه‌ی فایل‌های واقعی در پروژه انجام شده و هدف آن تأیید این بوده است که طراحی پیشنهادی با معماری فعلی سازگار باشد، بدون ایجاد خطای مالکیت، تکرار state، یا وابستگی‌های غیرضروری.

یافته‌ی کلیدی این است که معماری پیشنهادی برای Library با ساختار موجود کاملاً سازگار است. Route `/library` از قبل در App Router وجود دارد، AppShell و BottomNavigation از قبل آن را در جریان اصلی اپ قرار می‌دهند، ProtectedRoute برای احراز هویت موجود است، Player و Auth به‌صورت feature-owned و global state مدیریت می‌شوند، و React Query نیز الگوی feature-scoped و قابل‌گسترش دارد.

نتیجه نهایی:
- VALIDATION PASSED: YES
- ARCHITECTURE VERIFIED: YES
- READY FOR PHASE 3.6.2: YES

---

## Route Validation

### یافته‌ها

- مسیر [apps/web/src/app/library/page.tsx](../../apps/web/src/app/library/page.tsx) در حال حاضر وجود دارد و به‌عنوان route پایه‌ی Library در App Router ثبت شده است.
- [apps/web/src/components/layout/app-shell.tsx](../../apps/web/src/components/layout/app-shell.tsx) همه‌ی صفحات را در یک shell مشترک قرار می‌دهد و Library می‌تواند بدون تغییر ساختار app-level در این لایه قرار بگیرد.
- [apps/web/src/components/layout/bottom-navigation.tsx](../../apps/web/src/components/layout/bottom-navigation.tsx) از قبل لینک `/library` را در ناوبری اصلی دارد.
- [apps/web/src/features/auth/components/ProtectedRoute.tsx](../../apps/web/src/features/auth/components/ProtectedRoute.tsx) برای حفاظت از صفحات حساس موجود است و می‌تواند به‌عنوان wrapper برای صفحه‌ی Library استفاده شود.

### نتیجه

Library می‌تواند به‌صورت یک feature route مستقل در ساختار فعلی باقی بماند و برای این منظور نیازی به تغییر معماری routing یا AppShell وجود ندارد. ساختار فعلی از لحاظ route-placement مناسب است.

### ProtectedRoute runtime flow

```text
User
↓
/library
↓
ProtectedRoute
↓
Authenticated ?
├── No → Login
└── Yes
↓
React Query
↓
Library API
↓
Render Sections
```

این جریان نشان می‌دهد که Library باید در مرحله‌ی ورود به صفحه، از Auth guard استفاده کند اما هیچ منطق احراز هویت را در خود Library نگه ندارد. در نتیجه، پیاده‌سازی auth داخل Library به‌عنوان یک violation architectural در نظر گرفته می‌شود.

---

## Feature Ownership Validation

### مالکیت‌های مجاز برای Library

Library باید فقط مسئول موارد زیر باشد:
- composition صفحه‌ی `/library`
- UI مربوط به Library
- hook‌های query مربوط به Library
- UI subscribe / unsubscribe
- UI continue listening
- wrapperهای presentation مخصوص Library

### مالکیت‌های غیرمجاز برای Library

Library نباید مسئول موارد زیر باشد:
- منطق کسب‌وکار Podcast
- منطق کسب‌وکار Episode
- runtime Player
- احراز هویت
- Search
- state global غیر-UI

### یافته‌ها

- در ریپو فعلی هیچ feature Library پیاده‌سازی نشده است؛ بنابراین در این مرحله تنها ساختار route و لایه‌های پشتیبان موجود است.
- هیچ نشانه‌ای از نقض مالکیت در current codebase دیده نشد. به‌عنوان مثال، منطق Player در [apps/web/src/features/player](../../apps/web/src/features/player) و auth در [apps/web/src/features/auth](../../apps/web/src/features/auth) هنوز در مرز feature-محور خود قرار دارند.

### نتیجه

هیچ violation مالکیتی در معماری فعلی یافت نشد. طراحی Library به‌عنوان یک feature consumer-compatible قابل‌قبول است.

---

## React Query Validation

### یافته‌ها

- الگوی query hooks در پروژه فعلی از طریق [apps/web/src/features/podcasts/hooks/usePodcasts.ts](../../apps/web/src/features/podcasts/hooks/usePodcasts.ts) و [apps/web/src/features/search/hooks/useSearch.ts](../../apps/web/src/features/search/hooks/useSearch.ts) مشخص است.
- query key‌های فعلی به‌صورت feature-scoped نوشته شده‌اند؛ مثال: `['podcasts']`، `['podcast', id]` و `['search', ...]`.
- معماری پیشنهادی برای Library با keys شبیه `['library', 'subscriptions']` و `['library', 'continue-listening']` با این الگو هم‌خوانی دارد.

### ارزیابی

- naming query keys مناسب است.
- invalidation strategy پیشنهادی برای subscription و history change منطقی است.
- cache Library باید مالکیت خود را روی داده‌های کاربرمحور داشته باشد و نه به‌عنوان source of truth برای Podcast data.
- Library می‌تواند از cache Podcast به‌عنوان داده‌ی کمکی استفاده کند، اما نباید آن را جایگزین cache Library یا ownership Podcast کند.

### نتیجه

استراتژی React Query پیشنهادی با الگوی فعلی سازگار است و خطر duplicated source of truth در آن پایین است، مشروط بر اینکه Library فقط داده‌های user-specific خود را در cache خود نگه دارد و به `podcasts` cache فقط به‌صورت read-only یا secondary reference نگاه کند.

### Matrix of invalidation behavior

| Mutation | Invalidates | Purpose |
| --- | --- | --- |
| Subscribe | `['library', 'subscriptions']` | Refresh the user subscriptions list after a new subscription is created. |
| Unsubscribe | `['library', 'subscriptions']` | Refresh the subscriptions list after removing a subscription. |
| Update History | `['library', 'continue-listening']` | Refresh continue-listening data after playback progress changes. |
| Overview refresh | `['library']` | Refresh library-wide cached summaries or composite views when a library mutation affects multiple sections. |

---

## Zustand Validation

### یافته‌ها

- Zustand فعلی در پروژه فقط برای دو حوزه‌ی اصلی استفاده می‌شود: auth در [apps/web/src/stores/authStore.ts](../../apps/web/src/stores/authStore.ts) و player در [apps/web/src/features/player/store/playerStore.ts](../../apps/web/src/features/player/store/playerStore.ts).
- هیچ store جهانی جدید برای Library در ساختار فعلی وجود ندارد.

### ارزیابی

- اضافه‌کردن یک store جدید برای Library در این مرحله منطقی نیست.
- stateهای UI مانند tab انتخابی، expand/collapse بخش‌ها یا view mode باید محلی در component یا hook Library باقی بمانند.
- اگر در آینده یک state نیاز باشد که بین چند بخش Library مشترک باشد، بهتر است به‌صورت local component state یا React Query state مدیریت شود، نه Zustand global.

### نتیجه

Library نباید یک Zustand store جدید معرفی کند. این تصمیم با معماری فعلی مطابقت دارد.

---

## Component Ownership Validation

### یافته‌ها

- componentهای podcats فعلی در [apps/web/src/features/podcasts/PodcastCard.tsx](../../apps/web/src/features/podcasts/PodcastCard.tsx) و [apps/web/src/features/podcasts](../../apps/web/src/features/podcasts) وجود دارند و برای نمایش پادکست‌ها در context‌های مختلف قابل استفاده‌اند.
- componentهای shared UI مانند Button، Skeleton، Empty/Error state در لایه‌ی shared/design system موجود هستند و برای Library نیز مناسب‌اند.

### ارزیابی

- wrapperهای Library-specific مانند section container، empty state، loading state و podcast card wrapper در feature Library justified هستند.
- reuse Podcast UI در Library کاملاً مناسب است، اما باید بدون duplication و با استفاده از wrapperهای presentation محدود انجام شود.
- componentهایی که باید Library-specific باقی بمانند عبارت‌اند از: Library page container، Continue Listening section، Subscriptions section، empty/loading/error states، و wrapperهای action برای subscribe/unsubscribe.

### نتیجه

الگوی component ownership پیشنهادی با ساختار فعلی سازگار است و از duplication UI جلوگیری می‌کند.

---

## Player Integration Validation

### یافته‌ها

- Player در [apps/web/src/features/player/store/playerStore.ts](../../apps/web/src/features/player/store/playerStore.ts) مالک queue، current item، playback state و runtime است.
- runtime Player در [apps/web/src/features/player/runtime/playerRuntime.ts](../../apps/web/src/features/player/runtime/playerRuntime.ts) مدیریت می‌شود.
- UI Player در [apps/web/src/features/player/components](../../apps/web/src/features/player/components) نمایش داده می‌شود و در AppShell به‌صورت shared surface قرار دارد.

### ارزیابی

- Library می‌تواند فقط با Player تعامل داشته باشد تا playback شروع/ادامه داده شود یا وضعیت پخش را نمایش دهد.
- Library نباید به‌طور مستقیم queue، playback runtime، media session یا state پخش را مدیریت کند.

### نتیجه

الگوی پیشنهادی برای Player integration مطابق با مرز موجود است و هیچ نشانه‌ای از نیاز به ownership انتقالی از Player به Library دیده نمی‌شود.

---

## Podcast Integration Validation

### یافته‌ها

- Podcast feature در [apps/web/src/features/podcasts](../../apps/web/src/features/podcasts) مالک fetch و presentation داده‌های podcast است.
- Query hooks Podcast به‌صورت feature-owned و با keys مشخص مدیریت می‌شوند.

### ارزیابی

- Library باید data podcast را مصرف کند، نه اینکه دوباره fetching یا cacheسازی مستقل برای آن انجام دهد.
- Library نباید ownership Podcast را منتقل یا cache `['podcasts']` را به‌صورت جدید و جداگانه مدیریت کند.

### نتیجه

Library می‌تواند از داده‌های Podcast به‌صورت consumer استفاده کند بدون اینکه ownership Podcast یا cache آن را تحت‌الشعاع قرار دهد.

---

## State Validation

### طبقه‌بندی پیشنهادی

- React Query: مناسب برای server state Library و داده‌های user-scoped
- Local State: مناسب برای tab، collapse، view mode، sort/filter UI
- URL State: مناسب برای future filter/search/shareable state
- Global State: فقط برای Auth و Player در ساختار فعلی

### یافته‌ها

در ساختار فعلی، stateهایglobal فقط برای auth و player در نظر گرفته شده‌اند. Library با stateهای محلی و React Query می‌تواند به‌خوبی از این الگو پیروی کند.

### نتیجه

هیچ مسئولیت اشتباه یا misplaced responsibility در طراحی پیشنهادی برای state دیده نمی‌شود.

---

## Performance Validation

### ارزیابی

- برای MVP، ساختار صفحه‌ی Library با چند بخش اصلی ساده و چند list محدود، ریسکی برای performance ندارد.
- نیاز به virtualization در این مرحله ضروری نیست، مگر در آینده حجم داده‌ی Library به‌طور قابل‌توجهی زیاد شود.
- re-render risk به‌طور معقول با تقسیم componentها و نگه‌داشتن state محلی کاهش می‌یابد.
- memoization در این مرحله لازم نیست مگر پس از اندازه‌گیری واقعی و در صورت وجود bottleneck UI.

### نتیجه

استراتژی performance پیشنهادی برای MVP مناسب است و بهینه‌سازی زودهنگام ضروری به‌نظر نمی‌رسد.

> Virtualization intentionally deferred for MVP.
>
> Current expected dataset size does not justify additional rendering complexity.

---

## Accessibility Validation

### ارزیابی

- معماری صفحه‌ی Library با composition section-based برای accessibility مناسب است.
- استفاده از semantic structure، heading hierarchy، button labels و section-based layouts برای آینده آماده است.
- این معماری بدون پیاده‌سازی، readiness مناسبی برای keyboard navigation و screen reader support فراهم می‌کند.

### نتیجه

از نظر معماری، Library برای accessibility آینده آماده است. این بررسی فقط validation بوده و هیچ تغییر accessibility انجام نشده است.

---

## Future Compatibility

### ارزیابی

معماری فعلی برای آینده‌ی featureهای زیر مناسب است:
- Favorites
- Playlists
- Downloads
- Offline
- History

دلیل این سازگاری این است که Library در مرز feature-owned باقی می‌ماند و می‌تواند در آینده با همان لایه‌ی React Query، local state و Player/auth integrations رشد کند. هیچ نیازی به redesign اساسی دیده نمی‌شود.

---

## Risk Assessment

| ریسک | سطح | توضیح |
| --- | --- | --- |
| Route composition در مرحله پیاده‌سازی | Medium | current route فقط placeholder است و باید در فاز بعدی به container/view واقعی تبدیل شود. |
| Ownership drift در تعامل با Player | Medium | اگر Library در آینده queue یا runtime پخش را مالک شود، مرز معماری شکسته می‌شود. |
| State overload در Library | Low | اگر state UI به Zustand global منتقل شود، طراحی فعلی دچار over-centralization می‌شود. |
| Cache synchronization بین Library و Podcast | Low | این ریسک با استفاده از query keys جداگانه و نگه‌داشتن podcast cache به‌صورت secondary قابل کنترل است. |

### جمع‌بندی ریسک

هیچ ریسک بحرانی یافت نشد. ریسک‌های شناسایی‌شده در سطح Medium/Low هستند و با رعایت مرزهای پیشنهادی قابل کنترل‌اند.

---

## Final Recommendation

معماری پیشنهادی برای Library با ساختار فعلی پروژه سازگار است. مرز مالکیت‌ها روشن، state strategy مناسب، interaction با Player و Podcast سالم، و route architecture بدون نیاز به تغییر app-level قابل‌قبول است.

نتیجه نهایی:

VALIDATION PASSED

ARCHITECTURE VERIFIED

READY FOR PHASE 3.6.2
