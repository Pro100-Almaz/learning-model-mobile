export interface TestOptionApi {
  id: number;
  text: string;
}

export interface TestQuestionApi {
  id: number;
  text: string;
  image: string | null;
  options: TestOptionApi[];
}

export interface TestMetaApi {
  id: number;
  type: string;
  title: string;
  time_limit_sec: number | null;
  question_count: number;
}

export interface TestAttemptApi {
  attempt_id: number;
  test: TestMetaApi;
  started_at: string;
  questions: TestQuestionApi[];
}

export interface SubmitAnswerApi {
  question_id: number;
  option_id: number | null;
}

export interface TestResultApi {
  attempt_id: number;
  score: number;
  correct_count: number;
  total_count: number;
  finished_at: string;
}

/** One option in a review item; `is_correct` marks the right answer(s). */
export interface ReviewOptionApi {
  id: number;
  text: string;
  is_correct: boolean;
}

/** One reviewed question with the user's choice and the explanation. */
export interface ReviewItemApi {
  question_id: number;
  question_text: string;
  selected_option_id: number | null;
  correct_option_id: number | null;
  is_correct: boolean;
  explanation: string;
  /** Optional diagnosis of the student's likely error; "" when none. */
  mistake_reason: string;
  options: ReviewOptionApi[];
}

/** Response from GET /attempts/{id}/review/ — the post-submit answer key. */
export interface TestReviewApi {
  attempt_id: number;
  score: number;
  items: ReviewItemApi[];
}

export interface TestOption {
  id: number;
  text: string;
}

export interface TestQuestion {
  id: number;
  text: string;
  image: string | null;
  options: TestOption[];
}

export interface TestAttempt {
  attemptId: number;
  test: {
    id: number;
    type: string;
    title: string;
    timeLimitSec: number | null;
    questionCount: number;
  };
  startedAt: string;
  questions: TestQuestion[];
}

export interface TestResult {
  attemptId: number;
  score: number;
  correctCount: number;
  totalCount: number;
  finishedAt: string;
}

export interface ReviewOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface ReviewItem {
  questionId: number;
  questionText: string;
  selectedOptionId: number | null;
  correctOptionId: number | null;
  isCorrect: boolean;
  explanation: string;
  /** Optional diagnosis of the student's likely error; "" when none. */
  mistakeReason: string;
  options: ReviewOption[];
}

export interface TestReview {
  attemptId: number;
  score: number;
  items: ReviewItem[];
}

/**
 * The user's in-progress answer sheet: the chosen option id per question, keyed
 * by question id. `null` means unanswered.
 */
export type AnswerSheet = Record<number, number | null>;

// --- Normalizers -------------------------------------------------------------

export function toTestAttempt(r: TestAttemptApi): TestAttempt {
  return {
    attemptId: r.attempt_id,
    test: {
      id: r.test.id,
      type: r.test.type,
      title: r.test.title,
      timeLimitSec: r.test.time_limit_sec,
      questionCount: r.test.question_count,
    },
    startedAt: r.started_at,
    questions: r.questions.map((q) => ({
      id: q.id,
      text: q.text,
      image: q.image,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
    })),
  };
}

export function toTestResult(r: TestResultApi): TestResult {
  return {
    attemptId: r.attempt_id,
    score: r.score,
    totalCount: r.total_count,
    correctCount: r.correct_count,
    finishedAt: r.finished_at,
  };
}

export function toTestReview(r: TestReviewApi): TestReview {
  return {
    attemptId: r.attempt_id,
    score: r.score,
    items: r.items.map((it) => ({
      questionId: it.question_id,
      questionText: it.question_text,
      selectedOptionId: it.selected_option_id,
      correctOptionId: it.correct_option_id,
      isCorrect: it.is_correct,
      explanation: it.explanation,
      mistakeReason: it.mistake_reason,
      options: it.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.is_correct,
      })),
    })),
  };
}

/** Build a submit payload from an in-progress answer sheet. */
export function toSubmitAnswers(
  questions: TestQuestion[],
  answers: AnswerSheet
): SubmitAnswerApi[] {
  return questions.map((q) => ({
    question_id: q.id,
    option_id: answers[q.id] ?? null,
  }));
}
