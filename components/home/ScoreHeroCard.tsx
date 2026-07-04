import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { SHADOW_CTA } from '@/lib/onboarding-theme';
import { remainingToTarget, type DashboardStats } from '@/lib/home';
import { ScoreRing } from './ScoreRing';

interface ScoreHeroCardProps {
  stats: DashboardStats;
  reduceMotion?: boolean;
  onOpenScores: () => void;
}

/**
 * Brand-gradient hero: animated score ring + "N балл қалды" copy and a reward
 * button that opens the Scores tab. The 135° brand gradient is approximated with
 * layered brand-blue tones (no native gradient dependency), matching WelcomeStep.
 */
export function ScoreHeroCard({ stats, reduceMotion, onOpenScores }: ScoreHeroCardProps) {
  const remaining = remainingToTarget(stats);

  return (
    <View
      style={SHADOW_CTA}
      className="flex-row items-center gap-[18px] overflow-hidden rounded-lg bg-blue-500 p-5">
      {/* depth accents (gradient approximation) */}
      <View className="absolute -right-10 -top-12 h-44 w-44 rounded-pill bg-blue-400/50" />
      <View className="absolute -bottom-14 -left-8 h-40 w-40 rounded-pill bg-blue-600/40" />

      <ScoreRing
        value={stats.expectedScore}
        max={stats.maxScore}
        reduceMotion={reduceMotion}
      />

      <View className="flex-1">
        <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-white/80">
          Күтілетін балл
        </Text>
        <Text
          className="mb-1.5 mt-1 font-display text-xl leading-tight text-white"
          numberOfLines={2}
          adjustsFontSizeToFit>
          {remaining > 0 ? `Мақсатқа ${remaining} балл қалды` : 'Мақсатқа жеттің! 🎉'}
        </Text>

        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Балдарды көру"
          onPress={onOpenScores}
          style={SHADOW_CTA}
          className="h-10 flex-row items-center gap-2 self-start rounded-md bg-amber-500 px-4">
          <Ionicons name="trophy" size={16} color="#5A3A00" />
          <Text className="font-bodyBold text-sm text-[#5A3A00]">Балдарды көру</Text>
        </PressableScale>
      </View>
    </View>
  );
}
