import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  trailing?: ReactNode;
}

/** Row with a display title and an optional trailing node (e.g. a Badge). */
export function SectionHeader({ title, trailing }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-display text-xl text-ink-900">{title}</Text>
      {trailing}
    </View>
  );
}
