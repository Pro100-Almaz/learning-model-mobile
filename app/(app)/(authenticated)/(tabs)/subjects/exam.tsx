import { useCallback } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { LadderExamScreen } from '@/components/learn/screens/LadderExamScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { useLadderNext, useStartLadder } from '@/hooks/useLadderExam';
import { ApiError } from '@/lib/api';
import { COLORS, SHADOW_CTA } from '@/lib/onboarding-theme';

const LESSON = '/(app)/(authenticated)/(tabs)/subjects/lesson' as const;

/**
 * Adaptive module exam ("Модуль бойынша тест"). `moduleId` is the backend
 * chapter id used to start the ladder session; `subjectId`/`classId` are carried
 * so a `gap` verdict can deep-link back into a lesson.
 */
export default function ExamRoute() {
  const { title, subjectId, classId, moduleId } = useLocalSearchParams<{
    title?: string;
    subjectId?: string;
    classId?: string;
    moduleId?: string;
  }>();
  const { router, back } = useLearnNav();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  // Leaving the exam: the ladder session updates lesson mastery on the backend,
  // so refetch the lessons list (and the module summary it renders) on return.
  const onExit = useCallback(() => {
    if (moduleId) queryClient.invalidateQueries({ queryKey: [moduleId, 'lessons'] });
    if (classId) queryClient.invalidateQueries({ queryKey: [classId, 'modules'] });
    back();
  }, [queryClient, moduleId, classId, back]);

  // Full-screen exam: hide the parent tab bar while focused, restore on blur
  // (mirrors the lesson test route).
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

  const { data: first, isLoading, isError, error } = useStartLadder(moduleId);
  const next = useLadderNext();

  const onNext = useCallback(
    (questionId: number, optionId: number | null) => {
      if (!first) throw new Error('Ladder session not started');
      return next.mutateAsync({
        session_id: first.sessionId,
        question_id: questionId,
        option_id: optionId,
      });
    },
    [next, first]
  );

  const onOpenLesson = useCallback(
    (lessonId: number, lessonTitle: string) => {
      router.push({
        pathname: LESSON,
        params: { subjectId, classId, moduleId, lessonId: String(lessonId), title: lessonTitle },
      });
    },
    [router, subjectId, classId, moduleId]
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Ladder switched off for this module — backend returns 409 (ladder_disabled).
  const disabled =
    error instanceof ApiError &&
    (error.status === 409 ||
      (error.body as { code?: string } | null)?.code === 'ladder_disabled');
  if (disabled) {
    return (
      <EmptyState
        icon="lock-closed-outline"
        title="Тест әзірге қолжетімсіз"
        message="Бұл модуль бойынша тест әлі ашылмаған. Сәл кейінірек кіріп көр."
        onBack={back}
      />
    );
  }

  if (isError || !first || !first.question) {
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
    <LadderExamScreen
      first={first}
      title={title}
      onNext={onNext}
      onExit={onExit}
      onOpenLesson={onOpenLesson}
    />
  );
}

/** Centered full-screen empty/error state with a single "back" action. */
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
