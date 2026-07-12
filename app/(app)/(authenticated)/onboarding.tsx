import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { StoryProgress } from '@/components/onboarding/StoryProgress';
import { OrbitStage } from '@/components/onboarding/OrbitStage';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { PrevButton } from '@/components/onboarding/PrevButton';
import { PressableScale } from '@/components/onboarding/PressableScale';
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep';
import { ProfileStep } from '@/components/onboarding/steps/ProfileStep';
import { ExpectedScoresStep } from '@/components/onboarding/steps/ExpectedScoresStep';
import { TargetStep } from '@/components/onboarding/steps/TargetStep';

import type { SearchSelectOption } from '@/components/SearchSelect';
import ErrorState from '@/components/ErrorState';
import LoadingSkeleton from '@/components/LoadingSkeleton';

import { useProfile } from '@/hooks/useProfile';
import { useOnboardingOptions, useUpdateProfile } from '@/hooks/useOnboarding';
import { useAllSubjects } from '@/hooks/useSubjects';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ENT_MAX_SCORE, subjectMax } from '@/lib/ent';
import { isStepTargetValid, isStepScoresValid } from '@/lib/onboarding-validation';
import type { ExpectedScore } from '@/lib/types';

const HOME = '/(app)/(authenticated)/(tabs)' as const;
const LAST_STEP = 3; // 0: welcome, 1: profile, 2: scores, 3: target
const TOTAL = LAST_STEP + 1;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();

  const optionsQuery = useOnboardingOptions();
  const profileQuery = useProfile();
  const allSubjectsQuery = useAllSubjects();
  const updateProfile = useUpdateProfile();

  const isLoading =
    optionsQuery.isPending || profileQuery.isPending || allSubjectsQuery.isPending;
  const isError = optionsQuery.isError || profileQuery.isError;
  const error = optionsQuery.error ?? profileQuery.error;
  const isSubmitting = updateProfile.isPending;

  const [step, setStep] = useState(0);

  const [targetUniversity, setTargetUniversity] = useState<number | null>(null);
  const [targetSpecialty, setTargetSpecialty] = useState<number | null>(null);
  const [targetScore, setTargetScore] = useState<number>(120);
  const [expectedMap, setExpectedMap] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const profile = profileQuery.data;
  const subjects = useMemo(
    () => optionsQuery.data?.subjects ?? [],
    [optionsQuery.data]
  );

  // Onboarding options give us subject *slugs*; the full catalog (/subjects/all/)
  // gives each slug a human name. Resolve slug → name for display and for
  // subjectMax(), which is keyed by name. Falls back to the slug if unresolved.
  const subjectNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of allSubjectsQuery.data ?? []) map[s.slug] = s.title;
    return map;
  }, [allSubjectsQuery.data]);

  const subjectName = useCallback(
    (slug: string) => subjectNames[slug] ?? slug,
    [subjectNames]
  );
  const maxFor = useCallback(
    (slug: string) => subjectMax(subjectName(slug)),
    [subjectName]
  );

  // One-shot seed from an existing profile (or sensible defaults) once both
  // queries have settled. Sliders always need a concrete value, so unseeded
  // subjects default to ~60% of their max.
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || isLoading) return;

    const profScores = new Map(
      (profile?.expected_scores ?? []).map((e) => [e.subject, e.score])
    );
    const seeded: Record<string, number> = {};
    for (const s of subjects) {
      const fromProfile = profScores.get(s);
      seeded[s] =
        typeof fromProfile === 'number'
          ? clamp(fromProfile, 0, maxFor(s))
          : Math.round(maxFor(s) * 0.6);
    }
    setExpectedMap(seeded);

    if (profile?.target_university != null) setTargetUniversity(profile.target_university);
    if (profile?.target_specialty != null) setTargetSpecialty(profile.target_specialty);

    const expTotal = Object.values(seeded).reduce((a, b) => a + b, 0);
    const floor = Math.min(expTotal, ENT_MAX_SCORE);
    setTargetScore(
      profile?.target_score != null
        ? clamp(profile.target_score, 0, ENT_MAX_SCORE)
        : clamp(120, floor, ENT_MAX_SCORE)
    );

    initialized.current = true;
  }, [isLoading, subjects, profile]);

  // Onboarding is mandatory: the Android hardware back button must not let the
  // user escape into the app. Instead it walks back through the steps, and is
  // fully swallowed on the first step. Returning true blocks the default exit.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setStep((s) => (s > 0 ? s - 1 : 0));
      return true;
    });
    return () => sub.remove();
  }, []);

  // ────────────────── Select options ──────────────────

  const universityOptions = useMemo<SearchSelectOption<number>[]>(() => {
    const list = optionsQuery.data?.universities ?? [];
    return list
      .filter((u) => typeof u.id === 'number' && typeof u.name === 'string')
      .map((u) => ({ value: u.id, label: u.name, hint: u.city ?? undefined }));
  }, [optionsQuery.data]);

  const specialtyOptions = useMemo<SearchSelectOption<number>[]>(() => {
    if (targetUniversity == null) return [];
    const list = optionsQuery.data?.specialties ?? [];
    return list
      .filter((s) => s.university_id === targetUniversity)
      .filter((s) => typeof s.id === 'number' && typeof s.name === 'string')
      .map((s) => ({
        value: s.id,
        label: s.name,
        hint: s.latest_threshold != null ? `Шекті балл: ${s.latest_threshold}` : undefined,
      }));
  }, [optionsQuery.data, targetUniversity]);

  const selectedThreshold = useMemo(() => {
    if (targetSpecialty == null) return null;
    return (
      optionsQuery.data?.specialties?.find((s) => s.id === targetSpecialty)
        ?.latest_threshold ?? null
    );
  }, [optionsQuery.data, targetSpecialty]);

  // ────────────────── Derived values ──────────────────

  const maxTotal = useMemo(
    () => subjects.reduce((sum, s) => sum + maxFor(s), 0),
    [subjects, maxFor]
  );
  const expectedTotal = useMemo(
    () => subjects.reduce((sum, s) => sum + (expectedMap[s] ?? 0), 0),
    [subjects, expectedMap]
  );
  const targetFloor = Math.min(expectedTotal, ENT_MAX_SCORE);

  const expectedScores = useMemo<ExpectedScore[]>(
    () => subjects.map((s) => ({ subject: s, score: expectedMap[s] ?? 0 })),
    [subjects, expectedMap]
  );

  const step1Ok = isStepTargetValid(targetUniversity, targetSpecialty);
  const step2Ok = isStepScoresValid(subjects, expectedScores);
  const canAdvance =
    step === 1 ? step1Ok : step === 2 ? step2Ok : true; // welcome + target are free

  // ────────────────── Actions ──────────────────

  function onUniversityChange(next: number | null) {
    setTargetUniversity((prev) => {
      if (prev !== next) setTargetSpecialty(null);
      return next;
    });
  }

  function onScore(subject: string, value: number) {
    setExpectedMap((prev) => ({ ...prev, [subject]: value }));
  }

  function onTargetChange(value: number) {
    // Target is free across the whole 0..max range; the expected total is only
    // shown as a reference line, it does not floor the goal.
    setTargetScore(clamp(value, 0, ENT_MAX_SCORE));
  }

  async function finish(finalTarget: number | null) {
    setSubmitError(null);
    try {
      const result = await updateProfile.mutateAsync({
        target_university: targetUniversity,
        target_specialty: targetSpecialty,
        target_score: finalTarget,
        expected_scores: expectedScores,
      });
      if (result.onboarding_completed) {
        router.replace(HOME);
      } else {
        setSubmitError('Онбординг аяқталмады. Жауаптарыңды тексеріп көр.');
      }
    } catch {
      setSubmitError('Сақтау мүмкін болмады. Қайта көріп көр.');
    }
  }

  function next() {
    if (!canAdvance || isSubmitting) return;
    if (step < LAST_STEP) setStep((s) => s + 1);
    else void finish(targetScore);
  }

  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  function skipGoal() {
    if (isSubmitting) return;
    void finish(null);
  }

  const isLast = step === LAST_STEP;
  const primaryLabel = isLast
    ? isSubmitting
      ? 'Сақталуда…'
      : 'Бастау'
    : 'Жалғастыру';

  // ────────────────── Render ──────────────────

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-surface-app px-7"
        style={{ paddingTop: insets.top + 24 }}>
        <LoadingSkeleton rows={4} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center bg-surface-app px-7">
        <ErrorState
          body={error?.message}
          onRetry={() => {
            void optionsQuery.refetch();
            void profileQuery.refetch();
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-app">
      {/* Fixed top chrome: story bars */}
      <View className="px-7 pb-2" style={{ paddingTop: insets.top + 12 }}>
        <StoryProgress current={step} total={TOTAL} />
      </View>

      {/* Rotating orbit — the only thing that animates */}
      <View className="flex-1">
        <OrbitStage index={step} reduceMotion={reduceMotion}>
          <WelcomeStep />
          <ProfileStep
            universityOptions={universityOptions}
            specialtyOptions={specialtyOptions}
            targetUniversity={targetUniversity}
            targetSpecialty={targetSpecialty}
            onUniversityChange={onUniversityChange}
            onSpecialtyChange={setTargetSpecialty}
            selectedThreshold={selectedThreshold}
          />
          <ExpectedScoresStep
            subjects={subjects}
            subjectNames={subjectNames}
            expectedMap={expectedMap}
            onScore={onScore}
            currentTotal={expectedTotal}
            maxTotal={maxTotal}
          />
          <TargetStep
            value={targetScore}
            max={ENT_MAX_SCORE}
            floor={targetFloor}
            onChange={onTargetChange}
          />
        </OrbitStage>
      </View>

      {/* Fixed nav bar (never inside the orbit) */}
      <View className="px-7 pt-2.5" style={{ paddingBottom: insets.bottom + 16 }}>
        {submitError ? (
          <Text className="mb-3 text-center font-body text-sm text-red-600">
            {submitError}
          </Text>
        ) : null}

        <View className="flex-row items-center gap-3.5">
          {step > 0 ? <PrevButton onPress={back} disabled={isSubmitting} /> : null}

          {isLast ? (
            <PressableScale
              onPress={skipGoal}
              disabled={isSubmitting}
              className="h-14 justify-center px-2">
              <Text className="font-bodyBold text-base text-ink-500">Өткізу</Text>
            </PressableScale>
          ) : null}

          <PrimaryButton
            label={primaryLabel}
            onPress={next}
            disabled={!canAdvance}
            loading={isSubmitting}
            showArrow={!isLast}
          />
        </View>
      </View>
    </View>
  );
}
