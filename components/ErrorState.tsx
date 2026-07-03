import { View, Text, Pressable } from 'react-native';

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
}

/** Full-width error panel with an optional retry action. */
export default function ErrorState({
  title = 'Something went wrong',
  body,
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-6">
      <Text className="text-center text-base font-semibold text-red-700">{title}</Text>
      {body ? <Text className="text-center text-sm text-red-600">{body}</Text> : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="mt-1 rounded-lg bg-red-600 px-5 py-2.5 active:opacity-80">
          <Text className="font-semibold text-white">Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
