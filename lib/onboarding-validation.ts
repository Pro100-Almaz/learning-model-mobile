// Plain validation replacing the Vue feature's zod schemas. Kept framework-free
// so it can be reused from the screen's computed gates and inline field errors.

import { ENT_MAX_SCORE, subjectMax } from './ent';
import type { ExpectedScore } from './types';

function isValidScore(value: number | null | undefined, max: number): boolean {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
  );
}

/** Step 1 gate — both target university and specialty must be chosen. */
export function isStepTargetValid(
  targetUniversity: number | null,
  targetSpecialty: number | null
): boolean {
  return targetUniversity != null && targetSpecialty != null;
}

/** Step 2 gate — every subject filled with an in-range integer score. */
export function isStepScoresValid(
  subjects: string[],
  expected: ExpectedScore[]
): boolean {
  if (subjects.length === 0) return false;
  if (expected.length !== subjects.length) return false;
  return expected.every((e) => isValidScore(e.score, subjectMax(e.subject)));
}

/** Step 3 gate — target score is optional, but if present must be valid. */
export function isStepGoalValid(targetScore: number | null): boolean {
  if (targetScore == null) return true;
  return isValidScore(targetScore, ENT_MAX_SCORE);
}

/**
 * Inline error for a single subject score, or null when acceptable.
 * `null`/empty is treated as "not yet entered" and produces no error.
 */
export function subjectScoreError(
  subject: string,
  value: number | null | undefined
): string | null {
  if (value == null) return null;
  const max = subjectMax(subject);
  return isValidScore(value, max) ? null : `Enter a score from 0 to ${max}.`;
}

/** Inline error for the optional target score, or null when acceptable. */
export function targetScoreError(value: number | null): string | null {
  if (value == null) return null;
  return isValidScore(value, ENT_MAX_SCORE)
    ? null
    : `Enter a score from 0 to ${ENT_MAX_SCORE}.`;
}
