import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { MathText } from '@/components/learn/MathText';
import { COLORS, SHADOW_CTA, SHADOW_SOFT } from '@/lib/onboarding-theme';
import {
  toSubmitAnswers,
  type AnswerSheet,
  type ReviewItem,
  type SubmitAnswerApi,
  type TestAttempt,
  type TestResult,
  type TestReview,
} from '@/lib/tests';

interface TestScreenProps {
  attempt: TestAttempt;
  title?: string;
  onAnswer: (answer: SubmitAnswerApi) => Promise<void>;
  onSubmit: (answers: SubmitAnswerApi[]) => Promise<TestResult>;
  submitting?: boolean;
  /** Triggers the parent to fetch the review (answer key + explanations). */
  onReview: () => void;
  /** Reviewed answer key, once fetched. */
  review?: TestReview | null;
  reviewLoading?: boolean;
  reviewError?: boolean;
  onExit: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatClock(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function TestScreen({
  attempt,
  title: titleProp,
  onAnswer,
  onSubmit,
  submitting,
  onReview,
  review,
  reviewLoading,
  reviewError,
  onExit,
}: TestScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const { timeLimitSec } = attempt.test;
  const title = titleProp ?? attempt.test.title;
  const questions = attempt.questions;
  const total = questions.length;

  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [current, setCurrent] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  // What the backend has already stored per question, so we only re-post an
  // answer that actually changed. A question is synced once `/answer/` accepts
  // its choice; navigating never blocks on an already-persisted answer.
  const [synced, setSynced] = useState<AnswerSheet>({});
  const [syncing, setSyncing] = useState(false);

  const answeredCount = questions.filter((q) => answers[q.id] != null).length;

  const submittingRef = useRef(false);
  const doSubmit = useCallback(async () => {
    if (submittingRef.current || result) return;
    // Persist the answer on screen before the final submit, so a last-moment
    // change on the current question isn't lost.
    if (!(await syncCurrentRef.current())) return;
    submittingRef.current = true;
    setSidebarOpen(false);
    try {
      const res = await onSubmit(toSubmitAnswers(questions, answers));
      setResult(res);
    } catch {
      Alert.alert(t('test.errorTitle'), t('test.errorSubmitAnswers'));
    } finally {
      submittingRef.current = false;
    }
  }, [onSubmit, questions, answers, result, t]);

  // Optional countdown. Auto-submits when it reaches zero.
  const [remaining, setRemaining] = useState<number | null>(timeLimitSec);
  useEffect(() => {
    if (timeLimitSec == null || result) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) return prev;
        if (prev <= 1) {
          clearInterval(id);
          void doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timeLimitSec, result, doSubmit]);

  // Confirm before abandoning an in-progress test. Catches every exit path — the
  // header ✕, Android hardware back and the iOS swipe-back gesture all funnel
  // through `beforeRemove`. No prompt once submitted or while still untouched.
  const allowLeaveRef = useRef(false);
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (allowLeaveRef.current || result || answeredCount === 0) return;
      e.preventDefault();
      Alert.alert(t('test.exitTitle'), t('test.exitBodyTest'), [
        { text: t('common.stay'), style: 'cancel' },
        {
          text: t('common.exit'),
          style: 'destructive',
          onPress: () => {
            allowLeaveRef.current = true;
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return unsubscribe;
  }, [navigation, result, answeredCount, t]);

  const isLast = current === total - 1;

  const select = (optionId: number) => {
    const qId = questions[current].id;
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
  };

  // Persist the current question's choice to the backend if it changed. Resolves
  // to false (and warns) when the request fails, so the caller can stay put
  // instead of losing the answer to an unsaved navigation.
  const syncingRef = useRef(false);
  const syncCurrent = useCallback(async (): Promise<boolean> => {
    const qId = questions[current].id;
    const chosen = answers[qId];
    if (chosen == null || synced[qId] === chosen) return true;
    if (syncingRef.current) return false;
    syncingRef.current = true;
    setSyncing(true);
    try {
      await onAnswer({ question_id: qId, option_id: chosen });
      setSynced((prev) => ({ ...prev, [qId]: chosen }));
      return true;
    } catch {
      Alert.alert(t('test.errorTitle'), t('test.errorSaveAnswer'));
      return false;
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [questions, current, answers, synced, onAnswer, t]);

  // Latest syncCurrent, so doSubmit / the countdown auto-submit can reach it
  // without listing it as a dependency (which would reset the timer each edit).
  const syncCurrentRef = useRef(syncCurrent);
  syncCurrentRef.current = syncCurrent;

  // Navigate to another question, persisting the current answer first. The move
  // is aborted if the answer fails to save.
  const goTo = useCallback(
    async (index: number) => {
      const target = Math.max(0, Math.min(total - 1, index));
      if (target === current) {
        setSidebarOpen(false);
        return;
      }
      if (!(await syncCurrent())) return;
      setCurrent(target);
      setSidebarOpen(false);
    },
    [total, current, syncCurrent]
  );

  // --- Review (answer key + explanations) ------------------------------------
  if (result && showReview) {
    return (
      <ReviewView
        title={title}
        review={review ?? null}
        loading={reviewLoading}
        error={reviewError}
        onRetry={onReview}
        onBack={() => setShowReview(false)}
      />
    );
  }

  // --- Results ---------------------------------------------------------------
  if (result) {
    const pct =
      result.totalCount > 0 ? Math.round((result.correctCount / result.totalCount) * 100) : 0;
    return (
      <View className="flex-1 bg-surface-app">
        <View style={{ paddingTop: insets.top }} className="bg-surface-app">
          <Header title={t('test.result')} onClose={onExit} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 96 }}
          showsVerticalScrollIndicator={false}>
          <View style={SHADOW_SOFT} className="items-center gap-2 rounded-lg bg-white p-8">
            <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-600">
              {title}
            </Text>
            <Text className="font-display text-[56px] leading-tight text-ink-900">{pct}%</Text>
            <Text className="text-[15px] text-ink-500">
              {t('test.correctAnswers', {
                correct: result.correctCount,
                total: result.totalCount,
              })}
            </Text>
          </View>
        </ScrollView>

        <View
          className="absolute inset-x-0 bottom-0 gap-3 border-t border-line-200 bg-surface-app px-4 pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}>
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel={t('test.reviewAnswers')}
            onPress={() => {
              onReview();
              setShowReview(true);
            }}
            style={SHADOW_CTA}
            className="h-12 flex-row items-center justify-center gap-2 rounded-md bg-blue-500">
            <Ionicons name="reader-outline" size={18} color={COLORS.white} />
            <Text className="font-bodyBold text-[15px] text-white">{t('test.reviewAnswers')}</Text>
          </PressableScale>
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel={t('test.backToMenu')}
            onPress={onExit}
            className="h-12 items-center justify-center rounded-md bg-surface-tint">
            <Text className="font-bodyBold text-[15px] text-blue-600">{t('test.backToMenu')}</Text>
          </PressableScale>
        </View>
      </View>
    );
  }

  // --- Question page ---------------------------------------------------------
  const question = questions[current];
  const chosen = answers[question.id] ?? null;
  const timeLow = remaining != null && remaining <= 30;

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <Header title={title} onClose={onExit} onMenu={() => setSidebarOpen(true)} />
        <View className="gap-1.5 px-4 pb-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-bodyBold text-[13px] text-ink-700">
              {t('test.questionOfTotal', { current: current + 1, total })}
            </Text>
            {remaining != null ? (
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={timeLow ? '#E5484D' : COLORS.ink500}
                />
                <Text
                  className={`font-bodyBold text-[13px] ${timeLow ? 'text-[#E5484D]' : 'text-ink-500'}`}>
                  {formatClock(remaining)}
                </Text>
              </View>
            ) : (
              <Text className="text-[13px] text-ink-500">{t('test.answeredCount', { count: answeredCount })}</Text>
            )}
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
        {question.image ? (
          <Image
            source={{ uri: question.image }}
            resizeMode="contain"
            className="h-44 w-full rounded-md bg-surface-tint"
          />
        ) : null}

        <MathText
          // Deliberately NOT keyed by question: reusing the instance is what
          // lets MathText inject the next prompt into its already-loaded page
          // instead of remounting into a fresh, blank WebView.
          value={question.text}
          fontSize={16}
          color={COLORS.ink900}
          plainClassName="font-display text-[22px] leading-snug text-ink-900"
        />

        <View className="gap-3">
          {question.options.map((option, i) => {
            const active = chosen === option.id;
            return (
              <PressableScale
                key={option.id}
                activeScale={0.98}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.text}
                onPress={() => select(option.id)}
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
        </View>
      </ScrollView>

      {/* Bottom navigation */}
      <View
        className="absolute inset-x-0 bottom-0 flex-row gap-3 border-t border-line-200 bg-surface-app px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <PressableScale
          activeScale={0.98}
          disabled={current === 0 || syncing}
          accessibilityRole="button"
          accessibilityLabel={t('test.prev')}
          onPress={() => goTo(current - 1)}
          className={`h-12 flex-1 flex-row items-center justify-center gap-1 rounded-md ${
            current === 0 ? 'bg-surface-field opacity-50' : 'bg-surface-tint'
          }`}>
          <Ionicons name="chevron-back" size={18} color={COLORS.blue600} />
          <Text className="font-bodyBold text-[15px] text-blue-600">{t('test.prev')}</Text>
        </PressableScale>

        {isLast ? (
          <PressableScale
            activeScale={0.98}
            disabled={submitting || syncing}
            accessibilityRole="button"
            accessibilityLabel={t('test.finishTest')}
            onPress={doSubmit}
            style={SHADOW_CTA}
            className="h-12 flex-[1.4] flex-row items-center justify-center gap-2 rounded-md bg-success-500">
            {submitting || syncing ? <ActivityIndicator color={COLORS.white} size="small" /> : null}
            <Text className="font-bodyBold text-[15px] text-white">{t('test.finish')}</Text>
          </PressableScale>
        ) : (
          <PressableScale
            activeScale={0.98}
            disabled={syncing}
            accessibilityRole="button"
            accessibilityLabel={t('test.next')}
            onPress={() => goTo(current + 1)}
            style={SHADOW_CTA}
            className="h-12 flex-[1.4] flex-row items-center justify-center gap-1 rounded-md bg-blue-500">
            {syncing ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Text className="font-bodyBold text-[15px] text-white">{t('test.next')}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
              </>
            )}
          </PressableScale>
        )}
      </View>

      <QuestionSidebar
        open={sidebarOpen}
        questions={questions}
        current={current}
        answers={answers}
        submitting={submitting || syncing}
        onJump={goTo}
        onSubmit={doSubmit}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}

// --- Review (answer key + explanations) -------------------------------------

const DANGER = '#E5484D';

/**
 * Rough height of the block a card reveals when its explanation opens. Used to
 * decide whether opening would push the new content under the sticky footer —
 * it only has to be in the right ballpark, since being a little conservative
 * just means scrolling when it wasn't strictly needed.
 */
const REVEAL_ROOM = 140;

/**
 * Widens the rectangle a press is allowed to wander out of before Pressability
 * gives up on it.
 *
 * Pressability measures the row once, at press-in, and the moment a later touch
 * sample lands outside that rectangle it abandons the press: it fires
 * `onPressOut` and never `onPress`. The rectangle goes stale easily in this
 * list — the cards shift as their KaTeX WebViews report real heights, and the
 * scroll offset it is measured against lags behind the finger — so on a real
 * press, which rests on the row rather than tapping it instantly, the row went
 * dead mid-press. (Measured on device: an instant tap toggled, a ~900ms hold
 * did not; and the further down the list, the worse it got.) A wide retention
 * rect is not a hit rect, so the row still can't steal taps meant for anything
 * else.
 *
 * It is only a cushion for the `onPress` fallback, though — widening it was not
 * enough on its own. Both what the row *does* and how it *looks* while held run
 * off the raw touch stream instead; see `TAP_SLOP`.
 */
const PRESS_RETENTION = { top: 1000, bottom: 1000, left: 100, right: 100 };

/**
 * How far the finger may travel and still count as a tap on the toggle.
 *
 * The card toggles on touch-end rather than on `onPress`, because the touch
 * stream carries no cached geometry: nothing to go stale, so no press can be
 * silently abandoned no matter how long it is held or how far down the list it
 * is. The only thing we have to rule out ourselves is a drag, hence the slop —
 * and a drag that becomes a scroll never reaches touch-end anyway, since the
 * ScrollView taking over cancels the child's touches.
 */
const TAP_SLOP = 12;

/**
 * Window in which a second toggle for the same tap is ignored. `onPress` still
 * fires for the presses Pressability doesn't abandon (and for an assistive
 * tap, which sends no touches), so both paths stay wired and the first one to
 * arrive wins.
 */
const TOGGLE_DEBOUNCE_MS = 300;

function ReviewView({
  title,
  review,
  loading,
  error,
  onRetry,
  onBack,
}: {
  title: string;
  review: TestReview | null;
  loading?: boolean;
  error?: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const viewportH = useRef(0);
  // The "back" bar is absolutely positioned over the list, so this much of the
  // bottom is covered even once content has scrolled into the viewport.
  const footerH = insets.bottom + 96;

  // A card opened near the bottom edge reveals its explanation *behind* that
  // bar — and on a half-covered row even the chevron flip is invisible, so the
  // tap reads as ignored. Lift the toggle up whenever there isn't room below it
  // to show what it just revealed.
  // Nudge by exactly the shortfall rather than pulling the row to the top: the
  // reader keeps their place, and a `y` we failed to measure reads as "already
  // visible" and moves nothing, instead of flinging the list to the start.
  const revealToggle = useCallback(
    (y: number) => {
      if (!viewportH.current) return;
      const shortfall = y + REVEAL_ROOM - (scrollY.current + viewportH.current - footerH);
      if (shortfall <= 0) return;
      scrollRef.current?.scrollTo({ y: scrollY.current + shortfall, animated: true });
    },
    [footerH]
  );

  return (
    <View className="flex-1 bg-surface-app">
      <View style={{ paddingTop: insets.top }} className="bg-surface-app">
        <Header title={t('test.review')} onClose={onBack} />
      </View>

      {review ? (
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: footerH }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onLayout={(e) => {
            viewportH.current = e.nativeEvent.layout.height;
          }}
          onScroll={(e) => {
            scrollY.current = e.nativeEvent.contentOffset.y;
          }}>
          <Text className="font-bodyBold text-[11px] uppercase tracking-[1.5px] text-blue-600">
            {title}
          </Text>
          {review.items.map((item, i) => (
            <ReviewItemCard key={item.questionId} item={item} index={i} onReveal={revealToggle} />
          ))}
        </ScrollView>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Ionicons name="cloud-offline-outline" size={44} color={COLORS.ink500} />
          <Text className="text-center text-[15px] leading-6 text-ink-500">
            {t('test.reviewLoadError')}
          </Text>
          <PressableScale
            activeScale={0.98}
            accessibilityRole="button"
            accessibilityLabel={t('common.tryAgain')}
            onPress={onRetry}
            style={SHADOW_CTA}
            className="h-12 flex-row items-center justify-center gap-2 self-stretch rounded-md bg-blue-500">
            <Ionicons name="refresh" size={18} color={COLORS.white} />
            <Text className="font-bodyBold text-[15px] text-white">{t('common.tryAgain')}</Text>
          </PressableScale>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      )}

      <View
        className="absolute inset-x-0 bottom-0 border-t border-line-200 bg-surface-app px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <PressableScale
          activeScale={0.98}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={onBack}
          style={SHADOW_CTA}
          className="h-12 flex-row items-center justify-center gap-2 rounded-md bg-blue-500">
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text className="font-bodyBold text-[15px] text-white">{t('common.back')}</Text>
        </PressableScale>
      </View>
    </View>
  );
}

/**
 * One reviewed question: the prompt, every option coloured against the answer
 * key (correct = green ✓, the user's wrong pick = red ✗), and a collapsible
 * explanation revealed by the chevron below.
 */
function ReviewItemCard({
  item,
  index,
  onReveal,
}: {
  item: ReviewItem;
  index: number;
  /** Asks the list to scroll the toggle (at content offset `y`) into view. */
  onReveal: (y: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  // The API types these as strings, but it sends "" (and, in practice,
  // whitespace) when a question has no write-up — trim so those don't count as
  // content and render an empty box.
  const explanation = item.explanation?.trim();
  const mistakeReason = item.mistakeReason?.trim();

  // Where the toggle sits in the scroll content, kept as the card's own offset
  // plus the toggle's offset inside it. Refs, not state: this is only read at
  // press time and re-rendering on every layout pass would be wasted work.
  const cardY = useRef(0);
  const toggleY = useRef(0);

  const lastToggleAt = useRef(0);
  const toggle = () => {
    const now = Date.now();
    if (now - lastToggleAt.current < TOGGLE_DEBOUNCE_MS) return;
    lastToggleAt.current = now;
    const next = !expanded;
    setExpanded(next);
    if (next) onReveal(cardY.current + toggleY.current);
  };

  // Start of the current touch, or null once it ended or was cancelled (which
  // is what a scroll arrives as).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // The held-down tint. Ours rather than Pressable's `active:` variant, which
  // is tied to the same press Pressability keeps abandoning — that is why the
  // row used to go un-highlighted a few hundred ms into a hold. Driven by the
  // touch stream, it stays lit for exactly as long as the finger is down, and
  // clears on the cancel that a scroll taking over delivers.
  const [pressed, setPressed] = useState(false);
  const onTouchStart = (e: GestureResponderEvent) => {
    touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    setPressed(true);
  };
  const onTouchEnd = (e: GestureResponderEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    setPressed(false);
    if (start == null) return;
    const { pageX, pageY } = e.nativeEvent;
    if (Math.hypot(pageX - start.x, pageY - start.y) > TAP_SLOP) return;
    toggle();
  };
  const onTouchCancel = () => {
    touchStart.current = null;
    setPressed(false);
  };

  return (
    <View
      onLayout={(e) => {
        cardY.current = e.nativeEvent.layout.y;
      }}
      style={SHADOW_SOFT}
      className="gap-3 rounded-lg bg-white p-4">
      <View className="flex-row items-start gap-2">
        <Ionicons
          name={item.isCorrect ? 'checkmark-circle' : 'close-circle'}
          size={20}
          color={item.isCorrect ? COLORS.success500 : DANGER}
        />
        <View className="flex-1 flex-row flex-wrap">
          <Text className="font-bodyBold text-[15px] leading-6 text-ink-900">{index + 1}. </Text>
          <View className="flex-1">
            <MathText value={item.questionText} fontSize={15} bold color={COLORS.ink900} />
          </View>
        </View>
      </View>

      <View className="gap-2">
        {item.options.map((o, i) => {
          const isCorrect = o.isCorrect;
          const isChosenWrong = o.id === item.selectedOptionId && !o.isCorrect;
          return (
            <View
              key={o.id}
              className={`flex-row items-center gap-3 rounded-md border p-3 ${
                isCorrect
                  ? 'border-success-500 bg-success-50'
                  : isChosenWrong
                    ? 'border-[#E5484D] bg-[#FDECEC]'
                    : 'border-line-200 bg-white'
              }`}>
              <View
                className={`h-7 w-7 items-center justify-center rounded-pill ${
                  isCorrect ? 'bg-success-500' : isChosenWrong ? 'bg-[#E5484D]' : 'bg-surface-tint'
                }`}>
                <Text
                  className={`font-bodyBold text-[13px] ${
                    isCorrect || isChosenWrong ? 'text-white' : 'text-blue-600'
                  }`}>
                  {LETTERS[i]}
                </Text>
              </View>
              <View className="flex-1">
                <MathText value={o.text} fontSize={14} color={COLORS.ink900} />
              </View>
              {isCorrect ? (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success500} />
              ) : isChosenWrong ? (
                <Ionicons name="close-circle" size={20} color={DANGER} />
              ) : null}
            </View>
          );
        })}
      </View>

      {/*
        The toggle is always offered, even when the backend sent neither an
        explanation nor a mistake reason: the chevron turning down is the
        feedback that the press registered, and an expanded card that says so
        beats a row that silently ignores taps.
      */}
      <View
        className="gap-2"
        onLayout={(e) => {
          toggleY.current = e.nativeEvent.layout.y;
        }}>
        <Pressable
          onPress={toggle}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
          hitSlop={8}
          pressRetentionOffset={PRESS_RETENTION}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={t('test.explanation')}
          // Padded into a full-width row so the target is a comfortable height
          // rather than the 18px chevron; the negative margin keeps the label
          // visually aligned with the card's other content.
          className={`-mx-2 flex-row items-center gap-1 rounded-md px-2 py-2 ${
            pressed ? 'bg-surface-tint' : ''
          }`}>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color={COLORS.blue600}
          />
          <Text className="font-bodyBold text-[14px] text-blue-600">{t('test.explanation')}</Text>
        </Pressable>
        {expanded ? (
          <View className="gap-2">
            {explanation ? (
              <View className="rounded-md bg-surface-tint p-3">
                <MathText value={explanation} fontSize={14} color={COLORS.ink700} />
              </View>
            ) : null}
            {mistakeReason ? (
              <View className="flex-row gap-2 rounded-md bg-[#FDECEC] p-3">
                <Ionicons name="alert-circle-outline" size={18} color={DANGER} />
                <View className="flex-1">
                  <Text className="mb-0.5 font-bodyBold text-[12px] uppercase tracking-[0.5px] text-[#E5484D]">
                    {t('test.likelyMistake')}
                  </Text>
                  <MathText value={mistakeReason} fontSize={14} color={COLORS.ink700} />
                </View>
              </View>
            ) : null}
            {!explanation && !mistakeReason ? (
              <View className="rounded-md bg-surface-tint p-3">
                <Text className="text-[14px] leading-6 text-ink-500">
                  {t('test.noExplanation')}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
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
  const { t } = useTranslation();
  return (
    <View className="flex-row items-center border-b border-line-200 bg-surface-app px-4 pb-3 pt-2">
      <Pressable
        onPress={onClose}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
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
          accessibilityLabel={t('test.questionsList')}
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
  questions,
  current,
  answers,
  submitting,
  onJump,
  onSubmit,
  onClose,
}: {
  open: boolean;
  questions: TestAttempt['questions'];
  current: number;
  answers: AnswerSheet;
  submitting?: boolean;
  onJump: (index: number) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 flex-row">
        <View
          style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
          className="w-[78%] max-w-[320px] bg-surface-app px-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-display text-[22px] text-ink-900">{t('test.questions')}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              className="h-10 w-10 items-center justify-center rounded-pill active:bg-surface-tint">
              <Ionicons name="close" size={24} color={COLORS.ink900} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View className="flex-row flex-wrap gap-3">
              {questions.map((q, i) => {
                const isCurrent = i === current;
                const isAnswered = answers[q.id] != null;
                return (
                  <Pressable
                    key={q.id}
                    onPress={() => onJump(i)}
                    accessibilityRole="button"
                    accessibilityLabel={t('test.questionAria', { number: i + 1 })}
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
              <Legend color="bg-blue-500" label={t('test.legendCurrent')} />
              <Legend color="bg-success-50 border border-success-500" label={t('test.legendAnswered')} />
              <Legend color="bg-white border border-line-200" label={t('test.legendUnanswered')} />
            </View>
          </ScrollView>

          <PressableScale
            activeScale={0.98}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel={t('test.finishTest')}
            onPress={onSubmit}
            style={SHADOW_CTA}
            className="mt-4 h-12 flex-row items-center justify-center gap-2 rounded-md bg-success-500">
            {submitting ? <ActivityIndicator color={COLORS.white} size="small" /> : null}
            <Text className="font-bodyBold text-[15px] text-white">{t('test.finishTest')}</Text>
          </PressableScale>
        </View>

        <Pressable
          className="flex-1 bg-black/40"
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
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
