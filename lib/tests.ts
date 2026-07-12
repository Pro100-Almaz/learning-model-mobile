// Mock testing content. Each scope (subject → class → module → lesson) launches a
// 10-question MCQ mock test. Content is demo/mock today — swap `getMockTest` for a
// React-Query hook (useMockTest(scope)) later without touching the screen; the
// shapes model a typical quiz API.

export interface MockQuestion {
  id: string;
  prompt: string;
  /** 4 answer choices; index in this array is the answer id. */
  options: string[];
  /** Index into `options` of the correct answer. */
  correctIndex: number;
}

/** A single mock question's user answer: chosen option index, or null. */
export type MockAnswer = number | null;

// --- Mock / demo content -----------------------------------------------------

const QUESTIONS: MockQuestion[] = [
  {
    id: 'q1',
    prompt: '2x + 6 = 14 теңдеуінің шешімі неге тең?',
    options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: '25-тің квадрат түбірі неге тең?',
    options: ['4', '5', '6', '625'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    prompt: 'Үшбұрыштың ішкі бұрыштарының қосындысы неге тең?',
    options: ['90°', '180°', '270°', '360°'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    prompt: '3² + 4² өрнегінің мәні?',
    options: ['7', '12', '25', '49'],
    correctIndex: 2,
  },
  {
    id: 'q5',
    prompt: '120 санының 25%-ы неге тең?',
    options: ['24', '30', '36', '48'],
    correctIndex: 1,
  },
  {
    id: 'q6',
    prompt: 'f(x) = 2x + 1 функциясы үшін f(3) неге тең?',
    options: ['5', '6', '7', '9'],
    correctIndex: 2,
  },
  {
    id: 'q7',
    prompt: 'Радиусы 5 болатын шеңбердің диаметрі?',
    options: ['2.5', '5', '10', '25'],
    correctIndex: 2,
  },
  {
    id: 'q8',
    prompt: '(a + b)² өрнегін жайғанда қайсысы дұрыс?',
    options: ['a² + b²', 'a² + 2ab + b²', 'a² − 2ab + b²', '2a + 2b'],
    correctIndex: 1,
  },
  {
    id: 'q9',
    prompt: '2, 4, 8, 16, … тізбегінің келесі мүшесі?',
    options: ['18', '24', '32', '64'],
    correctIndex: 2,
  },
  {
    id: 'q10',
    prompt: 'sin(30°) неге тең?',
    options: ['0', '0.5', '√2 / 2', '1'],
    correctIndex: 1,
  },
];

// --- Selector ----------------------------------------------------------------
// Content is scope-agnostic for now; the `scope` arg is accepted so the call
// sites already pass what a real API would key on (subject/class/module/lesson).

/** Returns the 10 mock questions for a given scope key. */
export function getMockTest(_scope?: string): MockQuestion[] {
  return QUESTIONS;
}

/** Number of correct answers for a filled-in answer sheet. */
export function scoreMockTest(questions: MockQuestion[], answers: MockAnswer[]): number {
  return questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );
}
