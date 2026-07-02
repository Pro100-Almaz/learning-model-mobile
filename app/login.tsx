import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useSSO, useSignIn, useSignUp } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';

// Required for the OAuth browser to hand control back to the app when the
// redirect fires. Without this the SSO popup can close without completing.
WebBrowser.maybeCompleteAuthSession();

// Pre-warming the in-app browser makes the OAuth handoff noticeably snappier
// on Android and avoids a cold-start flash.
const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HOME = '/(app)/(authenticated)/(tabs)' as const;

type Stage = 'options' | 'email' | 'verify';
type Mode = 'signIn' | 'signUp';

// Pull a human-readable message out of a Clerk error object.
const clerkError = (err: unknown, fallback: string): string => {
  const e = err as { errors?: { message?: string; longMessage?: string; code?: string }[] };
  return e?.errors?.[0]?.longMessage ?? e?.errors?.[0]?.message ?? fallback;
};
const clerkErrorCode = (err: unknown): string | undefined => {
  const e = err as { errors?: { code?: string }[] };
  return e?.errors?.[0]?.code;
};

const RESEND_COOLDOWN_SECONDS = 30;

export default function Login() {
  useWarmUpBrowser();
  const router = useRouter();

  const { startSSOFlow } = useSSO();
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [stage, setStage] = useState<Stage>('options');
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Kept so we can re-request an email code on resend (sign-in path needs it).
  const [emailAddressId, setEmailAddressId] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  // Tick down the resend cooldown once a second.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  // ---- SSO (Apple / Google) --------------------------------------------
  const handleSignInWithSSO = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple') => {
      if (loading) return;
      setError(null);
      setLoading(true);
      try {
        // clerk-expo builds the redirect URL internally as
        // `qadam://sso-callback` (from app.json `scheme`) and opens the OAuth
        // browser. The critical bit is `maybeCompleteAuthSession()` at module
        // load above — without it the browser can't hand control back and the
        // user gets stranded on this screen.
        const { createdSessionId, setActive, authSessionResult, signUp } =
          await startSSOFlow({ strategy });

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          router.replace(HOME);
          return;
        }

        // Distinguish the common failure modes instead of a blanket message.
        if (authSessionResult?.type === 'cancel' || authSessionResult?.type === 'dismiss') {
          setError('Sign in was cancelled.');
        } else if (authSessionResult && authSessionResult.type !== 'success') {
          setError(
            `The browser did not return to the app (${authSessionResult.type}). ` +
              'Check that the redirect URL is allow-listed in Clerk.'
          );
        } else if (signUp?.status === 'missing_requirements') {
          const missing = [
            ...(signUp.missingFields ?? []),
            ...(signUp.unverifiedFields ?? []),
          ].join(', ');
          setError(
            `Your Clerk instance requires extra sign-up fields (${missing || 'unknown'}) ` +
              'that Google did not provide. Make these optional in the Clerk Dashboard.'
          );
        } else {
          setError('Sign in did not complete. Please try again.');
        }
      } catch (err) {
        console.warn('SSO error', clerkError(err, ''));
        setError(clerkError(err, 'Could not sign in. Please try again.'));
      } finally {
        setLoading(false);
      }
    },
    [loading, startSSOFlow, router]
  );

  // ---- Email: send verification code -----------------------------------
  const handleSendCode = useCallback(async () => {
    if (loading || !signInLoaded || !signUpLoaded || !signIn || !signUp) return;
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Try signing in an existing user first.
      const attempt = await signIn.create({ identifier: value });
      const factor = attempt.supportedFirstFactors?.find(
        (f): f is typeof f & { emailAddressId: string } =>
          f.strategy === 'email_code' && 'emailAddressId' in f
      );
      if (!factor) {
        setError('Email code sign-in is not enabled for this account.');
        return;
      }
      await signIn.prepareFirstFactor({
        strategy: 'email_code',
        emailAddressId: factor.emailAddressId,
      });
      setEmailAddressId(factor.emailAddressId);
      setMode('signIn');
      setCode('');
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setStage('verify');
    } catch (err) {
      // No such user yet → create one and verify their email.
      if (clerkErrorCode(err) === 'form_identifier_not_found') {
        try {
          await signUp.create({ emailAddress: value });
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setEmailAddressId(null);
          setMode('signUp');
          setCode('');
          setResendIn(RESEND_COOLDOWN_SECONDS);
          setStage('verify');
        } catch (signUpErr) {
          setError(clerkError(signUpErr, 'Could not start sign up. Please try again.'));
        }
      } else {
        setError(clerkError(err, 'Could not send the code. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, signInLoaded, signUpLoaded, email, signIn, signUp]);

  // ---- Email: verify the 6-digit code ----------------------------------
  const handleVerifyCode = useCallback(async () => {
    if (loading || !signIn || !signUp) return;
    const value = code.trim();
    if (value.length < 6) {
      setError('Enter the 6-digit code we emailed you.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signIn') {
        const res = await signIn.attemptFirstFactor({ strategy: 'email_code', code: value });
        if (res.status === 'complete') {
          await setSignInActive({ session: res.createdSessionId });
          router.replace(HOME);
        } else {
          setError('That code was not accepted. Please try again.');
        }
      } else {
        const res = await signUp.attemptEmailAddressVerification({ code: value });
        if (res.status === 'complete' && res.createdSessionId) {
          await setSignUpActive({ session: res.createdSessionId });
          router.replace(HOME);
        } else if (res.status === 'missing_requirements') {
          setError(
            `Could not finish sign up (still needs: ${(res.missingFields ?? []).join(', ') || 'unknown'}).`
          );
        } else {
          setError('That code was not accepted. Please try again.');
        }
      }
    } catch (err) {
      setError(clerkError(err, 'Invalid or expired code. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [loading, code, mode, signIn, signUp, setSignInActive, setSignUpActive, router]);

  // ---- Email: resend the verification code -----------------------------
  const handleResendCode = useCallback(async () => {
    if (loading || resendIn > 0 || !signIn || !signUp) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signIn') {
        if (!emailAddressId) {
          setError('Please go back and enter your email again.');
          return;
        }
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId });
      } else {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }
      setCode('');
      setResendIn(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(clerkError(err, 'Could not resend the code. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [loading, resendIn, mode, signIn, signUp, emailAddressId]);

  const resetToOptions = () => {
    setStage('options');
    setError(null);
    setCode('');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-[#132134]">
      <View className="flex-1 bg-[#132134] justify-center">
        <View className="w-full items-center gap-8 max-w-md mx-auto px-4">
          <Image
            source={require('@/assets/images/intro.png')}
            style={{ width: '100%', height: 280, aspectRatio: 1 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-white text-center">
            Your journey starts here
          </Text>

          {error ? (
            <Text className="text-red-400 text-center px-2 -mt-4">{error}</Text>
          ) : null}

          {/* --- Provider options --- */}
          {stage === 'options' && (
            <View className="w-full gap-4">
              <Pressable
                disabled={loading}
                className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg"
                onPress={() => handleSignInWithSSO('oauth_apple')}>
                <Ionicons name="logo-apple" size={24} color="black" />
                <Text className="text-black text-center font-semibold ml-2">
                  Continue with Apple
                </Text>
              </Pressable>

              <Pressable
                disabled={loading}
                className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg"
                onPress={() => handleSignInWithSSO('oauth_google')}>
                <Ionicons name="logo-google" size={24} color="black" />
                <Text className="text-black text-center font-semibold ml-2">
                  Continue with Google
                </Text>
              </Pressable>

              <View className="flex-row items-center gap-3 my-1">
                <View className="flex-1 h-px bg-white/20" />
                <Text className="text-white/50 text-sm">or</Text>
                <View className="flex-1 h-px bg-white/20" />
              </View>

              <Pressable
                disabled={loading}
                className="w-full flex-row justify-center items-center border border-white/40 py-3 rounded-lg"
                onPress={() => {
                  setError(null);
                  setStage('email');
                }}>
                <Ionicons name="mail-outline" size={22} color="white" />
                <Text className="text-white text-center font-semibold ml-2">
                  Continue with Email
                </Text>
              </Pressable>

              {loading && <ActivityIndicator color="white" />}
            </View>
          )}

          {/* --- Email entry --- */}
          {stage === 'email' && (
            <View className="w-full gap-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                autoFocus
                editable={!loading}
                onSubmitEditing={handleSendCode}
                className="w-full bg-white/10 text-white py-3 px-4 rounded-lg"
              />
              <Pressable
                disabled={loading}
                className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg"
                onPress={handleSendCode}>
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black text-center font-semibold">Send code</Text>
                )}
              </Pressable>
              <Pressable onPress={resetToOptions} disabled={loading}>
                <Text className="text-white/60 text-center">Back</Text>
              </Pressable>
            </View>
          )}

          {/* --- Code verification --- */}
          {stage === 'verify' && (
            <View className="w-full gap-4">
              <Text className="text-white/70 text-center">
                We sent a 6-digit code to{'\n'}
                <Text className="text-white font-semibold">{email.trim().toLowerCase()}</Text>
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor="#94a3b8"
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                autoFocus
                editable={!loading}
                onSubmitEditing={handleVerifyCode}
                className="w-full bg-white/10 text-white py-3 px-4 rounded-lg text-center tracking-[8px] text-lg"
              />
              <Pressable
                disabled={loading}
                className="w-full flex-row justify-center items-center bg-white py-3 rounded-lg"
                onPress={handleVerifyCode}>
                {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <Text className="text-black text-center font-semibold">Verify & continue</Text>
                )}
              </Pressable>
              <Pressable onPress={handleResendCode} disabled={loading || resendIn > 0}>
                <Text className={`text-center ${resendIn > 0 ? 'text-white/40' : 'text-white'}`}>
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setError(null);
                  setCode('');
                  setStage('email');
                }}
                disabled={loading}>
                <Text className="text-white/60 text-center">Use a different email</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
