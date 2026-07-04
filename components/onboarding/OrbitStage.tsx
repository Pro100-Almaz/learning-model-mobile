import { Children as RNChildren, useEffect, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_SOFT, ORBIT_DURATION } from '@/lib/onboarding-theme';
import { OrbitFace } from './OrbitFace';
import {
  OrbitContext,
  type OrbitContextValue,
  type OrbitMode,
} from './orbit-context';

interface OrbitStageProps {
  /** Active step index (0-based); drives the orbit angle. */
  index: number;
  /** When true, the 3D rotation is replaced by a crossfade. */
  reduceMotion?: boolean;
  /** One child per face, in order. */
  children: ReactNode;
}

/**
 * The page track. Advancing `index` slides the whole track left by one screen
 * width — a single animated transform on one node, so faces never race or tear.
 *
 * The design (docs/onboarding-design-handoff.md §3) originally specced a 3D
 * `rotateY`/`translateZ` cube, but RN has no `translateZ` transform and its 3D
 * backface culling is unreliable on Android (faces get dropped). §3 sanctions a
 * "zero 3D risk" fallback — a horizontal `translateX(-index · width)` track with
 * the same component tree — which is what we use here. With `reduceMotion`, faces
 * crossfade instead.
 */
export function OrbitStage({ index, reduceMotion = false, children }: OrbitStageProps) {
  const { width } = useWindowDimensions();
  const mode: OrbitMode = reduceMotion ? 'fade' : 'orbit';

  const offset = useSharedValue(-index * width);

  useEffect(() => {
    if (mode === 'fade') return; // no sliding in reduced-motion mode
    offset.value = withTiming(-index * width, {
      duration: ORBIT_DURATION,
      easing: EASE_SOFT,
    });
  }, [index, mode, offset, width]);

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const faces = RNChildren.toArray(children);

  const ctx: OrbitContextValue = { width, index, mode };

  // Reduced-motion: stack faces and crossfade, no sliding.
  if (mode === 'fade') {
    return (
      <OrbitContext.Provider value={ctx}>
        <View className="flex-1">
          {faces.map((child, pos) => (
            <OrbitFace key={pos} pos={pos}>
              {child}
            </OrbitFace>
          ))}
        </View>
      </OrbitContext.Provider>
    );
  }

  return (
    <OrbitContext.Provider value={ctx}>
      <View className="flex-1 overflow-hidden">
        <Animated.View className="flex-1" style={trackStyle}>
          {faces.map((child, pos) => (
            <OrbitFace key={pos} pos={pos}>
              {child}
            </OrbitFace>
          ))}
        </Animated.View>
      </View>
    </OrbitContext.Provider>
  );
}
