// Shared API types mirroring the Qadam backend (same API the web app uses).

export interface University {
  id: number;
  name: string;
  city?: string | null;
}

export interface Specialty {
  id: number;
  name: string;
  university_id: number;
  /** Most recent passing threshold for this specialty, if known. */
  latest_threshold?: number | null;
}

/** A single per-subject expected score, keyed by the subject name. */
export interface ExpectedScore {
  subject: string;
  score: number;
}

/** Options that populate the onboarding selects. */
export interface OnboardingOptions {
  universities: University[];
  specialties: Specialty[];
  /** Subject names the student fills expected scores for. */
  subjects: string[];
}

/** The authenticated user's Qadam profile. */
export interface Profile {
  target_university: number | null;
  target_specialty: number | null;
  target_score: number | null;
  expected_scores: ExpectedScore[];
  onboarding_completed: boolean;
}

/** Payload accepted by PATCH /profile/. */
export interface ProfileUpdate {
  target_university: number | null;
  target_specialty: number | null;
  target_score: number | null;
  expected_scores: ExpectedScore[];
}
