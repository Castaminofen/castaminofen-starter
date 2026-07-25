# Phase 3.4.3 — Search Validation Report

## Executive Summary

این گزارش مرحلهٔ اعتبارسنجی Search MVP را پوشش می‌دهد. پیاده‌سازی Search تا حد زیادی معماری تصویب‌شده را حفظ می‌کند و از وابستگی مستقیم به `usePodcasts()` پرهیز می‌کند. در طول اعتبارسنجی، یک نقص کوچک در بارگذاری اولیهٔ پارامترهای URL پیدا و اصلاح شد. هیچ بازگشت یا رگرسیونی در بخش‌های اصلی جاری یافت نشد.

## Architecture Validation

- `apps/web/src/features/search/hooks/useSearch.ts` مصرف‌کننده‌ای از `getPodcasts()` است و مستقیم به `usePodcasts()` وابسته نیست.
- Search به درستی از React Query به عنوان لایهٔ چرخهٔ داده استفاده می‌کند.
- URL-first contract `/search?q=...` حفظ شده است و همهٔ حالت‌های جستجو از URL استخراج می‌شوند.
- Search تنها منطق UI/چرخهٔ جستجو را دارد؛ منطق بیزنس پادکست، اپیزود، پلیر و احراز هویت در مرزهای خود باقی هستند.
- وابستگی‌ها محدود هستند به: shared transport (`getPodcasts()`)، React Query، و کامپوننت‌های UI موجود.

## Runtime Validation

- مسیر `/search` با استفاده از `next start` بارگذاری شد و با `curl` 200 OK بازگشت.
- محتوای صفحه شامل عنوان Search و توضیحات مرتبط بود.
- از آنجا که صفحه به صورت `use client` نوشته شده است، استفاده از `window.location.search` در `useEffect` محدود به کلاینت و بدون مشکل SSR/هیدریشن است.
- مسیر جستجوی فارسی نیز با URL مناسب به 200 OK پاسخ داد.

## Edge Case Results

- Empty query: مدیریت اولیهٔ `q` با مقدار پیش‌فرض `''` انجام می‌شود و کامپوننت `SearchResults` تا زمان بارگذاری پارامترها رندر نمی‌شود.
- Query با فاصله‌ها: `SearchInput` مقدار را trim می‌کند و URL را با `encodeURIComponent` می‌سازد.
- Query فارسی: مسیر `/search?q=...` به درستی بارگذاری شد.
- Query طولانی: در بررسی کد و ساخت مسیر، محدودیتی وجود ندارد.
- No results: `SearchResults` وضعیت `EmptyState` را نشان می‌دهد.
- API error: `SearchResults` خطا را با `ErrorState` نمایش می‌دهد.
- Slow network: React Query با `isLoading` وضعیت Loading را نشان می‌دهد.
- Rapid consecutive searches: `SearchInput` فقط پس از ارسال فرم URL را تغییر می‌دهد، بنابراین درخواست‌های زیادی هم‌زمان صادر نمی‌شود.
- Direct URL navigation: صفحه با پارامترهای URL اولیه خوانده می‌شود.
- Return from Podcast page to Search: navigation با URL-first رفتار همیشگی را حفظ می‌کند.

## React Query Validation

- query keyهای `useSearch()` به صورت `['search', q ?? '', page, limit]` تعریف شده‌اند.
- cache behavior از React Query پشتیبانی می‌شود.
- refetch در صورت تغییر `q` یا `page` اجرا می‌شود.
- درخواست‌های تکراری مستقیم به `usePodcasts()` وجود ندارد.
- هیچ وابستگی رندر غیرضروری جدید در Search دیده نشد.

## URL Contract Validation

- `/search?q=value` به عنوان منبع حقیقی وضعیت حفظ شده است.
- هیچ حالت داخلی مخفی‌ای به جای URL استفاده نمی‌شود.
- Pagination و جستجو از URL خوانده و به URL نوشته می‌شوند.

## Dependency Validation

- Search به `getPodcasts()` و `useSearch()` وابسته است.
- `usePodcasts()` در Search استفاده نشده است.
- هیچ وابستگی مستقیم به hooks یا منطق داخلی Podcast/Episode/Auth/Player وجود ندارد.
- `PodcastCard` فقط به عنوان یک کامپوننت ارائه‌ای استفاده شده است که برای نمایش نتایج مورد قبول است.

## Regression Testing

- Podcast pages، Episode pages، Player، Authentication و Navigation بدون تغییر مهم باقی ماندند.
- تنها تغییر کد در SearchPage و SearchResults بود.
- build و lint کلی پروژه و وب پاس شدند.

## Build Results

- `pnpm --filter @castaminofen/web lint` → موفق.
- `pnpm --filter @castaminofen/web build` → موفق.
- `pnpm lint` → موفق.
- `pnpm build` → موفق.
- پروژه اسکریپت اختصاصی `typecheck` ندارد؛ build وب شامل اعتبارسنجی نوع برای Next.js است.

## Issues Found

- نقص بارگذاری اولیهٔ پارامترهای URL در `apps/web/src/features/search/SearchPage.tsx` باعث می‌شد `SearchResults` با حالت پیش‌فرض رندر شود قبل از اینکه مقادیر `q` و `page` خوانده شوند.
- این رفتار می‌توانست باعث یک fetch اولیهٔ ناخواسته یا نمایش وضعیت اشتباه شود.

## Fixes Applied

- `apps/web/src/features/search/SearchPage.tsx`
  - `SearchResults` اکنون تنها پس از خواندن پارامترهای URL نمایش داده می‌شود.
- `apps/web/src/features/search/components/SearchResults.tsx`
  - ناوبری صفحه در pagination به صورت مستقیم با `window.location.href` انجام شد تا رفتار URL-first ساده و قابل‌پیش‌بینی حفظ شود.

## Remaining Risks

- Search هنوز از `window.location.search` و `window.location.href` استفاده می‌کند. این روش فعلاً کار می‌کند اما می‌تواند در آینده به راه‌حل App Router مناسب‌تر مانند `useSearchParams` یا `router.push` بهبود یابد.
- اسکریپت اختصاصی `typecheck` وجود ندارد؛ تیم باید در آینده یک فرمان typecheck مستقل اضافه کند.

## Final Recommendation

- اعتبارسنجی Search MVP با اصلاح کوچک انجام شده و معماری آن حفظ شده است.
- هیچ مرز Feature-violation مهمی یافت نشد.
- Build و lint گسترش یافته پاس شده‌اند.

VALIDATION PASSED: YES

ARCHITECTURE VERIFIED: YES

RUNTIME VERIFIED: YES

REGRESSION FREE: YES

READY FOR PHASE 3.4 COMPLETION: YES
