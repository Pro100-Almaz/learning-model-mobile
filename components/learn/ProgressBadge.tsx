import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { COLORS } from '@/lib/onboarding-theme';

type Status = 'done' | 'progress' | 'todo' | 'locked';

interface ProgressBadgeProps {
  status: Status;
  /** In-progress percent, shown when status === 'progress' and no label given. */
  percent?: number;
  /** Explicit label (e.g. "5/8"); overrides the default per-status copy. */
  label?: string;
}

const STYLES: Record<
  Status,
  { wrap: string; text: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }
> = {
  done: {
    wrap: 'bg-success-50',
    text: 'text-success-500',
    icon: 'checkmark',
    iconColor: COLORS.success500,
  },
  progress: {
    wrap: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'time-outline',
    iconColor: COLORS.blue600,
  },
  todo: {
    wrap: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'play',
    iconColor: COLORS.blue600,
  },
  locked: {
    wrap: 'bg-surface-field',
    text: 'text-ink-500',
    icon: 'lock-closed',
    iconColor: COLORS.ink500,
  },
};

function defaultLabel(t: TFunction, status: Status, percent?: number): string {
  switch (status) {
    case 'done':
      return t('learn.progressDone');
    case 'progress':
      return percent != null ? `${percent}%` : t('learn.progressInProgress');
    case 'locked':
      return t('learn.progressLocked');
    default:
      return t('learn.progressStart');
  }
}

/** Status pill (done / progress / todo / locked) with a leading glyph. */
export function ProgressBadge({ status, percent, label }: ProgressBadgeProps) {
  const { t } = useTranslation();
  const s = STYLES[status];
  return (
    <View className={`flex-row items-center gap-1 rounded-pill px-2.5 py-1 ${s.wrap}`}>
      <Ionicons name={s.icon} size={13} color={s.iconColor} />
      <Text className={`font-bodyBold text-[12px] ${s.text}`}>
        {label ?? defaultLabel(t, status, percent)}
      </Text>
    </View>
  );
}
