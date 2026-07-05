import { useCallback } from 'react';
import { StackActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';

/**
 * Learn-flow navigation helpers. `popScreens(n)` pops n screens off the learn
 * stack — used by breadcrumb crumbs to jump back up the hierarchy.
 * See docs/subject_lesson_pages.md §3.
 */
export function useLearnNav() {
  const router = useRouter();
  const navigation = useNavigation();

  const back = useCallback(() => router.back(), [router]);

  const popScreens = useCallback(
    (n: number) => {
      if (n > 0) navigation.dispatch(StackActions.pop(n));
    },
    [navigation]
  );

  return { router, back, popScreens };
}
