# Castaminofen

Castaminofen یک پلتفرم موبایل‌فرست برای پادکست است که در قالب یک مونو-ریپو برای تجربه‌ی مرور، کشف، مدیریت و پخش پادکست پیاده‌سازی شده است. این مخزن شامل یک اپ فرانت‌اند با Next.js، یک اپ بک‌اند با NestJS، بسته‌ی مشترک تایپ‌ها و زیرساخت محلی برای PostgreSQL، Redis و MinIO است.

## مرور کلی پروژه

نسخه‌ی فعلی این ریپو در محدوده‌ی MVP، تجربه‌ی اصلی کاربر را برای احراز هویت، مرور پادکست و اپیزود، جستجو، Library، Playlist و پخش آنلاین فراهم می‌کند. تمرکز بر ساختار سازگار، مالکیت feature، و آماده‌سازی برای اولین انتشار رسمی است.

## نمای کلی معماری

پروژه بر پایه‌ی معماری مونو-ریپو و تقسیم مسئولیت‌های feature-oriented ساخته شده است:

- Frontend در [apps/web](apps/web) با Next.js و React پیاده‌سازی شده است.
- Backend در [apps/api](apps/api) با NestJS و Prisma اجرا می‌شود.
- بسته‌ی مشترک تایپ‌ها در [packages/shared-types](packages/shared-types) نگهداری می‌شود.
- مستندات و گزارش‌های فازها در [docs](docs) مستقر شده‌اند.

## تکنولوژی‌های اصلی

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

## ساختار مخزن

- [apps/web](apps/web): اپ فرانت‌اند
- [apps/api](apps/api): اپ بک‌اند
- [packages/shared-types](packages/shared-types): تایپ‌های مشترک
- [packages/config](packages/config): پیکربندی مشترک
- [docs](docs): مستندات، گزارش‌ها و فازها
- [docker-compose.yml](docker-compose.yml): سرویس‌های محلی دیتابیس و storage

## پیش‌نیازها

قبل از اجرای پروژه، موارد زیر لازم است:

- Git
- Node.js با نسخه‌ی LTS اخیر
- pnpm
- Docker و Docker Compose
- PostgreSQL، Redis و MinIO برای اجرای کامل محیط محلی

## نصب و راه‌اندازی

1. کلون پروژه را دریافت کنید:

```bash
git clone <repository-url>
cd castaminofen-starter
```

2. وابستگی‌ها را نصب کنید:

```bash
pnpm install
```

3. فایل‌های محیطی نمونه را آماده کنید:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

4. سرویس‌های محلی را راه‌اندازی کنید:

```bash
docker compose up -d
```

## اجرای برنامه

### Backend

```bash
pnpm dev:api
```

### Frontend

```bash
pnpm dev:web
```

## تست، lint و build

```bash
pnpm lint
pnpm build
pnpm --filter @castaminofen/web test
```

## متغیرهای محیطی

فایل‌های نمونه‌ی محیطی موجود هستند:

- [.env.example](.env.example)
- [apps/api/.env.example](apps/api/.env.example)

متغیرهای اصلی شامل موارد زیر هستند:

- DATABASE_URL
- REDIS_URL
- MINIO_ENDPOINT
- MINIO_ACCESS_KEY
- MINIO_SECRET_KEY
- MINIO_BUCKET
- PORT
- JWT_SECRET
- JWT_REFRESH_SECRET
- ACCESS_TOKEN_TTL
- REFRESH_TOKEN_TTL

## امکانات اصلی MVP

- احراز هویت کاربر
- مرور پادکست و اپیزود
- جستجو
- Library و Continue Listening
- Playlist
- Player با Queue، Repeat و Shuffle
- زیرساخت API و Prisma برای داده‌های اصلی

## مستندات مرتبط

- [docs/architecture.md](docs/architecture.md)
- [docs/quick-start.md](docs/quick-start.md)
- [docs/project-status.md](docs/project-status.md)
- [docs/releases/v1.0.0-mvp.md](docs/releases/v1.0.0-mvp.md)

## بخش اسکرین‌شات

بخش اسکرین‌شات برای نسخه‌ی رسمی MVP در آینده تکمیل خواهد شد.

## نقشه راه

- تکمیل CI و تست‌های end-to-end
- بهبود تجربه‌ی refresh/session در وب
- تقویت پایداری runtime و edge-case‌های پخش
- گسترش قابلیت‌های بعدی در مسیر محصول

## مشارکت

برای مشارکت در توسعه، تغییرات را کوچک و هدفمند نگه دارید، ساختار فعلی را رعایت کنید و مستندات را به‌روز نگه دارید.

## لایسنس

در این مخزن در حال حاضر فایل مجوزی وجود ندارد. برای انتشار رسمی، تکمیل مجوز مناسب توصیه می‌شود.
