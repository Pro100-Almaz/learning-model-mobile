import { type ReactNode } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { EASE_SOFT, PRESS_DURATION } from '@/lib/onboarding-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  /** Scale applied while pressed (design: ~0.96). */
  activeScale?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * A Pressable that scales down on press via Reanimated (--ease-soft, ~140ms)
 * instead of `active:` classes, for the premium press feel in
 * docs/onboarding-design-handoff.md §4.
 */
export function PressableScale({
  children,
  activeScale = 0.96,
  onPressIn,
  onPressOut,
  disabled,
  style,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withTiming(activeScale, {
          duration: PRESS_DURATION,
          easing: EASE_SOFT,
        });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, {
          duration: PRESS_DURATION,
          easing: EASE_SOFT,
        });
        onPressOut?.(e);
      }}
      style={[animatedStyle, style as ViewStyle]}>
      {children}
    </AnimatedPressable>
  );
}
