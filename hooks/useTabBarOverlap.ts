import { Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

/**
 * How many pixels of the screen's content the tab bar covers.
 *
 * Only iOS floats the tab bar over the content — see the `position: 'absolute'`
 * tabBarStyle in `app/(app)/(authenticated)/(tabs)/_layout.tsx`. There, a sticky
 * footer pinned to `bottom: 0` sits *under* the tab bar and has to lift itself
 * by its height. On Android the tab bar is a sibling in the layout, so the
 * content area already ends at its top edge: the overlap is zero, and padding a
 * footer by `useBottomTabBarHeight()` strands it a whole tab bar too high.
 *
 * Use this instead of `useBottomTabBarHeight()` for any bottom padding whose job
 * is "clear the tab bar".
 */
export function useTabBarOverlap(): number {
  const tabBarHeight = useBottomTabBarHeight();
  return Platform.OS === 'ios' ? tabBarHeight : 0;
}
