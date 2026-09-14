import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

/**
 * Signs the user out and returns them to /login.
 *
 * Clearing the react-query cache matters even though nothing is stored past a
 * screen's lifetime: the queryClient is a module-level singleton, so entries
 * still observed by screens mounted at sign-out time would otherwise survive
 * into the next session and briefly render the previous user's profile.
 * `finally` guarantees we leave the authenticated area even if `signOut` throws
 * (e.g. offline).
 */
export function useSignOut(): () => Promise<void> {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useCallback(async () => {
    try {
      await signOut();
    } finally {
      queryClient.clear();
      router.replace('/login');
    }
  }, [signOut, queryClient, router]);
}
