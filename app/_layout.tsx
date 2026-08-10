import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, LogBox } from 'react-native';
import 'react-native-reanimated';
import '@/global.css';
import '@/lib/i18n';

import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/utils/cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';
import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import {
  Onest_400Regular,
  Onest_600SemiBold,
  Onest_800ExtraBold,
} from '@expo-google-fonts/onest';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}
LogBox.ignoreLogs(['Clerk: Clerk has been loaded with development keys']);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      // Don't hammer the backend on client errors (401/403/404/429 etc.) — an
      // auth failure like "could not resolve user" is not transient, so retrying
      // just spams the endpoint. Retry only genuine transient failures (network
      // / timeout → ApiError status 0, or 5xx), and only once: a down backend
      // shouldn't make the user wait through several timeouts before the error
      // shows. The API client's circuit breaker + a manual retry handle the rest.
      retry: (failureCount, error) => {
        const status = error instanceof ApiError ? error.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});

export const unstable_settings = {
  initialRouteName: 'index',
};

const InitialLayout = () => {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Nunito_800ExtraBold,
    Onest_400Regular,
    Onest_600SemiBold,
    Onest_800ExtraBold,
  });
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  useReactQueryDevTools(queryClient);

  useEffect(() => {
    if (loaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoaded]);

  // Bounce a signed-in user out of the public routes (login) and into the app.
  // `segments` must stay in the deps: it's what this decision reads, so without
  // it the guard wouldn't re-run on navigation and would judge the *old* route.
  useEffect(() => {
    if (!loaded || !isLoaded) return;

    const inAuthGroup = segments[1] === '(authenticated)';

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(app)/(authenticated)/(tabs)');
    }
  }, [loaded, isLoaded, isSignedIn, segments, router]);

  if (!isLoaded || !loaded) {
    return <ActivityIndicator />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={DefaultTheme}>
              <InitialLayout />
            </ThemeProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
};

export default RootLayout;
