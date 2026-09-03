import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LessonDetailScreen } from '@/components/learn/screens/LessonDetailScreen';
import { MissingScreen } from '@/components/learn/screens/MissingScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { subjectById, classById, moduleById } from '@/lib/learn';
import { useModules } from '@/hooks/useModules';
import { useLessonDetail } from '@/hooks/useLessons';

const TEST = '/(app)/(authenticated)/(tabs)/subjects/test' as const;

export default function LessonRoute() {
  const { subjectId, classId, moduleId, lessonId } = useLocalSearchParams<{
    subjectId?: string;
    classId?: string;
    moduleId?: string;
    lessonId: string;
  }>();
  const { router, back, popScreens } = useLearnNav();
  const { t } = useTranslation();

  const { data: subjects, isLoading: subjectsLoading } = useSubjects();
  const { data: classes, isLoading: classesLoading } = useClasses(subjectId);
  const { data: modules, isLoading: modulesLoading } = useModules(classId);
  const subject = subjectId ? subjectById(subjects ?? [], subjectId) : undefined;
  const cls = classId ? classById(classes ?? [], classId) : undefined;
  const module = moduleId ? moduleById(modules ?? [], moduleId) : undefined;
  const { data: lesson, isLoading: lessonLoading } = useLessonDetail(lessonId);

  const onTest = useCallback(() => {
    router.push({
      pathname: TEST,
      params: {
        title: lesson?.title ?? t('learn.test'),
        lessonId,
      },
    });
  }, [router, lessonId, lesson?.title, t]);

  // Show a spinner while any query is still loading — otherwise a not-yet-resolved
  // id looks identical to a genuinely missing one and we'd flash "Not found".
  if (subjectsLoading || classesLoading || modulesLoading || lessonLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!lesson) return <MissingScreen onBack={back} />;

  const breadcrumb =
    subject && cls && module
      ? [
          { label: subject.title, pop: 3 },
          { label: cls.title, pop: 2 },
          { label: module.title, pop: 1 },
        ]
      : [];

  return (
    <LessonDetailScreen
      lesson={lesson}
      breadcrumb={breadcrumb}
      onBack={back}
      onCrumb={popScreens}
      onTest={onTest}
    />
  );
}
