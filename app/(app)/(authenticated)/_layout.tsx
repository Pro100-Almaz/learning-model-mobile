import { Stack } from 'expo-router';
import OnboardingGate from '@/components/OnboardingGate';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const Layout = () => {
  return (
    <OnboardingGate>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#0d6c9a',
          headerTitleStyle: {
            color: '#000000',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false,
            // Onboarding is mandatory: no swipe-back / no gesture dismissal.
            gestureEnabled: false,
          }}
        />
      </Stack>
    </OnboardingGate>
  );
};
export default Layout;
