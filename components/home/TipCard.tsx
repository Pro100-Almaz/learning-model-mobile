import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TipCardProps {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

/** Tinted tip card (no shadow) with an amber icon tile. */
export function TipCard({ title, body, icon = 'bulb' }: TipCardProps) {
  return (
    <View className="flex-row items-center gap-3.5 rounded-lg bg-surface-tint p-5">
      <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-md bg-amber-500">
        {/* warm accent to approximate the amber gradient */}
        <View
          className="absolute -right-3 -top-3 h-8 w-8 rounded-pill opacity-70"
          style={{ backgroundColor: '#FF7A59' }}
        />
        <Ionicons name={icon} size={22} color="#5A3A00" />
      </View>
      <View className="flex-1">
        <Text className="font-bodyBold text-base text-ink-900">{title}</Text>
        <Text className="mt-0.5 font-body text-[13px] leading-5 text-ink-500">{body}</Text>
      </View>
    </View>
  );
}
