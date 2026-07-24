import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Clerk's `useSSO` hardcodes its OAuth redirect to `<scheme>://sso-callback`
// (see @clerk/clerk-expo useSSO). When Google/Apple redirect back here, the
// pending `WebBrowser.openAuthSessionAsync()` inside `startSSOFlow` only
// resolves once `maybeCompleteAuthSession()` runs on the redirect page.
//
// Without this route, expo-router matches the redirect to a non-existent path
// and shows +not-found ("Back to Login!"), the auth session never completes,
// and no Clerk session is created — the exact standalone-Android failure.
//
// We call it both at module scope (web) and on mount (native, where the app is
// already running and this component mounts when the deep link arrives). Once
// the session is created, the `startSSOFlow` caller in login.tsx runs
// `setActive` + `router.replace(HOME)`, which replaces this screen.
WebBrowser.maybeCompleteAuthSession();

export default function SSOCallback() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-[#132134]">
      <ActivityIndicator color="#ffffff" />
    </View>
  );
}
