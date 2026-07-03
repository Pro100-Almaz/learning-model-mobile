import { ScrollView, Text, View } from 'react-native';

import { Chip } from '../Chip';
import { StepHeader } from '../StepHeader';
import { ScoreSlider } from '../ScoreSlider';

const QUICK_PICKS = [90, 105, 120, 135];

interface TargetStepProps {
  value: number;
  max: number;
  /** Lower bound from the expected-scores step (soft-clamp floor). */
  floor: number;
  onChange: (value: number) => void;
}

/** Step: pick a target total score (optional; soft-clamped ≥ expected total). */
export function TargetStep({ value, max, floor, onChange }: TargetStepProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8 mt-9"
      keyboardShouldPersistTaps="handled">
      <StepHeader
        eyebrow="Мақсат балл"
        title="Мақсатың қандай?"
        subtitle="Қай балға ұмтыласың? Мұны кейін өткізіп жіберуге де болады."
      />

      <View className="items-center py-2 mt-10">
        <Text className="font-display text-[64px] leading-[90px] text-blue-500">
          {value}
        </Text>
        <Text className="mt-1 font-body text-sm text-ink-300">{max} баллдан</Text>
      </View>

      <View className="mt-2">
        <ScoreSlider value={value} min={0} max={max} onChange={onChange} />
      </View>

      <View className="mt-10 flex-row flex-wrap justify-center gap-2.5">
        {QUICK_PICKS.map((pick) => (
          <Chip
            key={pick}
            label={String(pick)}
            selected={value === pick}
            onPress={() => onChange(pick)}
          />
        ))}
      </View>

      {floor > 0 ? (
        <Text className="mt-5 text-center font-body text-xs text-ink-300">
          Күтілетін балдарыңның қосындысы: {floor}
        </Text>
      ) : null}
    </ScrollView>
  );
}
