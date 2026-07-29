import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { PressableScale } from './PressableScale';

interface PrevButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

/** Square "back" button, sits left of the primary CTA (hidden on step 0). */
export function PrevButton({ onPress, disabled = false }: PrevButtonProps) {
  const { t } = useTranslation();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      disabled={disabled}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="h-[52px] w-[52px] items-center justify-center rounded-md bg-white">
      <Ionicons name="arrow-back" size={22} color={COLORS.ink700} />
    </PressableScale>
  );
}
