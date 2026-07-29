import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useProfile';
import { useSignOut } from '@/hooks/useSignOut';
import { ApiError } from '@/lib/api';
import ErrorState from '@/components/ErrorState';

const ONBOARDING = '/(app)/(authenticated)/onboarding' as const;
const HOME = '/(app)/(authenticated)/(tabs)' as const;

/**
 * Gates the authenticated area on onboarding completion. Onboarding is
 * mandatory, so this fails *closed*:
 * - completed → let the user into the app (and off the onboarding screen)
 * - profile missing / not completed → force the onboarding flow
 *
 * The one thing it must NOT do is fail closed on a *fetch* failure. When the
 * backend is unreachable (network down / server off / rejected token), the
 * profile can't load, so bouncing to onboarding just spins that screen's own
 * queries — the "login circles forever" symptom. Instead we surface an explicit
 * error with a retry and stop here.
 */
export default function OnboardingGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const segments = useSegments();
  const onOnboarding = (segments as string[]).includes('onboarding');
  const { data: profile, isPending, isError, error, refetch } = useProfile();
  const signOut = useSignOut();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#0d6c9a" />
      </View>
    );
  }

  // A 404 means "no profile yet" (a brand-new user) — that's a real reason to
  // fail closed into onboarding. Any *other* error is a fetch failure we can't
  // recover from by moving screens, so show it with a retry. 401/403 is a
  // persistent auth problem; everything else reads as a connectivity problem.
  const status = error instanceof ApiError ? error.status : undefined;
  if (isError && status !== 404) {
    const isAuth = status === 401 || status === 403;
    return (
      <View className="flex-1 justify-center bg-surface-app px-7">
        <ErrorState
          title={isAuth ? t('common.errorTitle') : t('common.networkErrorTitle')}
          body={isAuth ? t('common.authErrorBody') : t('common.networkErrorBody')}
          onRetry={() => void refetch()}
          secondaryLabel={t('common.backToLogin')}
          onSecondary={() => void signOut()}
        />
      </View>
    );
  }

  const completed = profile?.onboarding_completed === true;

  // Not done → drag the user to onboarding no matter where they tried to go.
  if (!completed && !onOnboarding) {
    return <Redirect href={ONBOARDING} />;
  }
  // Done → don't let them sit on the onboarding screen.
  if (completed && onOnboarding) {
    return <Redirect href={HOME} />;
  }

  return <>{children}</>;
}
