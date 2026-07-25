"use client";

import { useEffect, useMemo, useState } from 'react';
import SearchInput from './components/SearchInput';
import SearchResults from './components/SearchResults';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get('q') ?? '');
    setPage(Number(params.get('page') ?? '1') || 1);
  }, []);

  const params = useMemo(() => ({ q, page }), [q, page]);

  return (
    <main className="page-container">
      <section className="card">
        <div className="header">
          <div>
            <h1>Search</h1>
            <p>Search podcasts by title or description.</p>
          </div>
        </div>

        <SearchInput defaultQuery={q} onNavigate={(newQ) => (window.location.href = `/search?q=${encodeURIComponent(newQ)}&page=1`)} />

        <SearchResults q={params.q} page={params.page} />
      </section>
    </main>
  );
}
