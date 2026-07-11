import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getTagIcon } from '@/lib/tag-icons';
import type { Tag } from '@/lib/learn';
import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

interface TagListProps {
  tags: Tag[];
}

/** Key-concepts list — icon tile (by slug) + name + description per tag. */
export function TagList({ tags }: TagListProps) {
  return (
    <View style={SHADOW_SOFT} className="gap-1 rounded-lg bg-white p-2">
      {tags.map((tag, i) => (
        <View key={`${tag.slug}-${i}`} className="flex-row items-start gap-3.5 rounded-md p-3">
          <View className="h-10 w-10 items-center justify-center rounded-md bg-blue-50">
            <Ionicons name={getTagIcon(tag.slug)} size={20} color={COLORS.blue600} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-bodyBold text-[15px] text-ink-900">{tag.name}</Text>
            <Text className="text-[13px] leading-5 text-ink-500">{tag.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
