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
        model: "gemini-3.8-flash",
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
  const hasNumbersOrMetrics = /\b\d+(\.\d+)?%?|\b(ms|seconds|throughput|latency|qps|rps|kafka|redis|postgres)\b/i.test(
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

  // 3. Adaptive Coordinated Interviewer Switching Logic (The Hackathon Showcase!)
  // SCENARIO A: Contradiction detected -> Route to Devon (Behavioral) or Marcus (Technical) to clarify gracefully
  if (contradictions.length > 0) {
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
      nextQuestion:
        "I'd love to clarify something from our earlier discussion. You mentioned owning the overall architecture, but a moment ago described focusing on one specific service. Could you walk me through your specific level of direct ownership versus what the broader team delivered?",
      transitionStatement: "Devon stepping in to explore project scope.",
      reasoningCategory: "Contradiction in claimed ownership vs execution scope",
    };
  }

  // SCENARIO B: Vague answer -> Probe for specifics with current interviewer or Hiring Manager
  if (vagueness > 0.6) {
    if (currentInterviewer === "technical") {
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
        nextQuestion:
          "What specific baseline metric were you tracking, and what profiling tools or architectural changes gave you the measured improvement?",
        reasoningCategory: "Vague technical claim requires concrete metrics",
      };
    } else {
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
        nextQuestion:
          "How did you actually measure that success—did you have a defined KPI or user feedback loop to validate the impact?",
        reasoningCategory: "Qualitative assertion requires concrete KPI measurement",
      };
    }
  }

  // SCENARIO C: The Core Hackathon Demo Flow!
  // Candidate gives a strong technical explanation with caching/latency/architecture
  // BUT lacks customer impact or business justification!
  const hasTechnicalDepth =
    answerLower.includes("cache") ||
    answerLower.includes("latency") ||
    answerLower.includes("redis") ||
    answerLower.includes("kafka") ||
    answerLower.includes("database") ||
    answerLower.includes("p99") ||
    answerLower.includes("throughput") ||
    answerLower.includes("index") ||
    answerLower.includes("concurrency");

  const lacksCustomerImpact =
    !answerLower.includes("customer") &&
    !answerLower.includes("user") &&
    !answerLower.includes("revenue") &&
    !answerLower.includes("conversion") &&
    !answerLower.includes("churn") &&
    !answerLower.includes("retention") &&
    !answerLower.includes("client");

  if (currentInterviewer === "technical" && hasTechnicalDepth && lacksCustomerImpact && turnIndex >= 2) {
    return {
      summary: "Technical mechanism is well-articulated, but candidate omitted customer and business impact.",
      claims: ["Successfully articulated caching and latency optimization techniques"],
      evidence: [answer.slice(0, 150)],
      missing_evidence: ["Customer experience impact", "Business KPI or conversion attribution"],
      confidence: 0.94,
      vagueness: 0.18,
      contradictions: [],
      competencies: { technical: 90, product: 55, communication: 82 },
      recommended_interviewer: "product",
      recommended_action: "switch_interviewer",
      difficulty_delta: 0,
      nextQuestion:
        "You explained the latency reduction very cleanly, Alex. From a product perspective, how did that technical improvement actually translate into customer experience, retention, or business metrics?",
      transitionStatement: "Elena Rostova (Product Strategy) is taking over the next question.",
      reasoningCategory: "Customer & business impact not sufficiently covered in technical answer",
    };
  }

  // SCENARIO D: Product interview concluded -> Shift to Devon (Behavioral) for team collaboration & conflict
  if (currentInterviewer === "product" && turnIndex >= 4) {
    return {
      summary: "Product dimensions covered. Transitioning to team leadership and conflict resolution.",
      claims: ["Addressed customer metrics and prioritization"],
      evidence: [answer.slice(0, 140)],
      missing_evidence: ["Collaboration challenges during delivery"],
      confidence: 0.89,
      vagueness: 0.2,
      contradictions: [],
      competencies: { product: 84, communication: 85 },
      recommended_interviewer: "behavioral",
      recommended_action: "switch_interviewer",
      difficulty_delta: 0,
      nextQuestion:
        "Balancing aggressive product timelines with architectural quality often creates team friction. Could you share a scenario where your engineering perspective clashed with a product or design priority, and how you worked through it?",
      transitionStatement: "Devon Clark (Engineering Operations) is joining the discussion.",
      reasoningCategory: "Evaluating interpersonal conflict resolution and team ownership",
    };
  }

  // SCENARIO E: High depth candidate -> Challenge with simulated Customer or Hiring Manager
  if (turnIndex >= 6) {
    return {
      summary: "Core technical, product, and behavioral baselines established. Escalating to executive role fit.",
      claims: ["Sustained high competency across multiple vectors"],
      evidence: [answer.slice(0, 120)],
      missing_evidence: ["Long-term engineering leverage"],
      confidence: 0.92,
      vagueness: 0.15,
      contradictions: [],
      competencies: { technical: 88, product: 82, leadership: 85 },
      recommended_interviewer: "hiring_manager",
      recommended_action: "switch_interviewer",
      difficulty_delta: 1,
      nextQuestion:
        "Alex, stepping back to the 30,000-foot view: as systems scale, complexity naturally creeps in. How do you ensure your engineering teams maintain high velocity and high leverage without burning out under technical debt?",
      transitionStatement: "Sarah Jenkins (VP of Engineering) entering to assess executive leverage.",
      reasoningCategory: "Evaluating high-level technical leadership and organizational leverage",
    };
  }

  // DEFAULT FOLLOW-UP: Keep current interviewer drilling down with tailored depth
  if (currentInterviewer === "technical") {
    return {
      summary: "Candidate proposed an initial architectural concept. Drilling into edge cases and concurrency.",
      claims: ["Proposed distributed implementation"],
      evidence: [answer.slice(0, 140)],
      missing_evidence: ["Cache stampede protection", "Failure handling under network partitions"],
      confidence: 0.85,
      vagueness: 0.22,
      contradictions: [],
      competencies: { technical: 84, problem_solving: 82 },
      recommended_interviewer: "technical",
      recommended_action: "follow_up",
      difficulty_delta: 0,
      nextQuestion:
        "That's a sound architectural starting point. How would your cache invalidation strategy behave if the primary database experienced a sudden burst of write contention and replica lag?",
      reasoningCategory: "Probing resilience under replica lag and partition states",
    };
  } else {
    return {
      summary: "Continuing focused inquiry on recent point.",
      claims: ["Candidate highlighted operational outcome"],
      evidence: [answer.slice(0, 140)],
      missing_evidence: ["Follow-through on key metric"],
      confidence: 0.82,
      vagueness: 0.25,
      contradictions: [],
      competencies: { communication: 80 },
      recommended_interviewer: currentInterviewer,
      recommended_action: "follow_up",
      difficulty_delta: 0,
      nextQuestion: "Could you expand on what trade-off you had to accept when choosing that specific implementation?",
      reasoningCategory: "Deep dive into trade-off prioritization",
    };
  }
}
