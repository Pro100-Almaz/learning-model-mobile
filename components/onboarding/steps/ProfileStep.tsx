import { ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
      keyboardShouldPersistTaps="handled">
      <StepHeader
        eyebrow={t('onboarding.profileEyebrow')}
        title={t('onboarding.profileTitle')}
        subtitle={t('onboarding.profileSubtitle')}
      />

      <View className="gap-4">
        <View>
          <Text className="mb-1.5 font-bodyBold text-sm text-ink-900">{t('onboarding.university')}</Text>
          <SearchSelect
            value={targetUniversity}
            onChange={onUniversityChange}
            options={universityOptions}
            icon="school-outline"
            placeholder={t('onboarding.selectUniversity')}
            searchTitle={t('onboarding.university')}
            emptyLabel={t('onboarding.universityNotFound')}
          />
        </View>

        <View>
          <Text className="mb-1.5 font-bodyBold text-sm text-ink-900">{t('onboarding.specialty')}</Text>
          <SearchSelect
            value={targetSpecialty}
            onChange={onSpecialtyChange}
            options={specialtyOptions}
            icon="ribbon-outline"
            placeholder={t('onboarding.selectSpecialty')}
            searchTitle={t('onboarding.specialty')}
            emptyLabel={
              targetUniversity == null
                ? t('onboarding.selectUniversityFirst')
                : t('onboarding.specialtyNotFound')
            }
            disabled={targetUniversity == null}
          />
        </View>

        {selectedThreshold != null ? (
          <View className="flex-row items-center gap-2 rounded-md bg-surface-tint px-4 py-3">
            <Text className="font-body text-sm text-ink-500">{t('onboarding.lastYearThreshold')}</Text>
            <Text className="font-bodyBold text-sm text-blue-600">
              {selectedThreshold}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
