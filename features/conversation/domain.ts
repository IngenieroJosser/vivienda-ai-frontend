export type ConsentMode = "PENDING" | "USE_KNOWN_DATA" | "START_FRESH" | "DECLINED";

export type ProfileField =
  | "affiliation"
  | "dreamGoal"
  | "mainConcern"
  | "location"
  | "horizon"
  | "householdSize"
  | "incomeRange"
  | "obligations"
  | "savings"
  | "subsidyInterest"
  | "visitIntent"
  | "homeOwnership"
  | "creditStatus"
  | "monthlySavingsGoal"
  | "debtReductionPlan"
  | "followUpPreference"
  | "preferredChannel"
  | "fullName"
  | "phone"
  | "email"
  | "contactTimePreference"
  | "contactConsent";

export type ProfileAnswers = Partial<Record<ProfileField, string>>;

export type Scenario = {
  id: string;
  leadId: `lead-${string}`;
  displayName: string;
  leadSource: "META" | "ORGANIC";
  capturedAt: string;
  routeLabel: string;
  description: string;
  knownProfile: ProfileAnswers;
  knownBenefits: string[];
  engagementSignals: string[];
  campaignProjectId?: string;
  requiredFields: ProfileField[];
};

export type AnswerOption = {
  value: string;
  label: string;
};

export type Question = {
  id: "consent" | ProfileField;
  prompt: string;
  explanation?: string;
  options: AnswerOption[];
};

export type EvaluationRoute =
  | "ADVISOR_NOW"
  | "NON_AFFILIATE_PRIORITY"
  | "NURTURE_FINANCIAL"
  | "NURTURE_BENEFITS"
  | "NURTURE_LONG_TERM"
  | "NEEDS_DATA"
  | "OPTED_OUT";

export type ProjectMatchSignal =
  | "CAMPAIGN"
  | "LOCATION"
  | "CAPACITY"
  | "HOUSEHOLD"
  | "PREFERENCE"
  | "HORIZON";

export type ProjectMatch = {
  projectId: string;
  score: number;
  signals: ProjectMatchSignal[];
  reasons: string[];
  evidenceSourceIds: string[];
};

export type EvaluationResult = {
  leadId: Scenario["leadId"];
  readinessScore: number;
  confidenceScore: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  route: EvaluationRoute;
  projectIds: string[];
  projectMatches: ProjectMatch[];
  capacity: {
    monthlyIncomeEstimate: number;
    currentCommitmentRatio: number;
    maximumHousingRatio: number;
    estimatedHousingPayment: number;
    status: "STRONG" | "MODERATE" | "LIMITED" | "UNKNOWN";
  };
  benefitSignals: {
    confirmed: string[];
    potential: string[];
  };
  profileSnapshot: ProfileAnswers;
  knownDataUsed: ProfileField[];
  factors: string[];
  blockers: string[];
  commercialSummary: string;
  nextAction: string;
  followUpAt: string | null;
  advanceCondition: string;
};

export type ConversationStatus = "ACTIVE" | "COMPLETED" | "OPTED_OUT";

export type ConversationSession = {
  version: 4;
  id: string;
  scenarioId: Scenario["id"];
  leadId: Scenario["leadId"];
  consent: ConsentMode;
  questionIds: Question["id"][];
  currentQuestionIndex: number;
  answers: ProfileAnswers;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  evaluation?: EvaluationResult;
};
