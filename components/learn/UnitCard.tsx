import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { Unit } from '@/lib/learn';
import { ProgressBadge } from './ProgressBadge';
import { ProgressBar } from './ProgressBar';

interface UnitCardProps {
  unit: Unit;
  /** 0-based position; rendered as a 1-based leading number. */
  index: number;
  onPress: () => void;
}

/** Numbered row + description + progress. Renders disabled when locked. */
export function UnitCard({ unit, index, onPress }: UnitCardProps) {
  const locked = !!unit.locked;
  const done = unit.progress >= 100;

  const inner = (
    <>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-9 w-9 items-center justify-center rounded-md ${
            locked ? 'bg-surface-field' : done ? 'bg-success-50' : 'bg-blue-50'
          }`}>
          {locked ? (
            <Ionicons name="lock-closed" size={16} color={COLORS.ink500} />
          ) : (
            <Text
              className={`font-display text-[15px] ${done ? 'text-success-500' : 'text-blue-600'}`}>
              {index + 1}
            </Text>
          )}
        </View>

        <View className="flex-1">
          <Text
            className={`font-bodyBold text-base ${locked ? 'text-ink-300' : 'text-ink-900'}`}
            numberOfLines={2}>
            {unit.title}
          </Text>
          <Text
            className={`text-[13px] ${locked ? 'text-ink-300' : 'text-ink-500'}`}
            numberOfLines={2}>
            {unit.description}
          </Text>
        </View>

        <ProgressBadge
          status={locked ? 'locked' : done ? 'done' : unit.progress > 0 ? 'progress' : 'todo'}
          label={locked ? undefined : done ? undefined : `${unit.done}/${unit.lessons}`}
          percent={unit.progress}
        />
      </View>

      {!locked ? (
        <ProgressBar value={unit.progress} tone={done ? 'success' : 'blue'} height={6} />
      ) : null}
    </>
  );

  if (locked) {
    return (
      <View
        style={SHADOW_SOFT}
        className="gap-3 rounded-lg bg-white p-4 opacity-60"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={`${unit.title}, жабық`}>
        {inner}
      </View>
    );
  }

  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={unit.title}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="gap-3 rounded-lg bg-white p-4 active:bg-surface-tint">
      {inner}
    </PressableScale>
  );
}
