import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { useTabBarOverlap } from '@/hooks/useTabBarOverlap';
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
  const { t } = useTranslation();
  const tabBarOverlap = useTabBarOverlap();

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
      style={{ paddingBottom: tabBarOverlap + 12 }}>
      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={t('learn.mockTest')}
        onPress={onTest}
        style={SHADOW_CTA}
        className="h-12 items-center justify-center rounded-md bg-blue-500">
        <Text className="font-bodyBold text-[15px] text-white">{t('learn.mockTest')}</Text>
      </PressableScale>
    </View>
  );
}
