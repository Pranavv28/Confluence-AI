import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { agoraService } from "./src/lib/agora/agoraService";
import { runModeratorOrchestration } from "./src/lib/moderatorEngine";
import { generateAssessmentReport } from "./src/lib/assessmentEngine";
import { parseResumeText } from "./src/lib/resumeParser";
import { DEMO_CANDIDATE, DEMO_JOBS, DEMO_PRECOMPLETED_ASSESSMENT } from "./src/lib/demoData";
import {
  AssessmentReport,
  CandidateProfile,
  EvidenceItem,
  InterviewTurn,
  JobConfig,
  TypedEvent,
} from "./src/types/interview";

dotenv.config();

// -------------------------------------------------------------
// Server Runtime Configuration & Environment Dependencies
// Direct references to process.env ensure Google AI Studio detects
// these variables as actual runtime dependencies in the Secrets panel.
// -------------------------------------------------------------
export const SERVER_RUNTIME_CONFIG = {
  // Required credentials for Agora Conversational AI & WebRTC
  NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID,
  NEXT_AGORA_APP_CERTIFICATE: process.env.NEXT_AGORA_APP_CERTIFICATE,
  AGORA_CUSTOMER_ID: process.env.AGORA_CUSTOMER_ID,
  AGORA_CUSTOMER_SECRET: process.env.AGORA_CUSTOMER_SECRET,

  // Server-side AI logic credential
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  // Agent configuration defaults
  NEXT_PUBLIC_AGENT_UID: process.env.NEXT_PUBLIC_AGENT_UID || "333",
  NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE || "false",
  NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || "false",
};

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory store for sessions, jobs, and reports (with database fallback support)
interface InterviewSession {
  id: string;
  candidateProfile: CandidateProfile;
  jobConfig: JobConfig;
  status: string;
  currentInterviewer: string;
  currentDifficulty: number;
  turns: InterviewTurn[];
  evidence: EvidenceItem[];
  events: TypedEvent[];
  startedAt: string;
  endedAt?: string;
  assessment?: AssessmentReport;
}

const sessions = new Map<string, InterviewSession>();
const jobsList: JobConfig[] = [...DEMO_JOBS];

// Pre-seed demo session for instant review
sessions.set("sess_demo_live_01", {
  id: "sess_demo_live_01",
  candidateProfile: DEMO_CANDIDATE,
  jobConfig: DEMO_JOBS[0],
  status: "COMPLETED",
  currentInterviewer: "technical",
  currentDifficulty: 3,
  turns: [
    {
      id: "turn_1",
      interviewId: "sess_demo_live_01",
      speaker: "interviewer",
      role: "technical",
      interviewerName: "Dr. Marcus Vance",
      text: "Welcome Alex. To start off, walk me through a distributed architecture you designed that had stringent latency requirements.",
      timestamp: "10:41:02",
      secondsOffset: 15,
    },
    {
      id: "turn_2",
      interviewId: "sess_demo_live_01",
      speaker: "candidate",
      text: "At Aura Payments, I re-architected our transaction settlement pipeline. We used a multi-tier Redis cluster with CDC invalidation from PostgreSQL over Kafka. This brought our p99 response time down from 140ms to under 28ms while processing 35,000 requests per second.",
      timestamp: "10:41:45",
      secondsOffset: 58,
    },
    {
      id: "turn_3",
      interviewId: "sess_demo_live_01",
      speaker: "interviewer",
      role: "product",
      interviewerName: "Elena Rostova",
      text: "You explained the latency reduction very cleanly, Alex. From a product perspective, how did that technical improvement actually translate into customer experience, retention, or business metrics?",
      timestamp: "10:42:30",
      secondsOffset: 105,
    },
  ],
  evidence: DEMO_PRECOMPLETED_ASSESSMENT.evidenceList,
  events: [],
  startedAt: new Date(Date.now() - 3600000).toISOString(),
  endedAt: new Date(Date.now() - 2100000).toISOString(),
  assessment: DEMO_PRECOMPLETED_ASSESSMENT,
});

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

app.get("/api/health", (req, res) => {
  const agoraConfigured = Boolean(
    process.env.NEXT_PUBLIC_AGORA_APP_ID &&
    process.env.NEXT_AGORA_APP_CERTIFICATE &&
    process.env.AGORA_CUSTOMER_ID &&
    process.env.AGORA_CUSTOMER_SECRET
  );

  const missingAgoraKeys: string[] = [];
  if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) missingAgoraKeys.push("NEXT_PUBLIC_AGORA_APP_ID");
  if (!process.env.NEXT_AGORA_APP_CERTIFICATE) missingAgoraKeys.push("NEXT_AGORA_APP_CERTIFICATE");
  if (!process.env.AGORA_CUSTOMER_ID) missingAgoraKeys.push("AGORA_CUSTOMER_ID");
  if (!process.env.AGORA_CUSTOMER_SECRET) missingAgoraKeys.push("AGORA_CUSTOMER_SECRET");

  res.json({
    status: "ok",
    agoraConfigured,
    agoraDetails: {
      NEXT_PUBLIC_AGORA_APP_ID: Boolean(process.env.NEXT_PUBLIC_AGORA_APP_ID),
      NEXT_AGORA_APP_CERTIFICATE: Boolean(process.env.NEXT_AGORA_APP_CERTIFICATE),
      AGORA_CUSTOMER_ID: Boolean(process.env.AGORA_CUSTOMER_ID),
      AGORA_CUSTOMER_SECRET: Boolean(process.env.AGORA_CUSTOMER_SECRET),
      NEXT_PUBLIC_AGENT_UID: process.env.NEXT_PUBLIC_AGENT_UID ? Number(process.env.NEXT_PUBLIC_AGENT_UID) : 333,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
    },
    missingAgoraKeys,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

/**
 * Explicit Agora runtime status verification (safe, non-leaking)
 */
app.get("/api/agora/config-status", (req, res) => {
  const missingRequired: string[] = [];
  if (!process.env.NEXT_PUBLIC_AGORA_APP_ID) missingRequired.push("NEXT_PUBLIC_AGORA_APP_ID");
  if (!process.env.NEXT_AGORA_APP_CERTIFICATE) missingRequired.push("NEXT_AGORA_APP_CERTIFICATE");
  if (!process.env.AGORA_CUSTOMER_ID) missingRequired.push("AGORA_CUSTOMER_ID");
  if (!process.env.AGORA_CUSTOMER_SECRET) missingRequired.push("AGORA_CUSTOMER_SECRET");

  res.json({
    isConfigured: missingRequired.length === 0,
    missingRequired,
    details: {
      NEXT_PUBLIC_AGORA_APP_ID: Boolean(process.env.NEXT_PUBLIC_AGORA_APP_ID),
      NEXT_AGORA_APP_CERTIFICATE: Boolean(process.env.NEXT_AGORA_APP_CERTIFICATE),
      AGORA_CUSTOMER_ID: Boolean(process.env.AGORA_CUSTOMER_ID),
      AGORA_CUSTOMER_SECRET: Boolean(process.env.AGORA_CUSTOMER_SECRET),
      GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
      NEXT_PUBLIC_AGENT_UID: process.env.NEXT_PUBLIC_AGENT_UID ? Number(process.env.NEXT_PUBLIC_AGENT_UID) : 333,
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE === "true",
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
    },
  });
});

/**
 * Agora Token generation
 */
app.post("/api/agora/token", (req, res) => {
  try {
    const { channelName, uid, role } = req.body;
    if (!channelName || uid === undefined) {
      return res.status(400).json({ error: "channelName and uid are required" });
    }

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || agoraService.appId;
    const tokenData = agoraService.generateRtcToken({
      channelName: String(channelName),
      uid: Number(uid),
      role: role || "publisher",
    });

    res.json({ success: true, ...tokenData, appId: appId || tokenData.appId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Agora Conversational AI Agent Invitation
 */
app.post("/api/agora/invite-agent", async (req, res) => {
  try {
    const { channelName, agentUid, candidateUid, activePersonaName, systemPrompt, firstQuestion } = req.body;

    const targetAgentUid = Number(
      agentUid || process.env.NEXT_PUBLIC_AGENT_UID || agoraService.agentUid || 333
    );

    const result = await agoraService.inviteConversationalAgent({
      channelName: String(channelName || `panelai_${Date.now()}`),
      agentUid: targetAgentUid,
      candidateUid: Number(candidateUid || 1001),
      activePersonaName: String(activePersonaName || "Marcus"),
      systemPrompt: String(systemPrompt || ""),
      firstQuestion: String(firstQuestion || "Hello! Let us begin our panel interview."),
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Stop Agora Agent
 */
app.post("/api/agora/stop-agent", async (req, res) => {
  try {
    const { channelName, agentId } = req.body;
    const result = await agoraService.stopConversationalAgent(String(channelName), String(agentId));
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Real Resume Processing Endpoint
 */
app.post("/api/resume/process", async (req, res) => {
  try {
    const { text, fileName } = req.body;
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return res.status(400).json({ error: "Please provide valid resume text or document content." });
    }

    const fallbackCandidateName = fileName
      ? fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ")
      : "";
    const parsedProfile = await parseResumeText(text, fallbackCandidateName);
    res.json({ success: true, profile: parsedProfile });
  } catch (err: any) {
    console.error("Resume processing error:", err);
    res.status(500).json({ error: err.message || "Failed to process resume." });
  }
});

/**
 * PDF Resume Upload Endpoint — passes raw PDF bytes directly to Gemini
 * Gemini natively understands PDF documents — no text extraction library needed.
 * Client sends Content-Type: application/pdf, body: raw PDF ArrayBuffer
 * Optional header x-file-name: filename for fallback name extraction
 */
app.post(
  "/api/resume/upload",
  express.raw({ type: "application/pdf", limit: "10mb" }),
  async (req, res) => {
    try {
      if (!req.body || !Buffer.isBuffer(req.body) || req.body.length < 100) {
        return res.status(400).json({ error: "No valid PDF data received. Please upload a real PDF file." });
      }

      const fileName = (req.headers["x-file-name"] as string) || "resume.pdf";

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "GEMINI_API_KEY is not configured. Please set it in your .env file to enable PDF parsing.",
        });
      }

      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const pdfBase64 = req.body.toString("base64");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                text: "Extract the complete candidate profile from this resume PDF into structured JSON. Include all experience, skills, education, projects, and achievements. Only extract what is actually in the document — do not hallucinate details.",
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              targetRole: { type: Type.STRING },
              yearsOfExperience: { type: Type.NUMBER },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
              domains: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    degree: { type: Type.STRING },
                    institution: { type: Type.STRING },
                    year: { type: Type.NUMBER },
                  },
                  required: ["degree", "institution"],
                },
              },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    role: { type: Type.STRING },
                    company: { type: Type.STRING },
                    period: { type: Type.STRING },
                    highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["role", "company"],
                },
              },
              projects: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["name"],
                },
              },
              achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["name", "targetRole", "skills"],
          },
        },
      });

      if (!response.text) {
        throw new Error("Gemini returned an empty response for the uploaded PDF.");
      }

      const parsed = JSON.parse(response.text);
      if (!parsed.name || !parsed.targetRole) {
        throw new Error("Could not extract a valid candidate profile from this PDF. Please ensure it is a readable resume.");
      }

      const profile = {
        id: `cand_${Date.now()}`,
        name: parsed.name,
        email: parsed.email || `${parsed.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`,
        targetRole: parsed.targetRole,
        yearsOfExperience: Number(parsed.yearsOfExperience) || 4,
        skills: Array.isArray(parsed.skills) && parsed.skills.length > 0 ? parsed.skills : ["Software Engineering"],
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        domains: Array.isArray(parsed.domains) ? parsed.domains : ["Software Engineering"],
        education: Array.isArray(parsed.education) ? parsed.education : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
        certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      };

      res.json({ success: true, profile });
    } catch (err: any) {
      console.error("PDF upload/parsing error:", err);
      res.status(500).json({ error: err.message || "Failed to parse the uploaded PDF." });
    }
  }
);

/**
 * Create Interview Session
 */
app.post("/api/interview/create", (req, res) => {
  try {
    const { candidateProfile, jobId } = req.body;
    const job = jobsList.find((j) => j.id === jobId) || jobsList[0];
    const candidate = candidateProfile || DEMO_CANDIDATE;

    const sessionId = `sess_${Date.now()}`;
    const initialQuestion =
      candidate.projects && candidate.projects.length > 0 && candidate.projects[0].name
        ? `Welcome ${candidate.name}. I'm Dr. Marcus Vance, leading technical evaluation today alongside our product and engineering panel. I noticed in your background that you worked on ${candidate.projects[0].name}. To get started, could you walk me through the core architecture and the key scalability constraints you had to manage?`
        : `Welcome ${candidate.name}. I'm Dr. Marcus Vance, leading technical evaluation today alongside our product and engineering panel. To get started, could you walk me through a distributed architecture or system you've designed that had complex scalability constraints?`;

    const newSession: InterviewSession = {
      id: sessionId,
      candidateProfile: candidate,
      jobConfig: job,
      status: "PREPARING",
      currentInterviewer: "technical",
      currentDifficulty: job.difficulty || 3,
      turns: [
        {
          id: `turn_${Date.now()}`,
          interviewId: sessionId,
          speaker: "interviewer",
          role: "technical",
          interviewerName: "Dr. Marcus Vance",
          text: initialQuestion,
          timestamp: new Date().toTimeString().split(" ")[0],
          secondsOffset: 5,
        },
      ],
      evidence: [],
      events: [],
      startedAt: new Date().toISOString(),
    };

    sessions.set(sessionId, newSession);
    res.json({ success: true, session: newSession });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Interview Session
 */
app.get("/api/interview/:id", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Interview session not found" });
  }
  res.json({ session });
});

/**
 * Record Event or Turn in Interview Session
 */
app.post("/api/interview/:id/event", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const { event, turn } = req.body;

  if (event) {
    session.events.push(event);
  }

  if (turn) {
    session.turns.push(turn);
  }

  res.json({ success: true, turnCount: session.turns.length, eventCount: session.events.length });
});

/**
 * Core Multi-Agent Moderator Turn Endpoint
 */
app.post("/api/interview/:id/moderator-turn", async (req, res) => {
  try {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    const { candidateAnswer, secondsOffset = 0 } = req.body;

    if (!candidateAnswer) {
      return res.status(400).json({ error: "candidateAnswer is required" });
    }

    // 1. Record Candidate Turn
    const candidateTurn: InterviewTurn = {
      id: `turn_${Date.now()}_cand`,
      interviewId: session.id,
      speaker: "candidate",
      text: candidateAnswer,
      timestamp: new Date().toTimeString().split(" ")[0],
      secondsOffset,
    };
    session.turns.push(candidateTurn);

    // 2. Run Moderator Multi-Agent Decision Engine
    const decision = await runModeratorOrchestration({
      candidateProfile: session.candidateProfile,
      jobConfig: session.jobConfig,
      currentInterviewer: session.currentInterviewer as any,
      currentTurnIndex: session.turns.length,
      transcriptHistory: session.turns,
      latestCandidateAnswer: candidateAnswer,
      previousEvidence: session.evidence,
      currentDifficulty: session.currentDifficulty,
    });

    // 3. Update evidence graph
    if (decision.evidence.length > 0) {
      const newEvidence: EvidenceItem = {
        id: `ev_${Date.now()}`,
        interviewId: session.id,
        competency:
          decision.recommended_interviewer === "technical"
            ? "Technical Depth & System Design"
            : decision.recommended_interviewer === "product"
            ? "Product & Customer Impact"
            : "Communication & Ownership",
        claim: decision.claims[0] || "Candidate articulated engineering claim",
        evidence: decision.evidence[0] || candidateAnswer.slice(0, 140),
        score: decision.competencies?.[decision.recommended_interviewer] || 82,
        transcriptStart: Math.max(0, secondsOffset - 30),
        transcriptEnd: secondsOffset,
        confidence: decision.confidence,
        vaguenessScore: decision.vagueness,
        isContradiction: decision.contradictions.length > 0,
      };
      session.evidence.push(newEvidence);
    }

    // 4. Update session state
    session.currentInterviewer = decision.recommended_interviewer;
    session.currentDifficulty = Math.max(1, Math.min(5, session.currentDifficulty + decision.difficulty_delta));

    // 5. Generate and record Interviewer Turn
    const interviewerTurn: InterviewTurn = {
      id: `turn_${Date.now()}_agent`,
      interviewId: session.id,
      speaker: "interviewer",
      role: decision.recommended_interviewer,
      text: decision.nextQuestion,
      timestamp: new Date().toTimeString().split(" ")[0],
      secondsOffset: secondsOffset + 5,
    };
    session.turns.push(interviewerTurn);

    res.json({
      success: true,
      decision,
      interviewerTurn,
      candidateTurn,
      currentDifficulty: session.currentDifficulty,
    });
  } catch (err: any) {
    console.error("Error in moderator turn:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Generate Final Assessment Report
 */
app.post("/api/interview/:id/assessment/generate", (req, res) => {
  try {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Interview session not found" });
    }

    const { durationSeconds = 900 } = req.body;

    const report = generateAssessmentReport({
      interviewId: session.id,
      candidateProfile: session.candidateProfile,
      jobConfig: session.jobConfig,
      transcript: session.turns,
      evidenceList: session.evidence,
      durationSeconds: Number(durationSeconds),
    });

    session.assessment = report;
    session.status = "COMPLETED";
    session.endedAt = new Date().toISOString();

    res.json({ success: true, assessment: report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get Assessment Report
 */
app.get("/api/interview/:id/assessment", (req, res) => {
  const session = sessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.assessment) {
    return res.json({ assessment: session.assessment });
  }

  // Generate on the fly
  const report = generateAssessmentReport({
    interviewId: session.id,
    candidateProfile: session.candidateProfile,
    jobConfig: session.jobConfig,
    transcript: session.turns,
    evidenceList: session.evidence,
    durationSeconds: 1200,
  });

  session.assessment = report;
  res.json({ assessment: report });
});

// Note: /api/resume/process is defined above (line ~239) with real Gemini-backed parsing.
// /api/resume/upload is defined above for direct PDF binary uploads.

/**
 * Job Management
 */
app.get("/api/jobs", (req, res) => {
  res.json({ jobs: jobsList });
});

app.post("/api/jobs", (req, res) => {
  try {
    const newJob: JobConfig = {
      id: `job_${Date.now()}`,
      title: req.body.title || "Senior Software Engineer",
      department: req.body.department || "Engineering",
      description: req.body.description || "Exciting role building high-scale distributed systems.",
      requiredSkills: req.body.requiredSkills || ["System Design", "TypeScript", "Go"],
      preferredSkills: req.body.preferredSkills || ["Kubernetes", "Kafka"],
      experienceLevel: req.body.experienceLevel || "Senior",
      durationMinutes: req.body.durationMinutes || 30,
      difficulty: req.body.difficulty || 3,
      competencies: req.body.competencies || [
        "Technical Depth",
        "Product Thinking",
        "Communication",
        "Leadership",
      ],
      panelConfig: req.body.panelConfig || [
        { role: "technical", weight: 40, enabled: true, order: 1 },
        { role: "product", weight: 25, enabled: true, order: 2 },
        { role: "behavioral", weight: 20, enabled: true, order: 3 },
        { role: "hiring_manager", weight: 15, enabled: true, order: 4 },
      ],
    };
    jobsList.push(newJob);
    res.json({ success: true, job: newJob });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/jobs/:id", (req, res) => {
  const job = jobsList.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json({ job });
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for HTML page navigation in dev mode
    app.use("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api/")) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html; charset=utf-8" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PanelAI Server listening on http://0.0.0.0:${PORT}`);

    // Direct runtime verification of environment variables on startup
    const runtimeConfigAudit = {
      NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID ? "LOADED" : "NOT_SET",
      NEXT_AGORA_APP_CERTIFICATE: process.env.NEXT_AGORA_APP_CERTIFICATE ? "LOADED" : "NOT_SET",
      AGORA_CUSTOMER_ID: process.env.AGORA_CUSTOMER_ID ? "LOADED" : "NOT_SET",
      AGORA_CUSTOMER_SECRET: process.env.AGORA_CUSTOMER_SECRET ? "LOADED" : "NOT_SET",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "LOADED" : "NOT_SET",
      NEXT_PUBLIC_AGENT_UID: process.env.NEXT_PUBLIC_AGENT_UID || "333",
      NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE || "false",
      NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE || "false",
    };

    console.log("[Server Startup] Google AI Studio Runtime Dependencies:", runtimeConfigAudit);
  });
}

startServer();
