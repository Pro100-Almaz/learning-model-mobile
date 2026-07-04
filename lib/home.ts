// Home dashboard data model, helpers and mock content.
//
// The screen renders from a `HomeViewModel` (see docs/home-page.md §5) so it can
// swap to a real API/React-Query source later without touching the components.
// Today the score/target come from the user's onboarding profile when available
// and the rest is mock demo content.

import type { Ionicons } from '@expo/vector-icons';
import { ENT_MAX_SCORE } from '@/lib/ent';
import type { Profile } from '@/lib/types';

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
  /** e.g. "Квадрат теңдеулер". */
  title: string;
  /** e.g. "Математика". */
  subject: string;
  /** Ionicons glyph name for the leading tile. */
  icon: IoniconName;
  questionCount: number;
  estMinutes: number;
  state: LessonState;
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

/** "Математика · 12 сұрақ · 15 мин" */
export function lessonSubtitle(lesson: LessonItem): string {
  return `${lesson.subject} · ${lesson.questionCount} сұрақ · ${lesson.estMinutes} мин`;
}

// --- Mock / demo content -----------------------------------------------------
// Swap for an API/React-Query source later; see hooks/useDashboard.ts.

/** Demo stats used when the profile has no expected/target scores yet. */
const DEMO_STATS = {
  expectedScore: 112,
  targetScore: 120,
  streakDays: 12,
} as const;

const MOCK_LESSONS: LessonItem[] = [
  {
    id: 'quadratic-equations',
    title: 'Квадрат теңдеулер',
    subject: 'Математика',
    icon: 'calculator-outline',
    questionCount: 12,
    estMinutes: 15,
    state: 'active',
  },
  {
    id: 'newton-laws',
    title: 'Ньютон заңдары',
    subject: 'Физика',
    icon: 'planet-outline',
    questionCount: 10,
    estMinutes: 12,
    state: 'todo',
  },
  {
    id: 'kazakh-khanate',
    title: 'Қазақ хандығы',
    subject: 'Қазақстан тарихы',
    icon: 'business-outline',
    questionCount: 8,
    estMinutes: 10,
    state: 'done',
  },
];

const MOCK_TIP = {
  title: 'Күн кеңесі',
  body: 'Қиын тақырыпты күн сайын 20 минуттан қайтала — қысқа әрі жиі оқу нәтижені арттырады.',
};

/**
 * Build the home view-model. Score/target come from the onboarding profile when
 * the student has filled them in; everything else is demo content for now.
 */
export function buildHomeViewModel(args: {
  name: string;
  avatarUrl?: string;
  profile: Profile;
  now?: Date;
}): HomeViewModel {
  const { name, avatarUrl, profile, now } = args;

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
      streakDays: DEMO_STATS.streakDays,
      daysUntilExam: daysUntilExam(now),
    },
    todayLessons: MOCK_LESSONS,
    tip: MOCK_TIP,
  };
}

/** Remaining points to the target, never negative. */
export function remainingToTarget(stats: DashboardStats): number {
  return Math.max(0, stats.targetScore - stats.expectedScore);
}
