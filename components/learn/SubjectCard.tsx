import { Text, View } from 'react-native';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Subject } from '@/lib/learn';
import { IconTile } from './IconTile';
import { ProgressBar } from './ProgressBar';

interface SubjectCardProps {
  subject: Subject;
  onPress: () => void;
}

/** Grid tile: icon, title, class count, progress bar. */
export function SubjectCard({ subject, onPress }: SubjectCardProps) {
  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={subject.title}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="flex-1 gap-3 rounded-lg bg-white p-4 active:bg-surface-tint">
      <IconTile name={subject.icon} tint={subject.tint} soft={subject.soft} />

      <View className="gap-0.5">
        <Text className="font-bodyBold text-base text-ink-900" numberOfLines={2}>
          {subject.title}
        </Text>
        <Text className="text-[13px] text-ink-500">
          {subject.classCount > 0 ? `${subject.classCount} сынып` : 'Жақында'}
        </Text>
      </View>

      <View className="mt-1 gap-1">
        <ProgressBar value={subject.progress} tone="blue" height={6} />
        <Text className="text-[11px] text-ink-500">{subject.progress}%</Text>
      </View>
    </PressableScale>
  );
}
