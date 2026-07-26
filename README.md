# Castaminofen

Castaminofen یک پلتفرم موبایل‌فرست برای پادکست است که به‌صورت مونو-ریپو پیاده‌سازی شده است. این مخزن شامل یک اپ فرانت‌اند با Next.js، یک اپ بک‌اند با NestJS، بسته مشترک تایپ‌ها و زیرساخت محلی برای PostgreSQL، Redis و MinIO می‌شود.

## معرفی پروژه

این پروژه برای ارائه تجربه‌ی مرور، کشف و پخش پادکست طراحی شده است. در نسخه‌ی فعلی، تمرکز روی ساختار پایه‌ی محصول است؛ شامل احراز هویت، مدیریت پادکست و اپیزود، بخش Library و Playlist و زیرساختی که برای پخش و تجربه‌های آینده لازم است.

ویژگی‌های اصلی قابل‌تشخیص در این نسخه شامل موارد زیر است:

- احراز هویت کاربر
- مدیریت پادکست و اپیزود
- مدیریت Library و Playlist
- پخش آنلاین و ساختار اولیه‌ی پخش
- زیرساخت محلی برای دیتابیس و storage

## تکنولوژی‌های استفاده‌شده

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- Vitest

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- MinIO
- JWT
- bcrypt
- class-validator
- class-transformer
- cookie-parser

### ابزارهای توسعه
- pnpm
- Docker Compose
- ESLint
- Prettier
- TypeScript

## ساختار پروژه

ریپو به‌صورت مونو-ریپو سازماندهی شده است:

- `apps/web`: اپ فرانت‌اند با Next.js
- `apps/api`: اپ بک‌اند با NestJS
- `packages/shared-types`: بسته مشترک برای تایپ‌های مورد استفاده در چند قسمت پروژه
- `packages/config`: پیکربندی مشترک TypeScript
- `docs`: مستندات و گزارش‌های فازها
- `docker-compose.yml`: سرویس‌های محلی PostgreSQL، Redis و MinIO

هر اپ مسئولیت خود را دارد و کدهای مشترک در بسته‌های مناسب نگهداری می‌شوند.

## پیش‌نیازها

قبل از اجرای پروژه روی محیط محلی، موارد زیر لازم است:

- Git
- Node.js با نسخه LTS اخیر
- pnpm
- Docker و Docker Compose
- PostgreSQL (در صورت استفاده از راه‌اندازی جداگانه یا بررسی دستی)
- فایل‌های محیطی لازم برای اجرای اپ

> نسخه دقیق Node.js در این ریپو مشخص نشده است، بنابراین استفاده از نسخه LTS اخیر پیشنهاد می‌شود.

## نصب پروژه

1. سورس پروژه را clone کنید:

```bash
git clone <repository-url>
cd castaminofen-starter
```

2. وابستگی‌ها را نصب کنید:

```bash
pnpm install
```

3. فایل‌های محیطی نمونه را از روی الگو ایجاد کنید:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

4. سرویس‌های محلی را راه‌اندازی کنید:

```bash
docker compose up -d
```

5. در صورت نیاز، Prisma را آماده کنید. در این نسخه اسکریپت رسمی برای Prisma Generate/Migrate/Seed در package.json تعریف نشده است، بنابراین این مرحله باید با بررسی محیط محلی انجام شود.

## اسکریپت‌های پروژه

### اسکریپت‌های سطح ریشه

| اسکریپت | توضیح |
|---|---|
| `pnpm dev:web` | اجرای اپ Frontend در حالت توسعه |
| `pnpm dev:api` | اجرای اپ Backend در حالت توسعه |
| `pnpm build` | Build کل Workspace شامل shared-types، web و api |
| `pnpm lint` | اجرای lint برای کل Workspace |
| `pnpm lint:web` | اجرای lint برای Frontend |
| `pnpm lint:api` | اجرای lint برای Backend |
| `pnpm lint:fix` | اجرای ESLint با اصلاح خودکار |

### اسکریپت‌های Frontend

| اسکریپت | توضیح |
|---|---|
| `pnpm --filter @castaminofen/web dev` | اجرای Next.js در حالت توسعه |
| `pnpm --filter @castaminofen/web build` | Build اپ Web |
| `pnpm --filter @castaminofen/web start` | اجرای نسخه production اپ Web |
| `pnpm --filter @castaminofen/web lint` | اجرای lint اپ Web |
| `pnpm --filter @castaminofen/web test` | اجرای تست‌های Frontend |

### اسکریپت‌های Backend

| اسکریپت | توضیح |
|---|---|
| `pnpm --filter @castaminofen/api start` | اجرای نسخه build شده‌ی Backend |
| `pnpm --filter @castaminofen/api start:dev` | اجرای Backend در حالت watch |
| `pnpm --filter @castaminofen/api build` | Build اپ API |
| `pnpm --filter @castaminofen/api lint` | اجرای lint اپ API |

### اسکریپت‌های بسته مشترک

| اسکریپت | توضیح |
|---|---|
| `pnpm --filter @castaminofen/shared-types build` | Build بسته shared-types |

## متغیرهای محیطی

فایل‌های نمونه‌ی محیطی در این ریپو موجود هستند:

- [.env.example](.env.example)
- [apps/api/.env.example](apps/api/.env.example)

| نام متغیر | کاربرد | وضعیت | توضیح |
|---|---|---|---|
| `DATABASE_URL` | اتصال به PostgreSQL | لازم | آدرس اتصال دیتابیس |
| `REDIS_URL` | اتصال به Redis | لازم | آدرس سرویس Redis |
| `MINIO_ENDPOINT` | endpoint MinIO | لازم | آدرس سرویس MinIO |
| `MINIO_ACCESS_KEY` | access key MinIO | لازم | نام کاربری MinIO |
| `MINIO_SECRET_KEY` | secret key MinIO | لازم | رمز عبور MinIO |
| `MINIO_BUCKET` | bucket MinIO | لازم | نام bucket مورد استفاده |
| `PORT` | پورت API | لازم | پورت اجرای Backend |
| `JWT_SECRET` | امضای توکن JWT | لازم | secret برای access token |
| `JWT_REFRESH_SECRET` | امضای refresh token | لازم | secret برای refresh token |
| `ACCESS_TOKEN_TTL` | مدت اعتبار access token | لازم در فایل نمونه API | مثال: `15m` |
| `REFRESH_TOKEN_TTL` | مدت اعتبار refresh token | لازم در فایل نمونه API | مثال: `7d` |

## معماری کلی پروژه

پروژه به‌صورت مونو-ریپو طراحی شده است و تقسیم وظایف آن به‌صورت زیر است:

- Frontend مسئول تجربه کاربری و نمایش صفحه‌ها است.
- Backend مسئول منطق کسب‌وکار، اعتبارسنجی و دسترسی به دیتابیس است.
- بسته‌های مشترک برای استفاده‌ی مشترک در چند بخش پروژه نگهداری می‌شوند.
- Featureهای اصلی در سطح فرانت‌اند و بک‌اند به‌صورت مجزا مدیریت می‌شوند.

این ساختار برای رشد تدریجی و حفظ سادگی پروژه طراحی شده است.

## روند توسعه

### نصب و راه‌اندازی
```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
docker compose up -d
```

### Build
```bash
pnpm build
```

### Lint
```bash
pnpm lint
```

### Test
```bash
pnpm --filter @castaminofen/web test
```

### Prisma workflow
در این نسخه، workflow Prisma به‌صورت رسمی از طریق اسکریپت‌های package.json تعریف نشده است و باید با بررسی محیط محلی انجام شود.

## مشارکت در توسعه

برای مشارکت در پروژه، پیشنهاد می‌شود:

- تغییرات را کوچک و هدفمند نگه دارید.
- ساختار فعلی پروژه را رعایت کنید.
- قبل از اضافه کردن ابزار یا dependency جدید، نیاز واقعی را بررسی کنید.
- مستندات را به‌روز نگه دارید.

## لایسنس

در این مخزن فایل مجوزی یافت نشد.
