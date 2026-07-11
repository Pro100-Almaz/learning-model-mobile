// Client-side visual theme for subjects (icon / accent / soft bg).
//
// The backend only sends data fields (id, name, slug, class_count, progress) —
// it has no opinion on how a subject should look. The look lives here, keyed by
// the subject `slug`, so design can be tuned without a backend change. Add a new
// subject to subject-theme.json to give it a themed tile; anything missing falls
// back to DEFAULT_SUBJECT_THEME.

import type { Ionicons } from '@expo/vector-icons';
import themes from './subject-theme.json';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** The purely-visual half of a subject tile, resolved by slug on the client. */
export interface SubjectTheme {
  /** Ionicons glyph for the leading tile. */
  icon: IoniconName;
  tint: string; // accent hex
  soft: string; // soft bg hex
}

// JSON widens `icon` to `string`; assert back to the themed shape.
const THEMES = themes as Record<string, SubjectTheme>;

/**
 * Neutral fallback for a slug the client has no theme for yet. Prefers the
 * tunable `_default` entry in subject-theme.json, with a hardcoded backstop in
 * case that key is ever removed.
 */
export const DEFAULT_SUBJECT_THEME: SubjectTheme = THEMES._default ?? {
  icon: 'book-outline',
  tint: '#2F6BFF',
  soft: '#EEF3FF',
};

/** Visual theme (icon/tint/soft) for a subject slug, with a safe fallback. */
export function getSubjectTheme(slug: string): SubjectTheme {
  return THEMES[slug] ?? DEFAULT_SUBJECT_THEME;
}
