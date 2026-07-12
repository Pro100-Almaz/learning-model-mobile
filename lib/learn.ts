// Learn flow (Subjects → Classes → Modules → Lessons → Lesson Detail) data model,
// mock content and selectors. See docs/subject_lesson_pages.md §4.
//
// The screens select their slice by ids only (keeps navigation params
// serializable / deep-linkable). Today everything is mock demo content; swap the
// selectors below for React-Query hooks (useSubjects, useClasses(subjectId), …)
// later without touching the components — the shapes model the API exactly.

import { type SubjectTheme } from './subject-theme';

export type Progress = number; // 0–100
export type LessonStatus = 'available' | 'progress' | 'done';
export type VideoProvider = 'youtube' | 'vimeo';

export interface Subject extends SubjectTheme {
  id: string;
  slug: string;
  title: string; // ← backend `name`
  classCount: number;
  progress: Progress;
}

export interface ClassLevel {
  id: string;
  subjectId: string;
  title: string;
  grade: number;
  modules: number;
  lessons: number;
  progress: Progress;
}

export interface Module {
  id: string;
  classId: string;
  title: string;
  description: string;
  lessons: number;
  done: number;
  progress: Progress;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  durationSec: number;
  status: LessonStatus;
  progress: Progress;
}

export interface LessonDetail extends Lesson {
  description: string; 
  tags: Tag[]; 
  videoUrl?: string; 
  provider: VideoProvider;
}

export interface Tag {
  name: string;
  slug: string;
  description: string;
}

// --- Lookups & selectors -----------------------------------------------------
export function subjectById(subjects: Subject[], id: string): Subject | undefined {
  return subjects.find((s) => String(s.id) === String(id));
}

export function subjectBySlug(subjects: Subject[], slug: string): Subject | undefined {
  return subjects.find((s) => s.slug === slug);
}

export function classById(classes: ClassLevel[], id: string): ClassLevel | undefined {
  return classes.find((c) => String(c.id) === String(id));
}

export function moduleById(modules: Module[], id: string): Module | undefined {
  return modules.find((c) => String(c.id) === String(id));
}

// --- Derived strings (compute in components; keep data clean) ----------------

/** "4 бөлім · 32 сабақ" */
export function classSubtitle(cls: ClassLevel): string {
  return `${cls.modules} бөлім · ${cls.lessons} сабақ`;
}

/** Whole minutes from a lesson's `durationSec`. */
export function lessonMinutes(lesson: Lesson): number {
  return Math.round(lesson.durationSec / 60);
}

/** Lesson meta: "14 мин", "· жалғасуда 45%" when in progress, "· бітті" when done. */
export function lessonMeta(lesson: Lesson): string {
  const base = `${lessonMinutes(lesson)} мин`;
  if (lesson.status === 'progress') return `${base} · жалғасуда ${lesson.progress}%`;
  if (lesson.status === 'done') return `${base} · бітті`;
  return base;
}

/** Lesson-detail meta: "14 мин". */
export function lessonDetailMeta(lesson: LessonDetail): string {
  return `${lessonMinutes(lesson)} мин`;
}

/**
 * Turn a raw YouTube/Vimeo watch URL into a privacy-friendly *embed* URL, or
 * `null` when the id can't be parsed (→ caller shows the placeholder).
 *
 * We deliberately embed the players' own domains (youtube-nocookie, player.vimeo)
 * with chrome-minimising params. The "can't leave to the source site" guarantee
 * is enforced by the WebView in LessonVideo (it blocks any off-embed navigation),
 * not by these params — params only *reduce* the surface that tempts a tap.
 */
export function videoEmbedUrl(url: string | undefined, provider: VideoProvider): string | null {
  if (!url) return null;

  if (provider === 'youtube') {
    // youtu.be/ID · watch?v=ID · /embed/ID · /shorts/ID
    const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];
    return id
      ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3`
      : null;
  }

  // vimeo.com/ID · vimeo.com/channels/x/ID · player.vimeo.com/video/ID
  const id = url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/(?:[\w-]+\/)*)(\d+)/)?.[1];
  return id
    ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&dnt=1`
    : null;
}

/**
 * Poster image for a video, or `null` when the client can't derive one.
 *
 * YouTube thumbnails live at a predictable id-based URL (a plain image — no
 * branding, no click-through). Vimeo has no such URL, so the backend must send
 * a `thumbnail_url`; until then Vimeo returns `null` and the player falls back
 * to the embed's own poster frame.
 */
export function videoThumbnail(url: string | undefined, provider: VideoProvider): string | null {
  if (!url || provider !== 'youtube') return null;
  const id = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/)?.[1];
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Whether a request URL is the embedded player itself (vs. an off-site redirect). */
export function isEmbedNavigation(url: string, provider: VideoProvider): boolean {
  if (!url || url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) return true;
  // Allow only the player path; watch pages / channel links / app deep-links are blocked.
  return provider === 'youtube'
    ? /^https?:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\//.test(url)
    : /^https?:\/\/player\.vimeo\.com\//.test(url);
}

/** Map a LessonStatus to the ProgressBadge status vocabulary. */
export function statusToBadge(status: LessonStatus): 'done' | 'progress' | 'todo' {
  if (status === 'done') return 'done';
  if (status === 'progress') return 'progress';
  return 'todo';
}
