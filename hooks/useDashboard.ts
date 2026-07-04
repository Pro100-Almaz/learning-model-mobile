import { useMemo } from 'react';
import { useUser } from '@clerk/clerk-expo';

import { buildHomeViewModel, type HomeViewModel } from '@/lib/home';
import { useProfile } from './useProfile';

/**
 * Home dashboard view-model. Composes the Clerk user (name/avatar) with the
 * onboarding profile (expected/target scores). Lessons, streak and tip are demo
 * content for now — see lib/home.ts. Follows the useProfile query pattern so a
 * dedicated `GET /dashboard/` endpoint can be dropped in later.
 */
export function useDashboard(): {
  vm: HomeViewModel | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { user } = useUser();
  const profileQuery = useProfile();

  const name = user?.firstName?.trim() || 'Оқушы';
  const avatarUrl = user?.imageUrl || undefined;
  const profile = profileQuery.data;

  const vm = useMemo<HomeViewModel | undefined>(
    () =>
      profile ? buildHomeViewModel({ name, avatarUrl, profile }) : undefined,
    [name, avatarUrl, profile]
  );

  return {
    vm,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    refetch: () => {
      profileQuery.refetch();
    },
  };
}
