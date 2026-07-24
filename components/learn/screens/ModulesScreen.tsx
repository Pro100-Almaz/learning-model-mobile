import { FlatList, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ClassLevel, Module } from '@/lib/learn';
import { type BreadcrumbItem } from '../Breadcrumb';
import { ClassSummaryCard } from '../ClassSummaryCard';
import { LearnEmptyState } from '../LearnEmptyState';
import { MockTestCTA } from '../MockTestCTA';
import { ScreenHeader } from '../ScreenHeader';
import { SkeletonList } from '../SkeletonCard';
import { ModuleCard } from '../ModuleCard';

interface ModulesScreenProps {
  cls: ClassLevel;
  title: string;
  modules: Module[];
  isLoading: boolean;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onOpenModule: (moduleId: string) => void;
  onTest: () => void;
}

/** Class-progress summary + numbered module list. See docs/subject_lesson_pages.md §1. */
export function ModulesScreen({
  cls,
  title,
  modules,
  isLoading,
  breadcrumb,
  onBack,
  onCrumb,
  onOpenModule,
  onTest,
}: ModulesScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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
          data={modules}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: tabBarHeight + 84 }}
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
            <ModuleCard module={item} index={index} onPress={() => onOpenModule(item.id)} />
          )}
        />
      )}

      {/* <MockTestCTA onPress={onTest} /> */}
    </View>
  );
}
