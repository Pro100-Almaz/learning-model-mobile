import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { PressableScale } from '@/components/onboarding/PressableScale';
import { MathText } from '@/components/learn/MathText';
import { COLORS, SHADOW_CTA, SHADOW_SOFT } from '@/lib/onboarding-theme';
import {
  choiceToOptionId,
  type LadderChoice,
  type LadderLesson,
  type LadderPlan,
  type LadderPlanTopic,
  type LadderStep,
  type LadderVerdict,
} from '@/lib/ladder';

interface LadderExamScreenProps {
  /** The first step from `ladder/start/` — always a question. */
  first: LadderStep;
  title?: string;
  /** Submit the current answer; resolves to the server's next step. */
  onNext: (questionId: number, optionId: number | null) => Promise<LadderStep>;
  onExit: () => void;
  /** Open a lesson from a `gap` verdict's study list. */
  onOpenLesson: (lessonId: number, title: string) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * Adaptive module exam. Unlike the lesson {@link TestScreen}, there is exactly
 * one question on screen at a time and the server picks the next one — so there
 * is no navigating back, no fixed total, and the answer is sent only on submit
 * (the student may freely toggle options first). Every question also offers an
 * "I don't know" choice, which submits `option_id: null`. No correctness is
 * shown per question; when every topic resolves the server returns a `plan` and
 * we render the per-topic verdict.
 */
export function LadderExamScreen({
  first,
  title = 'Модуль бойынша тест',
  onNext,
  onExit,
  onOpenLesson,
}: LadderExamScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [step, setStep] = useState<LadderStep>(first);
  const [choice, setChoice] = useState<LadderChoice>(null);
  const [index, setIndex] = useState(1); // 1-based question counter (total unknown)
  const [submitting, setSubmitting] = useState(false);

  const done = step.isComplete;
  const question = step.question;

  // Confirm before abandoning an in-progress exam — mirrors TestScreen. Every
  // exit path (header ✕, Android back, iOS swipe-back) funnels through
  // `beforeRemove`; no prompt once complete.
  const allowLeaveRef = useRef(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current || done) return;
      e.preventDefault();
      Alert.alert('Тесттен шығасың ба?', 'Нәтижелерің сақталмайды.', [
        { text: 'Қалу', style: 'cancel' },
        {
          text: 'Шығу',
          style: 'destructive',
          onPress: () => {
            allowLeaveRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return unsubscribe;
  }, [navigation, done]);

  const submit = useCallback(async () => {
    if (submitting || choice === null || !question) return;
    setSubmitting(true);
    try {
      const nextStep = await onNext(question.id, choiceToOptionId(choice));
      setStep(nextStep);
      setChoice(null);
      if (!nextStep.isComplete) setIndex((n) => n + 1);
    } catch {
      Alert.alert('Қате', 'Жауапты жіберу мүмкін болмады. Қайталап көр.');
    } finally {
      setSubmitting(false);
    }
  }, [submitting, choice, question, onNext]);

  // --- Results (diagnostic plan) ---------------------------------------------
  if (done) {
    return (
      <PlanView plan={step.plan} title={title} onExit={onExit} onOpenLesson={onOpenLesson} />
    );
  }

  // Defensive: a non-complete step should always carry a question.
  if (!question) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-app">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <Header title={title} onClose={onExit} />
        <View className="gap-1.5 px-4 pb-3">
          <Text className="font-bodyBold text-[13px] text-ink-700">Сұрақ {index}</Text>
          {/* Adaptive: the total is unknown, so the bar is a subtle indeterminate cue. */}
          <View className="h-1.5 overflow-hidden rounded-pill bg-line-200">
            <View className="h-full w-1/3 rounded-pill bg-blue-500" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}>
        {question.image ? (
          <Image
            source={{ uri: question.image }}
            resizeMode="contain"
            className="h-44 w-full rounded-md bg-surface-tint"
          />
        ) : null}

        <MathText
          value={question.text}
          fontSize={16}
          color={COLORS.ink900}
          plainClassName="font-display text-[22px] leading-snug text-ink-900"
        />

        <View className="gap-3">
          {question.options.map((option, i) => {
            const active = choice === option.id;
            return (
              <PressableScale
                key={option.id}
                activeScale={0.98}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.text}
                disabled={submitting}
                onPress={() => setChoice(option.id)}
                style={active ? SHADOW_SOFT : undefined}
                className={`flex-row items-center gap-3 rounded-md border p-4 ${
                  active ? 'border-blue-500 bg-white' : 'border-line-200 bg-white'
                }`}>
                <View
                  className={`h-8 w-8 items-center justify-center rounded-pill ${
                    active ? 'bg-blue-500' : 'bg-surface-tint'
                  }`}>
                  <Text
                    className={`font-bodyBold text-[14px] ${active ? 'text-white' : 'text-blue-600'}`}>
                    {LETTERS[i]}
                  </Text>
                </View>
                <View className="flex-1">
                  <MathText value={option.text} fontSize={15} color={COLORS.ink900} />
                </View>
                {active ? (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.blue500} />
                ) : null}
              </PressableScale>
            );
          })}

          {/* "I don't know" — client-only; submits option_id: null. */}
          <PressableScale
            activeScale={0.98}
            accessibilityRole="radio"
            accessibilityState={{ selected: choice === 'idk' }}
            accessibilityLabel="Білмеймін"
            disabled={submitting}
            onPress={() => setChoice('idk')}
            style={choice === 'idk' ? SHADOW_SOFT : undefined}
            className={`flex-row items-center gap-3 rounded-md border border-dashed p-4 ${
              choice === 'idk' ? 'border-ink-500 bg-white' : 'border-line-200 bg-surface-app'
            }`}>
            <View
              className={`h-8 w-8 items-center justify-center rounded-pill ${
                choice === 'idk' ? 'bg-ink-500' : 'bg-surface-tint'
              }`}>
              <Ionicons
                name="help"
                size={18}
                color={choice === 'idk' ? COLORS.white : COLORS.ink500}
              />
            </View>
            <Text
              className={`flex-1 font-bodyBold text-[15px] ${
                choice === 'idk' ? 'text-ink-900' : 'text-ink-500'
              }`}>
              Білмеймін
            </Text>
            {choice === 'idk' ? (
              <Ionicons name="checkmark-circle" size={22} color={COLORS.ink500} />
            ) : null}
          </PressableScale>
        </View>
      </ScrollView>

      {/* Single action: submit sends the answer and pulls the next question.
          Disabled until something is picked, so the student can't skip ahead. */}
      <View
        className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <PressableScale
          activeScale={0.98}
          disabled={choice === null || submitting}
          accessibilityRole="button"
          accessibilityLabel="Жауап беру"
          onPress={submit}
          style={SHADOW_CTA}
          className={`h-12 flex-row items-center justify-center gap-2 rounded-md ${
            choice === null ? 'bg-surface-field opacity-50' : 'bg-blue-500'
          }`}>
          {submitting ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Text className="font-bodyBold text-[15px] text-white">Жауап беру</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </>
          )}
        </PressableScale>
      </View>
    </View>
  );
}

// --- Results (diagnostic plan) ----------------------------------------------

const VERDICT_META: Record<
  LadderVerdict,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; tint: string }
> = {
  solid: { label: 'Меңгерілген', icon: 'checkmark-circle', color: COLORS.success500, tint: 'bg-success-50' },
  mastered: { label: 'Терең меңгеру', icon: 'trophy', color: COLORS.blue500, tint: 'bg-surface-tint' },
  gap: { label: 'Қайталау қажет', icon: 'alert-circle', color: '#E5484D', tint: 'bg-[#FDECEC]' },
};

function PlanView({
  plan,
  title,
  onExit,
  onOpenLesson,
}: {
  plan: LadderPlan | null;
  title: string;
  onExit: () => void;
  onOpenLesson: (lessonId: number, title: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const topics = plan?.topics ?? [];
  const gaps = topics.filter((t) => t.verdict === 'gap').length;

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <Header title="Нәтиже" onClose={onExit} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}>
        <View style={SHADOW_SOFT} className="items-center gap-2 rounded-lg bg-white p-6">
          <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-600">
            {title}
          </Text>
          <Ionicons
            name={gaps === 0 ? 'checkmark-circle' : 'clipboard'}
            size={44}
            color={gaps === 0 ? COLORS.success500 : COLORS.blue500}
          />
          <Text className="text-center text-[15px] leading-6 text-ink-500">
            {gaps === 0
              ? 'Бәрін жақсы меңгергенсің! Күрделі есептермен өзіңді сына.'
              : `${gaps} тақырыпты қайталау ұсынылады.`}
          </Text>
        </View>

        {topics.map((topic) => (
          <TopicCard key={topic.tagId} topic={topic} onOpenLesson={onOpenLesson} />
        ))}
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <PressableScale
          activeScale={0.98}
          accessibilityRole="button"
          accessibilityLabel="Мәзірге оралу"
          onPress={onExit}
          style={SHADOW_CTA}
          className="h-12 flex-row items-center justify-center gap-2 rounded-md bg-blue-500">
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text className="font-bodyBold text-[15px] text-white">Мәзірге оралу</Text>
        </PressableScale>
      </View>
    </View>
  );
}

/**
 * One topic's verdict. `gap` lists the lessons to revisit (tappable); `mastered`
 * notes that harder problems are available; `solid` is informational only.
 */
function TopicCard({
  topic,
  onOpenLesson,
}: {
  topic: LadderPlanTopic;
  onOpenLesson: (lessonId: number, title: string) => void;
}) {
  const meta = VERDICT_META[topic.verdict];
  return (
    <View style={SHADOW_SOFT} className="gap-3 rounded-lg bg-white p-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={meta.icon} size={20} color={meta.color} />
        <Text className="flex-1 font-bodyBold text-[15px] leading-5 text-ink-900">
          {topic.tagName}
        </Text>
        <View className={`rounded-pill px-2.5 py-1 ${meta.tint}`}>
          <Text className="font-bodyBold text-[11px]" style={{ color: meta.color }}>
            {meta.label}
          </Text>
        </View>
      </View>

      {topic.verdict === 'gap' && topic.lessons.length > 0 ? (
        <View className="gap-2">
          {topic.lessons.map((lesson) => (
            <LessonRow key={lesson.id} lesson={lesson} onPress={onOpenLesson} />
          ))}
        </View>
      ) : null}

      {topic.verdict === 'mastered' && topic.hardQuestionIds.length > 0 ? (
        <View className="flex-row items-center gap-2 rounded-md bg-surface-tint p-3">
          <Ionicons name="flame-outline" size={18} color={COLORS.blue600} />
          <Text className="flex-1 text-[13px] leading-5 text-ink-700">
            {topic.hardQuestionIds.length} күрделі есеп қолжетімді.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function LessonRow({
  lesson,
  onPress,
}: {
  lesson: LadderLesson;
  onPress: (lessonId: number, title: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(lesson.id, lesson.title)}
      accessibilityRole="button"
      accessibilityLabel={lesson.title}
      className="flex-row items-center gap-3 rounded-md border border-line-200 bg-surface-app p-3 active:bg-surface-tint">
      <Ionicons name="play-circle-outline" size={20} color={COLORS.blue500} />
      <Text className="flex-1 text-[14px] leading-5 text-ink-900" numberOfLines={2}>
        {lesson.title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.ink300} />
    </Pressable>
  );
}

// --- Header ------------------------------------------------------------------

function Header({ title, onClose }: { title: string; onClose: () => void }) {
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
    </View>
  );
}
