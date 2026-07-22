import { useMutation, useQuery } from "@tanstack/react-query";

import { useApiClient } from "./useApiClient";
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
 * stale started/finished attempt from cache. `gcTime: 0` drops the result the
 * moment the screen unmounts, so re-entering the test starts a new attempt;
 * within a single mount the observer stays put, so navigating back from the
 * review does NOT create another attempt. Window-focus / reconnect refetches are
 * disabled to avoid spawning duplicate attempts mid-session.
 */
export function useTestAttempt(lessonId: string | number | undefined) {
  const api = useApiClient();
  const body = {lesson_id: lessonId};
  return useQuery({
    queryKey: ["test-attempt-lesson", lessonId],
    enabled: lessonId != null,
    staleTime: 0,
    gcTime: 0,
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
 * fires when the user opens the review — not on the results screen itself.
 */
export function useTestReview(
  attemptId: number | undefined,
  enabled: boolean
) {
  const api = useApiClient();
  return useQuery({
    queryKey: ["test-review", attemptId],
    enabled: enabled && attemptId != null,
    staleTime: Infinity,
    queryFn: async () => {
      const raw = await api.get<TestReviewApi>(reviewPath(attemptId!));
      return toTestReview(raw);
    },
  });
}

export function useFinishTest() {
  const api = useApiClient();
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
  });
}
