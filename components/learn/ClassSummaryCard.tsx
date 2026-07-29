import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { ClassLevel } from '@/lib/learn';
import { ProgressRing } from './ProgressRing';

interface ClassSummaryCardProps {
  cls: ClassLevel;
  reduceMotion?: boolean;
}

/** Modules-screen header card: progress ring + module / lesson counts. */
export function ClassSummaryCard({ cls, reduceMotion }: ClassSummaryCardProps) {
  const { t } = useTranslation();
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
        <Text className="font-bodyBold text-base text-ink-900">{t('learn.classProgress')}</Text>
        <Text className="text-[13px] text-ink-500">
          {t('learn.moduleLessonCount', { modules: cls.modules, lessons: cls.lessons })}
        </Text>
      </View>
    </View>
  );
}
