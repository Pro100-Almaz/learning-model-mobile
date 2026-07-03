import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { createApiClient, type ApiClient } from '@/lib/api';

/**
 * Returns an API client bound to the current Clerk session. Every request it
 * makes fetches a fresh token via Clerk's `getToken`.
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth();
  return useMemo(() => createApiClient(() => getToken()), [getToken]);
}
