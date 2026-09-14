import { useFreshQuery } from "./useFreshQuery";

import { useApiClient } from "./useApiClient";
import { toLessonItem, type NextLessonApi } from "@/lib/home";
import { useLanguage } from "@/lib/i18n/useLanguage";
import {
  type Lesson,
  type LessonStatus,
  type Progress,
  type Tag,
  type VideoProvider,
} from "@/lib/learn";

interface LessonApi {
  id: string;
  module_id: string;
  title: string;
  duration_sec: number;
  status: LessonStatus;
  progress: Progress;
  mastery: number | null;
}

interface LessonDetailApi extends LessonApi {
  description: string;
  video_url?: string;
  video_provider: VideoProvider;
  tag: Tag | null;
}

function toLesson(r: LessonApi): Lesson {
  return {
    id: r.id,
    moduleId: r.module_id,
    title: r.title,
    durationSec: r.duration_sec,
    status: r.status,
    progress: r.progress,
    mastery: r.mastery,
  };
}

/** Lessons for a module, in order. */
export function useLessons(moduleId: string) {
  const api = useApiClient();
  return useFreshQuery({
    queryKey: [moduleId, "lessons"],
    queryFn: async () => {
      const raw = await api.get<LessonApi[]>(`/modules/${moduleId}/`);
      return raw.map(toLesson);
    },
  });
}

export const nextLessonsQueryKey = ["lessons", "next"] as const;

export function useNextLessons() {
  const api = useApiClient();
  const { language } = useLanguage();
  return useFreshQuery({
    queryKey: [...nextLessonsQueryKey, language],
    queryFn: async () => {
      const raw = await api.get<NextLessonApi[]>("/lessons/next_lessons/");
      return raw.map(toLessonItem);
    },
  });
}

/** A single lesson with its content (description, video, concept tags). */
export function useLessonDetail(lessonId: string) {
  const api = useApiClient();
  return useFreshQuery({
    queryKey: [lessonId, "lesson-detail"],
    queryFn: async () => {
      const r = await api.get<LessonDetailApi>(`/lessons/${lessonId}/`);
      return {
        ...toLesson(r),
        description: r.description,
        videoUrl: r.video_url,
        provider: r.video_provider,
        tags: r.tag ? [r.tag] : [], // backend sends a single tag (or null)
      };
    },
  });
}
