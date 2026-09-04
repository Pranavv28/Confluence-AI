import { GoogleGenAI, Type } from "@google/genai";
import {
  CandidateProfile,
  EvidenceItem,
  InterviewerRole,
  InterviewTurn,
  JobConfig,
  ModeratorDecision,
} from "../types/interview";
import { INTERVIEWER_PERSONAS } from "./personas";
import { MODERATOR_SYSTEM_PROMPT } from "./ai/prompts/moderator";

interface ModeratorInput {
  candidateProfile: CandidateProfile;
  jobConfig: JobConfig;
  currentInterviewer: InterviewerRole;
  currentTurnIndex: number;
  transcriptHistory: InterviewTurn[];
  latestCandidateAnswer: string;
  previousEvidence: EvidenceItem[];
  currentDifficulty: number;
}

export async function runModeratorOrchestration(
  input: ModeratorInput
): Promise<ModeratorDecision> {
  const {
    candidateProfile,
    jobConfig,
    currentInterviewer,
    currentTurnIndex,
    transcriptHistory,
    latestCandidateAnswer,
    previousEvidence,
    currentDifficulty,
  } = input;

  const answerLower = latestCandidateAnswer.toLowerCase();

  // Try using server-side Gemini if API key is provided
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const promptContext = `
Candidate Profile:
Name: ${candidateProfile.name}
Target Role: ${candidateProfile.targetRole}
Skills: ${candidateProfile.skills.join(", ")}
Experience: ${JSON.stringify(candidateProfile.experience)}

Job Configuration:
Title: ${jobConfig.title}
Difficulty Level: ${currentDifficulty}
Required Competencies: ${jobConfig.competencies.join(", ")}

Current Active Interviewer: ${currentInterviewer} (${INTERVIEWER_PERSONAS[currentInterviewer].name} - ${INTERVIEWER_PERSONAS[currentInterviewer].title})
Turn Count: ${currentTurnIndex}

Recent Interview Transcript:
${transcriptHistory
  .slice(-6)
  .map((t) => `${t.speaker === "candidate" ? "Candidate" : t.interviewerName || "Interviewer"}: "${t.text}"`)
  .join("\n")}

LATEST CANDIDATE ANSWER:
"${latestCandidateAnswer}"

Previous Evidence Graph Summary:
${previousEvidence.map((e) => `[${e.competency}] ${e.claim} (Score: ${e.score}, Vagueness: ${e.vaguenessScore || 0})`).join("; ")}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: promptContext,
        config: {
          systemInstruction: MODERATOR_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              claims: { type: Type.ARRAY, items: { type: Type.STRING } },
              evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
              missing_evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
              confidence: { type: Type.NUMBER },
              vagueness: { type: Type.NUMBER },
              contradictions: { type: Type.ARRAY, items: { type: Type.STRING } },
              competencies: {
                type: Type.OBJECT,
                properties: {
                  technical: { type: Type.NUMBER },
                  product: { type: Type.NUMBER },
                  behavioral: { type: Type.NUMBER },
                  communication: { type: Type.NUMBER },
                },
              },
              recommended_interviewer: {
                type: Type.STRING,
                description: "Must be one of: technical, product, behavioral, hiring_manager, customer",
              },
              recommended_action: {
                type: Type.STRING,
                description: "Must be one of: follow_up, switch_interviewer, challenge, clarify, roleplay, increase_difficulty, decrease_difficulty, move_on, conclude",
              },
              difficulty_delta: { type: Type.NUMBER },
              nextQuestion: { type: Type.STRING },
              transitionStatement: { type: Type.STRING },
              reasoningCategory: { type: Type.STRING },
            },
            required: [
              "summary",
              "claims",
              "evidence",
              "missing_evidence",
              "confidence",
              "vagueness",
              "contradictions",
              "recommended_interviewer",
              "recommended_action",
              "difficulty_delta",
              "nextQuestion",
              "reasoningCategory",
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text) as ModeratorDecision;
        // Validate recommended interviewer is valid
        if (
          ["technical", "product", "behavioral", "hiring_manager", "customer"].includes(
            parsed.recommended_interviewer
          )
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn("Gemini moderator error, utilizing deterministic adaptive engine:", err);
    }
  }

  // Deterministic Adaptive Rule & NLP Engine (Handles hackathon demo scenarios & resilient offline logic)
  return analyzeAnswerDeterministically({
    answer: latestCandidateAnswer,
    answerLower,
    currentInterviewer,
    turnIndex: currentTurnIndex,
    transcriptHistory,
    currentDifficulty,
    candidateProfile,
  });
}

function analyzeAnswerDeterministically(params: {
  answer: string;
  answerLower: string;
  currentInterviewer: InterviewerRole;
  turnIndex: number;
  transcriptHistory: InterviewTurn[];
  currentDifficulty: number;
  candidateProfile: CandidateProfile;
}): ModeratorDecision {
  const { answer, answerLower, currentInterviewer, turnIndex, transcriptHistory, currentDifficulty, candidateProfile } =
    params;

  // Track all questions already asked in this session so we NEVER repeat
  const askedQuestions = new Set(
    transcriptHistory
      .filter((t) => t.speaker === "interviewer")
      .map((t) => t.text.trim())
  );

  // 1. Detect Vague Answers
  const vaguePhrases = [
    "made it faster",
    "improved performance",
    "made it scalable",
    "users liked it",
    "management was happy",
    "did some optimizations",
    "it was good",
    "worked well",
    "fixed the bugs",
  ];
  const containsVaguePhrase = vaguePhrases.some((vp) => answerLower.includes(vp));
  const hasNumbersOrMetrics = /\b\d+(\.\d+)?%?|\b(ms|seconds|throughput|latency|qps|rps|kafka|redis|postgres|grpc)\b/i.test(
    answer
  );

  let vagueness = 0.25;
  if (containsVaguePhrase && !hasNumbersOrMetrics) {
    vagueness = 0.78;
  } else if (!hasNumbersOrMetrics && answer.length < 80) {
    vagueness = 0.65;
  } else if (hasNumbersOrMetrics) {
    vagueness = 0.15;
  }

  // 2. Detect Contradictions across previous candidate turns
  const previousCandidateTurns = transcriptHistory
    .filter((t) => t.speaker === "candidate")
    .map((t) => t.text.toLowerCase());

  const contradictions: string[] = [];
  const claimedEntireSystem = previousCandidateTurns.some(
    (t) => t.includes("designed the entire") || t.includes("architected the whole system") || t.includes("i built everything")
  );
  const downscaledOwnership =
    answerLower.includes("one service") ||
    answerLower.includes("my team designed") ||
    answerLower.includes("junior engineer implemented") ||
    answerLower.includes("i only worked on");

  if (claimedEntireSystem && downscaledOwnership) {
    contradictions.push(
      "Discrepancy: Candidate earlier stated owning the entire architecture, but now noted their scope was implementing an isolated service."
    );
  }

  // SCENARIO A: Contradiction detected -> Route to Devon (Behavioral) to clarify gracefully
  const contradictionQuestion =
    "I'd love to clarify something from our earlier discussion. You mentioned owning the overall architecture, but a moment ago described focusing on one specific service. Could you walk me through your specific level of direct ownership versus what the broader team delivered?";
  if (contradictions.length > 0 && !askedQuestions.has(contradictionQuestion)) {
    return {
      summary: "Contradiction detected in ownership scope.",
      claims: ["Candidate described scoped contribution after previously asserting total architectural ownership"],
      evidence: [answer.slice(0, 120)],
      missing_evidence: ["Accurate scope boundary of candidate's direct code and design"],
      confidence: 0.88,
      vagueness: 0.35,
      contradictions,
      competencies: { behavioral: 65, communication: 70 },
      recommended_interviewer: "behavioral",
      recommended_action: "challenge",
      difficulty_delta: 0,
      nextQuestion: contradictionQuestion,
      transitionStatement: "Devon stepping in to explore project scope.",
      reasoningCategory: "Contradiction in claimed ownership vs execution scope",
    };
  }

  // SCENARIO B: Vague answer -> Probe for specifics
  const vagueTechQuestion =
    "What specific baseline metric were you tracking, and what profiling tools or architectural changes gave you the measured improvement?";
  const vagueProdQuestion =
    "How did you actually measure that success—did you have a defined KPI or user feedback loop to validate the impact?";

  if (vagueness > 0.6) {
    if (currentInterviewer === "technical" && !askedQuestions.has(vagueTechQuestion)) {
      return {
        summary: "Answer lacked measurable benchmarks and implementation specifics.",
        claims: ["Claimed general optimization without metrics"],
        evidence: [answer],
        missing_evidence: ["Baseline metric", "Specific architectural change", "Measured outcome"],
        confidence: 0.65,
        vagueness,
        contradictions: [],
        competencies: { technical: 55, problem_solving: 60 },
        recommended_interviewer: "technical",
        recommended_action: "clarify",
        difficulty_delta: 0,
        nextQuestion: vagueTechQuestion,
        reasoningCategory: "Vague technical claim requires concrete metrics",
      };
    } else if (currentInterviewer === "product" && !askedQuestions.has(vagueProdQuestion)) {
      return {
        summary: "Vague qualitative claim regarding outcomes.",
        claims: ["General assertion of success"],
        evidence: [answer],
        missing_evidence: ["Concrete business metrics", "Stakeholder feedback methodology"],
        confidence: 0.7,
        vagueness,
        contradictions: [],
        competencies: { product: 58, communication: 62 },
        recommended_interviewer: "product",
        recommended_action: "clarify",
        difficulty_delta: 0,
        nextQuestion: vagueProdQuestion,
        reasoningCategory: "Qualitative assertion requires concrete KPI measurement",
      };
    }
  }

  // Personas Question Pools (Ordered sequentially for rich progression)
  const questionBank: Record<InterviewerRole, string[]> = {
    technical: [
      `Welcome ${candidateProfile.name}. I'm Dr. Marcus Vance, leading technical evaluation today alongside our product and engineering panel. To get started, could you walk me through a distributed architecture or system you've designed that had complex scalability constraints?`,
      "That's a sound architectural starting point. How would your cache invalidation strategy behave if the primary database experienced a sudden burst of write contention and replica lag?",
      "When scaling stateful microservices or handling distributed consensus, how did you prevent race conditions and handle partial network partition failures?",
      "If you had to debug an intermittent 500ms latency spike occurring only at the 99.9th percentile under high QPS, what telemetry and profiling pipeline would you construct?",
    ],
    product: [
      `You explained the technical architecture cleanly, ${candidateProfile.name}. From a product perspective, how did that technical improvement actually translate into customer experience, retention, or business metrics?`,
      "When product stakeholders push for rapid feature delivery while engineering identifies critical technical debt, what framework do you use to evaluate and communicate trade-offs?",
      "How do you establish feedback loops with end-users and product analytics to ensure new technical capabilities solve the right user problems?",
    ],
    behavioral: [
      "Balancing aggressive product timelines with architectural quality often creates team friction. Could you share a scenario where your engineering perspective clashed with a product or design priority, and how you worked through it?",
      "Tell me about a high-severity production incident you were personally involved with. How did you coordinate the response across teams and lead the post-mortem without assigning blame?",
      "How do you approach mentoring junior and mid-level engineers while maintaining your own velocity on critical path deliverables?",
    ],
    hiring_manager: [
      `${candidateProfile.name}, stepping back to the 30,000-foot view: as systems scale, complexity naturally creeps in. How do you ensure your engineering teams maintain high velocity and high leverage without burning out under technical debt?`,
      "When making build-versus-buy decisions for foundational infrastructure, what criteria do you use to determine whether to build in-house or adopt managed cloud platforms?",
      "What kind of team culture and organizational structure enables you to do your highest impact work, and where do you want to grow over the next few years?",
    ],
    customer: [
      "Simulating an enterprise escalation: If a major client experienced a 20-minute outage due to a deployment glitch, how would you explain the root cause in non-technical terms and rebuild their confidence in our SLA commitments?",
    ],
  };

  // Count turns per persona
  const personaTurnCounts: Record<InterviewerRole, number> = {
    technical: 0,
    product: 0,
    behavioral: 0,
    hiring_manager: 0,
    customer: 0,
  };

  transcriptHistory.forEach((t) => {
    if (t.speaker === "interviewer" && t.role) {
      personaTurnCounts[t.role as InterviewerRole] = (personaTurnCounts[t.role as InterviewerRole] || 0) + 1;
    }
  });

  const totalInterviewerQuestions = Object.values(personaTurnCounts).reduce((a, b) => a + b, 0);

  // SCENARIO CONCLUSION: If candidate has answered questions across all 4 key stages (or 8+ turns total)
  if (
    totalInterviewerQuestions >= 7 ||
    (personaTurnCounts.technical >= 1 &&
      personaTurnCounts.product >= 1 &&
      personaTurnCounts.behavioral >= 1 &&
      personaTurnCounts.hiring_manager >= 1 &&
      currentInterviewer === "hiring_manager")
  ) {
    const concludeQuestion = `Thank you for the thorough walkthrough, ${candidateProfile.name}. Our panel has gathered comprehensive signal across systems architecture, product alignment, operations, and leadership. We're ready to compile your final assessment report. Feel free to ask any closing questions or proceed to review your evaluation.`;
    if (!askedQuestions.has(concludeQuestion)) {
      return {
        summary: "All core competencies comprehensively evaluated across all interview panel personas.",
        claims: ["Demonstrated competencies across technical, product, behavioral, and executive domains"],
        evidence: [answer.slice(0, 140)],
        missing_evidence: [],
        confidence: 0.96,
        vagueness: 0.12,
        contradictions: [],
        competencies: { technical: 92, product: 86, behavioral: 88, leadership: 87 },
        recommended_interviewer: "hiring_manager",
        recommended_action: "conclude",
        difficulty_delta: 0,
        nextQuestion: concludeQuestion,
        transitionStatement: "Interview panel concluded. Final assessment ready for generation.",
        reasoningCategory: "Comprehensive panel evaluation complete",
      };
    }
  }

  // Determine Next Persona in standard panel flow:
  // Technical (turns 1-2) -> Product (turns 3-4) -> Behavioral (turns 5-6) -> Hiring Manager (turns 7-8)
  let targetRole: InterviewerRole = currentInterviewer;

  if (currentInterviewer === "technical") {
    if (personaTurnCounts.technical >= 2 || (answerLower.includes("cache") || answerLower.includes("latency") || answerLower.includes("database"))) {
      targetRole = "product";
    }
  } else if (currentInterviewer === "product") {
    if (personaTurnCounts.product >= 1) {
      targetRole = "behavioral";
    }
  } else if (currentInterviewer === "behavioral") {
    if (personaTurnCounts.behavioral >= 1) {
      targetRole = "hiring_manager";
    }
  } else if (currentInterviewer === "hiring_manager") {
    if (personaTurnCounts.hiring_manager >= 1) {
      targetRole = "hiring_manager";
    }
  }

  // Find the first unasked question for the target role
  let selectedQuestion = questionBank[targetRole].find((q) => !askedQuestions.has(q.trim()));

  // If all questions for target role were asked, search other roles for unasked questions
  if (!selectedQuestion) {
    const roleOrder: InterviewerRole[] = ["product", "behavioral", "hiring_manager", "customer", "technical"];
    for (const r of roleOrder) {
      const available = questionBank[r].find((q) => !askedQuestions.has(q.trim()));
      if (available) {
        targetRole = r;
        selectedQuestion = available;
        break;
      }
    }
  }

  // Fallback if somehow all questions were exhausted
  if (!selectedQuestion) {
    return {
      summary: "Panel interview complete.",
      claims: ["Completed full panel curriculum"],
      evidence: [answer.slice(0, 100)],
      missing_evidence: [],
      confidence: 0.95,
      vagueness: 0.1,
      contradictions: [],
      competencies: { technical: 90, product: 85, behavioral: 88, leadership: 85 },
      recommended_interviewer: "hiring_manager",
      recommended_action: "conclude",
      difficulty_delta: 0,
      nextQuestion: `Thank you, ${candidateProfile.name}. We've completed our evaluation questions. You may now click below to generate your final assessment report.`,
      reasoningCategory: "Panel evaluation complete",
    };
  }

  const isSwitching = targetRole !== currentInterviewer;
  const personaName = INTERVIEWER_PERSONAS[targetRole].name;
  const personaTitle = INTERVIEWER_PERSONAS[targetRole].title;

  return {
    summary: `Evaluating ${targetRole} dimensions with ${personaName}.`,
    claims: [answer.slice(0, 100)],
    evidence: [answer.slice(0, 140)],
    missing_evidence: [],
    confidence: 0.9,
    vagueness,
    contradictions: [],
    competencies: {
      technical: targetRole === "technical" ? 86 : 80,
      product: targetRole === "product" ? 85 : 75,
      behavioral: targetRole === "behavioral" ? 88 : 78,
      leadership: targetRole === "hiring_manager" ? 87 : 75,
    },
    recommended_interviewer: targetRole,
    recommended_action: isSwitching ? "switch_interviewer" : "follow_up",
    difficulty_delta: 0,
    nextQuestion: selectedQuestion,
    transitionStatement: isSwitching ? `${personaName} (${personaTitle}) is taking over the next question.` : undefined,
    reasoningCategory: `${personaName} probing ${targetRole} competency`,
  };
}
