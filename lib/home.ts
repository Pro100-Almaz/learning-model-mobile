// Home dashboard data model, helpers and mock content.
//
// The screen renders from a `HomeViewModel` (see docs/home-page.md §5) so it can
// swap to a real API/React-Query source later without touching the components.

import type { Ionicons } from '@expo/vector-icons';
import { ENT_MAX_SCORE } from '@/lib/ent';
import { getSubjectTheme } from '@/lib/subject-theme';
import type { Profile, Gamification } from '@/lib/types';

type IoniconName = keyof typeof Ionicons.glyphMap;

export interface DashboardStats {
  /** 0–140, drives the hero ring. */
  expectedScore: number;
  /** For the "N балл қалды" copy. */
  targetScore: number;
  /** Ring maximum (total ЕНТ score, 140). */
  maxScore: number;
  streakDays: number;
  daysUntilExam: number;
}

export type LessonState = 'active' | 'todo' | 'done';

export interface LessonItem {
  id: string;
  lessonId: string;
  subjectId: string;
  moduleId: string;
  /** e.g. "Квадрат теңдеулер". */
  title: string;
  /** e.g. "Математика". */
  subject: string;
  /** Ionicons glyph name for the leading tile. */
  icon: IoniconName;
  estMinutes: number;
  state: LessonState;
}

// --- GET /lessons/next_lessons/ ----------------------------------------------

export interface NextLessonApi {
  id: number | string;
  /** ISO date (YYYY-MM-DD) the item is planned for. */
  date: string;
  status: 'todo' | 'done';
  subject: {
    id: number | string;
    name: string;
    slug: string;
  };
  lesson: {
    id: number | string;
    module_id: number | string;
    title: string;
    duration_sec: number;
    status?: 'todo' | 'done';
  };
}

export function toLessonItem(r: NextLessonApi): LessonItem {
  const sec = r.lesson.duration_sec;
  return {
    id: String(r.id),
    lessonId: String(r.lesson.id),
    subjectId: String(r.subject.id),
    moduleId: String(r.lesson.module_id),
    title: r.lesson.title,
    subject: r.subject.name,
    icon: getSubjectTheme(r.subject.slug).icon,
    estMinutes: sec > 0 ? Math.max(1, Math.round(sec / 60)) : 0,
    state: (r.status ?? r.lesson.status) === 'done' ? 'done' : 'todo',
  };
}

export interface HomeViewModel {
  user: { name: string; avatarUrl?: string };
  stats: DashboardStats;
  todayLessons: LessonItem[];
  tip?: { title: string; body: string };
}

/**
 * Main ЕНТ exam date. `daysUntilExam` is derived from this at render time so the
 * countdown stays honest. Adjust to the real exam date / make it backend-driven.
 */
export const ENT_EXAM_DATE = new Date('2026-08-07T00:00:00');

/** Whole days from `from` until the exam, clamped at 0. */
export function daysUntilExam(from: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const exam = Date.UTC(
    ENT_EXAM_DATE.getFullYear(),
    ENT_EXAM_DATE.getMonth(),
    ENT_EXAM_DATE.getDate()
  );
  return Math.max(0, Math.round((exam - start) / msPerDay));
}

/** Space-grouped thousands to match the Profile screen (1 240). */
export function formatNumber(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// --- Mock / demo content -----------------------------------------------------

/** Demo stats used when the profile has no expected/target scores yet. */
const DEMO_STATS = {
  expectedScore: 112,
  targetScore: 120,
} as const;

const MOCK_TIP = {
  title: 'Күн кеңесі',
  body: 'Қиын тақырыпты күн сайын 20 минуттан қайтала — қысқа әрі жиі оқу нәтижені арттырады.',
};

export function buildHomeViewModel(args: {
  name: string;
  avatarUrl?: string;
  profile: Profile;
  gamification: Gamification | undefined;
  todayLessons: LessonItem[];
  now?: Date;
}): HomeViewModel {
  const { name, avatarUrl, profile, gamification, todayLessons, now } = args;

  const derivedExpected = profile.expected_scores.reduce(
    (sum, e) => sum + (e.score || 0),
    0
  );
  const expectedScore =
    derivedExpected > 0
      ? Math.min(derivedExpected, ENT_MAX_SCORE)
      : DEMO_STATS.expectedScore;
  const targetScore =
    profile.target_score && profile.target_score > 0
      ? profile.target_score
      : DEMO_STATS.targetScore;

  return {
    user: { name, avatarUrl },
    stats: {
      expectedScore,
      targetScore,
      maxScore: ENT_MAX_SCORE,
      streakDays: gamification?.streak.current || 0,
      daysUntilExam: daysUntilExam(now),
    },
    todayLessons,
    tip: MOCK_TIP,
  };
}

/** Remaining points to the target, never negative. */
export function remainingToTarget(stats: DashboardStats): number {
  return Math.max(0, stats.targetScore - stats.expectedScore);
}
