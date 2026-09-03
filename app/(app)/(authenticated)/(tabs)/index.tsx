import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { HomeScreen } from '@/components/home/HomeScreen';
import { useDashboard } from '@/hooks/useDashboard';
import type { LessonItem } from '@/lib/home';

const LESSON = '/(app)/(authenticated)/(tabs)/subjects/lesson' as const;

/**
 * Home tab (Басты). Owns the data (useDashboard) and navigation callbacks; the
 * presentational HomeScreen renders from the view-model. See docs/home-page.md.
 */
export default function HomeRoute() {
  const { vm, isLoading, isError, refetch } = useDashboard();
  const router = useRouter();

  const onStartLesson = useCallback(
    (lesson: LessonItem) => {
      router.push({
        pathname: LESSON,
        params: {
          subjectId: lesson.subjectId,
          moduleId: lesson.moduleId,
          lessonId: lesson.lessonId,
        },
      });
    },
    [router]
  );

  // TODO: switch to the Scores tab (Балдар) once that route exists.
  const onOpenScores = useCallback(() => {}, []);

  // TODO: open notifications once that screen exists.
  const onOpenNotifications = useCallback(() => {}, []);

  return (
    <HomeScreen
      vm={vm}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
      onStartLesson={onStartLesson}
      onOpenScores={onOpenScores}
      onOpenNotifications={onOpenNotifications}
    />
  );
}
