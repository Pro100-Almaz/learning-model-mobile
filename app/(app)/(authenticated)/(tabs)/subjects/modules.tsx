import { useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { ModulesScreen } from '@/components/learn/screens/ModulesScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { subjectById, classById } from '@/lib/learn';
import { useModules } from '@/hooks/useModules';

const LESSONS = '/(app)/(authenticated)/(tabs)/subjects/lessons' as const;
const TEST = '/(app)/(authenticated)/(tabs)/subjects/test' as const;

/** Modules for a class. See docs/subject_lesson_pages.md §3. */
export default function ModulesRoute() {
  const { subjectId, classId } = useLocalSearchParams<{ subjectId: string; classId: string }>();
  const { router, back, popScreens } = useLearnNav();
  const { data: subjects } = useSubjects();
  const { data: classes } = useClasses(subjectId);
  const { data: modules, isLoading } = useModules(classId);
  const subject = subjectById(subjects ?? [], subjectId);
  const cls = classById(classes ?? [], classId);

  const onOpenModule = useCallback(
    (moduleId: string) => {
      router.push({ pathname: LESSONS, params: { subjectId, classId, moduleId } });
    },
    [router, subjectId, classId]
  );

  const onTest = useCallback(() => {
    router.push({
      pathname: TEST,
      params: { title: cls?.title ?? 'Тест', scope: `${subjectId}:${classId}` },
    });
  }, [router, subjectId, classId, cls?.title]);

  if (!subject || !cls) return <MissingScreen onBack={back} />;

  return (
    <ModulesScreen
      cls={cls}
      title={cls.title}
      modules={modules ?? []}
      isLoading={isLoading}
      breadcrumb={[
        { label: 'Пәндер', pop: 2 },
        { label: subject.title, pop: 1 },
      ]}
      onBack={back}
      onCrumb={popScreens}
      onOpenModule={onOpenModule}
      onTest={onTest}
    />
  );
}
