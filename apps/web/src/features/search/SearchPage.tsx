"use client";

import { useEffect, useState } from 'react';
import SearchInput from './components/SearchInput';
import SearchResults from './components/SearchResults';

type SearchParams = {
  q: string;
  page: number;
};

export default function SearchPage() {
  const [params, setParams] = useState<SearchParams | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const q = searchParams.get('q') ?? '';
    const page = Number(searchParams.get('page') ?? '1') || 1;
    setParams({ q, page });
  }, []);

  return (
    <main className="page-container">
      <section className="card space-y-6">
        <div className="space-y-2">
          <h1 className="text-heading">جستجو</h1>
          <p className="text-body m-0">برای کشف پادکست‌های جدید، عنوان، توضیحات یا نام پادکست را وارد کنید.</p>
        </div>

        <SearchInput defaultQuery={params?.q ?? ''} onNavigate={(newQ) => (window.location.href = `/search?q=${encodeURIComponent(newQ)}&page=1`)} />

        {params ? <SearchResults q={params.q} page={params.page} /> : null}
      </section>
    </main>
  );
}
