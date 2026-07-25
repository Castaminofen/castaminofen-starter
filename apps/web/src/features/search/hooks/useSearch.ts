import { useQuery } from '@tanstack/react-query';
import { getPodcasts } from '@/lib/podcasts';

type UseSearchParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export function useSearch(params: UseSearchParams) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;

  return useQuery({
    queryKey: ['search', params.q ?? '', page, limit],
    queryFn: () => getPodcasts({ search: params.q, page, limit }),
    staleTime: 1000 * 30,
  });
}
