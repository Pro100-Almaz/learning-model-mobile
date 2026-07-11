import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { SubjectsScreen } from '@/components/learn/screens/SubjectsScreen';
import { useSubjects } from '@/hooks/useSubjects';

/** Subjects tab root. See docs/subject_lesson_pages.md. */
export default function SubjectsRoute() {
  const router = useRouter();
  const { data: subjects, isLoading } = useSubjects();

  const onOpenSubject = useCallback(
    (subjectId: string) => {
      router.push({ pathname: '/(app)/(authenticated)/(tabs)/subjects/classes', params: { subjectId } });
    },
    [router]
  );

  return (
    <SubjectsScreen subjects={subjects ?? []} isLoading={isLoading} onOpenSubject={onOpenSubject} />
  );
}
