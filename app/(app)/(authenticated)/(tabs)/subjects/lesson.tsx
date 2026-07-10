import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { LessonDetailScreen } from '@/components/learn/screens/LessonDetailScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { getClass, getLessonDetail, getSubject, getUnit } from '@/lib/learn';

/** Lesson detail. See docs/subject_lesson_pages.md §1, §3. */
export default function LessonRoute() {
  const { subjectId, classId, unitId, lessonId } = useLocalSearchParams<{
    subjectId: string;
    classId: string;
    unitId: string;
    lessonId: string;
  }>();
  const { back, popScreens } = useLearnNav();

  const subject = getSubject(subjectId);
  const cls = getClass(subjectId, classId);
  const unit = getUnit(subjectId, classId, unitId);
  const lesson = getLessonDetail(lessonId);

  // TODO: wire to the Practice / player flow once those routes exist.
  const onPractice = useCallback(() => {}, []);
  const onStart = useCallback(() => {}, []);

  if (!subject || !cls || !unit || !lesson) return <MissingScreen onBack={back} />;

  return (
    <LessonDetailScreen
      lesson={lesson}
      breadcrumb={[
        { label: subject.title, pop: 3 },
        { label: cls.title, pop: 2 },
        { label: unit.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onPractice={onPractice}
      onStart={onStart}
    />
  );
}
