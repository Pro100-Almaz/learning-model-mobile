import { useQuery } from '@tanstack/react-query';

import { useApiClient } from './useApiClient';
import { type Progress } from '@/lib/learn';
import { getSubjectTheme } from '@/lib/subject-theme';
import { type Subject } from '@/lib/learn';
import { useLanguage } from '@/lib/i18n/useLanguage';

export const subjectsQueryKey = ['subjects'] as const;
export const allSubjectsQueryKey = ['subjects', 'all'] as const;

export interface SubjectApi {
  id: string;
  name: string;
  slug: string;
  class_count: number;
  progress: Progress;
}

export function useSubjects() {
  const api = useApiClient();
  const { language } = useLanguage();
  return useQuery({
    queryKey: [...subjectsQueryKey, language],
    queryFn: async () => {
          const raw = await api.get<SubjectApi[]>('/subjects/');
          return raw.map(toSubject);
        },
  });
}

export function useAllSubjects() {
  const api = useApiClient();
  const { language } = useLanguage();
  return useQuery({
    queryKey: [...allSubjectsQueryKey, language],
    queryFn: async () => {
          const raw = await api.get<SubjectApi[]>('/subjects/all/');
          return raw.map(toSubject);
        },
  });
}

export function toSubject(api: SubjectApi): Subject {
  return {
    id: api.id,
    slug: api.slug,
    title: api.name,
    classCount: api.class_count,
    progress: api.progress,
    ...getSubjectTheme(api.slug),
  };
}
