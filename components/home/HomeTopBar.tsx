import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS } from '@/lib/onboarding-theme';

interface HomeTopBarProps {
  name: string;
  avatarUrl?: string;
  /** e.g. "12 күн қатарынан 🔥". */
  subtitle: string;
  onOpenNotifications: () => void;
}

/** Greeting header (not sticky): avatar with ring, greeting, bell button. */
export function HomeTopBar({ name, avatarUrl, subtitle, onOpenNotifications }: HomeTopBarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || 'О';

  return (
    <View className="flex-row items-center gap-3.5">
      <View className="h-12 w-12 items-center justify-center rounded-pill border-2 border-blue-200 p-0.5">
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} className="h-full w-full rounded-pill" />
        ) : (
          <View className="h-full w-full items-center justify-center rounded-pill bg-blue-50">
            <Text className="font-display text-base text-blue-600">{initial}</Text>
          </View>
        )}
      </View>

      <View className="flex-1">
        <Text className="font-display text-xl text-ink-900" numberOfLines={1}>
          Сәлем, {name}!
        </Text>
        <Text className="font-body text-[13px] text-ink-500" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Хабарламалар"
        onPress={onOpenNotifications}
        className="h-11 w-11 items-center justify-center rounded-md bg-white">
        <Ionicons name="notifications-outline" size={22} color={COLORS.ink700} />
      </PressableScale>
    </View>
  );
}
