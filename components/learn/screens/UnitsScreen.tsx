import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ClassLevel, Unit } from '@/lib/learn';
import { type BreadcrumbItem } from '../Breadcrumb';
import { ClassSummaryCard } from '../ClassSummaryCard';
import { LearnEmptyState } from '../LearnEmptyState';
import { ScreenHeader } from '../ScreenHeader';
import { SkeletonList } from '../SkeletonCard';
import { UnitCard } from '../UnitCard';

interface UnitsScreenProps {
  cls: ClassLevel;
  title: string;
  units: Unit[];
  isLoading: boolean;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onOpenUnit: (unitId: string) => void;
}

/** Class-progress summary + numbered unit list. See docs/subject_lesson_pages.md §1. */
export function UnitsScreen({
  cls,
  title,
  units,
  isLoading,
  breadcrumb,
  onBack,
  onCrumb,
  onOpenUnit,
}: UnitsScreenProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader title={title} onBack={onBack} breadcrumb={breadcrumb} onCrumb={onCrumb} />
      </View>

      {isLoading ? (
        <View className="p-4">
          <SkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={units}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-2">
              <ClassSummaryCard cls={cls} reduceMotion={reduceMotion} />
            </View>
          }
          ListEmptyComponent={
            <LearnEmptyState
              icon="layers-outline"
              title="Бөлімдер әзірге жоқ"
              description="Бұл сынып бойынша материалдар жақында қосылады."
            />
          }
          renderItem={({ item, index }) => (
            <UnitCard unit={item} index={index} onPress={() => onOpenUnit(item.id)} />
          )}
        />
      )}
    </View>
  );
}
