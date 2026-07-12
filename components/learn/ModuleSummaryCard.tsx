import { Text, View } from 'react-native';

import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Module } from '@/lib/learn';
import { ProgressBadge } from './ProgressBadge';
import { ProgressBar } from './ProgressBar';

interface ModuleSummaryCardProps {
  module: Module;
}

/** Lessons-screen header card: description + done/total + progress. */
export function ModuleSummaryCard({ module }: ModuleSummaryCardProps) {
  const done = module.progress >= 100;
  return (
    <View style={SHADOW_SOFT} className="gap-3 rounded-lg bg-white p-5">
      <View className="flex-row items-start gap-3">
        <Text className="flex-1 text-[13px] leading-5 text-ink-500">{module.description}</Text>
        <ProgressBadge
          status={done ? 'done' : module.progress > 0 ? 'progress' : 'todo'}
          label={done ? undefined : `${module.done}/${module.lessons}`}
          percent={module.progress}
        />
      </View>
      <ProgressBar value={module.progress} tone={done ? 'success' : 'blue'} height={8} />
    </View>
  );
}
