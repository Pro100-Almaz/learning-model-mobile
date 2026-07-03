import { ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOW_CTA } from '@/lib/onboarding-theme';
import { PressableScale } from './PressableScale';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Show a trailing arrow (hidden on the final "Бастау" step by choice). */
  showArrow?: boolean;
}

/** Blue CTA with lift shadow and press-scale (design §4). */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  showArrow = true,
}: PrimaryButtonProps) {
  const inactive = disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      disabled={inactive}
      onPress={onPress}
      style={inactive ? undefined : SHADOW_CTA}
      className={`h-14 flex-1 flex-row items-center justify-center gap-2 rounded-md ${
        inactive ? 'bg-blue-500/50' : 'bg-blue-500'
      }`}>
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <>
          <Text className="font-bodyBold text-lg text-white">{label}</Text>
          {showArrow ? (
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          ) : null}
        </>
      )}
    </PressableScale>
  );
}
