# Phase 4.1 — Playlist Backend Implementation Report

## Executive Summary

پیاده‌سازی بک‌اند Playlist در ریپو با رعایت معماری تأییدشده Phase 4.0 و Phase 4.0.1 انجام شد. این implementation شامل افزودن مدل‌های Prisma، ماژول جدید در NestJS، controller/service، DTOها، validation و endpoints مربوط به CRUD و PlaylistItemها است. مرزهای مالکیت feature در سطح backend حفظ شده و Playlist به‌عنوان feature-owned برای CRUD و ordering خود عمل می‌کند بدون اینکه مسئولیت‌های Player، Queue، Library، Search یا Auth را بر عهده بگیرد.

---

## Files Created

- apps/api/src/playlists/playlists.module.ts
- apps/api/src/playlists/playlists.controller.ts
- apps/api/src/playlists/playlists.service.ts
- apps/api/src/playlists/dto/create-playlist.dto.ts
- apps/api/src/playlists/dto/update-playlist.dto.ts
- apps/api/src/playlists/dto/add-playlist-item.dto.ts
- apps/api/src/playlists/dto/reorder-playlist-items.dto.ts
- apps/api/src/playlists/validators/playlist.validators.ts
- apps/api/src/playlists/types/playlist.types.ts

---

## Files Modified

- apps/api/src/app.module.ts
- apps/api/prisma/schema.prisma

---

## Prisma Changes

مدل‌های زیر به schema اضافه شدند:
- Playlist
- PlaylistItem

### Relations
- Playlist -> User
- PlaylistItem -> Playlist
- PlaylistItem -> Episode

### Constraints and indexes
- unique constraint روی (playlistId, episodeId)
- unique constraint روی (playlistId, position)
- index روی (userId, updatedAt)
- index روی (isPublic, updatedAt)
- index روی (playlistId, position)
- index روی (episodeId)

---

## Database Migration Summary

Migration ایجاد و اعمال شد:
- 20260726062642_add_playlists

این migration شامل ساخت جداول Playlist و PlaylistItem و اعمال constraints/indexes مربوطه است.

---

## REST Endpoints Implemented

- GET /playlists
- GET /playlists/:id
- POST /playlists
- PATCH /playlists/:id
- DELETE /playlists/:id
- POST /playlists/:id/items
- DELETE /playlists/:id/items/:episodeId
- PATCH /playlists/:id/items/reorder

---

## DTOs Implemented

- CreatePlaylistDto
- UpdatePlaylistDto
- AddPlaylistItemDto
- ReorderPlaylistItemsDto

---

## Services Implemented

- PlaylistsService

### Service capabilities
- create playlist
- list playlists for authenticated user
- fetch playlist by id with items
- update playlist metadata
- delete playlist
- add playlist item with duplicate prevention
- remove playlist item
- reorder playlist items with validation
- enforce user ownership on every protected operation

---

## Controller Summary

- PlaylistsController با استفاده از JwtAuthGuard و GetUser decorator پیاده‌سازی شد.
- مسئولیت controller محدود به request handling و delegating به service باقی ماند.

---

## Authorization Summary

- همه‌ی endpoints Playlist با JwtAuthGuard محافظت شدند.
- ownership در service بررسی می‌شود.
- فقط مالک Playlist به داده‌های آن دسترسی دارد.

---

## Validation Summary

- از ValidationPipe سراسری موجود استفاده شد.
- DTOها با class-validator تعریف شدند.
- برای reorder، validation سطح service با checks صریح برای position uniqueness و non-negative values اعمال شد.

---

## Business Rules Implemented

- جلوگیری از افزودن duplicate episode در یک Playlist
- جلوگیری از تکرار position در reorder
- validation position > 0
- ownership validation برای همه‌ی عملیات
- استفاده از transaction برای reorder و add-item operations
- consistent error handling با NotFound/Forbidden/Conflict/BadRequest exceptions

---

## Architecture Preservation

این پیاده‌سازی با اصول approved architecture هماهنگ است:
- Playlist feature در سطح backend به‌صورت مستقل نگهداری شد.
- Player، Queue، playback، listening history، Podcast logic، Episode logic، Search و Auth خارج از scope این feature باقی ماندند.
- هیچ مسئولیت cross-feature به Playlist منتقل نشد.

---

## Dependency Verification

وابستگی‌های اصلی Playlist به‌صورت زیر تأیید شد:
- User
- Episode
- Prisma
- Auth guard/context

بدون وابستگی مستقیم به Player runtime یا Queue lifecycle.

---

## Build Results

### Commands run
- pnpm --filter @castaminofen/api exec prisma generate --schema=prisma/schema.prisma
- DATABASE_URL='postgresql://postgres:postgres@localhost:5432/castaminofen' pnpm --filter @castaminofen/api exec prisma migrate dev --name add-playlists --schema=prisma/schema.prisma
- pnpm --filter @castaminofen/api lint
- pnpm --filter @castaminofen/api build

### Status
- Prisma generate: success
- Prisma migrate: success
- Lint: success
- Build: success

---

## Risks

- reorder و duplicate prevention در UI اگر به‌صورت ناقص پیاده‌سازی شوند، ممکن است با backend inconsistency مواجه شوند.
- در آینده، اگر عملیات public/shared playlists اضافه شود، schema و authorization rules باید به‌روزرسانی شوند.

---

## Final Recommendation

پیاده‌سازی Playlist backend با ساختار تأییدشده Phase 4.0 و Phase 4.0.1 سازگار است و می‌توان آن را به‌عنوان نسخه‌ی اولیه قابل قبول برای ادامه‌ی فازهای بعدی در نظر گرفت.
