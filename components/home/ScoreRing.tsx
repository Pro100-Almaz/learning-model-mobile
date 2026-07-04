import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { BRAND_GRADIENT, EASE_SOFT } from '@/lib/onboarding-theme';
import { formatNumber } from '@/lib/home';

interface ScoreRingProps {
  value: number;
  max: number;
  /** Outer diameter, px. */
  size?: number;
  /** Ring thickness, px. */
  stroke?: number;
  /** Skip the fill animation (reduce-motion). */
  reduceMotion?: boolean;
  /** Small caption under the number, e.g. "балл". */
  unit?: string;
}

/**
 * Circular ЕНТ score ring. Skia track + gradient progress arc, rounded cap,
 * starting at 12 o'clock. The arc animates from empty to `value/max` on mount
 * (700ms, --ease-soft) and whenever the value changes. Mirrors the web
 * ProgressRing. See docs/home-page.md §3, §6.
 */
export function ScoreRing({
  value,
  max,
  size = 132,
  stroke = 12,
  reduceMotion = false,
  unit = 'балл',
}: ScoreRingProps) {
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
        {/* Track */}
        <Path
          path={path}
          style="stroke"
          strokeWidth={stroke}
          strokeCap="round"
          color="rgba(255,255,255,0.28)"
        />
        {/* Progress arc, starting at 12 o'clock */}
        <Group origin={vec(cx, cy)} transform={[{ rotate: -Math.PI / 2 }]}>
          <Path
            path={path}
            style="stroke"
            strokeWidth={stroke}
            strokeCap="round"
            start={0}
            end={end}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(size, size)}
              colors={[...BRAND_GRADIENT]}
            />
          </Path>
        </Group>
      </Canvas>

      <View className="items-center">
        <Text className="font-display text-[26px] leading-none text-white">
          {formatNumber(value)}
        </Text>
        {unit ? (
          <Text className="mt-0.5 font-bodyBold text-[11px] uppercase tracking-[1.5px] text-white/80">
            {unit}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
