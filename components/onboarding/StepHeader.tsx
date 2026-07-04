import { Text, View } from 'react-native';

interface StepHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/** Eyebrow + H1 + sub block shared by every step (design §4). */
export function StepHeader({ eyebrow, title, subtitle }: StepHeaderProps) {
  return (
    <View className="mb-6">
      <Text className="mb-2.5 font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-500">
        {eyebrow}
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={2}
        className="mb-3 font-display text-[30px] leading-tight text-ink-900">
        {title}
      </Text>
      {subtitle ? (
        <Text className="font-body text-base leading-6 text-ink-500">{subtitle}</Text>
      ) : null}
    </View>
  );
}
