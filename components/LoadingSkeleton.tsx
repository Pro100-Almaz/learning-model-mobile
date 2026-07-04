import { View } from 'react-native';

interface LoadingSkeletonProps {
  /** Number of placeholder rows to render. */
  rows?: number;
}

/** Neutral placeholder shown while a screen's data is loading. */
export default function LoadingSkeleton({ rows = 3 }: LoadingSkeletonProps) {
  return (
    <View className="gap-4">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <View className="mb-3 h-4 w-1/3 rounded bg-gray-200" />
          <View className="h-11 w-full rounded-lg bg-gray-200" />
        </View>
      ))}
    </View>
  );
}
