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
  | "visitIntent";

export type ProfileAnswers = Partial<Record<ProfileField, string>>;

export type Scenario = {
  id: "jonathan" | "laura" | "camila";
  leadId: `lead-${string}`;
  displayName: string;
  leadSource: "META" | "ORGANIC";
  routeLabel: string;
  description: string;
  knownProfile: ProfileAnswers;
  knownBenefits: string[];
  engagementSignals: string[];
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

export type EvaluationResult = {
  leadId: Scenario["leadId"];
  readinessScore: number;
  confidenceScore: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  route: EvaluationRoute;
  projectIds: string[];
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
};

export type ConversationStatus = "ACTIVE" | "COMPLETED" | "OPTED_OUT";

export type ConversationSession = {
  version: 2;
  id: string;
  demoMode: true;
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
