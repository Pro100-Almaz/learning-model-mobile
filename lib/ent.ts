// ЕНТ (Unified National Test) scoring constants.
//
// Ported from the web app's `@/shared/lib/constants/ent`. The exact per-subject
// maxes should be reconciled against that source of truth — the values below
// follow the current 140-point ЕНТ model (mandatory subjects + two profile
// subjects at 50 each). Subject names may arrive from the backend in Kazakh,
// Russian, or English, so all known spellings are mapped.

/** Maximum total ЕНТ score. */
export const ENT_MAX_SCORE = 140;

// Per-subject maximums for the mandatory subjects, keyed by every spelling the
// backend might send. Profile (elective) subjects fall through to the default.
const SUBJECT_MAX: Record<string, number> = {
  // History of Kazakhstan — 20 points
  'История Казахстана': 20,
  'Қазақстан тарихы': 20,
  'History of Kazakhstan': 20,
  // Mathematical literacy — 10 points
  'Математическая грамотность': 10,
  'Математикалық сауаттылық': 10,
  'Mathematical literacy': 10,
  // Reading literacy — 10 points
  'Грамотность чтения': 10,
  'Оқу сауаттылығы': 10,
  'Reading literacy': 10,
};

/** Profile (elective) subjects are scored out of 50 points each. */
const PROFILE_SUBJECT_MAX = 50;

/** Maximum score allowed for a given subject name. */
export function subjectMax(subject: string): number {
  return SUBJECT_MAX[subject] ?? PROFILE_SUBJECT_MAX;
}
