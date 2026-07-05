import { View } from 'react-native';

type Tone = 'blue' | 'teal' | 'amber' | 'solid' | 'success';

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  /** Track height in px. */
  height?: number;
}

const FILL: Record<Tone, string> = {
  blue: 'bg-blue-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
  solid: 'bg-ink-900',
  success: 'bg-success-500',
};

/** Linear progress track + rounded fill. See docs/subject_lesson_pages.md §5. */
export function ProgressBar({ value, max = 100, tone = 'blue', height = 8 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <View
      className="overflow-hidden rounded-pill bg-surface-field"
      style={{ height }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}>
      <View className={`h-full rounded-pill ${FILL[tone]}`} style={{ width: `${pct}%` }} />
    </View>
  );
}
