import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Subject } from '@/lib/learn';
import { ScreenHeader } from '../ScreenHeader';
import { SkeletonList } from '../SkeletonCard';
import { SubjectCard } from '../SubjectCard';

interface SubjectsScreenProps {
  subjects: Subject[];
  isLoading: boolean;
  onOpenSubject: (subjectId: string) => void;
}

/** Sentinel appended to an odd list so the lone last tile keeps its column width. */
type Row = Subject | { spacer: true };
const isSpacer = (r: Row): r is { spacer: true } => 'spacer' in r;

/** Top-level 2-column grid of subjects. See docs/subject_lesson_pages.md §1. */
export function SubjectsScreen({ subjects, isLoading, onOpenSubject }: SubjectsScreenProps) {
  const insets = useSafeAreaInsets();

  // Pad to an even count so the last row's single tile doesn't stretch full-width.
  const data: Row[] = subjects.length % 2 === 1 ? [...subjects, { spacer: true }] : subjects;

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader title="Пәндер" onSearch={() => {}} />
      </View>

      {isLoading ? (
        <View className="p-4">
          <SkeletonList count={4} variant="tile" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, i) => (isSpacer(item) ? `spacer-${i}` : item.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            isSpacer(item) ? (
              <View className="flex-1" />
            ) : (
              <SubjectCard subject={item} onPress={() => onOpenSubject(item.id)} />
            )
          }
        />
      )}
    </View>
  );
}
