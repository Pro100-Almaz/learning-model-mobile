// JS-side design tokens for the onboarding flow. NativeWind covers colors,
// radii and type; these are the values that need to live in JS — shadows,
// gradient stops, animation easing and the few raw colors used by the
// Reanimated slider / orbit driver.
//
// Source of truth: docs/onboarding-design-handoff.md (§4, §6).

import { Easing } from 'react-native-reanimated';
import { Platform } from 'react-native';

/** Raw palette values needed outside NativeWind className strings. */
export const COLORS = {
  blue50: '#EEF3FF',
  blue100: '#DCE6FF',
  blue200: '#BBCEFF',
  blue400: '#5C86FF',
  blue500: '#2F6BFF',
  blue600: '#1E54E8',
  blue700: '#1A45BE',
  teal500: '#15C7A9',
  amber500: '#FFB020',
  success50: '#E7F8EF',
  success500: '#16B364',
  ink900: '#0E1526',
  ink700: '#33405C',
  ink500: '#64708C',
  ink300: '#A7B0C4',
  surfaceApp: '#F5F7FC',
  surfaceTint: '#EEF3FF',
  surfaceField: '#EDF0F7',
  line200: '#E6EAF2',
  line300: '#D7DDEA',
  white: '#FFFFFF',
} as const;

/** --ease-soft from the design system: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE_SOFT = Easing.bezier(0.22, 1, 0.36, 1);

/** Orbit rotation timing. */
export const ORBIT_DURATION = 520;
/** StoryProgress fill timing. */
export const PROGRESS_DURATION = 300;
/** Press-scale feedback timing. */
export const PRESS_DURATION = 140;

/** Brand hero gradient stops (135°): #2F6BFF → #5C86FF → #7C5CFF. */
export const BRAND_GRADIENT = ['#2F6BFF', '#5C86FF', '#7C5CFF'] as const;
/** App background: radial #DCE8FF → #F5F7FC, approximated top-anchored. */
export const APP_BG_GRADIENT = ['#DCE8FF', '#F5F7FC'] as const;

/** Soft neutral card/well shadow. */
export const SHADOW_SOFT = Platform.select({
  ios: {
    shadowColor: '#14306F',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: { elevation: 6 },
  default: {},
}) as object;

/** Elevated blue CTA lift. */
export const SHADOW_CTA = Platform.select({
  ios: {
    shadowColor: '#2F6BFF',
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  android: { elevation: 8 },
  default: {},
}) as object;
