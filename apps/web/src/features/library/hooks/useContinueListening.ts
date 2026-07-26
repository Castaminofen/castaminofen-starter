import { useQuery } from '@tanstack/react-query';
import { getContinueListening } from '@/lib/library';

export function useContinueListening() {
  return useQuery({
    queryKey: ['library', 'continue-listening'],
    queryFn: getContinueListening,
    staleTime: 1000 * 30,
  });
}
