import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { ClassesScreen } from '@/components/learn/screens/ClassesScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { subjectById } from '@/lib/learn';

const MODULES = '/(app)/(authenticated)/(tabs)/subjects/modules' as const;
const TEST = '/(app)/(authenticated)/(tabs)/subjects/test' as const;

/** Classes for a subject. See docs/subject_lesson_pages.md §3. */
export default function ClassesRoute() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const { router, back, popScreens } = useLearnNav();

  const { data: subjects } = useSubjects();
  const { data: classes, isLoading } = useClasses(subjectId);
  const subject = subjectById(subjects ?? [], subjectId);

  const onOpenClass = useCallback(
    (classId: string) => {
      router.push({ pathname: MODULES, params: { subjectId, classId } });
    },
    [router, subjectId]
  );

  const onTest = useCallback(() => {
    router.push({
      pathname: TEST,
      params: { title: subject?.title ?? 'Тест', scope: subjectId },
    });
  }, [router, subjectId, subject?.title]);

  if (!subject) return <MissingScreen onBack={back} />;

  return (
    <ClassesScreen
      subject={subject}
      classes={classes ?? []}
      isLoading={isLoading}
      breadcrumb={[{ label: 'Пәндер', pop: 1 }]}
      onBack={back}
      onCrumb={popScreens}
      onOpenClass={onOpenClass}
      onTest={onTest}
    />
  );
}
