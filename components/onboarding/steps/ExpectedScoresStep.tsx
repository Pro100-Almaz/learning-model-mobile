import { ScrollView, Text, View } from 'react-native';

import EmptyState from '@/components/EmptyState';
import { subjectMax } from '@/lib/ent';
import { StepHeader } from '../StepHeader';
import { ScoreSlider } from '../ScoreSlider';

interface ExpectedScoresStepProps {
  /** Subject slugs — the stable identity used for scoring/persistence. */
  subjects: string[];
  /** slug → display name (from the /subjects/all/ catalog). */
  subjectNames: Record<string, string>;
  /** Current score per subject (always a number once seeded). */
  expectedMap: Record<string, number>;
  onScore: (subject: string, value: number) => void;
  currentTotal: number;
  maxTotal: number;
}

/** Step: per-subject expected scores via sliders, with a running total. */
export function ExpectedScoresStep({
  subjects,
  subjectNames,
  expectedMap,
  onScore,
  currentTotal,
  maxTotal,
}: ExpectedScoresStepProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled">
      <StepHeader
        eyebrow="Баллдар"
        title="Күтілетін баллдарың"
        subtitle="Әр пәннен қанша балл күтесің? Кейін өзгерте аласың."
      />

      {subjects.length === 0 ? (
        <EmptyState
          title="Пәндер қолжетімсіз"
          body="Пәндер тізімін жүктеу мүмкін болмады. Кейінірек қайталап көр."
        />
      ) : (
        <>
          {/* Running total */}
          <View className="mb-6 flex-row items-end justify-between rounded-lg bg-surface-tint px-5 py-4">
            <Text className="font-bodyBold text-sm text-ink-500">Жалпы балл</Text>
            <Text className="font-display text-[40px] leading-[60px] text-ink-900">
              {currentTotal}
              <Text className="font-body text-lg text-ink-500"> / {maxTotal}</Text>
            </Text>
          </View>

          <View className="gap-5">
            {subjects.map((subject) => {
              const name = subjectNames[subject] ?? subject;
              const max = subjectMax(name);
              const value = expectedMap[subject] ?? 0;
              return (
                <View key={subject}>
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-3 font-bodyBold text-sm text-ink-900">
                      {name}
                    </Text>
                    <Text className="font-display text-[19px] leading-[30px] text-blue-500">
                      {value}
                      <Text className="font-body text-xs text-ink-300"> /{max}</Text>
                    </Text>
                  </View>
                  <ScoreSlider
                    value={value}
                    max={max}
                    onChange={(v) => onScore(subject, v)}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}
