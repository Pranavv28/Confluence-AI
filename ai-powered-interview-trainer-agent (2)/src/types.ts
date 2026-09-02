export type ExperienceLevel = 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

export type InterviewDomain = 'Backend' | 'Frontend' | 'Fullstack' | 'Data / Analytics' | 'AI / Machine Learning' | 'DevOps / Cloud' | 'Mobile';

export interface CandidateProfile {
  role: string;
  experience: ExperienceLevel;
  domain: InterviewDomain;
  targetCompany?: string;
  customNotes?: string;
}

export interface EvaluationResult {
  score: number; // Out of 10
  strengths: string[];
  missingGaps: string[];
  improvedAnswer: string;
  keyConceptsIdentified?: string[];
  suggestedFollowUp?: string;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  category: 'Technical' | 'Behavioral' | 'Situational' | 'HR';
  question: string;
  interviewerCriteria: string; // What the interviewer is looking for
  userAnswer?: string;
  answeredAt?: string;
  evaluation?: EvaluationResult;
}

export interface ConversationTurn {
  id: string;
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
  questionNumber?: number;
  evaluation?: EvaluationResult;
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  role: string;
  experience: string;
  domain: string;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  turns: ConversationTurn[];
  status: 'idle' | 'active' | 'completed';
  ragContextUsed?: string;
  summaryStats?: {
    totalQuestions: number;
    answeredQuestions: number;
    averageScore: number;
    topStrengths: string[];
    criticalGaps: string[];
    readinessScorePercentage: number;
  };
}

export interface CorpusItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  keywords: string[];
}
