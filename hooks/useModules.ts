import { useFreshQuery } from "./useFreshQuery";

import { useApiClient } from "./useApiClient";
import { type Progress } from "@/lib/learn";

export interface ModuleApi {
  id: string;
  slug: string;
  title: string;
  description: string;

  class_grade_id: string;
  lessons: number;
  done: number;
  progress: Progress;
}

export function useModules(classId: string | undefined) {
  const api = useApiClient();
  return useFreshQuery({
    enabled: !!classId,
    queryKey: [classId, "modules"],
    queryFn: async () => {
      const raw = await api.get<ModuleApi[]>(
        `/classes/${classId}/`,
      );
      return raw.map((r) => {
        return {
          id: r.id,
          slug: r.slug,
          classId: r.class_grade_id,
          title: r.title,
          description: r.description,
          lessons: r.lessons,
          done: r.done ?? 0,
          progress: r.progress,
        };
      });
    },
  });
}
