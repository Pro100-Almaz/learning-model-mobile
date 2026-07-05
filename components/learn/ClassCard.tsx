import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { classSubtitle, type ClassLevel } from '@/lib/learn';
import { ProgressBadge } from './ProgressBadge';
import { ProgressBar } from './ProgressBar';

interface ClassCardProps {
  cls: ClassLevel;
  onPress: () => void;
}

/** Full-width row: grade title, units·lessons, progress badge + bar. */
export function ClassCard({ cls, onPress }: ClassCardProps) {
  const isDone = cls.progress >= 100;

  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={cls.title}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="gap-3 rounded-lg bg-white p-4 active:bg-surface-tint">
      <View className="flex-row items-center gap-3">
        <View className="flex-1">
          <Text className="font-bodyBold text-base text-ink-900" numberOfLines={2}>
            {cls.title}
          </Text>
          <Text className="text-[13px] text-ink-500" numberOfLines={1}>
            {classSubtitle(cls)}
          </Text>
        </View>
        <ProgressBadge
          status={isDone ? 'done' : cls.progress > 0 ? 'progress' : 'todo'}
          percent={cls.progress}
        />
        <Ionicons name="chevron-forward" size={20} color={COLORS.ink300} />
      </View>
      <ProgressBar value={cls.progress} tone={isDone ? 'success' : 'blue'} height={6} />
    </PressableScale>
  );
}
