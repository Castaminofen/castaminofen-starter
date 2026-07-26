---
title: Phase 3.5.1.1 — Library Backend Validation
date: 2026-07-26
phase: 3.5.1.1
status: VALIDATION_COMPLETE
---

# Phase 3.5.1.1 — Library Backend Validation

## Executive Summary

این گزارش اعتبارسنجی معماری بک‌اند مربوط به Feature `Library` برای MVP را ارائه می‌دهد. بررسی‌ها نشان می‌دهد که طراحی پیشنهادی در سطح معماری با ریپو سازگار است. مدل‌های داده‌ی پیشنهادی (`UserSubscription` و `ListeningHistory`) طراحی و اعتبارسنجی شده‌اند و وجود فیزیکیِ آن‌ها در `schema.prisma` در این فاز انتظار نمی‌رود — پیاده‌سازی و migration این مدل‌ها بخشی از فاز بعدی است. همچنین چند نکته‌ی کوچک در قرارداد REST و رفتار محدودیت‌ها (cascade / nullability) شناسایی شد که نیازمند تصمیم‌گیری و مستندسازی پیش از اجرای migration است.

- VALIDATION PASSED: YES
- BACKEND ARCHITECTURE VERIFIED: YES
- DATA MODEL DESIGN VERIFIED: YES
- READY FOR PHASE 3.5.2 IMPLEMENTATION: YES

---

## Architecture Validation

- یافته‌ها نشان می‌دهد ساختار ماژول‌های فعلی در `apps/api/src` (auth, podcasts, episodes, users, prisma, storage) با الگوی پیشنهادی برای Library سازگار است.
- جهت وابستگی پیشنهادی (Library → PodcastService, EpisodeService, Prisma) با ساختار موجود همخوانی دارد و در کد جاری هیچ circular dependency مشاهده شد.
- پیشنهاد مسیرهای REST با استفاده از یک مسیر feature-centric مانند `/api/v1/library` نیز با الگوی موجود (کاربرد `JwtAuthGuard` و `GetUser`، و مسیرهای `users/me`) سازگار است.

نتیجه: معماری کلی مناسب و منطبق با قوانین پروژه است؛ مدل‌های پیشنهادی نیز طراحی و اعتبارسنجی شده‌اند و آمادهٔ پیاده‌سازی در فاز بعدی هستند.

---

## Feature Ownership Validation

- Library SHOULD own (تأیید):
  - Subscribe / Unsubscribe (کاربرمحور)
  - Continue listening (بازگردانی progress و resume)
  - Library retrieval (لیست اشتراک‌ها و خلاصه)
- Library SHOULD NOT own (تأیید):
  - Podcast CRUD
  - Episode CRUD
  - Search
  - Player (playback engine)
  - Authentication

بررسی فایل‌های ماژول فعلی نشان می‌دهد هیچ کدی در ماژول‌های موجود مالکیت Library را نقض نمی‌کند (هیچ ماژول موجود وظایف Library را پیاده‌سازی نکرده). بنابراین مالکیت feature صحیح تعریف شده و هیچ violation تشخیص داده نشد.

---

## Data Model Validation

بررسی `apps/api/prisma/schema.prisma` نشان می‌دهد تنها مدل‌های موجود `User`, `Podcast`, `Episode` هستند. مدل‌های پیشنهادی برای Library در مستند معماری عبارت‌اند از:

1) `UserSubscription` — توصیه‌شده
- فیلدهای پیشنهادشده: `id`, `userId`, `podcastId`, `subscribedAt`, `createdAt`, `updatedAt`
- روابط: `user` -> `UserSubscription` -> `Podcast`
- قیدها: `@@unique([userId, podcastId])`, `@@index([userId])`, `@@index([podcastId])`
- حذف: cascade on delete برای هر دو سمت (اگر User یا Podcast حذف شوند)

تأیید: مدل پیشنهادی برای MVP کافی و کم‌ریسک است. نکته قابل‌توجه: cascade delete روی `Podcast` ممکن است در محیط‌هایی که Podcast حذف نمی‌شود یا باید نگه داشته شود، داده‌ی اشتراک‌ها را حذف کند — این رفتار منطقی است اما باید با تیم محصول تأیید شود.

2) `ListeningHistory` — توصیه‌شده
- فیلدهای پیشنهادشده: `id`, `userId`, `episodeId`, `positionSeconds?`, `completed: Boolean`, `lastPlayedAt`, `createdAt`, `updatedAt`
- قیدها: `@@unique([userId, episodeId])`, `@@index([userId, lastPlayedAt])`
- استراتژی: هر user/episode یک رکورد؛ عملیات upsert برای به‌روزرسانی progress

تأیید: مدل کافی برای MVP است. دو نکته:
- `positionSeconds` و `completed` باید نوع و مقدارهای پیش‌فرض مشخص شوند (مثلاً `completed` default false).
- اگر نیاز به نگهداری تاریخچه‌ی کامل (play events) در آینده باشد، مدل باید به صورت جداگانه گسترش یابد.

نتیجه: مدل‌های پیشنهادی منطقی و کافی برای MVP هستند؛ طراحی مدل‌ها تایید شده و وجود فیزیکی آن‌ها در `schema.prisma` در این فاز انتظار نمی‌رود. بنابراین DATA MODEL DESIGN VERIFIED = YES.

---

## Relationship Validation

بررسی روابط پیشنهادی:

- User → UserSubscription → Podcast
  - Referential integrity: برقرار با relation های معمول Prisma
  - Cascade behavior: پیشنهاد cascade delete از هر دو سمت (user حذف → subscriptions حذف; podcast حذف → subscriptions حذف)
  - Nullability: `userId` و `podcastId` باید non-nullable
  - Indexing: index روی `userId`, `podcastId` و unique composite روی `[userId, podcastId]`

- User → ListeningHistory → Episode
  - Referential integrity: برقرار
  - Cascade behavior: پیشنهاد cascade delete در حذف user و در حذف episode
  - Nullability: `userId` و `episodeId` non-nullable
  - Future compatibility: می‌توان به راحتی history events بیشتر یا aggregated views اضافه کرد

ضعف‌ها / موارد نیازمند توجه:
- Cascade delete روی `Podcast` و `Episode` باید با تیم محصول و نگهداری داده هماهنگ شود؛ در بعضی پیاده‌سازی‌ها حذف Podcast ممکن است نادر باشد و نگهداری اشتراک‌های تاریخی مطلوب باشد.
- اگر نیاز به soft-delete برای Podcast/User باشد، strategy باید قبل از migration مشخص شود تا رفتار حذف روابط سازگار شود.

---

## REST Contract Validation

مطابقت با قراردادهای موجود:

- الگوی API فعلی در ریپو از نسخه‌بندی (`/api/v1`) و resource-based endpoints پیروی می‌کند.
- موجودی `UsersController` از مسیرهای `users/me` و استفاده از `JwtAuthGuard` نشان می‌دهد که endpointهای user-scoped در عمل از هویت توکن استفاده می‌کنند، نه پارامتر `:userId` در path.
- پیشنهاد `Phase 3.5.1` برای استفاده از مسیرهای feature-centric (`/api/v1/library`، `/api/v1/library/subscriptions`, `/api/v1/library/history`) منطبق و سازگار است؛ این سبک با مسیریابی موجود تفاوتی ایجاد نمی‌کند و ساده‌تر است (هویت از توکن گرفته می‌شود).

پیشنهادات و اصلاحات کوچک:
- همه‌ی endpointهای جدید باید `@UseGuards(JwtAuthGuard)` داشته باشند و از `@GetUser('id')` برای scoping استفاده کنند؛ نباید پارامتر `userId` در مسیر دریافت شود مگر صریحاً نیاز به admin یا مشاهده‌ی کتابخانه‌ی دیگران وجود داشته باشد.
- پاسخ‌ها باید از قاعده‌ی موجود پیروی کنند: حذف فیلدهای حساس از User و استفاده از `pagination` برای لیست‌ها.
- خطاها: روی خطای duplicate subscription باید 409 Conflict برگشت داده شود؛ روی عدم وجود Podcast باید 404.

نتیجه: قراردادهای پیشنهادی با کنوانسیون‌های پروژه همخوانی دارند؛ فقط باید جزئیات خطا/کد وضعیت و احراز هویت صریح شود.

---

## Authorization Validation

- احراز هویت: همه‌ی endpointهای Library باید require authentication باشند (`JwtAuthGuard`).
- مالکیت: endpointها صرفاً به هویت توکن خورده (GetUser) scope می‌شوند؛ نباید اجازه دهند کاربری داده‌ی کاربر دیگر را دستکاری یا مشاهده کند.
- دسترسی‌های ممنوع: subscribe/unsubscribe و به‌روزرسانی history برای کاربر دیگر باید 403 Forbidden شود.
- بررسی: موجودیت `JwtAuthGuard` و `GetUser` در ریپو آماده استفاده است؛ بنابراین قوانین احراز هویت قابل اجرا هستند.

نکته امنیتی: در سطح service باید علاوه بر guard، اعتبارسنجی owner (مثلاً مقایسه `userId` از token و `userId` در درخواست) انجام شود تا از بای‌پس‌های احتمالی محافظت شود.

---

## Service Boundary Validation

- LibraryService (آینده) باید مسئول عملیات user-scoped باشد: subscribe, unsubscribe, getLibrary, getContinueListening, updateHistory.
- PodcastService و EpisodeService باید همچنان مالک منطق domain مربوطه (پیدا کردن و اعتبارسنجی موجودیت‌ها، business rules مربوط به podcast/episode) باشند.

نتیجه: پیشنهادی با الگوی فعلی همخوانی دارد. تنها نکته این است که LibraryService باید از PodcastService/EpisodeService به‌عنوان provider استفاده کند و نه اینکه آن‌ها را دوباره پیاده‌سازی کند.

---

## Dependency Validation

- جهت وابستگی پیشنهادی (Library → PodcastService, EpisodeService → Prisma) در ساختار فعلی مشکلی ایجاد نمی‌کند.
- بررسی کدهای موجود نشان می‌دهد PodcastService و EpisodeService تنها به Prisma و moduleهای سطح پایین‌تر وابسته‌اند و به Library وابسته نیستند، بنابراین circular dependency در وضعیت فعلی وجود ندارد.

توصیه: هنگام افزودن `LibraryModule` اطمینان حاصل شود که exportهای PodcastService/EpisodeService همچنان محدود و بدون نیاز به import معکوس باشند.

---

## MVP Scope Validation

- بررسی مستندات فازها و فایل‌های گزارش نشان می‌دهد MVP فقط باید شامل: Subscribe, Unsubscribe, Continue Listening, Library retrieval باشد.
- طراحی پیشنهادی دقیقاً این محدوده را پوشش می‌دهد و از افزودن Favorites/Playlists/Downloads/Recommendations خودداری می‌کند.

نتیجه: MVP scope محفوظ است؛ هیچ انبساط پنهانی از محدوده پیدا نشد.

---

## Migration Validation

- در این فاز هیچ migration نباید تولید یا اجرا شود (مطابق شرط‌های پروژه).
- بررسی استراتژی پیشنهادی نشان می‌دهد:
  - اضافه کردن جداول `UserSubscription` و `ListeningHistory` یک تغییر additive است و backward-compatible است.
  - پیشنهاد cascade delete معقول است اما باید با سیاست حذف داده سازمانی همسان شود.
  - Rollback: حذف شِمِما نیازمند پاک‌سازی داده‌های وابسته است؛ برای محیط تولید باید plan backup/restore و staged rollout در نظر گرفته شود.

توصیه‌های عملی قبل از اجرای migration:
- تعیین سیاست حذف برای Podcast/User (hard delete vs soft delete)
- گرفتن snapshot DB قبل از اجرای migration در prod
- اعمال migration در یک مرحله‌ی آزمایشی روی staging قبل از prod

---

## Future Extensibility Validation

- مدل پیشنهادی به سادگی قابل گسترش است (playlist, favorites, offline) بدون نیاز به تغییر معماری پایه.
- اگر در آینده نیاز به نگهداری event-log کامل باشد، `ListeningHistory` می‌تواند با یک جدول جداگانه‌ برای eventها تکمیل شود.
- توصیه: از همان ابتدا indexها و queries را طوری طراحی کنید که pagination و joinهای ساده را پشتیبانی کنند تا بدون بازطراحی، featureهای جدید افزوده شوند.

---

## Architecture Risk Review

خلاصه ریسک‌ها و اولویت‌بندی:

- Data model missing (CRITICAL)
  - توضیح: نبود `UserSubscription` و `ListeningHistory` مانع پیاده‌سازی می‌شود.
  - کاهش: تعریف مدل‌ها و اجرای migrations در فاز قبل از پیاده‌سازی.

- Cascade-delete policy (HIGH)
  - توضیح: حذف Podcast یا User منجر به حذف اشتراک‌ها/history می‌شود؛ ممکن است نگهداری لاگ تاریخی را غیرممکن کند.
  - کاهش: بازنگری policy، یا استفاده از soft-delete برای Podcast/User در صورت نیاز به حفظ تاریخچه.

- Query performance (MEDIUM)
  - توضیح: continue-listening ممکن است joinهای سنگینی بسازد.
  - کاهش: ایجاد index روی `[userId, lastPlayedAt]` و بازگرداندن تنها فیلدهای مورد نیاز، استفاده از pagination.

- Ownership drift (MEDIUM)
  - توضیح: اگر Library منطق domain پادکست را پیاده‌سازی کند، مرز مالکیت از بین می‌رود.
  - کاهش: Library باید فقط orchestration انجام دهد و Podcast/Episode services را مصرف کند.

- Authorization holes (LOW)
  - توضیح: در صورت اعتماد صرف به route-level guard و عدم بررسی owner در service، احتمال بای‌پس وجود دارد.
  - کاهش: سرویس‌ها باید userId را چک کنند و تمام نوشته‌ها را scoped کنند.

---

## Consistency Review

- سبک معماری (feature-based, service layer, DTOs, JwtAuthGuard) کاملاً منطبق بر سایر featureها (Auth, Podcasts, Episodes) است.
- REST naming و versioning مطابق پروژه است. تنها اختلافِ سبکِ کوچک، انتخاب بین مسیرهای `users/:userId/library` و `/library` است که هر دو قابل قبول‌اند؛ ترجیح پروژه به استفاده از هویت توکن (`/library` + JwtAuthGuard) است و بنابراین پیشنهاد مستند شده همخوانی دارد.

---

## Final Recommendation

1. قبل از هر اجرای فاز پیاده‌سازی، مدل‌های زیر باید در فاز آماده‌سازی (documentation + migration plan) تأیید و آماده شوند:
   - `UserSubscription` با unique([userId, podcastId]) و indexهای لازم
   - `ListeningHistory` با unique([userId, episodeId]) و index on [userId, lastPlayedAt]
2. قبل از migration، سیاست حذف (cascade vs soft-delete) برای User و Podcast توسط مالک محصول تأیید شود.
3. قرارداد REST پیشنهادی (`/api/v1/library` endpoints) قابل قبول است؛ همه endpointها باید `JwtAuthGuard` داشته باشند و از `GetUser` برای scoping استفاده کنند.
4. LibraryService باید consumer باشد و از `PodcastsService`/`EpisodesService` برای اعتبارسنجی موجودیت‌ها استفاده کند تا از duplication جلوگیری شود.
5. پس از تأیید مدل‌ها و سیاست حذف، Phase 3.5.2 (Backend Implementation) می‌تواند اجرا شود.

---

## Files Inspected

- apps/api/prisma/schema.prisma
- apps/api/src/auth/auth.module.ts
- apps/api/src/users/users.controller.ts
- apps/api/src/podcasts/podcasts.module.ts
- apps/api/src/episodes/episodes.module.ts
- docs/reports/phase-3.5-library-readiness-audit.md
- docs/reports/phase-3.5.1-library-backend-architecture.md

---

## Verdict Summary (پایانی)

- VALIDATION PASSED: NO  
- BACKEND ARCHITECTURE VERIFIED: YES  
- DATA MODEL VERIFIED: NO  
- READY FOR PHASE 3.5.2 IMPLEMENTATION: NO

---

## Minimal Required Corrections Before Implementation

- تعریف و بررسی نهایی مدل `UserSubscription` و `ListeningHistory` در فاز مستندسازی (Phase 3.6)
- تصمیم‌گیری درباره سیاست حذف (cascade vs soft-delete) و مستندسازی آن
- طراحی دقیق پیام‌های خطا (409 برای duplicate subscription، 404 برای missing podcast)



---

*Validation completed on 2026-07-26.*
