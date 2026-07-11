import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { COLORS, SHADOW_CTA, SHADOW_SOFT } from '@/lib/onboarding-theme';
import { scoreMockTest, type MockAnswer, type MockQuestion } from '@/lib/tests';

interface MockTestScreenProps {
  title: string;
  questions: MockQuestion[];
  onExit: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Mock MCQ test: one question per page with prev/next/submit, a removable
 * question sidebar for jumping between questions, and a results summary once
 * submitted. Content comes from lib/tests (mock today).
 */
export function MockTestScreen({ title, questions, onExit }: MockTestScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [answers, setAnswers] = useState<MockAnswer[]>(() =>
    questions.map(() => null)
  );
  const [current, setCurrent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const total = questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;

  // Confirm before abandoning an in-progress test. Catches every exit path —
  // the header ✕ (calls onExit → back), Android hardware back and the iOS
  // swipe-back gesture all funnel through `beforeRemove`. No prompt once the
  // test is submitted or while it's still untouched.
  const allowLeaveRef = useRef(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current || submitted || answeredCount === 0) return;
      e.preventDefault();
      Alert.alert(
        'Тесттен шығасың ба?',
        'Жауаптарың сақталмайды.',
        [
          { text: 'Қалу', style: 'cancel' },
          {
            text: 'Шығу',
            style: 'destructive',
            onPress: () => {
              allowLeaveRef.current = true;
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, submitted, answeredCount]);
  const isLast = current === total - 1;
  const score = useMemo(
    () => scoreMockTest(questions, answers),
    [questions, answers]
  );

  const select = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  };

  const goTo = (index: number) => {
    setCurrent(Math.max(0, Math.min(total - 1, index)));
    setSidebarOpen(false);
  };

  const submit = () => {
    setSidebarOpen(false);
    setSubmitted(true);
  };

  const retake = () => {
    setAnswers(questions.map(() => null));
    setCurrent(0);
    setSubmitted(false);
  };

  // --- Results ---------------------------------------------------------------
  if (submitted) {
    return (
      <View className="flex-1 bg-surface-app">
        <View style={{ paddingTop: insets.top }} className="bg-surface-app">
          <Header title="Нәтиже" onClose={onExit} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 96 }}
          showsVerticalScrollIndicator={false}>
          <View
            style={SHADOW_SOFT}
            className="items-center gap-2 rounded-lg bg-white p-6">
            <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-600">
              {title}
            </Text>
            <Text className="font-display text-[44px] leading-tight text-ink-900">
              {score}/{total}
            </Text>
            <Text className="text-[14px] text-ink-500">
              {Math.round((score / total) * 100)}% дұрыс жауап
            </Text>
          </View>

          <View className="gap-2">
            <Text className="font-display text-xl text-ink-900">Жауаптарды талдау</Text>
            {questions.map((q, i) => {
              const chosen = answers[i];
              const correct = chosen === q.correctIndex;
              return (
                <View
                  key={q.id}
                  style={SHADOW_SOFT}
                  className="gap-2 rounded-lg bg-white p-4">
                  <View className="flex-row items-start gap-2">
                    <Ionicons
                      name={correct ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={correct ? COLORS.success500 : '#E5484D'}
                    />
                    <Text className="flex-1 font-bodyBold text-[14px] leading-5 text-ink-900">
                      {i + 1}. {q.prompt}
                    </Text>
                  </View>
                  <Text className="text-[13px] text-ink-500">
                    Сенің жауабың:{' '}
                    <Text className={correct ? 'text-success-500' : 'text-ink-700'}>
                      {chosen === null ? 'жауап жоқ' : q.options[chosen]}
                    </Text>
                  </Text>
                  {!correct ? (
                    <Text className="text-[13px] text-ink-500">
                      Дұрыс жауап:{' '}
                      <Text className="text-success-500">{q.options[q.correctIndex]}</Text>
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          className="absolute inset-x-0 bottom-0 flex-row gap-3 border-t border-line-200 bg-surface-app px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}>
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Қайтадан тапсыру"
            onPress={retake}
            className="h-12 flex-1 items-center justify-center rounded-md bg-surface-tint">
            <Text className="font-bodyBold text-[15px] text-blue-600">Қайтадан</Text>
          </PressableScale>
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Жабу"
            onPress={onExit}
            style={SHADOW_CTA}
            className="h-12 flex-[1.4] items-center justify-center rounded-md bg-blue-500">
            <Text className="font-bodyBold text-[15px] text-white">Жабу</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  // --- Question page ---------------------------------------------------------
  const question = questions[current];
  const chosen = answers[current];

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <Header
          title={title}
          onClose={onExit}
          onMenu={() => setSidebarOpen(true)}
        />
        <View className="gap-1.5 px-4 pb-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-bodyBold text-[13px] text-ink-700">
              Сұрақ {current + 1} / {total}
            </Text>
            <Text className="text-[13px] text-ink-500">{answeredCount} жауап берілді</Text>
          </View>
          <View className="h-1.5 overflow-hidden rounded-pill bg-line-200">
            <View
              className="h-full rounded-pill bg-blue-500"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}>
        <Text className="font-display text-[22px] leading-snug text-ink-900">
          {question.prompt}
        </Text>

        <View className="gap-3">
          {question.options.map((option, i) => {
            const active = chosen === i;
            return (
              <PressableScale
                key={i}
                activeScale={0.98}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option}
                onPress={() => select(i)}
                style={active ? SHADOW_SOFT : undefined}
                className={`flex-row items-center gap-3 rounded-md border p-4 ${
                  active ? 'border-blue-500 bg-white' : 'border-line-200 bg-white'
                }`}>
                <View
                  className={`h-8 w-8 items-center justify-center rounded-pill ${
                    active ? 'bg-blue-500' : 'bg-surface-tint'
                  }`}>
                  <Text
                    className={`font-bodyBold text-[14px] ${
                      active ? 'text-white' : 'text-blue-600'
                    }`}>
                    {LETTERS[i]}
                  </Text>
                </View>
                <Text className="flex-1 text-[15px] leading-5 text-ink-900">{option}</Text>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.blue500} />
                ) : null}
              </PressableScale>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View
        className="absolute inset-x-0 bottom-0 flex-row gap-3 border-t border-line-200 bg-surface-app px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <PressableScale
          activeScale={0.98}
          disabled={current === 0}
          accessibilityRole="button"
          accessibilityLabel="Алдыңғы"
          onPress={() => goTo(current - 1)}
          className={`h-12 flex-1 flex-row items-center justify-center gap-1 rounded-md ${
            current === 0 ? 'bg-surface-field opacity-50' : 'bg-surface-tint'
          }`}>
          <Ionicons name="chevron-back" size={18} color={COLORS.blue600} />
          <Text className="font-bodyBold text-[15px] text-blue-600">Алдыңғы</Text>
        </PressableScale>

        {isLast ? (
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Тестті аяқтау"
            onPress={submit}
            style={SHADOW_CTA}
            className="h-12 flex-[1.4] items-center justify-center rounded-md bg-success-500">
            <Text className="font-bodyBold text-[15px] text-white">Аяқтау</Text>
          </PressableScale>
        ) : (
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Келесі"
            onPress={() => goTo(current + 1)}
            style={SHADOW_CTA}
            className="h-12 flex-[1.4] flex-row items-center justify-center gap-1 rounded-md bg-blue-500">
            <Text className="font-bodyBold text-[15px] text-white">Келесі</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
          </PressableScale>
        )}
      </View>

      <QuestionSidebar
        open={sidebarOpen}
        total={total}
        current={current}
        answers={answers}
        onJump={goTo}
        onSubmit={submit}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}

// --- Header ------------------------------------------------------------------

function Header({
  title,
  onClose,
  onMenu,
}: {
  title: string;
  onClose: () => void;
  onMenu?: () => void;
}) {
  return (
    <View className="flex-row items-center border-b border-line-200 bg-surface-app px-4 pb-3 pt-2">
      <Pressable
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Жабу"
        className="-ml-2 h-11 w-11 items-center justify-center rounded-pill active:bg-surface-tint">
        <Ionicons name="close" size={26} color={COLORS.ink900} />
      </Pressable>
      <Text className="flex-1 font-display text-[22px] text-ink-900" numberOfLines={1}>
        {title}
      </Text>
      {onMenu ? (
        <Pressable
          onPress={onMenu}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Сұрақтар тізімі"
          className="h-11 w-11 items-center justify-center rounded-pill active:bg-surface-tint">
          <Ionicons name="grid-outline" size={22} color={COLORS.ink700} />
        </Pressable>
      ) : null}
    </View>
  );
}

// --- Removable question sidebar ---------------------------------------------

function QuestionSidebar({
  open,
  total,
  current,
  answers,
  onJump,
  onSubmit,
  onClose,
}: {
  open: boolean;
  total: number;
  current: number;
  answers: MockAnswer[];
  onJump: (index: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <View
          style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
          className="w-[78%] max-w-[320px] bg-surface-app px-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-display text-[22px] text-ink-900">Сұрақтар</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Жабу"
              className="h-10 w-10 items-center justify-center rounded-pill active:bg-surface-tint">
              <Ionicons name="close" size={24} color={COLORS.ink900} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="flex-row flex-wrap gap-3">
              {Array.from({ length: total }).map((_, i) => {
                const isCurrent = i === current;
                const isAnswered = answers[i] !== null;
                return (
                  <Pressable
                    key={i}
                    onPress={() => onJump(i)}
                    accessibilityRole="button"
                    accessibilityLabel={`Сұрақ ${i + 1}`}
                    className={`h-12 w-12 items-center justify-center rounded-md border ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-500'
                        : isAnswered
                          ? 'border-success-500 bg-success-50'
                          : 'border-line-200 bg-white'
                    }`}>
                    <Text
                      className={`font-bodyBold text-[15px] ${
                        isCurrent
                          ? 'text-white'
                          : isAnswered
                            ? 'text-success-500'
                            : 'text-ink-700'
                      }`}>
                      {i + 1}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 gap-2">
              <Legend color="bg-blue-500" label="Ағымдағы" />
              <Legend color="bg-success-50 border border-success-500" label="Жауап берілген" />
              <Legend color="bg-white border border-line-200" label="Жауап берілмеген" />
            </View>
          </ScrollView>

          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel="Тестті аяқтау"
            onPress={onSubmit}
            style={SHADOW_CTA}
            className="mt-4 h-12 items-center justify-center rounded-md bg-success-500">
            <Text className="font-bodyBold text-[15px] text-white">Тестті аяқтау</Text>
          </PressableScale>
        </View>

        <Pressable
          className="flex-1 bg-black/40"
          accessibilityRole="button"
          accessibilityLabel="Жабу"
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className={`h-5 w-5 rounded ${color}`} />
      <Text className="text-[13px] text-ink-500">{label}</Text>
    </View>
  );
}
