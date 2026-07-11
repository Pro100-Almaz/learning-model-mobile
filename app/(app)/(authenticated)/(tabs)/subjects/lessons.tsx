import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { LessonsScreen } from '@/components/learn/screens/LessonsScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useModules } from '@/hooks/useModules';
import { useLessons } from '@/hooks/useLessons';
import { subjectById, classById, moduleById } from '@/lib/learn';

const LESSON = '/(app)/(authenticated)/(tabs)/subjects/lesson' as const;
const TEST = '/(app)/(authenticated)/(tabs)/subjects/test' as const;

/** Lessons for a module. See docs/subject_lesson_pages.md §3. */
export default function LessonsRoute() {
  const { subjectId, classId, moduleId } = useLocalSearchParams<{
    subjectId: string;
    classId: string;
    moduleId: string;
  }>();
  const { router, back, popScreens } = useLearnNav();

  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses(subjectId);
  const { data: modules } = useModules(classId);
  const { data: lessons, isLoading } = useLessons(moduleId);
  const subject = subjectById(subjects ?? [], subjectId);
  const cls = classById(classes ?? [], classId);
  const module = moduleById(modules ?? [], moduleId);

  const onOpenLesson = useCallback(
    (lessonId: string) => {
      router.push({ pathname: LESSON, params: { subjectId, classId, moduleId, lessonId } });
    },
    [router, subjectId, classId, moduleId]
  );

  const onTest = useCallback(() => {
    router.push({
      pathname: TEST,
      params: { title: module?.title ?? 'Тест', scope: `${subjectId}:${classId}:${moduleId}` },
    });
  }, [router, subjectId, classId, moduleId, module?.title]);

  if (!subject || !cls || !module) return <MissingScreen onBack={back} />;

  return (
    <LessonsScreen
      module={module}
      lessons={lessons ?? []}
      isLoading={isLoading}
      breadcrumb={[
        { label: 'Пәндер', pop: 3 },
        { label: subject.title, pop: 2 },
        { label: cls.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onOpenLesson={onOpenLesson}
      onTest={onTest}
    />
  );
}
