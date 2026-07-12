import { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';

import { MockTestScreen } from '@/components/learn/screens/MockTestScreen';
import { useLearnNav } from '@/hooks/useLearnNav';
import { getMockTest } from '@/lib/tests';

/**
 * Mock MCQ test, launched from any learn scope (subject / class / module / lesson).
 * `title` labels the header; `scope` keys the (mock) question set.
 * See docs/subject_lesson_pages.md.
 */
export default function TestRoute() {
  const { title, scope } = useLocalSearchParams<{ title?: string; scope?: string }>();
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

  const questions = getMockTest(scope);

  return (
    <MockTestScreen title={title ?? 'Тест'} questions={questions} onExit={back} />
  );
}
