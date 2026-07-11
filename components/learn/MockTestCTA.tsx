import { Text, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_CTA } from '@/lib/onboarding-theme';

interface MockTestCTAProps {
  onPress: () => void;
  label?: string;
}

/**
 * Sticky bottom "take a test" bar for the learn list screens (subject / class /
 * module). Absolutely positioned and lifted above the tab bar; lists add matching
 * bottom padding so the last item isn't covered.
 */
export function MockTestCTA({ onPress, label = 'Тест тапсыру' }: MockTestCTAProps) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View
      className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
      style={{ paddingBottom: tabBarHeight + 12 }}>
      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={SHADOW_CTA}
        className="h-12 flex-row items-center justify-center gap-2 rounded-md bg-blue-500">
        <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
        <Text className="font-bodyBold text-[15px] text-white">{label}</Text>
      </PressableScale>
    </View>
  );
}
