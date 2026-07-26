import { useQuery } from '@tanstack/react-query';
import { getLibraryOverview } from '@/lib/library';

export function useLibraryOverview() {
  return useQuery({
    queryKey: ['library'],
    queryFn: getLibraryOverview,
    staleTime: 1000 * 30,
  });
}
