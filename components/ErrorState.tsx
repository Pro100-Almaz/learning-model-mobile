import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  title?: string;
  body?: string;
  onRetry?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** Full-width error panel with an optional retry action. */
export default function ErrorState({
  title,
  body,
  onRetry,
  secondaryLabel,
  onSecondary,
}: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <View className="items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-6">
      <Text className="text-center text-base font-semibold text-red-700">
        {title ?? t('common.errorTitle')}
      </Text>
      {body ? <Text className="text-center text-sm text-red-600">{body}</Text> : null}
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          className="mt-1 rounded-lg bg-red-600 px-5 py-2.5 active:opacity-80">
          <Text className="font-semibold text-white">{t('common.tryAgain')}</Text>
        </Pressable>
      ) : null}
      {onSecondary && secondaryLabel ? (
        <Pressable
          onPress={onSecondary}
          accessibilityRole="button"
          className="mt-0.5 px-4 py-2 active:opacity-60">
          <Text className="text-center text-sm font-semibold text-red-700 underline">
            {secondaryLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
