import { Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOW_SOFT } from '@/lib/onboarding-theme';

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  variant?: 'default' | 'compact';
}

/** White stat tile: uppercase label, big Nunito value, icon tile. */
export function StatCard({
  label,
  value,
  unit,
  icon,
  style,
  variant = 'default',
}: StatCardProps) {
  if (variant === 'compact') {
    return (
      <View
        style={[SHADOW_SOFT, style]}
        className="min-h-[116px] flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-2.5 py-2">
        <View className="h-8 w-8 items-center justify-center rounded-md bg-blue-50">
          <Ionicons name={icon} size={18} color={COLORS.blue600} />
        </View>
        <View className="flex-row items-baseline justify-center">
          <Text className="font-display text-2xl leading-7 text-ink-900">{value}</Text>
          {unit ? (
            <Text className="ml-1 font-bodyBold text-[13px] text-ink-500">{unit}</Text>
          ) : null}
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.8}
          numberOfLines={1}
          className="w-full text-center font-bodyBold text-[11px] uppercase tracking-[1px] text-ink-500">
          {label}
        </Text>
      </View>
    );
  }

  return (
    <View style={[SHADOW_SOFT, style]} className="flex-1 gap-1.5 rounded-lg bg-white p-[18px]">
      {/* Fixed-height row so the icon tile sits in the same spot on every card,
          however long the label is, and the values below stay aligned. */}
      <View className="h-[38px] flex-row items-center gap-2">
        <Text
          numberOfLines={2}
          className="flex-1 font-bodyBold text-[11px] leading-[14px] uppercase tracking-[1.5px] text-ink-500">
          {label}
        </Text>
        <View className="h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-blue-50">
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
