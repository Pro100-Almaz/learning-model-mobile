import { useMutation, useQuery } from '@tanstack/react-query';

import { useApiClient } from './useApiClient';
import {
  toLadderStep,
  type LadderNextApi,
  type LadderStepApi,
} from '@/lib/ladder';

const startPath = (chapterId: string | number) =>
  `/roadmap/chapter/${chapterId}/ladder/start/`;
const NEXT_PATH = '/roadmap/chapter/ladder/next/';

/**
 * Starts a fresh ladder session for a module (POST .../ladder/start/, no body)
 * and returns the first question. Like {@link useTestAttempt}, this creates
 * server-side state, so it must run exactly once per screen open — never replay
 * a stale session from cache. `gcTime: 0` drops the result on unmount so
 * re-entering starts a new session; focus/reconnect refetches are disabled so a
 * background refresh can't silently spawn a second session. A disabled ladder
 * surfaces as a 409 (`code: "ladder_disabled"`) the caller can special-case.
 */
export function useStartLadder(chapterId: string | number | undefined) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['ladder-start', chapterId],
    enabled: chapterId != null,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    queryFn: async () => {
      const raw = await api.post<LadderStepApi>(startPath(chapterId!), {});
      return toLadderStep(raw);
    },
  });
}

/**
 * Submits the answer for the current question and returns the server's next
 * step — either the next question or, once every topic resolves,
 * `isComplete: true` with the diagnostic `plan`. `option_id: null` means the
 * student picked "I don't know". The session tracks the rung, so the same
 * endpoint is called for every question.
 */
export function useLadderNext() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (vars: LadderNextApi) => {
      const raw = await api.post<LadderStepApi>(NEXT_PATH, vars);
      return toLadderStep(raw);
    },
  });
}
