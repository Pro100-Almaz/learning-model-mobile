import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { LearnEmptyState } from '../LearnEmptyState';
import { ScreenHeader } from '../ScreenHeader';

interface MissingScreenProps {
  title?: string;
  onBack: () => void;
}

/** Fallback for an unresolved id (e.g. a stale deep link). */
export function MissingScreen({ title, onBack }: MissingScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader title={title ?? t('learn.missingTitle')} onBack={onBack} />
      </View>
      <View className="p-4">
        <LearnEmptyState
          icon="help-circle-outline"
          title={t('learn.missingContentTitle')}
          description={t('learn.missingContentBody')}
        />
      </View>
    </View>
  );
}
