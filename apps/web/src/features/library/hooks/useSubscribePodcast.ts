import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subscribeToPodcast } from '@/lib/library';

export function useSubscribePodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscribeToPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
