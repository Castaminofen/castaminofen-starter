import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateListeningHistory } from '@/lib/library';

export function useUpdateListeningHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateListeningHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library', 'continue-listening'] });
    },
  });
}
