# راه‌اندازی پروژه از صفر

این راهنما برای توسعه‌دهنده‌ای نوشته شده است که برای اولین بار سورس پروژه را روی ماشین محلی دریافت کرده است. هدف آن است که بدون حدس‌زدن، مراحل لازم برای اجرای کامل پروژه از صفر روشن شود.

## 1. پیش‌نیازها

قبل از شروع، اطمینان حاصل کنید که موارد زیر در محیط شما موجود باشند:

- Git
- Node.js با نسخه LTS اخیر
- pnpm
- Docker و Docker Compose
- PostgreSQL در صورت استفاده از راه‌اندازی جداگانه خارج از Docker

> نسخه دقیق Node.js در ریپو تعیین نشده است. برای این پروژه، استفاده از نسخه LTS اخیر توصیه می‌شود.

## 2. دریافت سورس پروژه

سورس پروژه را از مخزن Git clone کنید:

```bash
git clone <repository-url>
cd castaminofen-starter
```

## 3. نصب وابستگی‌ها

در ریشه پروژه، وابستگی‌ها را با pnpm نصب کنید:

```bash
pnpm install
```

## 4. ساخت فایل‌های Environment

در ریشه پروژه، فایل‌های Environment نمونه موجود هستند:

- [.env.example](../.env.example)
- [apps/api/.env.example](../apps/api/.env.example)

برای شروع، باید نسخه‌های محلی این فایل‌ها را ایجاد کنید:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

مقادیر موجود در این فایل‌ها باید مطابق محیط محلی شما تنظیم شوند. اگر مقدار خاصی در محیطتان متفاوت است، آن را ویرایش کنید.

متغیرهای شناخته‌شده در این نسخه شامل موارد زیر هستند:

- `DATABASE_URL`
- `REDIS_URL`
- `MINIO_ENDPOINT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`

## 5. آماده‌سازی پایگاه داده

پروژه از PostgreSQL استفاده می‌کند و سرویس‌های لازم از طریق Docker Compose در دسترس هستند.

### 5.1 راه‌اندازی سرویس‌های محلی

در ریشه پروژه، سرویس‌های Docker را اجرا کنید:

```bash
docker compose up -d
```

این دستور سرویس‌های زیر را راه‌اندازی می‌کند:

- PostgreSQL روی پورت `5432`
- Redis روی پورت `6379`
- MinIO روی پورت‌های `9000` و `9001`

### 5.2 Prisma workflow

پروژه از Prisma و فایل اسکیما در [apps/api/prisma/schema.prisma](../apps/api/prisma/schema.prisma) استفاده می‌کند. در این ریپو، اسکریپت‌های مشخصی برای Prisma Generate، Migrate یا Seed در package.json تعریف نشده‌اند.

بنابراین اگر نیاز به آماده‌سازی دیتابیس دارید، این مراحل باید با بررسی دستوری که در محیط شما در دسترس است انجام شود:

```bash
pnpm --filter @castaminofen/api exec prisma generate
```

اگر در محیط شما نیاز به اعمال migration یا sync دیتابیس دارید، باید این کار را با ابزار Prisma مربوطه و با توجه به تنظیمات محلی انجام دهید.

> در این نسخه، هیچ seed script رسمی در repository ثبت نشده است.

## 6. Build پروژه

برای build کل Workspace، دستور زیر را اجرا کنید:

```bash
pnpm build
```

این دستور سه بخش اصلی را build می‌کند:

- `@castaminofen/shared-types`
- `@castaminofen/web`
- `@castaminofen/api`

## 7. اجرای Backend

برای اجرای Backend، دستور زیر را اجرا کنید:

```bash
pnpm dev:api
```

این دستور اپ API را در حالت توسعه اجرا می‌کند.

## 8. اجرای Frontend

برای اجرای Frontend، دستور زیر را اجرا کنید:

```bash
pnpm dev:web
```

این دستور اپ Web را در حالت توسعه اجرا می‌کند.

## 9. اجرای کل Workspace

اگر بخواهید هر دو بخش را به‌صورت جداگانه اجرا کنید، دو دستور فوق کافی است. اگر بخواهید کل Workspace را به‌صورت یکجا مدیریت کنید، می‌توانید از اسکریپت‌های سطح ریشه استفاده کنید.

## 10. آدرس‌های محلی پروژه

آدرس‌های زیر بر اساس تنظیمات موجود در پروژه قابل‌استفاده‌اند:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MinIO Console: `http://localhost:9001`

> آدرس‌های بالا بر اساس تنظیمات موجود در فایل‌های پیکربندی و package.json قابل تأیید هستند.

## 11. اسکریپت‌های مهم

| Script | توضیح |
|---|---|
| `pnpm install` | نصب وابستگی‌های کل Workspace |
| `pnpm dev:web` | اجرای Frontend در حالت توسعه |
| `pnpm dev:api` | اجرای Backend در حالت توسعه |
| `pnpm build` | Build کل پروژه |
| `pnpm lint` | اجرای lint برای کل Workspace |
| `pnpm lint:web` | اجرای lint برای Frontend |
| `pnpm lint:api` | اجرای lint برای Backend |
| `pnpm lint:fix` | اجرای ESLint با اصلاح خودکار |
| `pnpm --filter @castaminofen/web test` | اجرای تست‌های Frontend |
| `pnpm --filter @castaminofen/api build` | Build Backend |
| `pnpm --filter @castaminofen/shared-types build` | Build بسته shared types |

## 12. ساختار Monorepo

پروژه به‌صورت مونو-ریپو سازماندهی شده است و شامل موارد زیر است:

- `apps/web`: اپ Frontend
- `apps/api`: اپ Backend
- `packages/shared-types`: بسته مشترک برای تایپ‌ها
- `docs`: مستندات پروژه
- `docker-compose.yml`: سرویس‌های محلی مانند PostgreSQL، Redis و MinIO

## 13. خطاهای رایج و راه‌حل‌ها

### Prisma Generate انجام نشده است
اگر خطای مربوط به Prisma یا client رخ داد، ابتدا تلاش کنید:

```bash
pnpm --filter @castaminofen/api exec prisma generate
```

### اتصال به پایگاه داده انجام نشد
اگر به دیتابیس متصل نشد، بررسی کنید:

- آیا سرویس PostgreSQL از Docker اجرا شده است؟
- آیا `DATABASE_URL` درست تنظیم شده است؟
- آیا فایل `.env` در ریشه یا `apps/api/.env` ایجاد شده است؟

### فایل Environment وجود ندارد
اگر خطای مربوط به متغیرهای محیطی دیدید، فایل‌های نمونه را کپی کنید:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

### تداخل پورت‌ها
اگر پورت‌های `3000`، `3001`، `5432`، `6379` یا `9000` در دسترس نباشند، این پورت‌ها را با پورت‌های دیگری جایگزین کنید یا سرویس‌های در حال اجرا را متوقف کنید.

### خطاهای Build
اگر build با خطا متوقف شد، ابتدا مطمئن شوید که وابستگی‌ها نصب شده‌اند و فایل‌های محیطی تنظیم شده‌اند.

## 14. ترتیب صحیح اجرای پروژه

در یک ماشین کاملاً تازه، ترتیب پیشنهادی زیر توصیه می‌شود:

1. نصب Git و ابزارهای لازم
2. Clone پروژه
3. نصب وابستگی‌ها با `pnpm install`
4. ایجاد فایل‌های `.env` از نمونه‌ها
5. راه‌اندازی سرویس‌های Docker با `docker compose up -d`
6. اجرای Prisma Generate در صورت نیاز
7. اجرای Backend با `pnpm dev:api`
8. اجرای Frontend با `pnpm dev:web`
9. اجرای Build با `pnpm build` برای تأیید نهایی

## 15. چک‌لیست نهایی

- [ ] سرویس‌های Docker در حال اجرا هستند
- [ ] فایل‌های `.env` ایجاد شده‌اند
- [ ] Backend اجرا شده است
- [ ] Frontend اجرا شده است
- [ ] Build با موفقیت انجام شده است

## نکته مهم

در این نسخه، مستندات و workflowها بر اساس واقعیت فعلی repository نوشته شده‌اند. اگر در محیط شما مرحله‌ای نیاز به بررسی دستی داشته باشد، در متن فوق به‌صورت روشن ذکر شده است.
