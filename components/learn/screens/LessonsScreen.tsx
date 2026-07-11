import { FlatList, View } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Lesson, Module } from "@/lib/learn";
import { type BreadcrumbItem } from "../Breadcrumb";
import { LearnEmptyState } from "../LearnEmptyState";
import { LessonCard } from "../LessonCard";
import { MockTestCTA } from "../MockTestCTA";
import { ScreenHeader } from "../ScreenHeader";
import { SkeletonList } from "../SkeletonCard";
import { ModuleSummaryCard } from "../ModuleSummaryCard";

interface LessonsScreenProps {
  module: Module;
  lessons: Lesson[];
  isLoading: boolean;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onOpenLesson: (lessonId: string) => void;
  onTest: () => void;
}

/** Module summary + status-driven lesson list. See docs/subject_lesson_pages.md §1. */
export function LessonsScreen({
  module,
  lessons,
  isLoading,
  breadcrumb,
  onBack,
  onCrumb,
  onOpenLesson,
  onTest,
}: LessonsScreenProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader
          title={module.title}
          onBack={onBack}
          breadcrumb={breadcrumb}
          onCrumb={onCrumb}
        />
      </View>

      {isLoading ? (
        <View className="p-4">
          <SkeletonList count={5} />
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{
            padding: 16,
            gap: 14,
            paddingBottom: tabBarHeight + 84,
          }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="mb-2">
              <ModuleSummaryCard module={module} />
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

      <MockTestCTA onPress={onTest} />
    </View>
  );
}
