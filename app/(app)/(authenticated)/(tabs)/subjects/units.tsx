import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { UnitsScreen } from '@/components/learn/screens/UnitsScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useMockLoading } from '@/hooks/useMockLoading';
import { getClass, getSubject, getUnits } from '@/lib/learn';

const LESSONS = '/(app)/(authenticated)/(tabs)/subjects/lessons' as const;

/** Units for a class. See docs/subject_lesson_pages.md §3. */
export default function UnitsRoute() {
  const { subjectId, classId } = useLocalSearchParams<{ subjectId: string; classId: string }>();
  const { router, back, popScreens } = useLearnNav();
  const isLoading = useMockLoading();

  const subject = getSubject(subjectId);
  const cls = getClass(subjectId, classId);

  const onOpenUnit = useCallback(
    (unitId: string) => {
      router.push({ pathname: LESSONS, params: { subjectId, classId, unitId } });
    },
    [router, subjectId, classId]
  );

  if (!subject || !cls) return <MissingScreen onBack={back} />;

  return (
    <UnitsScreen
      cls={cls}
      title={cls.title}
      units={getUnits(subjectId, classId)}
      isLoading={isLoading}
      breadcrumb={[
        { label: 'Пәндер', pop: 2 },
        { label: subject.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onOpenUnit={onOpenUnit}
    />
  );
}
