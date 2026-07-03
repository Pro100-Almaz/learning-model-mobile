import { useQuery } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';
import { DEV_BYPASS_AUTH, MOCK_PROFILE } from '@/lib/devFlags';
import type { Profile } from '@/lib/types';

export const profileQueryKey = ['profile'] as const;

/** The authenticated user's Qadam profile (GET /profile/). */
export function useProfile() {
  const api = useApiClient();
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: DEV_BYPASS_AUTH
      ? async () => MOCK_PROFILE
      : () => api.get<Profile>('/profile/'),
  });
}
