import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Lesson, Unit } from '@/lib/learn';
import { type BreadcrumbItem } from '../Breadcrumb';
import { LearnEmptyState } from '../LearnEmptyState';
import { LessonCard } from '../LessonCard';
import { ScreenHeader } from '../ScreenHeader';
import { SkeletonList } from '../SkeletonCard';
import { UnitSummaryCard } from '../UnitSummaryCard';

interface LessonsScreenProps {
  unit: Unit;
  lessons: Lesson[];
  isLoading: boolean;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onOpenLesson: (lessonId: string) => void;
}

/** Unit summary + status-driven lesson list. See docs/subject_lesson_pages.md §1. */
export function LessonsScreen({
  unit,
  lessons,
  isLoading,
  breadcrumb,
  onBack,
  onCrumb,
  onOpenLesson,
}: LessonsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader title={unit.title} onBack={onBack} breadcrumb={breadcrumb} onCrumb={onCrumb} />
      </View>

      {isLoading ? (
        <View className="p-4">
          <SkeletonList count={5} />
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-2">
              <UnitSummaryCard unit={unit} />
            </View>
          }
          ListEmptyComponent={
            <LearnEmptyState
              icon="reader-outline"
              title="Сабақтар әзірге жоқ"
              description="Бұл бөлім бойынша сабақтар жақында қосылады."
            />
          }
          renderItem={({ item }) => (
            <LessonCard lesson={item} onPress={() => onOpenLesson(item.id)} />
          )}
        />
      )}
    </View>
  );
}
