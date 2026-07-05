import { Text, View } from 'react-native';

import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { ClassLevel } from '@/lib/learn';
import { ProgressRing } from './ProgressRing';

interface ClassSummaryCardProps {
  cls: ClassLevel;
  reduceMotion?: boolean;
}

/** Units-screen header card: progress ring + unit / lesson counts. */
export function ClassSummaryCard({ cls, reduceMotion }: ClassSummaryCardProps) {
  return (
    <View
      style={SHADOW_SOFT}
      className="flex-row items-center gap-4 rounded-lg bg-white p-5">
      <ProgressRing
        value={cls.progress}
        reduceMotion={reduceMotion}
        centerValue={
          <Text className="font-display text-[18px] text-ink-900">{cls.progress}%</Text>
        }
      />
      <View className="flex-1 gap-1">
        <Text className="font-bodyBold text-base text-ink-900">Сынып бойынша үлгерім</Text>
        <Text className="text-[13px] text-ink-500">
          {cls.units} бөлім · {cls.lessons} сабақ
        </Text>
      </View>
    </View>
  );
}
