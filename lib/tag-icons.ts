// Client-side icon for a lesson tag (concept), resolved by `slug`.
//
// The backend Tag only carries data (name, slug, description) — it has no
// opinion on how a tag should look. The icon lives here, keyed by the tag
// `slug`, so design can be tuned without a backend change. Add a slug to
// tag-icons.json to give it a glyph; anything missing falls back to
// DEFAULT_TAG_ICON.

import type { Ionicons } from '@expo/vector-icons';
import icons from './tag-icons.json';

type IoniconName = keyof typeof Ionicons.glyphMap;

// JSON widens the values to `string`; assert back to the Ionicon glyph type.
const ICONS = icons as Record<string, IoniconName>;

/**
 * Neutral fallback for a slug the client has no icon for yet. Prefers the
 * tunable `_default` entry in tag-icons.json, with a hardcoded backstop in
 * case that key is ever removed.
 */
export const DEFAULT_TAG_ICON: IoniconName = ICONS._default ?? 'bulb-outline';

/** Ionicons glyph for a tag slug, with a safe fallback. */
export function getTagIcon(slug: string): IoniconName {
  return ICONS[slug] ?? DEFAULT_TAG_ICON;
}
