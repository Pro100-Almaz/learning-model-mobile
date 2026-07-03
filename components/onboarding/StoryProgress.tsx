import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { EASE_SOFT, PROGRESS_DURATION } from '@/lib/onboarding-theme';

interface StoryProgressProps {
  /** Active step index (0-based). */
  current: number;
  /** Total number of steps. */
  total: number;
}

/** One segmented story bar; fills from 0→100% when it becomes active/past. */
function Bar({ filled }: { filled: boolean }) {
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(filled ? 1 : 0, {
      duration: PROGRESS_DURATION,
      easing: EASE_SOFT,
    });
  }, [filled, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View className="h-1 flex-1 overflow-hidden rounded-pill bg-blue-500/20">
      <Animated.View className="h-full rounded-pill bg-blue-500" style={fillStyle} />
    </View>
  );
}

/** Top segmented story bars (fixed chrome). */
export function StoryProgress({ current, total }: StoryProgressProps) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <Bar key={i} filled={i <= current} />
      ))}
    </View>
  );
}
