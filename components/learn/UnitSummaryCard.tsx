import { Text, View } from 'react-native';

import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Unit } from '@/lib/learn';
import { ProgressBadge } from './ProgressBadge';
import { ProgressBar } from './ProgressBar';

interface UnitSummaryCardProps {
  unit: Unit;
}

/** Lessons-screen header card: description + done/total + progress. */
export function UnitSummaryCard({ unit }: UnitSummaryCardProps) {
  const done = unit.progress >= 100;
  return (
    <View style={SHADOW_SOFT} className="gap-3 rounded-lg bg-white p-5">
      <View className="flex-row items-start gap-3">
        <Text className="flex-1 text-[13px] leading-5 text-ink-500">{unit.description}</Text>
        <ProgressBadge
          status={done ? 'done' : unit.progress > 0 ? 'progress' : 'todo'}
          label={done ? undefined : `${unit.done}/${unit.lessons}`}
          percent={unit.progress}
        />
      </View>
      <ProgressBar value={unit.progress} tone={done ? 'success' : 'blue'} height={8} />
    </View>
  );
}
