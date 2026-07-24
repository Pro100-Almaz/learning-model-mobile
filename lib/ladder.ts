// Module ladder-exam (adaptive per-chapter diagnostic) data model + normalizers.
//
// The exam is one adaptive question at a time: the server tracks the "rung"
// (difficulty) and the active topic, and never exposes correctness or difficulty
// to the client. The client POSTs the chosen option (or `null` = "I don't know")
// and gets back the next question — or, once every topic resolves, a `plan` with
// a per-topic verdict. See the endpoint notes in docs / the backend serializers.

// --- API shapes (snake_case, straight off the serializers) -------------------

export interface LadderOptionApi {
  id: number;
  text: string;
}

export interface LadderQuestionApi {
  id: number;
  text: string;
  image: string | null;
  options: LadderOptionApi[];
}

/** One lesson the student should revisit (only present on a `gap` verdict). */
export interface LadderLessonApi {
  id: number;
  title: string;
  order: number;
}

export type LadderVerdict = 'gap' | 'mastered' | 'solid';

export interface LadderPlanTopicApi {
  tag_id: number;
  tag_slug: string;
  tag_name: string;
  verdict: LadderVerdict;
  degraded: boolean;
  /** Populated on `gap`: study these. Empty otherwise. */
  lessons: LadderLessonApi[];
  /** Populated on `mastered`: offer these hard problems. Empty otherwise. */
  hard_question_ids: number[];
}

export interface LadderPlanApi {
  module_id: number;
  topics: LadderPlanTopicApi[];
}

/** Response from both `ladder/start/` and `ladder/next/`. */
export interface LadderStepApi {
  session_id: number;
  is_complete: boolean;
  question: LadderQuestionApi | null;
  plan: LadderPlanApi | null;
}

export interface LadderNextApi {
  session_id: number;
  question_id: number;
  /** `null` = the student picked "I don't know". */
  option_id: number | null;
}

// --- Domain shapes (camelCase) -----------------------------------------------

export interface LadderOption {
  id: number;
  text: string;
}

export interface LadderQuestion {
  id: number;
  text: string;
  image: string | null;
  options: LadderOption[];
}

export interface LadderLesson {
  id: number;
  title: string;
  order: number;
}

export interface LadderPlanTopic {
  tagId: number;
  tagSlug: string;
  tagName: string;
  verdict: LadderVerdict;
  degraded: boolean;
  lessons: LadderLesson[];
  hardQuestionIds: number[];
}

export interface LadderPlan {
  moduleId: number;
  topics: LadderPlanTopic[];
}

export interface LadderStep {
  sessionId: number;
  isComplete: boolean;
  question: LadderQuestion | null;
  plan: LadderPlan | null;
}

/**
 * The client's local choice for the on-screen question before it is submitted.
 * `null` = nothing picked yet (submit disabled); `'idk'` = "I don't know"
 * (submits `option_id: null`); a number = the chosen option id.
 */
export type LadderChoice = number | 'idk' | null;

// --- Normalizers -------------------------------------------------------------

function toQuestion(q: LadderQuestionApi): LadderQuestion {
  return {
    id: q.id,
    text: q.text,
    image: q.image,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  };
}

function toPlan(p: LadderPlanApi): LadderPlan {
  return {
    moduleId: p.module_id,
    topics: p.topics.map((t) => ({
      tagId: t.tag_id,
      tagSlug: t.tag_slug,
      tagName: t.tag_name,
      verdict: t.verdict,
      degraded: t.degraded,
      lessons: t.lessons.map((l) => ({ id: l.id, title: l.title, order: l.order })),
      hardQuestionIds: t.hard_question_ids,
    })),
  };
}

export function toLadderStep(r: LadderStepApi): LadderStep {
  return {
    sessionId: r.session_id,
    isComplete: r.is_complete,
    question: r.question ? toQuestion(r.question) : null,
    plan: r.plan ? toPlan(r.plan) : null,
  };
}

/** Resolve a local choice to the `option_id` the backend expects. */
export function choiceToOptionId(choice: LadderChoice): number | null {
  return choice === 'idk' || choice === null ? null : choice;
}
