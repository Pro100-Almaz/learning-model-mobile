import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';
import { profileQueryKey } from './useProfile';
import {
  DEV_BYPASS_AUTH,
  MOCK_ONBOARDING_OPTIONS,
} from '@/lib/devFlags';
import type { OnboardingOptions, Profile, ProfileUpdate } from '@/lib/types';

/** Select options for the onboarding flow (GET /profile/onboarding-options/). */
export function useOnboardingOptions() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['onboarding-options'],
    queryFn: DEV_BYPASS_AUTH
      ? async () => MOCK_ONBOARDING_OPTIONS
      : () => api.get<OnboardingOptions>('/profile/onboarding-options/'),
  });
}

/** Persist the onboarding answers (PATCH /profile/). */
export function useUpdateProfile() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    // Dev bypass: pretend the save succeeded and mark onboarding complete so the
    // flow finishes and routes home, without touching the backend.
    mutationFn: (payload: ProfileUpdate) =>
      api.patch<Profile>('/profile/', payload),
    onSuccess: (profile) => {
      // Seed the cache so the route guard sees the completed flag immediately.
      queryClient.setQueryData(profileQueryKey, profile);
    },
  });
}
