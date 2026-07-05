import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';
import type { LessonDetail } from '@/lib/learn';

interface ConceptListProps {
  concepts: LessonDetail['concepts'];
}

/** Key-concepts list — icon tile + title + supporting text per row. */
export function ConceptList({ concepts }: ConceptListProps) {
  return (
    <View style={SHADOW_SOFT} className="gap-1 rounded-lg bg-white p-2">
      {concepts.map((c, i) => (
        <View key={`${c.title}-${i}`} className="flex-row items-start gap-3.5 rounded-md p-3">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-blue-50">
            <Ionicons name={c.icon} size={20} color={COLORS.blue600} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-bodyBold text-[15px] text-ink-900">{c.title}</Text>
            <Text className="text-[13px] leading-5 text-ink-500">{c.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
