import { Text, View } from 'react-native';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Module } from '@/lib/learn';
import { ProgressBadge } from './ProgressBadge';
import { ProgressBar } from './ProgressBar';

interface ModuleCardProps {
  module: Module;
  /** 0-based position; rendered as a 1-based leading number. */
  index: number;
  onPress: () => void;
}

/** Numbered row + description + progress. Always open/pressable. */
export function ModuleCard({ module, index, onPress }: ModuleCardProps) {
  const done = module.progress >= 100;

  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={module.title}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="gap-3 rounded-lg bg-white p-4 active:bg-surface-tint">
      <View className="flex-row items-center gap-3">
        <View
          className={`h-9 w-9 items-center justify-center rounded-md ${
            done ? 'bg-success-50' : 'bg-blue-50'
          }`}>
          <Text
            className={`font-display text-[15px] ${done ? 'text-success-500' : 'text-blue-600'}`}>
            {index + 1}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="font-bodyBold text-base text-ink-900" numberOfLines={2}>
            {module.title}
          </Text>
          <Text className="text-[13px] text-ink-500" numberOfLines={2}>
            {module.description}
          </Text>
        </View>

        <ProgressBadge
          status={done ? 'done' : module.progress > 0 ? 'progress' : 'todo'}
          label={done ? undefined : `${module.done}/${module.lessons}`}
          percent={module.progress}
        />
      </View>

      <ProgressBar value={module.progress} tone={done ? 'success' : 'blue'} height={6} />
    </PressableScale>
  );
}
