import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { TestScreen } from '@/components/learn/screens/TestScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useSubmitAnswer, useFinishTest, useTestAttempt, useTestReview } from '@/hooks/useTest';
import { ApiError } from '@/lib/api';
import { COLORS, SHADOW_CTA } from '@/lib/onboarding-theme';
import type { SubmitAnswerApi } from '@/lib/tests';

/**
 * MCQ test for a lesson. `title` labels the header; `lessonId` keys the attempt
 * the backend starts (POST /attempts/ with { lesson_id }).
 */
export default function TestRoute() {
  const { title, lessonId } = useLocalSearchParams<{ title?: string; lessonId?: string }>();
  const { back } = useLearnNav();
  const navigation = useNavigation();

  // Full-screen test: hide the parent tab bar while this page is focused, then
  // restore the original style (absolute + blur on iOS) on blur.
  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({ tabBarStyle: { display: 'none' } });
      return () => {
        parent?.setOptions({
          tabBarStyle: process.env.EXPO_OS === 'ios' ? { position: 'absolute' } : undefined,
        });
      };
    }, [navigation])
  );

  const { data: attempt, isLoading, isError, error } = useTestAttempt(lessonId);
  const submit = useFinishTest();
  const submitAnswer = useSubmitAnswer();

  // Review (answer key) is fetched lazily — only once the user opens it from the
  // results screen, so the request doesn't fire on every finished attempt.
  const [reviewing, setReviewing] = useState(false);
  const review = useTestReview(attempt?.attemptId, reviewing);

  const onAnswer = useCallback(
    (answer: SubmitAnswerApi) => {
      if (!attempt) throw new Error('Attempt not loaded');
      return submitAnswer.mutateAsync({ attemptId: attempt.attemptId, answer });
    },
    [submitAnswer, attempt]
  );

  const onSubmit = useCallback(
    (answers: SubmitAnswerApi[]) => {
      if (!attempt) throw new Error('Attempt not loaded');
      return submit.mutateAsync({ attemptId: attempt.attemptId, answers });
    },
    [submit, attempt]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // No test authored for this lesson yet — its own friendly empty state.
  const notFound = error instanceof ApiError && error.status === 404;
  if (notFound) {
    return (
      <EmptyState
        icon="document-text-outline"
        title="Тест әзірленбеген"
        message="Бұл сабаққа тест әлі құрылмаған. Жақын арада қосылады — сәл кейінірек кіріп көр."
        onBack={back}
      />
    );
  }

  if (isError || !attempt) {
    return (
      <EmptyState
        icon="cloud-offline-outline"
        title="Тест жүктелмеді"
        message="Тестті жүктеу мүмкін болмады. Байланысыңды тексеріп, қайталап көр."
        onBack={back}
      />
    );
  }

  return (
    <TestScreen
      attempt={attempt}
      title={title}
      onAnswer={onAnswer}
      onSubmit={onSubmit}
      submitting={submit.isPending}
      onReview={() => {
        // Enable the query on first open; force a refetch when retrying a failed load.
        if (reviewing && review.isError) void review.refetch();
        else setReviewing(true);
      }}
      review={review.data ?? null}
      reviewLoading={review.isLoading || review.isFetching}
      reviewError={review.isError}
      onExit={back}
    />
  );
}

/**
 * Centered full-screen empty/error state with an illustrative icon and a single
 * "back" action. Used when a lesson has no test yet (404) or loading failed.
 */
function EmptyState({
  icon,
  title,
  message,
  onBack,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-surface-app px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <View className="h-24 w-24 items-center justify-center rounded-full bg-surface-tint">
        <Ionicons name={icon} size={44} color={COLORS.blue500} />
      </View>
      <Text className="mt-6 text-center font-display text-[24px] leading-tight text-ink-900">
        {title}
      </Text>
      <Text className="mt-3 text-center text-[15px] leading-6 text-ink-500">{message}</Text>

      <PressableScale
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel="Артқа қайту"
        onPress={onBack}
        style={SHADOW_CTA}
        className="mt-8 h-12 flex-row items-center justify-center gap-2 self-stretch rounded-md bg-blue-500">
        <Ionicons name="arrow-back" size={18} color={COLORS.white} />
        <Text className="font-bodyBold text-[15px] text-white">Артқа</Text>
      </PressableScale>
    </View>
  );
}
