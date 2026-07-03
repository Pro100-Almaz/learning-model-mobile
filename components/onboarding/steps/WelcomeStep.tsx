import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SHADOW_CTA } from '@/lib/onboarding-theme';

/**
 * Intro face. The brand hero gradient is approximated with layered brand-blue
 * tones (no native gradient dependency) per the JS-only dependency choice.
 */
export function WelcomeStep() {
  return (
    <View className="flex-1 justify-center">
      {/* Hero */}
      <View
        style={SHADOW_CTA}
        className="mb-8 h-56 justify-end overflow-hidden rounded-xl bg-blue-500 p-6">
        {/* depth accents */}
        <View className="absolute -right-8 -top-10 h-40 w-40 rounded-pill bg-blue-400/60" />
        <Text className="ml-24 mb-14 font-display text-[32px] leading-tight text-ink-900">
          QADAM
        </Text>
        <View className="absolute -bottom-12 -left-6 h-36 w-36 rounded-pill bg-blue-600/50" />
      </View>

      <View className="h-12 w-12 items-center justify-center rounded-md bg-white/20">
        <Ionicons name="rocket" size={26} color={COLORS.blue400} />
      </View>
      <Text className="mb-3 font-display text-[32px] leading-tight text-ink-900">
        ҰБТ-ға дайындалуды бастайық
      </Text>
      <Text className="font-body text-base leading-6 text-ink-500">
        Бірнеше сұраққа жауап бер — саған лайықталған оқу жоспарын дайындаймыз.
      </Text>
    </View>
  );
}
