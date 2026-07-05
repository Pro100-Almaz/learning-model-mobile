import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SHADOW_CTA } from '@/lib/onboarding-theme';

interface StickyActionsProps {
  /** true → primary reads "Жалғастыру"; false → "Бастау". */
  started: boolean;
  onPractice: () => void;
  onStart: () => void;
}

/**
 * Sticky bottom action bar. Absolutely positioned; respects the safe-area
 * bottom inset. The detail scroll content adds matching bottom padding so it
 * isn't covered. See docs/subject_lesson_pages.md §6.
 */
export function StickyActions({ started, onPractice, onStart }: StickyActionsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 bottom-0 flex-row gap-3 border-t border-line-200 bg-surface-app px-4 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}>
      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel="Жаттығу"
        onPress={onPractice}
        className="h-12 flex-1 items-center justify-center rounded-md bg-surface-tint">
        <Text className="font-bodyBold text-[15px] text-blue-600">Жаттығу</Text>
      </PressableScale>

      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={started ? 'Жалғастыру' : 'Бастау'}
        onPress={onStart}
        style={SHADOW_CTA}
        className="h-12 flex-[1.4] items-center justify-center rounded-md bg-blue-500">
        <Text className="font-bodyBold text-[15px] text-white">
          {started ? 'Жалғастыру' : 'Бастау'}
        </Text>
      </PressableScale>
    </View>
  );
}
