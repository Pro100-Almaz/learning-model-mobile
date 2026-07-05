// Learn flow (Subjects → Classes → Units → Lessons → Lesson Detail) data model,
// mock content and selectors. See docs/subject_lesson_pages.md §4.
//
// The screens select their slice by ids only (keeps navigation params
// serializable / deep-linkable). Today everything is mock demo content; swap the
// selectors below for React-Query hooks (useSubjects, useClasses(subjectId), …)
// later without touching the components — the shapes model the API exactly.

import type { Ionicons } from '@expo/vector-icons';

type IoniconName = keyof typeof Ionicons.glyphMap;

export type Progress = number; // 0–100
export type LessonStatus = 'locked' | 'available' | 'progress' | 'done';

export interface Subject {
  id: string;
  title: string;
  en: string;
  /** Ionicons glyph for the leading tile (ported from the DS lucide names). */
  icon: IoniconName;
  tint: string; // accent hex
  soft: string; // soft bg hex
  classCount: number;
  progress: Progress;
}

export interface ClassLevel {
  id: string;
  subjectId: string;
  title: string;
  grade: number;
  units: number;
  lessons: number;
  progress: Progress;
}

export interface Unit {
  id: string;
  classId: string;
  title: string;
  description: string;
  lessons: number;
  done: number;
  progress: Progress;
  locked?: boolean;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  minutes: number;
  status: LessonStatus;
  progress: Progress;
}

export interface LessonDetail extends Lesson {
  intro: string;
  concepts: { icon: IoniconName; title: string; text: string }[];
  steps: number;
  currentStep: number;
  videoUrl?: string; // undefined → placeholder
}

// --- Mock / demo content -----------------------------------------------------

export const SUBJECTS: Subject[] = [
  {
    id: 'math',
    title: 'Математика',
    en: 'Math',
    icon: 'calculator-outline',
    tint: '#2F6BFF',
    soft: '#EEF3FF',
    classCount: 3,
    progress: 46,
  },
  {
    id: 'physics',
    title: 'Физика',
    en: 'Physics',
    icon: 'planet-outline',
    tint: '#15C7A9',
    soft: '#E6FBF6',
    classCount: 2,
    progress: 28,
  },
  {
    id: 'chemistry',
    title: 'Химия',
    en: 'Chemistry',
    icon: 'flask-outline',
    tint: '#FFB020',
    soft: '#FFF5E1',
    classCount: 1,
    progress: 12,
  },
  {
    id: 'biology',
    title: 'Биология',
    en: 'Biology',
    icon: 'leaf-outline',
    tint: '#16B364',
    soft: '#E7F8EF',
    classCount: 0, // empty branch → exercises the EmptyState
    progress: 0,
  },
  {
    id: 'english',
    title: 'Ағылшын тілі',
    en: 'English',
    icon: 'language-outline',
    tint: '#7C5CFF',
    soft: '#F0EDFF',
    classCount: 2,
    progress: 63,
  },
];

const CLASSES: Record<string, ClassLevel[]> = {
  math: [
    { id: 'g10', subjectId: 'math', title: '10-сынып', grade: 10, units: 4, lessons: 32, progress: 58 },
    { id: 'g11', subjectId: 'math', title: '11-сынып', grade: 11, units: 5, lessons: 40, progress: 34 },
    { id: 'g9', subjectId: 'math', title: '9-сынып', grade: 9, units: 3, lessons: 24, progress: 100 },
  ],
  physics: [
    { id: 'g10', subjectId: 'physics', title: '10-сынып', grade: 10, units: 3, lessons: 21, progress: 40 },
    { id: 'g11', subjectId: 'physics', title: '11-сынып', grade: 11, units: 4, lessons: 28, progress: 16 },
  ],
  chemistry: [
    { id: 'g10', subjectId: 'chemistry', title: '10-сынып', grade: 10, units: 3, lessons: 18, progress: 12 },
  ],
  biology: [], // empty → demo EmptyState
  english: [
    { id: 'b1', subjectId: 'english', title: 'Intermediate', grade: 10, units: 4, lessons: 30, progress: 72 },
    { id: 'b2', subjectId: 'english', title: 'Upper-Intermediate', grade: 11, units: 4, lessons: 30, progress: 54 },
  ],
};

const UNITS: Record<string, Unit[]> = {
  'math:g10': [
    {
      id: 'algebra',
      classId: 'g10',
      title: 'Алгебра',
      description: 'Теңдеулер, теңсіздіктер және функциялар',
      lessons: 8,
      done: 5,
      progress: 62,
    },
    {
      id: 'geometry',
      classId: 'g10',
      title: 'Геометрия',
      description: 'Жазықтықтағы фигуралар мен бұрыштар',
      lessons: 8,
      done: 3,
      progress: 38,
    },
    {
      id: 'trigonometry',
      classId: 'g10',
      title: 'Тригонометрия',
      description: 'Синус, косинус және тангенс',
      lessons: 8,
      done: 8,
      progress: 100,
    },
    {
      id: 'derivatives',
      classId: 'g10',
      title: 'Туынды',
      description: 'Алдымен алдыңғы бөлімдерді аяқта',
      lessons: 8,
      done: 0,
      progress: 0,
      locked: true, // locked variant
    },
  ],
};

const LESSONS: Record<string, Lesson[]> = {
  'math:g10:algebra': [
    { id: 'l1', unitId: 'algebra', title: 'Сызықтық теңдеулер', minutes: 12, status: 'done', progress: 100 },
    { id: 'l2', unitId: 'algebra', title: 'Квадрат теңдеулер', minutes: 15, status: 'done', progress: 100 },
    { id: 'l3', unitId: 'algebra', title: 'Теңсіздіктер', minutes: 14, status: 'progress', progress: 45 },
    { id: 'l4', unitId: 'algebra', title: 'Функциялар және графиктер', minutes: 18, status: 'available', progress: 0 },
    { id: 'l5', unitId: 'algebra', title: 'Логарифмдер', minutes: 20, status: 'locked', progress: 0 },
  ],
};

const LESSON_DETAIL: Record<string, LessonDetail> = {
  l3: {
    id: 'l3',
    unitId: 'algebra',
    title: 'Теңсіздіктер',
    minutes: 14,
    status: 'progress',
    progress: 45,
    steps: 6,
    currentStep: 3,
    intro:
      'Теңсіздіктерді шешу — айнымалының шарты орындалатын мәндер жиынын табу. Бұл сабақта сызықтық және квадрат теңсіздіктерді қалай шешуді үйренесің.',
    concepts: [
      {
        icon: 'swap-horizontal-outline',
        title: 'Теңсіздік белгілері',
        text: 'Екі жақты теріс санға көбейткенде белгі бағыты өзгереді.',
      },
      {
        icon: 'analytics-outline',
        title: 'Сан осіндегі шешім',
        text: 'Шешімді интервал ретінде сан осінде белгілеу.',
      },
      {
        icon: 'git-compare-outline',
        title: 'Квадрат теңсіздіктер',
        text: 'Параболаның таңбасы арқылы шешім аймағын анықтау.',
      },
    ],
  },
  l4: {
    id: 'l4',
    unitId: 'algebra',
    title: 'Функциялар және графиктер',
    minutes: 18,
    status: 'available',
    progress: 0,
    steps: 7,
    currentStep: 0,
    intro:
      'Функция — әр аргументке жалғыз мән сәйкес қоятын ереже. Бұл сабақта функцияның анықталу облысын және графигін оқисың.',
    concepts: [
      {
        icon: 'apps-outline',
        title: 'Анықталу облысы',
        text: 'Функция мағынасы бар аргумент мәндерінің жиыны.',
      },
      {
        icon: 'trending-up-outline',
        title: 'График',
        text: 'Функцияны координаталық жазықтықта бейнелеу.',
      },
    ],
  },
};

// --- Selectors ---------------------------------------------------------------
// Replace these with React-Query hooks when the API exists; the return shapes
// stay identical so the screens don't change.

export function getSubjects(): Subject[] {
  return SUBJECTS;
}

export function getSubject(subjectId: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === subjectId);
}

export function getClasses(subjectId: string): ClassLevel[] {
  return CLASSES[subjectId] ?? [];
}

export function getClass(subjectId: string, classId: string): ClassLevel | undefined {
  return getClasses(subjectId).find((c) => c.id === classId);
}

export function getUnits(subjectId: string, classId: string): Unit[] {
  return UNITS[`${subjectId}:${classId}`] ?? [];
}

export function getUnit(subjectId: string, classId: string, unitId: string): Unit | undefined {
  return getUnits(subjectId, classId).find((u) => u.id === unitId);
}

export function getLessons(subjectId: string, classId: string, unitId: string): Lesson[] {
  return LESSONS[`${subjectId}:${classId}:${unitId}`] ?? [];
}

export function getLessonDetail(lessonId: string): LessonDetail | undefined {
  return LESSON_DETAIL[lessonId];
}

// --- Derived strings (compute in components; keep data clean) ----------------

/** "4 бөлім · 32 сабақ" */
export function classSubtitle(cls: ClassLevel): string {
  return `${cls.units} бөлім · ${cls.lessons} сабақ`;
}

/** Lesson meta: "14 мин", "· жалғасуда 45%" when in progress, "· бітті" when done. */
export function lessonMeta(lesson: Lesson): string {
  const base = `${lesson.minutes} мин`;
  if (lesson.status === 'progress') return `${base} · жалғасуда ${lesson.progress}%`;
  if (lesson.status === 'done') return `${base} · бітті`;
  return base;
}

/** Lesson-detail meta: "14 мин · 6 қадам". */
export function lessonDetailMeta(lesson: LessonDetail): string {
  return `${lesson.minutes} мин · ${lesson.steps} қадам`;
}

/** Map a LessonStatus to the ProgressBadge status vocabulary. */
export function statusToBadge(status: LessonStatus): 'done' | 'progress' | 'todo' | 'locked' {
  if (status === 'done') return 'done';
  if (status === 'progress') return 'progress';
  if (status === 'locked') return 'locked';
  return 'todo';
}
