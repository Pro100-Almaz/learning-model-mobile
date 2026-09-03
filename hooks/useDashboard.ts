import { useMemo } from 'react';
import { useUser } from '@clerk/clerk-expo';

import { buildHomeViewModel, type HomeViewModel } from '@/lib/home';
import { useNextLessons } from './useLessons';
import { useProfile } from './useProfile';
import {useGamification} from './useGamification';


export function useDashboard(): {
  vm: HomeViewModel | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { user } = useUser();
  const profileQuery = useProfile();
  const gamificationQuery = useGamification();
  const nextLessonsQuery = useNextLessons();

  const name = user?.firstName?.trim() || 'Оқушы';
  const avatarUrl = user?.imageUrl || undefined;
  const profile = profileQuery.data;
  const gamification = gamificationQuery.data;
  const todayLessons = nextLessonsQuery.data;

  const vm = useMemo<HomeViewModel | undefined>(
    () =>
      profile
        ? buildHomeViewModel({
            name,
            avatarUrl,
            profile,
            gamification,
            todayLessons: todayLessons ?? [],
          })
        : undefined,
    [name, avatarUrl, profile, gamification, todayLessons]
  );

  return {
    vm,
    isLoading: profileQuery.isLoading || nextLessonsQuery.isLoading,
    isError: profileQuery.isError,
    refetch: () => {
      profileQuery.refetch();
      gamificationQuery.refetch();
      nextLessonsQuery.refetch();
    },
  };
}
