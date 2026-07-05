import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ClassLevel, Subject } from '@/lib/learn';
import { type BreadcrumbItem } from '../Breadcrumb';
import { ClassCard } from '../ClassCard';
import { LearnEmptyState } from '../LearnEmptyState';
import { ScreenHeader } from '../ScreenHeader';
import { SkeletonList } from '../SkeletonCard';

interface ClassesScreenProps {
  subject: Subject;
  classes: ClassLevel[];
  isLoading: boolean;
  breadcrumb: BreadcrumbItem[];
  onBack: () => void;
  onCrumb: (pop: number) => void;
  onOpenClass: (classId: string) => void;
}

/** List of class levels for a subject. See docs/subject_lesson_pages.md §1. */
export function ClassesScreen({
  subject,
  classes,
  isLoading,
  breadcrumb,
  onBack,
  onCrumb,
  onOpenClass,
}: ClassesScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader
          title={subject.title}
          onBack={onBack}
          breadcrumb={breadcrumb}
          onCrumb={onCrumb}
        />
      </View>

      {isLoading ? (
        <View className="p-4">
          <SkeletonList count={4} />
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <LearnEmptyState
              icon="book-outline"
              title="Сыныптар әзірге жоқ"
              description="Бұл пән бойынша сабақтар жақында қосылады."
            />
          }
          renderItem={({ item }) => (
            <ClassCard cls={item} onPress={() => onOpenClass(item.id)} />
          )}
        />
      )}
    </View>
  );
}
