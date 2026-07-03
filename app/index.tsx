import { Redirect } from 'expo-router';
import { DEV_BYPASS_AUTH } from '@/lib/devFlags';

const Page = () => {
  // Dev bypass: skip login and drop straight into the authenticated area, where
  // OnboardingGate takes over and routes to the onboarding flow.
  if (DEV_BYPASS_AUTH) {
    return <Redirect href="/(app)/(authenticated)/(tabs)" />;
  }
  return <Redirect href="/login" />;
};

export default Page;
