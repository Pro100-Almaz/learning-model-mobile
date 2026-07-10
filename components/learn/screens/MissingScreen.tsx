import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LearnEmptyState } from '../LearnEmptyState';
import { ScreenHeader } from '../ScreenHeader';

interface MissingScreenProps {
  title?: string;
  onBack: () => void;
}

/** Fallback for an unresolved id (e.g. a stale deep link). */
export function MissingScreen({ title = 'Табылмады', onBack }: MissingScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <ScreenHeader title={title} onBack={onBack} />
      </View>
      <View className="p-4">
        <LearnEmptyState
          icon="help-circle-outline"
          title="Мазмұн табылмады"
          description="Сілтеме ескірген болуы мүмкін. Артқа қайтып, қайта таңдап көр."
        />
      </View>
    </View>
  );
}
