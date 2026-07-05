import { useEffect, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { Canvas, Group, LinearGradient, Path, Skia, vec } from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { COLORS, EASE_SOFT } from '@/lib/onboarding-theme';

type Tone = 'blue' | 'teal' | 'amber';

interface ProgressRingProps {
  value: number;
  max?: number;
  /** Outer diameter in px. */
  size?: number;
  /** Ring thickness in px. */
  stroke?: number;
  tone?: Tone;
  /** Node rendered in the ring centre (e.g. the percent number). */
  centerValue?: ReactNode;
  /** Skip the fill animation (reduce-motion). */
  reduceMotion?: boolean;
}

const GRADIENTS: Record<Tone, [string, string]> = {
  blue: [COLORS.blue500, COLORS.blue400],
  teal: [COLORS.teal500, '#5DE0C9'],
  amber: [COLORS.amber500, '#FFD070'],
};

/**
 * Circular progress ring. Skia track + gradient arc, rounded cap, starting at
 * 12 o'clock and animating on mount / value change. Mirrors the web ProgressRing
 * and the home ScoreRing. See docs/subject_lesson_pages.md §6.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 84,
  stroke = 9,
  tone = 'blue',
  centerValue,
  reduceMotion = false,
}: ProgressRingProps) {
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2;

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.addCircle(cx, cy, r);
    return p;
  }, [cx, cy, r]);

  const end = useSharedValue(reduceMotion ? pct : 0);

  useEffect(() => {
    if (reduceMotion) {
      end.value = pct;
    } else {
      end.value = withTiming(pct, { duration: 700, easing: EASE_SOFT });
    }
  }, [pct, reduceMotion, end]);

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Canvas style={{ width: size, height: size, position: 'absolute' }}>
        <Path
          path={path}
          style="stroke"
          strokeWidth={stroke}
          strokeCap="round"
          color={COLORS.surfaceField}
        />
        <Group origin={vec(cx, cy)} transform={[{ rotate: -Math.PI / 2 }]}>
          <Path path={path} style="stroke" strokeWidth={stroke} strokeCap="round" start={0} end={end}>
            <LinearGradient start={vec(0, 0)} end={vec(size, size)} colors={GRADIENTS[tone]} />
          </Path>
        </Group>
      </Canvas>

      {centerValue ? <View className="items-center">{centerValue}</View> : null}
    </View>
  );
}
