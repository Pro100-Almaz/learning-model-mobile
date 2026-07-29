import { Pressable, Text, View } from 'react-native';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Pill segmented control. Used for the Friends List / Requests switch and,
 * inside Requests, for the Received / Sent switch.
 */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <View className="flex-row rounded-pill bg-surface-field p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={`h-10 flex-1 items-center justify-center rounded-pill ${
              active ? 'bg-white' : ''
            }`}>
            <Text
              className={`font-bodyBold text-sm ${active ? 'text-blue-600' : 'text-ink-500'}`}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
