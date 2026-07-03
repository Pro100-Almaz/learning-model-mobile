import { Redirect, Slot, useSegments } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { DEV_BYPASS_AUTH } from '@/lib/devFlags';

const Layout = () => {
  const { isSignedIn } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[1] === '(authenticated)';

  // Protect the inside area (dev bypass lets you in without a Clerk session).
  if (!isSignedIn && inAuthGroup && !DEV_BYPASS_AUTH) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
};

export default Layout;
