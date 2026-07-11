import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { LessonDetailScreen } from '@/components/learn/screens/LessonDetailScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { subjectById, classById, moduleById } from '@/lib/learn';
import { useModules } from '@/hooks/useModules';
import { useLessonDetail } from '@/hooks/useLessons';

const TEST = '/(app)/(authenticated)/(tabs)/subjects/test' as const;

/** Lesson detail. See docs/subject_lesson_pages.md §1, §3. */
export default function LessonRoute() {
  const { subjectId, classId, moduleId, lessonId } = useLocalSearchParams<{
    subjectId: string;
    classId: string;
    moduleId: string;
    lessonId: string;
  }>();
  const { router, back, popScreens } = useLearnNav();

  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses(subjectId);
  const { data: modules } = useModules(classId)
  const subject = subjectById(subjects ?? [], subjectId);
  const cls = classById(classes ?? [], classId);
  const module = moduleById(modules ?? [], moduleId);
  const { data: lesson } = useLessonDetail(lessonId);

  const onTest = useCallback(() => {
    router.push({
      pathname: TEST,
      params: {
        title: lesson?.title ?? 'Тест',
        scope: `${subjectId}:${classId}:${moduleId}:${lessonId}`,
      },
    });
  }, [router, subjectId, classId, moduleId, lessonId, lesson?.title]);

  if (!subject || !cls || !module || !lesson) return <MissingScreen onBack={back} />;

  return (
    <LessonDetailScreen
      lesson={lesson}
      breadcrumb={[
        { label: subject.title, pop: 3 },
        { label: cls.title, pop: 2 },
        { label: module.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onTest={onTest}
    />
  );
}
