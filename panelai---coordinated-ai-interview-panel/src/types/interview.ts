export type InterviewState =
  | "PREPARING"
  | "CONNECTING"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "INTERRUPTED"
  | "SWITCHING_INTERVIEWER"
  | "FOLLOW_UP"
  | "ROLEPLAY"
  | "PAUSED"
  | "COMPLETED"
  | "ERROR";

export type InterviewerRole =
  | "technical"
  | "product"
  | "behavioral"
  | "hiring_manager"
  | "customer";

export interface InterviewerPersona {
  id: string;
  role: InterviewerRole;
  name: string;
  title: string;
  avatar: string;
  accentColor: string;
  badgeBg: string;
  iconName: "terminal" | "target" | "users" | "briefcase" | "building";
  objective: string;
  personality: string;
  questioningStrategy: string;
  focusAreas: string[];
  evaluationRubric: string[];
  weight: number;
  voice: {
    name: string;
    gender: "male" | "female";
    pitch?: number;
    rate?: number;
  };
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  yearsOfExperience: number;
  skills: string[];
  technologies: string[];
  domains: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience: {
    role: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  projects: {
    name: string;
    description: string;
    impact: string;
    techStack: string[];
  }[];
  achievements: string[];
  certifications?: string[];
}

export interface JobConfig {
  id: string;
  title: string;
  department: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: "Entry" | "Mid-Level" | "Senior" | "Lead" | "Principal";
  durationMinutes: number;
  difficulty: number; // 1 to 5
  competencies: string[];
  panelConfig: {
    role: InterviewerRole;
    weight: number;
    enabled: boolean;
    order: number;
  }[];
}

export interface InterviewTurn {
  id: string;
  interviewId: string;
  speaker: "candidate" | "interviewer";
  role?: InterviewerRole;
  interviewerName?: string;
  text: string;
  timestamp: string; // e.g. "10:41:02"
  secondsOffset: number;
  audioUrl?: string;
  isCurrent?: boolean;
}

export interface EvidenceItem {
  id: string;
  interviewId: string;
  competency: string;
  claim: string;
  evidence: string;
  score: number; // 0 - 100
  transcriptStart: number;
  transcriptEnd: number;
  confidence: number; // 0.0 - 1.0
  vaguenessScore?: number; // 0.0 - 1.0
  isContradiction?: boolean;
  notes?: string;
}

export interface ModeratorDecision {
  summary: string;
  claims: string[];
  evidence: string[];
  missing_evidence: string[];
  confidence: number;
  vagueness: number; // 0.0 to 1.0
  contradictions: string[];
  competencies: Record<string, number>;
  recommended_interviewer: InterviewerRole;
  recommended_action:
    | "follow_up"
    | "switch_interviewer"
    | "challenge"
    | "clarify"
    | "roleplay"
    | "increase_difficulty"
    | "decrease_difficulty"
    | "move_on"
    | "conclude";
  difficulty_delta: number;
  nextQuestion: string;
  transitionStatement?: string;
  reasoningCategory: string;
}

export interface AssessmentReport {
  id: string;
  interviewId: string;
  candidateName: string;
  jobTitle: string;
  completedAt: string;
  durationFormatted: string;
  overallScore: number;
  competencyScores: {
    name: string;
    score: number;
    benchmark: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  recommendation: "Strong Hire" | "Hire" | "Leaning Hire" | "Leaning No Hire" | "No Hire";
  evidenceList: EvidenceItem[];
  interviewerPerspectives: {
    role: InterviewerRole;
    interviewerName: string;
    title: string;
    score: number;
    verdict: string;
    quote: string;
    perspective: string;
  }[];
  transcriptSummary: string;
}

export type TypedEventType =
  | "TRANSCRIPT_PARTIAL"
  | "TRANSCRIPT_FINAL"
  | "CANDIDATE_STARTED_SPEAKING"
  | "CANDIDATE_STOPPED_SPEAKING"
  | "AGENT_STARTED_SPEAKING"
  | "AGENT_STOPPED_SPEAKING"
  | "INTERVIEWER_SELECTED"
  | "QUESTION_GENERATED"
  | "INTERVIEWER_SWITCHING"
  | "EVIDENCE_UPDATED"
  | "DIFFICULTY_CHANGED"
  | "CONTRADICTION_DETECTED"
  | "INTERVIEW_COMPLETED"
  | "AGENT_ERROR";

export interface TypedEvent {
  id: string;
  sessionId: string;
  type: TypedEventType;
  timestamp: string;
  data: Record<string, unknown>;
}
