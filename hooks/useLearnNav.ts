import { useCallback } from 'react';
import { StackActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';

const SUBJECTS = '/(app)/(authenticated)/(tabs)/subjects' as const;

/**
 * Learn-flow navigation helpers. `popScreens(n)` pops n screens off the learn
 * stack — used by breadcrumb crumbs to jump back up the hierarchy.
 * See docs/subject_lesson_pages.md §3.
 */
export function useLearnNav() {
  const router = useRouter();
  const navigation = useNavigation();

  // Safety net: if this screen was opened with nothing beneath it (cross-tab push,
  // deep link), `router.back()` is a silent no-op — fall back to the subjects list.
  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(SUBJECTS);
  }, [router]);

  const popScreens = useCallback(
    (n: number) => {
      if (n > 0) navigation.dispatch(StackActions.pop(n));
    },
    [navigation]
  );

  return { router, back, popScreens };
}
