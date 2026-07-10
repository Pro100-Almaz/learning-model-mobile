import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

interface VideoPlaceholderProps {
  /** When a real URL exists, swap this for expo-video. */
  videoUrl?: string;
  onPress?: () => void;
}

/**
 * Brand-gradient video slot with a play glyph. The 135° brand gradient is
 * approximated with layered brand-blue tones (no native gradient dependency),
 * matching ScoreHeroCard. See docs/subject_lesson_pages.md §6.
 */
export function VideoPlaceholder({ videoUrl, onPress }: VideoPlaceholderProps) {
  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel="Видеоны ойнату"
      onPress={onPress}
      style={SHADOW_SOFT}
      className="aspect-video items-center justify-center overflow-hidden rounded-lg bg-blue-500">
      {/* gradient approximation */}
      <View className="absolute -right-10 -top-12 h-52 w-52 rounded-pill bg-blue-400/50" />
      <View className="absolute -bottom-16 -left-10 h-52 w-52 rounded-pill bg-[#7C5CFF]/40" />

      <View className="h-16 w-16 items-center justify-center rounded-pill bg-white/95">
        <Ionicons name="play" size={30} color={COLORS.blue600} style={{ marginLeft: 3 }} />
      </View>
      <Text className="mt-3 font-bodyBold text-[13px] text-white/90">
        {videoUrl ? 'Видеоны ойнату' : 'Видео жақында қосылады'}
      </Text>
    </PressableScale>
  );
}
