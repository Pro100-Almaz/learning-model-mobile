import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import OnboardingGate from '@/components/OnboardingGate';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const Layout = () => {
  const colorScheme = useColorScheme();

  return (
    <OnboardingGate>
      <Stack
        screenOptions={{
          headerTintColor: '#0d6c9a',
          headerTitleStyle: {
            color: colorScheme === 'dark' ? '#fff' : '#000',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
