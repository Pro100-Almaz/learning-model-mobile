import { Text } from 'react-native';

import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

/** Pill selector / quick-pick chip (design §4). */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-pill border px-4 py-2.5 ${
        selected ? 'border-blue-500 bg-blue-500' : 'border-line-200 bg-white'
      }`}>
      <Text
        className={`font-bodyBold text-sm ${
          selected ? 'text-white' : 'text-ink-700'
        }`}>
        {label}
      </Text>
    </PressableScale>
  );
}
