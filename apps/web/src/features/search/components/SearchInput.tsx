"use client";

import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
        جستجو در پادکست‌ها
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            id="search"
            className="input flex-1 pr-11"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="عنوان، توضیح یا نام پادکست"
          />
        </div>
        <Button className="justify-center sm:w-auto" type="submit">
          جستجو
        </Button>
      </div>
    </form>
  );
}
