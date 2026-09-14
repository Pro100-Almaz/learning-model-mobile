import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApiClient } from "./useApiClient";
import { gamificationQueryKey } from "./useGamification";
import {
  toTestAttempt,
  toTestResult,
  toTestReview,
  type SubmitAnswerApi,
  type TestAttemptApi,
  type TestResultApi,
  type TestReviewApi,
} from "@/lib/tests";

const answerPath = (attemptId: number) => `/attempts/${attemptId}/answer/`;
const finishPath = (attemptId: number) => `/attempts/${attemptId}/finish/`;
const reviewPath = (attemptId: number) => `/attempts/${attemptId}/review/`;

/**
 * Starts a fresh test attempt for a lesson (POST /attempts/). Since this creates
 * a new attempt server-side, it must run once per screen open — never replay a
 * stale started/finished attempt from cache, and never fire a *second* time
 * while the screen is open. The global `gcTime: 0` drops the result the moment
 * the screen unmounts, so re-entering the test starts a new attempt; within a
 * single mount the observer stays put, so navigating back from the review does
 * NOT create another attempt.
 *
 * This is the one family of reads that deliberately skips `useFreshQuery`:
 * refetching on focus/reconnect would spawn duplicate attempts mid-session.
 */
export function useTestAttempt(lessonId: string | number | undefined) {
  const api = useApiClient();
  const body = {lesson_id: lessonId};
  return useQuery({
    queryKey: ["test-attempt-lesson", lessonId],
    enabled: lessonId != null,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    queryFn: async () => {
      const raw = await api.post<TestAttemptApi>("/attempts/", body);
      return toTestAttempt(raw);
    },
  });
}

export function useSubmitAnswer() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (vars: {
      attemptId: number;
      answer: SubmitAnswerApi;
    }) => {
      await api.post(answerPath(vars.attemptId), vars.answer);
    },
  });
}

/**
 * Fetches the reviewed answer key for a submitted attempt (per-question correct
 * option + explanation). Only enabled once `enabled` flips true, so the request
 * fires when the user opens the review — not on the results screen itself, and
 * again if they close and reopen it. Like {@link useTestAttempt} this stays on
 * plain `useQuery`: it belongs to the attempt the screen is already holding, so
 * a focus refetch would add nothing.
 */
export function useTestReview(
  attemptId: number | undefined,
  enabled: boolean
) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["test-review", attemptId],
    enabled: enabled && attemptId != null,
    queryFn: async () => {
      const raw = await api.get<TestReviewApi>(reviewPath(attemptId!));
      return toTestReview(raw);
    },
  });
}

export function useFinishTest() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      attemptId: number;
      answers: SubmitAnswerApi[];
    }) => {
      const raw = await api.post<TestResultApi>(finishPath(vars.attemptId), {
        answers: vars.answers,
      });
      return toTestResult(raw);
    },
    // Finishing a test awards XP and can extend the streak, so the gamification
    // entry Home and Profile share is now stale. The module exam does the same
    // on exit (see subjects/exam.tsx); without this, a lesson test left both
    // screens showing the pre-test streak.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gamificationQueryKey });
    },
  });
}
