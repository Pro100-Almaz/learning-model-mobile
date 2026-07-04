import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ErrorState from '@/components/ErrorState';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { type HomeViewModel } from '@/lib/home';
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
  /** Active lesson / hero start. */
  onStartLesson: (id: string) => void;
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

  const contentStyle = {
    paddingTop: insets.top + 8,
    paddingBottom: insets.bottom + 20,
  };

  if (isError && !vm) {
    return (
      <View className="flex-1 justify-center bg-surface-app px-4" style={contentStyle}>
        <ErrorState
          title="Бір нәрсе дұрыс болмады"
          body="Деректерді жүктеу мүмкін болмады. Қайта көріп көр."
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
  const streakSubtitle = `${stats.streakDays} күн қатарынан 🔥`;

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
        <StatCard label="Streak" value={String(stats.streakDays)} unit="күн" icon="flame" />
        <StatCard
          label="ҰБТ-ге дейін"
          value={String(stats.daysUntilExam)}
          unit="күн"
          icon="calendar-outline"
        />
      </View>

      <SectionHeader
        title="Бүгінгі жоспар"
        trailing={<Badge>{`${todayLessons.length} сабақ`}</Badge>}
      />

      <View style={SHADOW_SOFT} className="gap-1 rounded-lg bg-white p-2">
        {todayLessons.map((lesson) => (
          <LessonRow key={lesson.id} lesson={lesson} onPress={onStartLesson} />
        ))}
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
