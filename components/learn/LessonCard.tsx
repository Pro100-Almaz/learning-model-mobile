import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { lessonMeta, type Lesson } from '@/lib/learn';
import { ProgressBar } from './ProgressBar';

interface LessonCardProps {
  lesson: Lesson;
  onPress: () => void;
}

/** Leading glyph tile driven by lesson status. */
function StatusTile({ status }: { status: Lesson['status'] }) {
  switch (status) {
    case 'done':
      return (
        <View className="h-11 w-11 items-center justify-center rounded-md bg-success-50">
          <Ionicons name="checkmark" size={22} color={COLORS.success500} />
        </View>
      );
    case 'locked':
      return (
        <View className="h-11 w-11 items-center justify-center rounded-md bg-surface-field">
          <Ionicons name="lock-closed" size={20} color={COLORS.ink500} />
        </View>
      );
    default:
      // available or in-progress
      return (
        <View className="h-11 w-11 items-center justify-center rounded-md bg-blue-50">
          <Ionicons name="play" size={20} color={COLORS.blue600} />
        </View>
      );
  }
}

/** Status-driven lesson row: leading icon/color, title, meta, mini progress bar. */
export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const locked = lesson.status === 'locked';
  const inProgress = lesson.status === 'progress';

  const body = (
    <>
      <StatusTile status={lesson.status} />
      <View className="flex-1 gap-1">
        <Text
          className={`font-bodyBold text-base ${locked ? 'text-ink-300' : 'text-ink-900'}`}
          numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text className={`text-[13px] ${locked ? 'text-ink-300' : 'text-ink-500'}`} numberOfLines={1}>
          {lessonMeta(lesson)}
        </Text>
        {inProgress ? <ProgressBar value={lesson.progress} tone="blue" height={5} /> : null}
      </View>
      {!locked ? (
        <Ionicons name="chevron-forward" size={20} color={COLORS.ink300} />
      ) : null}
    </>
  );

  if (locked) {
    return (
      <View
        style={SHADOW_SOFT}
        className="flex-row items-center gap-3.5 rounded-lg bg-white p-3.5 opacity-60"
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={`${lesson.title}, жабық`}>
        {body}
      </View>
    );
  }

  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      onPress={onPress}
      style={SHADOW_SOFT}
      className="flex-row items-center gap-3.5 rounded-lg bg-white p-3.5 active:bg-surface-tint">
      {body}
    </PressableScale>
  );
}
