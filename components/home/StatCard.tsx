import { Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

/** White stat tile: uppercase label, big Nunito value, icon tile. */
export function StatCard({ label, value, unit, icon, style }: StatCardProps) {
  return (
    <View style={[SHADOW_SOFT, style]} className="flex-1 gap-1.5 rounded-lg bg-white p-[18px]">
      <View className="flex-row items-start justify-between">
        <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-ink-500">
          {label}
        </Text>
        <View className="h-[38px] w-[38px] items-center justify-center rounded-md bg-blue-50">
          <Ionicons name={icon} size={20} color={COLORS.blue600} />
        </View>
      </View>
      <View className="flex-row items-baseline">
        <Text className="font-display text-[30px] leading-[35px] text-ink-900">{value}</Text>
        {unit ? (
          <Text className="ml-1 font-bodyBold text-base text-ink-500">{unit}</Text>
        ) : null}
      </View>
    </View>
  );
}
