import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

const THUMB = 26;
const TRACK_H = 6;

// Worklet so it can be called from both the JS thread (effect/commit) and the
// UI thread (inside the pan gesture worklets). A plain JS function called from a
// gesture worklet throws "Tried to call a non-worklet function on the UI thread".
function clamp(n: number, lo: number, hi: number) {
  'worklet';
  return Math.min(Math.max(n, lo), hi);
}

interface ScoreSliderProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  /** Active-track / thumb accent color. */
  accent?: string;
}

/**
 * Custom slider: white thumb with a blue border and soft shadow over a blue
 * fill track (design §6). Built on gesture-handler + Reanimated so no native
 * slider dependency is required. Reports integer values.
 */
export function ScoreSlider({
  value,
  min = 0,
  max,
  onChange,
  accent = COLORS.blue500,
}: ScoreSliderProps) {
  const [trackW, setTrackW] = useState(0);
  // `x` is the thumb *center*, constrained to [THUMB/2, trackW - THUMB/2] so the
  // circle never overhangs (and gets clipped at) either end of the track.
  const x = useSharedValue(0);

  // Keep the thumb in sync with the external value (e.g. quick-pick chips).
  useEffect(() => {
    if (trackW <= 0) return;
    const usable = Math.max(trackW - THUMB, 0);
    const frac = max === min ? 0 : clamp((value - min) / (max - min), 0, 1);
    x.value = THUMB / 2 + frac * usable;
  }, [value, trackW, min, max, x]);

  function commit(centerPx: number) {
    if (trackW <= 0) return;
    const usable = Math.max(trackW - THUMB, 1);
    const frac = clamp((centerPx - THUMB / 2) / usable, 0, 1);
    const next = Math.round(min + frac * (max - min));
    onChange(clamp(next, min, max));
  }

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      x.value = clamp(e.x, THUMB / 2, trackW - THUMB / 2);
      runOnJS(commit)(x.value);
    })
    .onUpdate((e) => {
      x.value = clamp(e.x, THUMB / 2, trackW - THUMB / 2);
      runOnJS(commit)(x.value);
    });

  const fillStyle = useAnimatedStyle(() => ({ width: x.value }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - THUMB / 2 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      {/* Padding gives a comfortable touch target above/below the track. */}
      <View className="py-4" collapsable={false}>
        <View
          onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
          className="justify-center rounded-pill bg-line-200"
          style={{ height: TRACK_H }}>
          <Animated.View
            className="absolute left-0 h-full rounded-pill"
            style={[fillStyle, { backgroundColor: accent }]}
          />
          <Animated.View
            style={[
              thumbStyle,
              SHADOW_SOFT,
              {
                position: 'absolute',
                width: THUMB,
                height: THUMB,
                borderRadius: THUMB / 2,
                backgroundColor: COLORS.white,
                borderWidth: 5,
                borderColor: accent,
              },
            ]}
          />
        </View>
      </View>
    </GestureDetector>
  );
}
