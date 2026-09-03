import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Subscription } from '@/lib/types/subscription';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription', 'me'],
    queryFn: async () => {
      const { data } = await api.get<Subscription>('/subscriptions/me');
      return data;
    },
    staleTime: 60_000,
  });
}
