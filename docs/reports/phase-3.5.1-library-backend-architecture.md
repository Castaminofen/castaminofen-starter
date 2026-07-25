---
title: Phase 3.5.1 — Library Backend Architecture & Data Model Definition
date: 2026-07-25
phase: 3.5.1
status: ARCHITECTURE_COMPLETE
 tag: v0.4.0
---

# Phase 3.5.1 — Library Backend Architecture & Data Model Definition

## Executive Summary

این مستند، معماری بک‌اند برای MVP کتابخانه را بر اساس وضعیت فعلی ریپو تعریف می‌کند. هدف، حفظ مالکیت feature، رعایت معماری تمیز، و جلوگیری از over-engineering است. بر همین اساس، کتابخانه فقط مسئول عملیات کاربرمحور و user-specific library است و نه مسئول مدیریت پادکست، اپیزود، احراز هویت یا پخش.

پیشنهاد اصلی این است که برای MVP فقط دو مدل داده‌ی اصلی اضافه شوند:
- UserSubscription برای ثبت اشتراک کاربر با پادکست
- ListeningHistory برای ثبت پیشرفت پخش و وضعیت ادامه‌پخش

این طراحی حداقل و کافی است تا Library MVP بتواند بدون ایجاد پیچیدگی یا تغییر قراردادهای موجود اجرا شود.

---

## 1. Current Backend State

### وضعیت فعلی در ریپو

بک‌اند فعلی در [apps/api/src](../../apps/api/src) بر اساس featureهای موجود پیاده‌سازی شده است و شامل این بخش‌ها است:
- [apps/api/src/auth](../../apps/api/src/auth)
- [apps/api/src/podcasts](../../apps/api/src/podcasts)
- [apps/api/src/episodes](../../apps/api/src/episodes)
- [apps/api/src/users](../../apps/api/src/users)
- [apps/api/src/prisma](../../apps/api/src/prisma)

### مدل‌های فعلی Prisma

در [apps/api/prisma/schema.prisma](../../apps/api/prisma/schema.prisma) تنها مدل‌های زیر وجود دارند:
- User
- Podcast
- Episode

### وضعیت فعلی نسبت به Library

در حال حاضر:
- رابطه‌ی کاربر و پادکست فقط برای مالک/creator وجود دارد
- هیچ مدل اشتراک کاربر با پادکست وجود ندارد
- هیچ مدل history برای پیشرفت پخش وجود ندارد
- Library قابلیت‌های user-specific را در بک‌اند ندارد

بنابراین، برای ساخت Library MVP، نیاز به تعریف مالکیت و مدل‌های داده‌ی جدید وجود دارد، اما بدون تغییر در ساختار کلی بک‌اند و بدون ایجاد APIهای غیرضروری.

---

## 2. Feature Ownership

### مالکیت Library در بک‌اند

Library باید فقط این مسئولیت‌ها را داشته باشد:
- ثبت اشتراک کاربر در پادکست
- لغو اشتراک کاربر از پادکست
- بازیابی لیست اشتراک‌ها
- بازیابی continue listening
- به‌روزرسانی progress/history برای اپیزودهای پخش‌شده

### Library نباید مالک باشد

Library نباید مسئول موارد زیر باشد:
- CRUD پادکست
- CRUD اپیزود
- احراز هویت
- پخش صوتی
- جستجو
- بارگذاری فایل یا مدیریت storage

### توضیح مرز مالکیت

Library در این طراحی یک feature consumer است، نه یک feature provider. به عبارت دیگر، Library از داده‌های موجود در Podcast و Episode استفاده می‌کند و فقط تجربه‌ی کاربری مربوط به کتابخانه را فراهم می‌کند. این مرز برای حفظ Clean Architecture و جلوگیری از coupling بین featureها ضروری است.

### پیشنهاد مالکیت فنی

در سطح فنی، Library باید در یک feature area جداگانه مانند `library` تعریف شود، اما وابستگی آن به سرویس‌های موجود باید به‌صورت زیر باشد:
- LibraryService → PodcastService
- LibraryService → EpisodeService
- LibraryService → PrismaService

این مدل باعث می‌شود Library درگیر منطق پادکست و اپیزود نشود، اما از آن‌ها برای اعتبارسنجی وجود و بازگرداندن داده استفاده کند.

---

## 3. Data Model Design

### 3.1 UserSubscription

#### هدف

ذخیره این که یک کاربر به کدام پادکست‌ها اشتراک دارد.

#### پیشنهاد فیلدها

- id: String
- userId: String
- podcastId: String
- subscribedAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime

#### رابطه‌ها

- هر UserSubscription متعلق به یک User است
- هر UserSubscription متعلق به یک Podcast است

#### Constraintها

- unique constraint روی [userId, podcastId]
- index روی userId
- index روی podcastId

#### رفتار حذف

- اگر کاربر حذف شود، اشتراک‌های او حذف شوند
- اگر پادکست حذف شود، اشتراک‌های مربوط به آن نیز حذف شوند

#### دلیل انتخاب

این مدل ساده‌ترین و کم‌ریسک‌ترین راه برای ساخت Library MVP است. در MVP نیازی به مدل جداگانه برای Favorite/Save/Follow نیست؛ اشتراک در این مرحله فقط یک رابطه‌ی مستقلی میان کاربر و پادکست است.

### 3.2 ListeningHistory

#### هدف

ذخیره پیشرفت پخش برای هر کاربر و هر اپیزود.

#### پیشنهاد فیلدها

- id: String
- userId: String
- episodeId: String
- positionSeconds: Int?
- completed: Boolean @default(false)
- lastPlayedAt: DateTime
- createdAt: DateTime
- updatedAt: DateTime

#### رابطه‌ها

- هر ListeningHistory متعلق به یک User است
- هر ListeningHistory متعلق به یک Episode است

#### استراتژی پیشرفت

برای MVP، هر کاربر برای هر اپیزود فقط یک رکورد history دارد. در هر بار به‌روزرسانی، رکورد موجود upsert می‌شود و آخرین position و وضعیت completed ذخیره می‌شود.

#### وضعیت completion

- completed = true اگر کاربر تا پایان اپیزود پیشرفت کرده باشد
- در غیر این صورت false

#### دلیلی که progress باید per Episode باشد

Progress باید بر اساس اپیزود تعریف شود، نه پادکست. دلیل اصلی این است که:
- کاربر معمولاً در سطح اپیزود پخش می‌کند
- هر اپیزود زمان پخش و موقعیت جداگانه دارد
- یک پادکست می‌تواند چند اپیزود داشته باشد و progress هر اپیزود باید مستقل باشد

اگر progress در سطح پادکست ذخیره شود، این اطلاعات برای کاربر به‌درستی نمایش داده نمی‌شود و با مدل فعلی Episode سازگاری ندارد.

#### indexها

- index روی [userId, lastPlayedAt]
- unique constraint روی [userId, episodeId]

---

## 4. Prisma Relationship Design

### رابطه‌ی پیشنهادی 1: User → UserSubscription → Podcast

```text
User
  └── UserSubscription
        └── Podcast
```

#### مشخصات

- یک User می‌تواند چند UserSubscription داشته باشد
- یک Podcast می‌تواند چند UserSubscription داشته باشد
- رابطه‌ی چندبه‌چند با کنترل از سمت کاربر و پادکست پیاده‌سازی می‌شود

#### Integrity

- رابطه از سمت User به UserSubscription باید با cascade delete همراه باشد
- رابطه از سمت Podcast به UserSubscription نیز باید با cascade delete همراه باشد

### رابطه‌ی پیشنهادی 2: User → ListeningHistory → Episode

```text
User
  └── ListeningHistory
        └── Episode
```

#### مشخصات

- یک User می‌تواند چند ListeningHistory داشته باشد
- یک Episode می‌تواند چند ListeningHistory داشته باشد
- برای MVP، هر user/episode فقط یک رکورد history دارد

#### Integrity

- حذف کاربر باید history او را حذف کند
- حذف اپیزود باید history مرتبط با آن را حذف کند

### نکته‌ی مهم

این طراحی از مدل فعلی Prisma استفاده می‌کند و هیچ تغییر schema‌ای در این فاز انجام نمی‌شود. هدف فقط تعریف رابطه‌های پیشنهادی و نحوه‌ی نگهداری integrity است.

---

## 5. REST API Contracts

### پیشنهاد قراردادهای MVP

این قراردادها مناسب‌اند و برای MVP ساده و واضح هستند.

#### 1. Library overview

- GET /api/v1/library
- هدف: بازگرداندن خلاصه‌ی کتابخانه شامل اشتراک‌ها و continue listening

#### 2. List subscriptions

- GET /api/v1/library/subscriptions
- هدف: بازگرداندن پادکست‌های subscribed توسط کاربر

#### 3. Subscribe to podcast

- POST /api/v1/library/subscriptions/:podcastId
- هدف: افزودن پادکست به کتابخانه کاربر

#### 4. Unsubscribe from podcast

- DELETE /api/v1/library/subscriptions/:podcastId
- هدف: حذف پادکست از کتابخانه کاربر

#### 5. Continue listening

- GET /api/v1/library/continue-listening
- هدف: بازگرداندن اپیزودهایی که کاربر اخیراً در حال پیشرفت بوده است

#### 6. Update playback history

- PATCH /api/v1/library/history/:episodeId
- هدف: به‌روزرسانی position و completed برای یک اپیزود

### چرا این قراردادها مناسب‌اند

- با feature ownership هم‌راستا هستند
- برای کاربر و کتابخانه طبیعی‌اند
- از APIهای فعلی فاصله نمی‌گیرند
- نیاز به تغییر در مسیرهای موجود نیست

### نکته‌ی طراحی

در این فاز، بهتر است از مسیرهای library-based استفاده شود، نه مسیرهای user-scoped مثل `/users/:userId/library`. دلیل این انتخاب این است که Library یک feature مستقل است و لازم نیست با resourceهای کاربر به‌صورت مستقیم ادغام شود.

---

## 6. Authorization Rules

### نیاز به احراز هویت

همه‌ی endpointهای Library باید require authentication باشند.

### مکانیزم فعلی

Library باید از همان Auth feature استفاده کند:
- JwtAuthGuard
- GetUser decorator
- current authenticated user id

### قوانین مالکیت

- کاربر فقط می‌تواند داده‌های خود را بخواند یا تغییر دهد
- هیچ endpointی نباید اجازه دهد کاربر به library کاربر دیگر دسترسی پیدا کند
- Library باید در سطح service خود، userId فعلی را به عنوان scope در نظر بگیرد

### عملیات غیرمجاز

- دسترسی به اشتراک‌های کاربر دیگر
- به‌روزرسانی history کاربر دیگر
- دسترسی به subscribe/unsubscribe برای پادکست‌های متعلق به کاربر دیگری

### نتیجه

Auth feature در این طراحی فقط نقش تامین identity و user context را دارد. Library فقط از این context استفاده می‌کند و منطق authorization را در سطح service انجام می‌دهد.

---

## 7. Service Responsibilities

### LibraryService

LibraryService مسئولیت‌های زیر را باید داشته باشد:
- دریافت overview کتابخانه کاربر
- دریافت subscriptions کاربر
- افزودن/حذف subscription
- دریافت continue listening
- به‌روزرسانی history برای اپیزود

### مسئولیت‌های PodcastService

PodcastService باید مسئول باشد:
- یافتن پادکست توسط id
- بازگرداندن داده‌ی پادکست برای نمایش در library
- مدیریت منطق پادکست در سطح podcast domain

### مسئولیت‌های EpisodeService

EpisodeService باید مسئول باشد:
- یافتن اپیزود توسط id
- بازگرداندن اطلاعات اپیزود برای history و continue listening
- مدیریت منطق اپیزود در سطح episode domain

### تقسیم مسئولیت پیشنهادی

LibraryService نباید:
- پادکست ایجاد/به‌روزرسانی کند
- اپیزود ایجاد/به‌روزرسانی کند
- auth را مدیریت کند
- playback را اجرا کند

LibraryService فقط باید از این سرویس‌ها برای اعتبارسنجی و خواندن داده استفاده کند.

---

## 8. Dependency Direction

### جهت وابستگی پیشنهادی

```text
Library Module
  ├── Podcast Service
  ├── Episode Service
  └── Prisma
```

### نکات مهم

- Library نباید به‌صورت مستقیم از UsersService برای منطق business استفاده کند، مگر برای دریافت user context
- Library نباید به سرویس دیگری در جهت معکوس وابسته باشد
- اگر PodcastService یا EpisodeService به LibraryService وابسته شوند، احتمال circular dependency ایجاد می‌شود

### نتیجه

برای جلوگیری از circular dependency، باید LibraryService به‌عنوان consumer عمل کند و PodcastService / EpisodeService به‌عنوان provider باقی بمانند.

---

## 9. MVP Scope

### Included in MVP

- Subscribe به پادکست
- Unsubscribe از پادکست
- Library retrieval
- Continue listening
- Update playback progress/history

### Excluded from MVP

- Favorites
- Collections
- Playlists
- Offline downloads
- Recently played as a separate feature
- Recommendations
- Smart Library
- AI-based organization

### دلیل حذف این موارد

این موارد در MVP نیاز به مدل‌های اضافی، UIهای پیچیده‌تر، یا منطق background/queue دارند. هدف این فاز فقط ایجاد پایه‌ی پایدار برای Library است و نه ساخت یک سیستم همه‌کاره.

---

## 10. Migration Strategy

### بدون ایجاد migration در این فاز

این فاز فقط مستندسازی است و migration تولید نمی‌شود. اما ترتیب پیشنهادی برای پیاده‌سازی بعدی به‌صورت زیر است:

1. تعریف مدل‌های Prisma در فاز بعدی
2. افزودن relations و constraints لازم
3. پیاده‌سازی LibraryService و endpointها
4. انتشار APIها با حفظ compatibility با endpointهای موجود

### Deployment order

- ابتدا schema تغییر کند
- سپس service layer آماده شود
- سپس endpoints فعال شوند
- در نهایت UI Library به آن متصل شود

### Rollback considerations

- اگر rollback لازم شود، endpointهای جدید باید غیر فعال شوند
- حذف schema باید با احتیاط انجام شود چون history و subscriptions داده‌های کاربرمحور هستند
- برای بک‌اندهای زنده، بهتر است rollout به‌صورت staged انجام شود

### Backward compatibility

- هیچ endpoint موجودی نباید تغییر کند
- همه‌ی endpointهای جدید باید به‌صورت additive اضافه شوند
- برنامه‌های فعلی باید بدون تغییر کار کنند

---

## 11. Future Extensibility

این مدل برای آینده قابل گسترش است، بدون نیاز به بازطراحی کامل.

### قابلیت‌های آینده که با این مدل پشتیبانی می‌شوند

- Playlists: با مدل‌های جداگانه‌ی join table قابل اضافه شدن
- Favorites: با یک رابطه‌ی جداگانه قابل توسعه
- Offline Downloads: مستقل از Library و با storage layer جداگانه
- Recently Played: با همان ListeningHistory و یک query متفاوت قابل پیاده‌سازی
- Recommendations: با استفاده از Subscription و History قابل ساخت

### چرا این طراحی آینده‌پذیر است

- Library از داده‌های user-centric استفاده می‌کند
- مدل‌های اصلی ساده‌اند و کد روی آن‌ها خوانا باقی می‌ماند
- در آینده می‌توان بدون تغییر اصول معماری، featureهای جدید اضافه کرد

---

## 12. Architecture Risk Review

### 1. ریسک Consistency

اگر history برای هر اپیزود فقط یک رکورد داشته باشد، باید update semantics دقیق باشد تا داده‌ها دچار تکرار یا منقضی‌ شدن نشوند.

#### Mitigation

- از unique constraint روی [userId, episodeId] استفاده شود
- update از طریق upsert انجام شود

### 2. ریسک Performance

اگر برای هر request، Library از چند relation و join استفاده کند، ممکن است query سنگین شود.

#### Mitigation

- فقط فیلدهای لازم بازگردانده شوند
- برای continue listening از index مناسب استفاده شود
- pagination در endpoints مربوطه اعمال شود

### 3. ریسک Ownership

اگر Library منطق Podcast/Episode را هم در خود داشته باشد، ownership از بین می‌رود.

#### Mitigation

- Library فقط operations user-specific را مدیریت کند
- Podcast/Episode domain در سرویس‌های مربوطه باقی بماند

### 4. ریسک Coupling

اگر Library از Prisma مستقیم و بدون واسطه استفاده کند، coupling با زیرساخت زیاد می‌شود.

#### Mitigation

- از LibraryService و سرویس‌های domain استفاده شود
- Prisma فقط در layer serviceها و نه در controllerها دیده شود

### 5. ریسک Migration

اگر schema تغییرات زیادی داشته باشد، deployment و rollback پیچیده می‌شود.

#### Mitigation

- MVP را محدود نگه داریم
- تغییرات را مرحله‌ای و additive انجام دهیم

---

## 13. Final Recommendation

Library MVP باید بر پایه‌ی دو مدل داده‌ی حداقلی ساخته شود:
- UserSubscription
- ListeningHistory

این مدل‌ها کافی‌اند تا:
- اشتراک کاربر با پادکست ثبت شود
- progress کاربر برای اپیزودها ذخیره شود
- continue listening با هزینه‌ی کم فراهم شود
- feature ownership حفظ شود
- Clean Architecture رعایت شود
- MVP-first با حداقل پیچیدگی اجرا شود

پیشنهاد نهایی این است که Library در بک‌اند به‌عنوان یک feature مستقل با مسئولیت‌های user-scoped تعریف شود، اما از PodcastService و EpisodeService برای دسترسی به داده‌های domain استفاده کند. این رویکرد ساده، قابل‌قبول، و مناسب برای MVP است.

---

## Completion Status

PROJECT UNDERSTOOD: YES

BACKEND ARCHITECTURE COMPLETE: YES

READY FOR BACKEND VALIDATION: YES
