import { useCallback } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

/**
 * Signs the user out and returns them to /login.
 *
 * Clearing the react-query cache matters: the queryClient is a module-level
 * singleton (staleTime 1h), so without it the next sign-in could briefly render
 * the previous user's cached profile/dashboard. `finally` guarantees we leave
 * the authenticated area even if `signOut` throws (e.g. offline).
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
