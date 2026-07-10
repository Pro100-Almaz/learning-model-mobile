import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { LessonsScreen } from '@/components/learn/screens/LessonsScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useMockLoading } from '@/hooks/useMockLoading';
import { getClass, getLessons, getSubject, getUnit } from '@/lib/learn';

const LESSON = '/(app)/(authenticated)/(tabs)/subjects/lesson' as const;

/** Lessons for a unit. See docs/subject_lesson_pages.md §3. */
export default function LessonsRoute() {
  const { subjectId, classId, unitId } = useLocalSearchParams<{
    subjectId: string;
    classId: string;
    unitId: string;
  }>();
  const { router, back, popScreens } = useLearnNav();
  const isLoading = useMockLoading();

  const subject = getSubject(subjectId);
  const cls = getClass(subjectId, classId);
  const unit = getUnit(subjectId, classId, unitId);

  const onOpenLesson = useCallback(
    (lessonId: string) => {
      router.push({ pathname: LESSON, params: { subjectId, classId, unitId, lessonId } });
    },
    [router, subjectId, classId, unitId]
  );

  if (!subject || !cls || !unit) return <MissingScreen onBack={back} />;

  return (
    <LessonsScreen
      unit={unit}
      lessons={getLessons(subjectId, classId, unitId)}
      isLoading={isLoading}
      breadcrumb={[
        { label: 'Пәндер', pop: 3 },
        { label: subject.title, pop: 2 },
        { label: cls.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onOpenLesson={onOpenLesson}
    />
  );
}
