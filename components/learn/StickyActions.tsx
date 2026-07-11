import { Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SHADOW_CTA } from '@/lib/onboarding-theme';

interface StickyActionsProps {
  /** Opens the lesson mock test. */
  onTest: () => void;
}

/**
 * Sticky bottom action bar. Absolutely positioned; sits above the tab bar. The
 * detail scroll content adds matching bottom padding so it isn't covered. The
 * video plays inline (see LessonVideo), so the bar's sole action is the test.
 * See docs/subject_lesson_pages.md §6.
 */
export function StickyActions({ onTest }: StickyActionsProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
      style={{ paddingBottom: tabBarHeight + 12 }}>
      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel="Тест тапсыру"
        onPress={onTest}
        style={SHADOW_CTA}
        className="h-12 items-center justify-center rounded-md bg-blue-500">
        <Text className="font-bodyBold text-[15px] text-white">Тест тапсыру</Text>
      </PressableScale>
    </View>
  );
}
