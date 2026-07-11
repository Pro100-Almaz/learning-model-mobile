import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createApiClient, type ApiClient } from '@/lib/api';

/**
 * Returns an API client bound to the current Clerk session. Every request it
 * makes fetches a fresh token via Clerk's `getToken`.
 */
export function useApiClient(): ApiClient {
  const { getToken, signOut } = useAuth();
  return useMemo(
    () => createApiClient((opts) => getToken(opts), () => signOut()),
    [getToken, signOut]
  );
}
