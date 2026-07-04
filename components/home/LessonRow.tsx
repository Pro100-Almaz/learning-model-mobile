import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS } from '@/lib/onboarding-theme';
import { lessonSubtitle, type LessonItem } from '@/lib/home';
import { Badge } from './Badge';

interface LessonRowProps {
  lesson: LessonItem;
  onPress: (id: string) => void;
}

/**
 * A lesson list row: leading icon tile, title + "subject · N сұрақ · N мин",
 * trailing state indicator. Active rows show a "Бастау" badge; done rows a check;
 * todo rows a chevron. Presses scale via PressableScale (design §3).
 */
export function LessonRow({ lesson, onPress }: LessonRowProps) {
  const isDone = lesson.state === 'done';

  return (
    <PressableScale
      activeScale={0.99}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      onPress={() => onPress(lesson.id)}
      className="flex-row items-center gap-3.5 rounded-md p-3.5 active:bg-surface-tint">
      <View className="h-11 w-11 items-center justify-center rounded-md bg-blue-50">
        <Ionicons name={lesson.icon} size={22} color={COLORS.blue600} />
      </View>

      <View className="flex-1">
        <Text
          className={`font-bodyBold text-base ${isDone ? 'text-ink-500' : 'text-ink-900'}`}
          numberOfLines={1}>
          {lesson.title}
        </Text>
        <Text className="text-[13px] text-ink-500" numberOfLines={1}>
          {lessonSubtitle(lesson)}
        </Text>
      </View>

      {lesson.state === 'active' ? (
        <Badge tone="solid">Бастау</Badge>
      ) : isDone ? (
        <View className="h-7 w-7 items-center justify-center rounded-pill bg-teal-500">
          <Ionicons name="checkmark" size={16} color={COLORS.white} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={COLORS.ink300} />
      )}
    </PressableScale>
  );
}
