import { useMutation, useQueryClient } from '@tanstack/react-query';
import { unsubscribeFromPodcast } from '@/lib/library';

export function useUnsubscribePodcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsubscribeFromPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['library'] });
    },
  });
}
