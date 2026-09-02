import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateInterviewQuestions, evaluateCandidateAnswer } from "./server/geminiService.js";
import { INITIAL_CORPUS, retrieveRAGContext } from "./server/corpusData.js";

interface SessionStore {
  id: string;
  createdAt: string;
  role: string;
  experience: string;
  domain: string;
  questions: any[];
  currentQuestionIndex: number;
  turns: any[];
  status: "active" | "completed";
  ragContext: string;
  totalScore: number;
  answeredCount: number;
}

const sessions = new Map<string, SessionStore>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      model: "gemini-3.7-flash",
      apiKeyConfigured: !!process.env.GEMINI_API_KEY,
      activeSessions: sessions.size,
    });
  });

  // Get RAG Corpus
  app.get("/api/corpus", (req, res) => {
    const { query, category } = req.query;
    let sections = INITIAL_CORPUS;

    if (category && typeof category === "string" && category !== "All") {
      sections = sections.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (query && typeof query === "string") {
      const q = query.toLowerCase();
      sections = sections
        .map((s) => ({
          ...s,
          items: s.items.filter(
            (item) =>
              item.question.toLowerCase().includes(q) ||
              item.answer.toLowerCase().includes(q) ||
              item.keywords.some((k) => k.toLowerCase().includes(q))
          ),
        }))
        .filter((s) => s.items.length > 0);
    }

    res.json({ sections });
  });

  // Start interview session
  app.post("/api/interview/start", async (req, res) => {
    try {
      const { role = "Software Developer", experience = "Fresher", domain = "Backend", targetCompany, customNotes } = req.body;

      const { questions, ragContext } = await generateInterviewQuestions(
        role,
        experience,
        domain,
        targetCompany,
        customNotes
      );

      const sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

      const formattedQuestions = questions.map((q, idx) => ({
        id: `q_${idx + 1}`,
        number: q.number || idx + 1,
        category: q.category || (idx < 3 ? "Technical" : idx === 3 ? "Behavioral" : "Situational"),
        question: q.question,
        interviewerCriteria: q.interviewerCriteria,
        userAnswer: "",
        evaluation: null,
      }));

      const newSession: SessionStore = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        role,
        experience,
        domain,
        questions: formattedQuestions,
        currentQuestionIndex: 0,
        turns: [
          {
            id: `turn_0`,
            timestamp: new Date().toISOString(),
            role: "assistant",
            content: `Welcome! I'm your AI Interview Trainer. Today we'll conduct a tailored interview session for **${role} (${experience} Level - ${domain})**.\n\nI have generated 5 focused questions (3 Technical, 1 Behavioral, 1 Situational) grounded in our curated interview knowledge base.\n\nLet's begin with Question 1 below:`,
          },
        ],
        status: "active",
        ragContext,
        totalScore: 0,
        answeredCount: 0,
      };

      sessions.set(sessionId, newSession);

      res.json({
        success: true,
        session: newSession,
      });
    } catch (error: any) {
      console.error("Failed to start session:", error);
      res.status(500).json({ error: error.message || "Failed to initialize interview session" });
    }
  });

  // Evaluate candidate response
  app.post("/api/interview/evaluate", async (req, res) => {
    try {
      const { sessionId, userAnswer } = req.body;

      if (!sessionId || !sessions.has(sessionId)) {
        return res.status(404).json({ error: "Interview session not found or expired" });
      }

      if (!userAnswer || !userAnswer.trim()) {
        return res.status(400).json({ error: "Please provide a valid answer to evaluate" });
      }

      const session = sessions.get(sessionId)!;
      const currentIndex = session.currentQuestionIndex;
      const currentQuestion = session.questions[currentIndex];

      if (!currentQuestion) {
        return res.status(400).json({ error: "No active question found to evaluate" });
      }

      // Record candidate's answer turn
      session.turns.push({
        id: `turn_${session.turns.length}`,
        timestamp: new Date().toISOString(),
        role: "user",
        content: userAnswer,
        questionNumber: currentQuestion.number,
      });

      // Evaluate via AI Service
      const historyContext = session.turns.map((t) => ({ role: t.role, text: t.content }));
      const evaluation = await evaluateCandidateAnswer(
        session.role,
        session.experience,
        session.domain,
        currentQuestion.question,
        currentQuestion.interviewerCriteria,
        currentQuestion.category,
        userAnswer,
        historyContext
      );

      // Update question state
      currentQuestion.userAnswer = userAnswer;
      currentQuestion.answeredAt = new Date().toISOString();
      currentQuestion.evaluation = evaluation;

      session.totalScore += evaluation.score;
      session.answeredCount += 1;

      // Add feedback assistant turn
      const nextIndex = currentIndex + 1;
      const hasNext = nextIndex < session.questions.length;

      let trainerTurnText = `📊 **Evaluation for Question ${currentQuestion.number}**\n\n` +
        `✅ **Score:** ${evaluation.score}/10\n\n` +
        `💪 **Strengths:**\n${evaluation.strengths.map((s: string) => `• ${s}`).join("\n")}\n\n` +
        `⚠️ **What Was Missing / Areas to Improve:**\n${evaluation.missingGaps.map((g: string) => `• ${g}`).join("\n")}\n\n` +
        `📝 **Improved Answer (Model Answer):**\n${evaluation.improvedAnswer}`;

      if (hasNext) {
        const nextQ = session.questions[nextIndex];
        session.currentQuestionIndex = nextIndex;
        trainerTurnText += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n▶️ **Next Question (${nextQ.number} of ${session.questions.length}): [${nextQ.category}]**\n${nextQ.question}\n\n💡 *What the interviewer wants:* ${nextQ.interviewerCriteria}`;
      } else {
        session.status = "completed";
        const avgScore = (session.totalScore / session.answeredCount).toFixed(1);
        trainerTurnText += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎉 **Interview Completed!**\n\nYou've finished all 5 questions. Your overall average score is **${avgScore}/10**. Check the full performance breakdown in the Summary tab!`;
      }

      session.turns.push({
        id: `turn_${session.turns.length}`,
        timestamp: new Date().toISOString(),
        role: "assistant",
        content: trainerTurnText,
        evaluation,
      });

      res.json({
        success: true,
        session,
        evaluation,
        isCompleted: session.status === "completed",
      });
    } catch (error: any) {
      console.error("Evaluation error:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate candidate answer" });
    }
  });

  // Get session
  app.get("/api/interview/session/:id", (req, res) => {
    const session = sessions.get(req.params.id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json({ session });
  });

  // Vite middleware or Static files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
