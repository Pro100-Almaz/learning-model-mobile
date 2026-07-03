import { ScrollView, Text, View } from 'react-native';

import SearchSelect, { type SearchSelectOption } from '@/components/SearchSelect';
import { StepHeader } from '../StepHeader';

interface ProfileStepProps {
  universityOptions: SearchSelectOption<number>[];
  specialtyOptions: SearchSelectOption<number>[];
  targetUniversity: number | null;
  targetSpecialty: number | null;
  onUniversityChange: (value: number | null) => void;
  onSpecialtyChange: (value: number | null) => void;
  selectedThreshold: number | null;
}

/** Step: choose target university + specialty. */
export function ProfileStep({
  universityOptions,
  specialtyOptions,
  targetUniversity,
  targetSpecialty,
  onUniversityChange,
  onSpecialtyChange,
  selectedThreshold,
}: ProfileStepProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled">
      <StepHeader
        eyebrow="Мақсат"
        title="Қайда оқығың келеді?"
        subtitle="Мақсатты университет пен мамандықты таңда."
      />

      <View className="gap-4">
        <View>
          <Text className="mb-1.5 font-bodyBold text-sm text-ink-900">Университет</Text>
          <SearchSelect
            value={targetUniversity}
            onChange={onUniversityChange}
            options={universityOptions}
            icon="school-outline"
            placeholder="Университетті таңда"
            searchTitle="Университет"
            emptyLabel="Университет табылмады"
          />
        </View>

        <View>
          <Text className="mb-1.5 font-bodyBold text-sm text-ink-900">Мамандық</Text>
          <SearchSelect
            value={targetSpecialty}
            onChange={onSpecialtyChange}
            options={specialtyOptions}
            icon="ribbon-outline"
            placeholder="Мамандықты таңда"
            searchTitle="Мамандық"
            emptyLabel={
              targetUniversity == null
                ? 'Алдымен университетті таңда'
                : 'Мамандық табылмады'
            }
            disabled={targetUniversity == null}
          />
        </View>

        {selectedThreshold != null ? (
          <View className="flex-row items-center gap-2 rounded-md bg-surface-tint px-4 py-3">
            <Text className="font-body text-sm text-ink-500">Өткен жылғы шекті балл:</Text>
            <Text className="font-bodyBold text-sm text-blue-600">
              {selectedThreshold}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
