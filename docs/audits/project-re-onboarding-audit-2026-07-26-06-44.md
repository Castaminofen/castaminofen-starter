# گزارش Audit مجدد پروژه Castaminofen

## 1. تاریخ بررسی
- 2026-07-26 06:44

## 2. نسخه / وضعیت پروژه
- پروژه در شاخه `main` و به‌صورت مونو-ریپو در حال نگهداری است.
- ساختار اصلی شامل `apps/web` برای فرانت‌اند، `apps/api` برای بک‌اند و `packages/shared-types` برای types مشترک است.
- بر اساس مستندات موجود، پروژه از فازهای foundation و feature-boundary عبور کرده و در وضعیت تثبیت featureهای اصلی مانند Auth، Podcast، Episode، Player و Library قرار دارد.
- هیچ تغییر کدی در این audit انجام نشده است.

## 3. خلاصه اجرایی
- بررسی قوانین پروژه از فایل `.github/copilot-instructions.md` و مستندات اصلی `docs/architecture.md`، `docs/project-status.md`، `docs/tech-stack.md`، `docs/folder-structure.md`، `docs/dependencies.md` و `docs/ui-ux-design-system.md` انجام شد.
- ساختار فعلی Repository با واقعیت کد هم‌خوانی دارد و ویژگی‌های اصلی پروژه در این نسخه قابل‌تشخیص‌اند.
- فرانت‌اند بر پایه Next.js App Router، TypeScript، Tailwind، Zustand، TanStack Query، React Hook Form و Zod پیاده‌سازی شده است.
- بک‌اند بر پایه NestJS، Prisma، PostgreSQL، Redis و MinIO پیاده‌سازی شده و feature-based structure در `apps/api/src` قابل مشاهده است.
- اعتبارسنجی فعلی با اجرای `pnpm lint`، `pnpm --filter @castaminofen/web test` و `pnpm build` انجام شد و نتیجه آنها موفق بود.

## 4. بررسی قوانین پروژه و copilot-instructions.md
- فایل `.github/copilot-instructions.md` منبع اصلی قوانین مهندسی و رفتار AI برای این ریپو است.
- قوانین کلیدی استخراج‌شده:
  - معماری Feature-Based و MVP-first
  - اجتناب از over-engineering و اضافه کردن dependency بدون نیاز
  - استفاده از TypeScript strict، Tailwind، Zustand، TanStack Query، React Hook Form و Zod در فرانت‌اند
  - استفاده از NestJS، Prisma، PostgreSQL، Redis و MinIO در بک‌اند
  - رعایت boundaryهای feature و جلوگیری از duplication logic
  - مستندسازی تغییرات و رعایت phase-based development
- نتیجه: ساختار فعلی ریپو در سطح کلی با این قوانین سازگار است و هیچ تخلف اساسی در اصول پایه مشاهده نشد.

## 5. درک معماری فعلی
- معماری کلی پروژه بر اساس جداسازی واضح میان frontend و backend است:
  - Frontend: تجربه کاربری، routing، state UI و composition feature
  - Backend: منطق کسب‌وکار، validation، دیتابیس و storage
  - Shared types: استفاده‌ی مرکزی برای contracts مشترک بین دو لایه
- در سطح فرانت‌اند، ساختار فعلی بر اساس لایه‌های زیر است:
  - `apps/web/src/app`: routeها و page entry points
  - `apps/web/src/features`: featureهای Auth، Podcasts، Episodes، Player، Library و Search
  - `apps/web/src/components`: componentهای UI و layout
  - `apps/web/src/shared`: زیرساخت‌های مشترک
  - `apps/web/src/stores`: Zustand stores
- در سطح بک‌اند، ساختار فعلی در `apps/api/src` با پوشه‌های feature-based مانند `auth`، `podcasts`، `episodes`، `library`، `playlists`، `storage` و `users` حضور دارد.

## 6. بررسی ساختار Repository
- ساختار ریپو با مستندات هماهنگ است:
  - `apps/web`: اپ فرانت‌اند
  - `apps/api`: اپ بک‌اند
  - `packages/shared-types`: shared types
  - `docs`: مستندات و گزارش‌های فازها
  - `docker-compose.yml`: سرویس‌های محلی PostgreSQL، Redis و MinIO
- مسیرهای اصلی در فرانت‌اند:
  - `apps/web/src/app` شامل routeهای `login`, `register`, `podcasts`, `episodes`, `library`, `search`, `profile`
  - `apps/web/src/features` شامل featureهای اصلی
  - `apps/web/src/components` شامل UI و layout components
  - `apps/web/src/stores` شامل `authStore.ts` و `playerStore.ts`
- مسیرهای اصلی در بک‌اند:
  - `apps/api/src/auth`
  - `apps/api/src/podcasts`
  - `apps/api/src/episodes`
  - `apps/api/src/library`
  - `apps/api/src/playlists`
  - `apps/api/src/storage`
  - `apps/api/src/users`

## 7. بررسی Technology Stack

| Area | Documented | Actual | Status |
|---|---|---|---|
| Frontend framework | Next.js App Router | Next.js 14.2.15 | ✅ |
| Frontend language | TypeScript | TypeScript | ✅ |
| Styling | Tailwind CSS | Tailwind CSS 3.4.17 | ✅ |
| State management | Zustand | Zustand 5.0.14 | ✅ |
| Data fetching | TanStack Query | `@tanstack/react-query` 5.101.2 | ✅ |
| Forms / validation | React Hook Form + Zod | `react-hook-form` 7.81.0 + `zod` 4.4.3 | ✅ |
| Backend framework | NestJS | `@nestjs/*` 10.4.x | ✅ |
| ORM / DB | Prisma + PostgreSQL | Prisma + PostgreSQL via Docker | ✅ |
| Cache / Queue | Redis + BullMQ | Redis present, BullMQ not installed | ⚠️ |
| Storage | MinIO / S3-compatible | MinIO via Docker | ✅ |
| Auth | JWT + Refresh + bcrypt | bcrypt + auth routes present | ✅ |
| i18n / RTL | next-intl planned | not installed in current workspace | ⚠️ |

## 8. بررسی Feature Ownership
- ownership فرانت‌اند به‌صورت feature-based در `apps/web/src/features` حفظ شده است.
- مرزهای فعلی به‌صورت زیر قابل‌تشخیص‌اند:
  - `auth`: مربوط به login/register/protected route و state auth
  - `podcasts`: مربوط به list/detail/create/edit و منطق مرتبط با podcast
  - `episodes`: مربوط به detail/create/upload و workflow اپیزود
  - `player`: مربوط به runtime، store، UI و queue playback
  - `library`: مربوط به experience library و integration با player
- بخش‌های shared در `apps/web/src/shared` و `apps/web/src/lib` برای زیرساخت‌های مشترک نگه داشته شده‌اند و به‌طور کلی از تداخل شدید بین featureها جلوگیری می‌کند.
- در بک‌اند نیز feature ownership در پوشه‌های مستقیم `src/{feature}` قابل‌مشاهده است و هنوز به ساختار `modules/` مهاجرت نشده اما از نظر عملی، boundaryها نسبتاً روشن‌اند.

## 9. وضعیت Featureهای اصلی

| Feature | Status | Ownership | Risks |
|---|---|---|---|
| Auth | موجود و فعال | `apps/web/src/features/auth` + shared auth infrastructure | نیاز به نظارت بیشتر روی refresh/session handling در UI |
| Podcast | موجود | `apps/web/src/features/podcasts` | نیاز به پایش بیشتر در مورد edge cases query و pagination |
| Episode | موجود | `apps/web/src/features/episodes` | coupling با route composition و upload flow باید حفظ شود |
| Player | در وضعیت تثبیت‌شده | `apps/web/src/features/player` | مرزها خوب تعریف شده‌اند اما باید به‌صورت تدریجی از compatibility paths محافظت شود |
| Library | در حال تکمیل و integration | `apps/web/src/features/library` | وابستگی به player state باید ساده و بدون state دوتایی باقی بماند |

## 10. بررسی Migrationهای انجام‌شده
- مستندات فازها نشان می‌دهند که پروژه در چند مرحله migration feature-based انجام داده است، از جمله:
  - Auth Feature Boundary Adoption
  - Podcast Feature Boundary Adoption
  - Episode Feature Boundary Adoption
  - Player Feature Foundation و Runtime Foundation
  - Player Consumption Migration
  - Player UI Foundation و Runtime Surface Migration
  - Library و Player Runtime Integration
- این مهاجرت‌ها در سطح معماری افزایشی بوده‌اند و بدون تغییر routeها یا قراردادهای API انجام شده‌اند.
- نتیجه‌ی این روند، افزایش وضوح ownership و کاهش وابستگی‌های غیرضروری در لایه فرانت‌اند است.

## 11. بررسی Quality و استانداردهای کدنویسی
- ابزارهای اصلی کیفیت کد در ریپو فعال‌اند:
  - ESLint
  - TypeScript
  - Vitest برای فرانت‌اند
  - Build برای وب و API
- وضعیت اعتبارسنجی در زمان audit:
  - `pnpm lint`: موفق
  - `pnpm --filter @castaminofen/web test`: 18 تست موفق
  - `pnpm build`: موفق
- از نظر ساختار کدنویسی، پروژه از اصول feature-based، composable UI و separation of concerns پیروی می‌کند.
- در سطح مستندات، خوانایی و وضعیت phase-based development خوب حفظ شده است.
- نکته مهم: هنوز برخی زیرساخت‌های آینده مانند `next-intl` و BullMQ به‌عنوان dependency رسمی در workspace دیده نمی‌شوند، اما این موضوع در مستندات به‌عنوان planned یا roadmap مطرح شده است.

## 12. ریسک‌های فعلی

### Critical
- هیچ ریسک Critical مستقیم در زمان این audit مشاهده نشد.

### High
- نبود `next-intl` در workspace، در حالی که در مستندات و طراحی UX به‌عنوان بخشی از RTL/i18n مطرح شده است.
- نبود BullMQ در workspace، در حالی که در مستندات backend queue/jobs به‌عنوان بخشی از معماری آینده ذکر شده است.

### Medium
- در auth UI، ذخیره‌سازی token و refresh flow در سطح فعلی نیاز به توجه بیشتر برای edge cases دارد.
- در برخی قسمت‌های foundation، routeهای صفحه‌ای هنوز بیشتر در سطح scaffold/placeholder باقی مانده‌اند و نیازمند تکمیل تدریجی هستند.

### Low
- ساختار بک‌اند هنوز در `src/{feature}` مستقیم نگهداری می‌شود نه در `modules/`؛ این موضوع برای MVP قابل‌قبول است اما باید در مستندات روشن بماند.

## 13. مواردی که نباید تغییر کنند
- ساختار مونو-ریپو با `apps/web`، `apps/api` و `packages/shared-types`
- اصول feature-based برای فرانت‌اند و بک‌اند
- استفاده از REST API با versioning `api/v1`
- استفاده از Docker Compose برای PostgreSQL، Redis و MinIO
- مرزهای feature Auth، Podcast، Episode، Player و Library
- قواعد موجود در `.github/copilot-instructions.md` و مستندات `docs/`

## 14. پیشنهاد قدم بعدی
- قدم بعدی منطقی برای ادامه پروژه، ادامه‌ی تثبیت و تکمیل featureهای نزدیک به MVP با تمرکز بر زیرساخت‌های پایدار است.
- در اولویت بعدی، پیشنهاد می‌شود روی دو موضوع تمرکز شود:
  1. تکمیل یا تثبیت زیرساخت‌های Offline / Playback experience در کنار Player
  2. آماده‌سازی زیرساخت‌های آینده مانند i18n/RTL و queue/jobs به‌صورت تدریجی و بدون ایجاد over-engineering
- اگر قرار باشد مرحله‌ی بعدی بر اساس مستندات فعلی انتخاب شود، بهترین گزینه، ادامه‌ی مسیر تثبیت Player/Library و سپس ورود به فازهای مرتبط با Offline و Playlist است.

## 15. نتیجه نهایی
- پروژه در وضعیت قابل‌قبول و هم‌راستا با مستندات فعلی قرار دارد.
- معماری کلی، ساختار feature-based، boundaryهای اصلی و ابزارهای مورد استفاده با واقعیت کد هماهنگ‌اند.
- از نظر کیفیت و استقرار، پروژه در وضعیت آماده برای ادامه‌ی توسعه قرار دارد.
- این audit به‌صورت analysis-only انجام شد و هیچ تغییر کدی در ریپو ایجاد نکرد.

PROJECT UNDERSTOOD: YES
READY TO CONTINUE: YES
