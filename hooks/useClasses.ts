import { useQuery } from "@tanstack/react-query";

import { useApiClient } from "./useApiClient";
import { type Progress } from "@/lib/learn";

interface ClassLevelApi {
  id: string;
  subject_id: string;
  title: string;
  grade: number;
  modules: number;
  lessons: number;
  progress: Progress;
}

export function useClasses(subjectId: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: [subjectId, "classes"],
    queryFn: async () => {
      const raw = await api.get<ClassLevelApi[]>(
        `/subjects/${subjectId}/`,
      );
      return raw.map((r) => {
        return {
          id: r.id,
          subjectId: r.subject_id,
          title: r.title,
          grade: r.grade,
          lessons: r.lessons,
          modules: r.modules,
          progress: r.progress,
        };
      });
    },
  });
}
