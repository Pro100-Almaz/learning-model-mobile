import { View } from 'react-native';

import { SHADOW_SOFT } from '@/lib/onboarding-theme';

interface SkeletonCardProps {
  /** Grid tile aspect (Subjects) vs full-width row. */
  variant?: 'tile' | 'row';
}

/** Loading placeholder matching a feature card's footprint. */
export function SkeletonCard({ variant = 'row' }: SkeletonCardProps) {
  if (variant === 'tile') {
    return (
      <View style={SHADOW_SOFT} className="flex-1 gap-3 rounded-lg bg-white p-4">
        <View className="h-12 w-12 rounded-md bg-line-200" />
        <View className="h-4 w-3/4 rounded bg-line-200" />
        <View className="h-3 w-1/2 rounded bg-line-200" />
        <View className="mt-1 h-2 w-full rounded-pill bg-line-200" />
      </View>
    );
  }

  return (
    <View style={SHADOW_SOFT} className="flex-row items-center gap-3.5 rounded-lg bg-white p-4">
      <View className="h-12 w-12 rounded-md bg-line-200" />
      <View className="flex-1 gap-2">
        <View className="h-4 w-2/3 rounded bg-line-200" />
        <View className="h-3 w-1/3 rounded bg-line-200" />
        <View className="mt-1 h-2 w-full rounded-pill bg-line-200" />
      </View>
    </View>
  );
}

/** A list of skeleton rows/tiles. */
export function SkeletonList({ count = 5, variant = 'row' }: { count?: number } & SkeletonCardProps) {
  return (
    <View className={variant === 'tile' ? 'flex-row flex-wrap gap-3' : 'gap-3.5'}>
      {Array.from({ length: count }, (_, i) =>
        variant === 'tile' ? (
          <View key={i} className="w-[48%]">
            <SkeletonCard variant="tile" />
          </View>
        ) : (
          <SkeletonCard key={i} variant="row" />
        )
      )}
    </View>
  );
}
