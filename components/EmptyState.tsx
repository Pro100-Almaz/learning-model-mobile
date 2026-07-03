import { View, Text } from 'react-native';

interface EmptyStateProps {
  title: string;
  body?: string;
}

/** Neutral panel for "nothing here" / unavailable content. */
export default function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-6">
      <Text className="text-center text-base font-semibold text-gray-700">{title}</Text>
      {body ? <Text className="text-center text-sm text-gray-500">{body}</Text> : null}
    </View>
  );
}
