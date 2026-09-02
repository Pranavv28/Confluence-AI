import { GoogleGenAI, Type } from "@google/genai";
import { retrieveRAGContext } from "./corpusData.js";

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export interface GeneratedQuestion {
  number: number;
  category: "Technical" | "Behavioral" | "Situational" | "HR";
  question: string;
  interviewerCriteria: string;
}

export interface EvaluationResponse {
  score: number;
  strengths: string[];
  missingGaps: string[];
  improvedAnswer: string;
  keyConceptsIdentified: string[];
  suggestedFollowUp?: string;
}

/**
 * Generate 5 tailored interview questions using RAG context and candidate profile.
 * Exactly adheres to the problem statement prompt structure:
 * - 3 Technical questions
 * - 1 Behavioral (STAR expected)
 * - 1 Situational / HR question
 */
export async function generateInterviewQuestions(
  role: string,
  experience: string,
  domain: string,
  targetCompany?: string,
  customNotes?: string
): Promise<{ questions: GeneratedQuestion[]; ragContext: string }> {
  const ragContext = retrieveRAGContext(role, domain, experience);

  if (!process.env.GEMINI_API_KEY) {
    // High quality offline fallback tailored to the selected domain and role
    return {
      ragContext,
      questions: getFallbackQuestions(role, experience, domain),
    };
  }

  try {
    const ai = getAIClient();

    const systemPrompt = `You are an expert AI Interview Trainer with 10+ years of experience conducting technical and behavioral interviews at top tech companies.
CANDIDATE PROFILE:
- Target Role: ${role}
- Experience Level: ${experience}
- Domain: ${domain}
${targetCompany ? `- Target Company: ${targetCompany}` : ""}
${customNotes ? `- Focus Areas / Notes: ${customNotes}` : ""}

KNOWLEDGE BASE CONTEXT (RAG Grounding):
${ragContext}

INSTRUCTIONS:
Generate exactly 5 targeted interview questions customized to this candidate profile:
- Questions 1, 2, 3: Technical questions assessing core domain knowledge, coding concepts, system fundamentals, and problem-solving appropriate for the ${experience} level.
- Question 4: Behavioral question requiring the STAR format (Situation, Task, Action, Result).
- Question 5: Situational or HR question assessing culture fit, communication, or handling difficult scenarios.

For each question, specify what key points/signals the interviewer is looking for in a strong candidate answer.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: "Generate the 5 tailored interview questions for this candidate now.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  category: {
                    type: Type.STRING,
                    enum: ["Technical", "Behavioral", "Situational", "HR"],
                  },
                  question: { type: Type.STRING },
                  interviewerCriteria: {
                    type: Type.STRING,
                    description: "2-3 key evaluation points the interviewer expects",
                  },
                },
                required: ["number", "category", "question", "interviewerCriteria"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return {
        questions: parsed.questions,
        ragContext,
      };
    }

    return {
      ragContext,
      questions: getFallbackQuestions(role, experience, domain),
    };
  } catch (error) {
    console.error("Gemini question generation error:", error);
    return {
      ragContext,
      questions: getFallbackQuestions(role, experience, domain),
    };
  }
}

/**
 * Real-time Answer Evaluation:
 * Evaluates candidate answer, scores out of 10, highlights strengths & gaps, and provides an improved STAR model answer.
 */
export async function evaluateCandidateAnswer(
  role: string,
  experience: string,
  domain: string,
  question: string,
  interviewerCriteria: string,
  category: string,
  userAnswer: string,
  conversationHistory: { role: string; text: string }[]
): Promise<EvaluationResponse> {
  const ragContext = retrieveRAGContext(role, domain, experience);

  if (!process.env.GEMINI_API_KEY) {
    return generateFallbackEvaluation(userAnswer, question, category);
  }

  try {
    const ai = getAIClient();

    const historyBlock = conversationHistory
      .slice(-4)
      .map((h) => `${h.role === "user" ? "Candidate" : "Interviewer"}: ${h.text}`)
      .join("\n");

    const systemPrompt = `You are an expert AI Interview Trainer evaluating a candidate's answer in real time.
ROLE: ${role} | LEVEL: ${experience} | DOMAIN: ${domain}
QUESTION ASKED (${category}): "${question}"
CRITERIA / WHAT INTERVIEWER WANTS: ${interviewerCriteria}

KNOWLEDGE BASE CONTEXT (RAG):
${ragContext}

PREVIOUS CONVERSATION CONTEXT:
${historyBlock || "First question in session."}

INSTRUCTIONS:
1. Score the answer strictly and fairly from 1 to 10 based on depth, correctness, structure, and communication.
2. Provide 2-3 specific Strengths (what the candidate explained well or correctly).
3. Provide 2-3 specific Gaps / What Was Missing (omitted nuances, missing metrics, lack of STAR format, edge cases, performance considerations).
4. Provide a structured "Improved Answer" (4-5 sentences, clear and professional, adhering to STAR format if behavioral).
5. Extract key technical or domain concepts mentioned.
6. Suggest a follow-up question to probe deeper.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `CANDIDATE'S ANSWER:\n"${userAnswer}"\n\nPlease evaluate this response thoroughly.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Integer score from 1 to 10",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 specific strengths",
            },
            missingGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 2-3 missing points or areas for improvement",
            },
            improvedAnswer: {
              type: Type.STRING,
              description: "Polished model answer (STAR format if behavioral)",
            },
            keyConceptsIdentified: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            suggestedFollowUp: {
              type: Type.STRING,
            },
          },
          required: ["score", "strengths", "missingGaps", "improvedAnswer"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      score: typeof parsed.score === "number" ? Math.min(10, Math.max(1, Math.round(parsed.score))) : 7,
      strengths: parsed.strengths || ["Provided relevant direct response to the core question."],
      missingGaps: parsed.missingGaps || ["Could include more specific real-world examples and trade-offs."],
      improvedAnswer: parsed.improvedAnswer || "A well-rounded answer clearly defines key principles, provides practical use cases, and notes trade-offs.",
      keyConceptsIdentified: parsed.keyConceptsIdentified || [],
      suggestedFollowUp: parsed.suggestedFollowUp,
    };
  } catch (error) {
    console.error("Gemini answer evaluation error:", error);
    return generateFallbackEvaluation(userAnswer, question, category);
  }
}

function getFallbackQuestions(role: string, experience: string, domain: string): GeneratedQuestion[] {
  const isData = domain.toLowerCase().includes("data") || role.toLowerCase().includes("data");
  const isFrontend = domain.toLowerCase().includes("frontend") || role.toLowerCase().includes("react");

  if (isData) {
    return [
      {
        number: 1,
        category: "Technical",
        question: "What is the difference between supervised and unsupervised machine learning, and how do you handle missing values in a dataset?",
        interviewerCriteria: "Labeling requirements, classification vs clustering examples, imputation strategies (mean/median/KNN/dropping).",
      },
      {
        number: 2,
        category: "Technical",
        question: "Explain the differences between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with SQL query scenarios.",
        interviewerCriteria: "Set theory concepts, handling NULLs in unmatched records, query performance on large tables.",
      },
      {
        number: 3,
        category: "Technical",
        question: "How do mean, median, and mode behave in skewed distributions, and why is normalization necessary for distance-based models?",
        interviewerCriteria: "Sensitivity to outliers, Min-Max scaling vs Z-score standardization, KNN / SVM distance metric impacts.",
      },
      {
        number: 4,
        category: "Behavioral",
        question: "Tell me about a data project where your initial model had poor accuracy. How did you diagnose and fix the issue using the STAR method?",
        interviewerCriteria: "Situation, Task, Action (feature engineering, hyperparameter tuning, validation), quantifiable Result.",
      },
      {
        number: 5,
        category: "Situational",
        question: "If a business stakeholder asks for a quick insight that conflicts with statistical best practices, how would you communicate the risks?",
        interviewerCriteria: "Stakeholder management, clear business communication without jargon, proposing valid alternatives.",
      },
    ];
  }

  if (isFrontend) {
    return [
      {
        number: 1,
        category: "Technical",
        question: "What is the difference between == and === in JavaScript, and how does the event loop handle asynchronous tasks?",
        interviewerCriteria: "Type coercion mechanisms, Call Stack, Web APIs, Microtask queue vs Callback/Macrotask queue.",
      },
      {
        number: 2,
        category: "Technical",
        question: "Explain how React's Virtual DOM works and what causes unnecessary re-renders in component trees.",
        interviewerCriteria: "Reconciliation algorithm, diffing, key prop significance, memoization (useMemo, useCallback).",
      },
      {
        number: 3,
        category: "Technical",
        question: "How do you optimize web application performance (Core Web Vitals, code splitting, asset loading)?",
        interviewerCriteria: "LCP/FID/CLS metrics, lazy loading, tree shaking, caching strategies.",
      },
      {
        number: 4,
        category: "Behavioral",
        question: "Describe a challenging UI bug or design discrepancy you had to resolve before a deadline. Structure your answer using the STAR format.",
        interviewerCriteria: "Situation context, Task ownership, Action taken to debug across browsers/devices, quantifiable Result.",
      },
      {
        number: 5,
        category: "HR",
        question: "Why are you interested in this frontend role and how do you stay updated with rapidly evolving modern web ecosystems?",
        interviewerCriteria: "Passion for UI/UX craftsmanship, learning routine (blogs, GitHub, RFCs), teamwork and collaboration.",
      },
    ];
  }

  return [
    {
      number: 1,
      category: "Technical",
      question: `What are the core differences between a Stack and a Queue in data structures, and in what scenarios would you choose each?`,
      interviewerCriteria: "LIFO vs FIFO principles, push/pop and enqueue/dequeue time complexities O(1), practical applications (call stack, undo buffers, job schedulers).",
    },
    {
      number: 2,
      category: "Technical",
      question: "Explain the four pillars of Object-Oriented Programming (OOP) with practical backend architecture examples.",
      interviewerCriteria: "Encapsulation, Inheritance, Polymorphism, Abstraction with clean design rationale.",
    },
    {
      number: 3,
      category: "Technical",
      question: "How does a REST API maintain statelessness, and what are the key differences between PUT and PATCH HTTP methods?",
      interviewerCriteria: "Stateless client-server architecture, idempotency rules, full resource replacement vs partial update.",
    },
    {
      number: 4,
      category: "Behavioral",
      question: "Describe a time when you faced a difficult technical roadblock during a project. Use the STAR (Situation, Task, Action, Result) format.",
      interviewerCriteria: "Clear STAR breakdown: technical hurdle, systematic debugging/research steps, measurable outcome or metric achieved.",
    },
    {
      number: 5,
      category: "HR",
      question: "How do you prioritize multiple conflicting deadlines when working in an agile software development team?",
      interviewerCriteria: "Impact vs urgency matrix, proactive stakeholder communication, breaking down tasks into deliverable milestones.",
    },
  ];
}

function generateFallbackEvaluation(userAnswer: string, question: string, category: string): EvaluationResponse {
  const wordCount = userAnswer.trim().split(/\s+/).length;
  let score = 7;
  if (wordCount < 10) score = 4;
  else if (wordCount < 25) score = 6;
  else if (wordCount > 50) score = 8;

  const strengths = [
    "Addressed the core subject of the question directly.",
    "Demonstrated foundational familiarity with the underlying concepts.",
  ];

  const missingGaps = [
    "Could provide concrete real-world use cases or system trade-offs.",
    category === "Behavioral"
      ? "Ensure all 4 components of the STAR format (Situation, Task, Action, Result) with measurable metrics are stated."
      : "Could mention edge cases, time/space complexity or performance implications.",
  ];

  const improvedAnswer =
    category === "Behavioral"
      ? "In my previous project (Situation), our API latency spiked by 40% under high load (Task). I profiled the database queries, identified missing compound indexes, and implemented a Redis caching layer (Action). This reduced response time from 350ms to 45ms and allowed the service to scale smoothly (Result)."
      : `To answer comprehensively: First, clearly define the concept and its fundamental mechanism. Next, contrast the trade-offs (such as time/space complexity or security implications). Finally, give a practical real-world production example to demonstrate hands-on experience.`;

  return {
    score,
    strengths,
    missingGaps,
    improvedAnswer,
    keyConceptsIdentified: ["Core architecture", "Problem-solving"],
    suggestedFollowUp: "Can you elaborate on how you would test or monitor this in production?",
  };
}
