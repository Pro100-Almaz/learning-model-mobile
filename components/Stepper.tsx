import { View, Text } from 'react-native';

interface StepperProps {
  step: number;
  total: number;
}

/** Simple "step N of total" progress indicator with a segmented bar. */
export default function Stepper({ step, total }: StepperProps) {
  const segments = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <View className="gap-2">
      <Text className="text-xs font-medium text-gray-500">
        Step {step} of {total}
      </Text>
      <View className="flex-row gap-1.5">
        {segments.map((n) => (
          <View
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= step ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
