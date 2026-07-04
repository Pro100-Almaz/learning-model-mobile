import { type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, useSegments } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';

const ONBOARDING = '/(app)/(authenticated)/onboarding' as const;
const HOME = '/(app)/(authenticated)/(tabs)' as const;

/**
 * Gates the authenticated area on onboarding completion. Onboarding is
 * mandatory, so this fails *closed*:
 * - completed → let the user into the app (and off the onboarding screen)
 * - anything else (not completed, no profile yet, or a fetch error) → force
 *   the onboarding flow. The onboarding screen surfaces its own error/retry UI
 *   if the profile genuinely can't load, so the user is never trapped blank.
 */
export default function OnboardingGate({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const onOnboarding = (segments as string[]).includes('onboarding');
  const { data: profile, isPending } = useProfile();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#0d6c9a" />
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
