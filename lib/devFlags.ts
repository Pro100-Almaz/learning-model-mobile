// Dev-only escape hatches. Everything here is hard-gated on `__DEV__` so it is
// compiled out of production builds — the flag cannot be flipped on in a
// release, no matter what the env var says.

import type { OnboardingOptions, Profile } from '@/lib/types';

/**
 * When true, the app skips Clerk auth and the backend entirely: the route
 * guards treat you as signed in and the profile / onboarding-options queries
 * return the mock data below. This lets you build and test the onboarding flow
 * without a working Clerk session or a reachable API.
 *
 * Turn on by setting `EXPO_PUBLIC_DEV_BYPASS_AUTH=true` in your `.env` and
 * restarting Metro. Leave it unset (or `false`) to use real auth.
 */
export const DEV_BYPASS_AUTH =
  __DEV__ && process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true';

/** Mock profile served while bypassing — onboarding not yet completed. */
export const MOCK_PROFILE: Profile = {
  target_university: null,
  target_specialty: null,
  target_score: null,
  expected_scores: [],
  onboarding_completed: false,
};

/** Mock select options so the onboarding steps render with real-looking data. */
export const MOCK_ONBOARDING_OPTIONS: OnboardingOptions = {
  universities: [
    { id: 1, name: 'Назарбаев Университеті', city: 'Астана' },
    { id: 2, name: 'КБТУ', city: 'Алматы' },
    { id: 3, name: 'СДУ', city: 'Қаскелең' },
  ],
  specialties: [
    { id: 11, name: 'Computer Science', university_id: 1, latest_threshold: 132 },
    { id: 12, name: 'Electrical Engineering', university_id: 1, latest_threshold: 128 },
    { id: 21, name: 'Информатика', university_id: 2, latest_threshold: 120 },
    { id: 22, name: 'Нефтегазовое дело', university_id: 2, latest_threshold: 115 },
    { id: 31, name: 'Педагогика', university_id: 3, latest_threshold: 105 },
  ],
  subjects: [
    'Қазақстан тарихы',
    'Математикалық сауаттылық',
    'Оқу сауаттылығы',
    'Математика',
    'Физика',
  ],
};
