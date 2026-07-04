import { useEffect, type ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_SOFT, PROGRESS_DURATION } from '@/lib/onboarding-theme';
import { useOrbit } from './orbit-context';

interface OrbitFaceProps {
  /** This face's fixed position in the ring (0-based). */
  pos: number;
  children: ReactNode;
}

/**
 * One positioned face of the track. In `orbit` mode the face is parked one
 * screen width apart from its neighbours (`translateX(pos · width)`) and the
 * parent track slides to reveal the active one. In `fade` mode it simply
 * crossfades. The content is painted on the opaque app background so faces
 * never bleed into each other during the slide.
 */
export function OrbitFace({ pos, children }: OrbitFaceProps) {
  const { width, index, mode } = useOrbit();
  const active = pos === index;

  // Crossfade opacity, only used in `fade` mode.
  const fade = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    if (mode !== 'fade') return;
    fade.value = withTiming(active ? 1 : 0, {
      duration: PROGRESS_DURATION,
      easing: EASE_SOFT,
    });
  }, [active, mode, fade]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (mode === 'fade') {
    return (
      <Animated.View
        pointerEvents={active ? 'auto' : 'none'}
        className="absolute inset-0 bg-surface-app px-7 pt-4"
        style={fadeStyle}>
        {children}
      </Animated.View>
    );
  }

  // Horizontal track: each face is a full-width panel parked at pos · width.
  // The parent OrbitStage slides the whole track by -index · width to reveal
  // the active face. No 3D transforms — robust on both platforms.
  return (
    <Animated.View
      pointerEvents={active ? 'auto' : 'none'}
      className="absolute top-0 bottom-0 bg-surface-app px-7 pt-4"
      style={{ width, transform: [{ translateX: pos * width }] }}>
      {children}
    </Animated.View>
  );
}
