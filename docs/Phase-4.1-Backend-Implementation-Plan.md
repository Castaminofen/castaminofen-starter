# Phase 4.1 — Playlist Backend Implementation Plan

## Executive Summary

بررسی معماری فعلی backend نشان می‌دهد که پیاده‌سازی Playlist backend با ساختار موجود کاملاً سازگار است و هیچ انحراف معماری جدی در مرزهای feature ownership ایجاد نمی‌کند. الگوی فعلی برای modules، controllers، services، DTOها، Prisma و auth به‌خوبی با طراحی تأییدشده Phase 4.0 و Phase 4.0.1 هم‌خوانی دارد.

نتیجه‌ی اصلی:
- ساختار backend فعلی برای افزودن Playlist feature مناسب است.
- Playlist می‌تواند به‌عنوان یک feature مستقل در apps/api/src/playlists پیاده‌سازی شود.
- مرزهای مالکیت با Player، Queue، Library، Search، Podcast، Episode و Auth حفظ می‌شود.
- هیچ تغییر لازم در ساختار موجود برای شروع پیاده‌سازی دیده نمی‌شود.

---

## Current Backend Analysis

### ساختار فعلی

Backend فعلی بر اساس الگوی feature-based NestJS سازماندهی شده است و در مسیر apps/api/src دارای ماژول‌های جداگانه برای موارد زیر است:
- auth
- podcasts
- episodes
- library
- users
- prisma
- storage

هر feature معمولاً شامل:
- module.ts
- controller.ts
- service.ts
- dto/

این ساختار با پیشنهاد Playlist در Phase 4.0 سازگار است.

### بررسی معماری فعلی

الگوی جاری در backend به‌صورت زیر است:
- Controller: مسئول دریافت request و delegating به service
- Service: مسئول منطق کسب‌وکار و permission checks
- PrismaService: ارائه دسترسی دیتابیس از طریق Prisma
- JwtAuthGuard: حفاظت از endpoints بر اساس auth
- GetUser decorator: استخراج شناسه کاربر از request

این الگو برای Playlist نیز مناسب است و از drift جلوگیری می‌کند.

---

## Prisma Compatibility Review

### سازگاری با schema فعلی

Schema فعلی شامل مدل‌های User، Podcast، Episode، UserSubscription و ListeningHistory است. افزودن Playlist و PlaylistItem با رابطه‌های زیر کاملاً سازگار است:
- Playlist -> User
- PlaylistItem -> Playlist
- PlaylistItem -> Episode

این روابط با الگوی موجود برای UserSubscription و ListeningHistory هم‌خوانی دارد.

### نکات مهم

- استفاده از foreign keys مستقیم و cascade برای حذف منطقی و فیزیکی مناسب است.
- اضافه کردن index روی userId + updatedAt، isPublic + updatedAt و playlistId + position با الگوی موجود در schema سازگار است.
- unique constraints روی (playlistId, episodeId) و (playlistId, position) برای جلوگیری از duplicated item و ordering conflict لازم است.

---

## Module Structure Review

پیشنهاد ساختار backend برای Playlist به‌صورت زیر است:

apps/api/src/playlists/
- playlists.module.ts
- playlists.controller.ts
- playlists.service.ts
- dto/
- validators/
- types/

این ساختار با ماژول‌های podcasts و episodes فعلی هم‌خوانی دارد. همچنین AppModule باید PlaylistModule را import کند تا module در سطح اپ فعال شود.

---

## Dependency Validation

### جهت‌وابستگی مجاز

Playlist باید به موارد زیر وابسته باشد:
- User
- Episode
- Prisma
- Auth guard/context

### جهت‌وابستگی غیرمجاز

Playlist نباید به‌صورت مستقیم به Player runtime، Queue، playback state، Search یا Library برای منطق اصلی خود وابسته شود. این اصل در تحلیل فعلی تأیید شد.

نتیجه:
- dependency direction برای Playlist مناسب است.
- هیچ نیاز به ایجاد cross-feature coupling در این فاز وجود ندارد.

---

## DTO Planning

DTOها باید با الگوی موجود در backend هماهنگ باشند و از class-validator استفاده کنند.

### DTOهای پیشنهادی

- CreatePlaylistDto
- UpdatePlaylistDto
- AddPlaylistItemDto
- RemovePlaylistItemDto
- ReorderPlaylistItemsDto
- PlaylistResponseDto
- PlaylistItemResponseDto

### اصول DTO

- validation در سطح DTO با class-validator انجام می‌شود.
- controller نباید منطق business rule داشته باشد.
- DTOها باید ساده و feature-local باشند.

---

## Controller Planning

Controller Playlist باید مسئولیت‌های زیر را داشته باشد:
- دریافت HTTP request
- تبدیل داده به DTO
- فراخوانی service
- بازگرداندن پاسخ استاندارد

این سطح از مسئولیت با الگوی podcasts و episodes فعلی هم‌خوانی دارد.

### Endpoints پیشنهادی

- GET /playlists
- GET /playlists/:id
- POST /playlists
- PATCH /playlists/:id
- DELETE /playlists/:id
- POST /playlists/:id/items
- DELETE /playlists/:id/items/:episodeId
- PATCH /playlists/:id/items/reorder

---

## Service Planning

Service Playlist باید مالک منطق کسب‌وکار باشد و شامل موارد زیر باشد:
- CRUD Playlist
- مدیریت PlaylistItemها
- ownership validation
- duplicate prevention
- reorder validation
- transaction-safe write operations
- تعامل با Prisma

### مسئولیت‌های Service

- ایجاد Playlist برای کاربر auth
- خواندن Playlistهای کاربر
- بررسی مالکیت در update/delete/add/remove/reorder
- جلوگیری از تکرار episode در یک Playlist
- بررسی معتبر بودن position در reorder
- استفاده از transaction برای عملیات multi-write

---

## REST Endpoint Mapping

| Method | Route | Purpose |
|---|---|---|
| GET | /playlists | دریافت لیست Playlistهای کاربر |
| GET | /playlists/:id | دریافت جزئیات یک Playlist |
| POST | /playlists | ایجاد Playlist |
| PATCH | /playlists/:id | به‌روزرسانی Playlist |
| DELETE | /playlists/:id | حذف Playlist |
| POST | /playlists/:id/items | افزودن اپیزود |
| DELETE | /playlists/:id/items/:episodeId | حذف اپیزود |
| PATCH | /playlists/:id/items/reorder | بازچینی آیتم‌ها |

---

## Authorization Review

### الگوی تأییدشده

- همه‌ی endpoints Playlist باید با JwtAuthGuard محافظت شوند.
- شناسه کاربر از GetUser decorator استخراج شود.
- service باید ownership را در همه‌ی عملیات بررسی کند.

### رفتار مورد انتظار

فقط مالک Playlist می‌تواند:
- آن را بخواند
- ویرایش کند
- حذف کند
- آیتم‌های آن را اضافه/حذف/بازچینی کند

---

## Validation Strategy

استراتژی validation باید با الگوی فعلی پروژه هم‌خوان باشد:
- استفاده از ValidationPipe سراسری در main.ts
- استفاده از class-validator در DTOها
- هیچ validation framework سفارشی اضافه نشود

در service نیز برای منطق‌های کسب‌وکار مثل duplicate و ordering از checks صریح استفاده می‌شود.

---

## Risks

### Risk 1 — Medium
- اگر ordering فقط در UI انجام شود، consistency در backend شکسته می‌شود.
- mitigation: validation و enforce در service و database

### Risk 2 — Low
- اگر ownership checks به‌صورت ناقص انجام شوند، دسترسی‌های غیرمجاز ممکن است ایجاد شود.
- mitigation: بررسی ownership در هر operation و استفاده از auth guard

### Risk 3 — Low
- اگر endpointها با الگوی موجود هم‌خوانی نداشته باشند، drift معماری ایجاد می‌شود.
- mitigation: استفاده از الگوی controller/service و naming RESTful فعلی

---

## Recommended Implementation Order

1. افزودن مدل‌های Prisma Playlist و PlaylistItem
2. ایجاد migration Prisma
3. ساخت ماژول Playlist در apps/api/src/playlists
4. پیاده‌سازی DTOها و validation
5. پیاده‌سازی service با ownership و business rules
6. پیاده‌سازی controller با endpoints مورد نیاز
7. ثبت ماژول در AppModule
8. اجرای Prisma generate/migrate
9. اجرای lint و build و رفع خطاها

---

## Final Assessment

معماری تأییدشده با ساختار فعلی پروژه سازگار است و می‌توان آن را بدون ایجاد drift یا cross-feature violation پیاده‌سازی کرد.
