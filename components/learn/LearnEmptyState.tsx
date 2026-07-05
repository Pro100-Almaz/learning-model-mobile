import { type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/lib/onboarding-theme';

interface LearnEmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Friendly "nothing here yet" panel styled with the Qadam DS tokens. */
export function LearnEmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  action,
}: LearnEmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-lg border border-line-200 bg-white px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-pill bg-surface-tint">
        <Ionicons name={icon} size={28} color={COLORS.blue600} />
      </View>
      <Text className="text-center font-bodyBold text-base text-ink-900">{title}</Text>
      {description ? (
        <Text className="text-center text-[13px] leading-5 text-ink-500">{description}</Text>
      ) : null}
      {action}
    </View>
  );
}
