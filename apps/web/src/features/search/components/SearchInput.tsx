"use client";

import { useEffect, useState } from 'react';

export default function SearchInput({ defaultQuery, onNavigate }: { defaultQuery?: string; onNavigate: (q: string) => void }) {
  const [value, setValue] = useState(defaultQuery ?? '');

  useEffect(() => {
    setValue(defaultQuery ?? '');
  }, [defaultQuery]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onNavigate(value.trim());
      }}
      className="form-field"
    >
      <label htmlFor="search" className="form-label">
        Search
      </label>
      <div className="flex items-center gap-2">
        <input
          id="search"
          className="input flex-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search podcasts"
        />
        <button className="button button-primary" type="submit">
          Search
        </button>
      </div>
    </form>
  );
}
