import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ClassesScreen } from '@/components/learn/screens/ClassesScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useMockLoading } from '@/hooks/useMockLoading';
import { getClasses, getSubject } from '@/lib/learn';

const UNITS = '/(app)/(authenticated)/(tabs)/subjects/units' as const;

/** Classes for a subject. See docs/subject_lesson_pages.md §3. */
export default function ClassesRoute() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { router, back, popScreens } = useLearnNav();
  const isLoading = useMockLoading();

  const subject = getSubject(subjectId);

  const onOpenClass = useCallback(
    (classId: string) => {
      router.push({ pathname: UNITS, params: { subjectId, classId } });
    },
    [router, subjectId]
  );

  if (!subject) return <MissingScreen onBack={back} />;

  return (
    <ClassesScreen
      subject={subject}
      classes={getClasses(subjectId)}
      isLoading={isLoading}
      breadcrumb={[{ label: 'Пәндер', pop: 1 }]}
      onBack={back}
      onCrumb={popScreens}
      onOpenClass={onOpenClass}
    />
  );
}
