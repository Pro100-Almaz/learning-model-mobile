import { useCallback } from 'react';
import { useRouter } from 'expo-router';

import { SubjectsScreen } from '@/components/learn/screens/SubjectsScreen';
import { useMockLoading } from '@/hooks/useMockLoading';
import { getSubjects } from '@/lib/learn';

/** Subjects tab root. See docs/subject_lesson_pages.md. */
export default function SubjectsRoute() {
  const router = useRouter();
  const isLoading = useMockLoading();

  const onOpenSubject = useCallback(
    (subjectId: string) => {
      router.push({ pathname: '/(app)/(authenticated)/(tabs)/subjects/classes', params: { subjectId } });
    },
    [router]
  );

  return (
    <SubjectsScreen subjects={getSubjects()} isLoading={isLoading} onOpenSubject={onOpenSubject} />
  );
}
