import type {
  ConsentMode,
  ConversationSession,
  ProfileAnswers,
  Question,
  Scenario,
} from "./domain";
import { evaluateProfile, selectQuestions } from "./engine";

export function createConversationSession(
  scenario: Scenario,
  id: string,
  timestamp: string,
): ConversationSession {
  return {
    version: 1,
    id,
    demoMode: true,
    scenarioId: scenario.id,
    leadId: scenario.leadId,
    consent: "PENDING",
    questionIds: selectQuestions(scenario, "PENDING").map((question) => question.id),
    currentQuestionIndex: 0,
    answers: {},
    status: "ACTIVE",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function answerCurrentQuestion(
  session: ConversationSession,
  scenario: Scenario,
  value: string,
  timestamp: string,
): ConversationSession {
  const currentQuestionId = session.questionIds[session.currentQuestionIndex];

  if (!currentQuestionId || session.status !== "ACTIVE") return session;

  if (currentQuestionId === "consent") {
    const consent = value as ConsentMode;

    if (consent === "DECLINED") {
      return {
        ...session,
        consent,
        status: "OPTED_OUT",
        evaluation: evaluateProfile(scenario, consent, {}),
        updatedAt: timestamp,
      };
    }

    return {
      ...session,
      consent,
      questionIds: selectQuestions(scenario, consent).map((question) => question.id),
      currentQuestionIndex: 0,
      updatedAt: timestamp,
    };
  }

  const answers: ProfileAnswers = { ...session.answers, [currentQuestionId]: value };
  const isLastQuestion = session.currentQuestionIndex >= session.questionIds.length - 1;

  if (isLastQuestion) {
    return {
      ...session,
      answers,
      status: "COMPLETED",
      evaluation: evaluateProfile(scenario, session.consent, answers),
      updatedAt: timestamp,
    };
  }

  return {
    ...session,
    answers,
    currentQuestionIndex: session.currentQuestionIndex + 1,
    updatedAt: timestamp,
  };
}

export function getCurrentQuestion(
  session: ConversationSession,
  questions: Record<Question["id"], Question>,
): Question | undefined {
  const id = session.questionIds[session.currentQuestionIndex];
  return id ? questions[id] : undefined;
}
