import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import ErrorState from '@/components/ErrorState';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { type HomeViewModel, type LessonItem } from '@/lib/home';
import { SHADOW_SOFT } from '@/lib/onboarding-theme';
import { Badge } from './Badge';
import { HomeTopBar } from './HomeTopBar';
import { LessonRow } from './LessonRow';
import { ScoreHeroCard } from './ScoreHeroCard';
import { SectionHeader } from './SectionHeader';
import { StatCard } from './StatCard';
import { TipCard } from './TipCard';

interface HomeScreenProps {
  vm?: HomeViewModel;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onStartLesson: (lesson: LessonItem) => void;
  /** Hero "Балдарды көру". */
  onOpenScores: () => void;
  /** Bell. */
  onOpenNotifications: () => void;
}

/** The Home dashboard. Renders from a view-model; owns only scroll + layout. */
export function HomeScreen({
  vm,
  isLoading,
  isError,
  onRetry,
  onStartLesson,
  onOpenScores,
  onOpenNotifications,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { t } = useTranslation();

  const contentStyle = {
    paddingTop: insets.top + 8,
    paddingBottom: insets.bottom + 20,
  };

  if (isError && !vm) {
    return (
      <View className="flex-1 justify-center bg-surface-app px-4" style={contentStyle}>
        <ErrorState
          title={t('home.errorTitle')}
          body={t('home.errorBody')}
          onRetry={onRetry}
        />
      </View>
    );
  }

  if (isLoading || !vm) {
    return (
      <ScrollView
        className="flex-1 bg-surface-app"
        contentContainerClassName="px-4 gap-4"
        contentContainerStyle={contentStyle}>
        <HomeSkeleton />
      </ScrollView>
    );
  }

  const { user, stats, todayLessons, tip } = vm;
  const streakSubtitle = t('home.streak', { count: stats.streakDays });

  return (
    <ScrollView
      className="flex-1 bg-surface-app"
      contentContainerClassName="px-4 gap-4"
      contentContainerStyle={contentStyle}
      showsVerticalScrollIndicator={false}>
      <HomeTopBar
        name={user.name}
        avatarUrl={user.avatarUrl}
        subtitle={streakSubtitle}
        onOpenNotifications={onOpenNotifications}
      />

      <ScoreHeroCard stats={stats} reduceMotion={reduceMotion} onOpenScores={onOpenScores} />

      <View className="flex-row gap-3">
        <StatCard
          label={t('home.statStreak')}
          value={String(stats.streakDays)}
          unit={t('home.unitDays')}
          icon="flame"
          />
        <StatCard
          label={t('home.statUntilExam')}
          value={String(stats.daysUntilExam)}
          unit={t('home.unitDays')}
          icon="calendar-outline"
        />
      </View>

      <SectionHeader
        title={t('home.todayPlan')}
        trailing={
          todayLessons.length > 0 ? (
            <Badge>{t('home.lessonsCount', { count: todayLessons.length })}</Badge>
          ) : undefined
        }
      />

      <View style={SHADOW_SOFT} className="gap-1 rounded-lg bg-white p-2">
        {todayLessons.length > 0 ? (
          todayLessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} onPress={onStartLesson} />
          ))
        ) : (
          <Text className="p-4 text-center text-[14px] leading-6 text-ink-500">
            {t('home.todayEmpty')}
          </Text>
        )}
      </View>

      {tip ? <TipCard title={tip.title} body={tip.body} /> : null}
    </ScrollView>
  );
}

/** Lightweight placeholder shown while the view-model loads. */
function HomeSkeleton() {
  return (
    <>
      <View className="flex-row items-center gap-3.5">
        <View className="h-12 w-12 rounded-pill bg-line-200" />
        <View className="flex-1 gap-2">
          <View className="h-4 w-2/3 rounded bg-line-200" />
          <View className="h-3 w-1/2 rounded bg-line-200" />
        </View>
      </View>
      <View className="h-[172px] rounded-lg bg-line-200" />
      <View className="flex-row gap-3">
        <View className="h-[104px] flex-1 rounded-lg bg-line-200" />
        <View className="h-[104px] flex-1 rounded-lg bg-line-200" />
      </View>
      <View className="h-6 w-1/3 rounded bg-line-200" />
      <View className="h-[220px] rounded-lg bg-line-200" />
    </>
  );
}
