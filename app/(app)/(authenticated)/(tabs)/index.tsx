import { useCallback } from 'react';

import { HomeScreen } from '@/components/home/HomeScreen';
import { useDashboard } from '@/hooks/useDashboard';

/**
 * Home tab (Басты). Owns the data (useDashboard) and navigation callbacks; the
 * presentational HomeScreen renders from the view-model. See docs/home-page.md.
 */
export default function HomeRoute() {
  const { vm, isLoading, isError, refetch } = useDashboard();

  // TODO: wire to the Practice quiz flow once that route exists.
  const onStartLesson = useCallback((_id: string) => {}, []);

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
