import { useQuery } from '@tanstack/react-query';
import { getLibrarySubscriptions } from '@/lib/library';

export function useLibrarySubscriptions() {
  return useQuery({
    queryKey: ['library', 'subscriptions'],
    queryFn: getLibrarySubscriptions,
    staleTime: 1000 * 30,
  });
}
