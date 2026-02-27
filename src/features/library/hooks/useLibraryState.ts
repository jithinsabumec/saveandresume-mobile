import { useQuery } from '@tanstack/react-query';

import { stateRepository } from '../../../data/stateRepository';

export function useLibraryState(userId: string) {
  return useQuery({
    queryKey: ['library-state', userId],
    queryFn: () => stateRepository.getState(userId),
    staleTime: 15_000
  });
}
