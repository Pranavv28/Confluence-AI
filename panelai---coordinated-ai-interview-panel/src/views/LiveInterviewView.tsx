import React, { useState, useEffect, useRef } from "react";
import {
  CandidateProfile,
  JobConfig,
  InterviewState,
  InterviewerRole,
  InterviewTurn,
  EvidenceItem,
  TypedEvent,
  ModeratorDecision,
} from "../types/interview";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import { VoiceOrb } from "../components/VoiceOrb";
import { InterviewerPanel } from "../components/InterviewerPanel";
import { LiveTranscript } from "../components/LiveTranscript";
import { EvidenceGraphCard } from "../components/EvidenceGraphCard";
import { DebugPanel } from "../components/DebugPanel";
import { AgoraInterviewClient } from "../lib/agora/agoraClient";
import {
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Sparkles,
  RefreshCw,
  Clock,
  Radio,
  Sliders,
  AlertTriangle,
  Play,
} from "lucide-react";

interface LiveInterviewViewProps {
  candidate: CandidateProfile;
  job: JobConfig;
  onFinishInterview: (sessionId: string) => void;
  isDebugOpen: boolean;
  onToggleDebug: () => void;
}

export const LiveInterviewView: React.FC<LiveInterviewViewProps> = ({
  candidate,
  job,
  onFinishInterview,
  isDebugOpen,
  onToggleDebug,
}) => {
  // Session State
  const [sessionId, setSessionId] = useState<string>(`sess_${Date.now()}`);
  const [state, setState] = useState<InterviewState>("PREPARING");
  const [activeRole, setActiveRole] = useState<InterviewerRole>("technical");
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(job.difficulty || 3);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRealAgora, setIsRealAgora] = useState<boolean>(false);

  // Audio & Transcript
  const [candidateVolume, setCandidateVolume] = useState<number>(0);
  const [agentVolume, setAgentVolume] = useState<number>(0);
  const [partialCandidateText, setPartialCandidateText] = useState<string>("");
  const [manualText, setManualText] = useState<string>("");

  // Data collections
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [events, setEvents] = useState<TypedEvent[]>([]);
  const [latestDecision, setLatestDecision] = useState<ModeratorDecision | null>(null);
  const [completedRoles, setCompletedRoles] = useState<InterviewerRole[]>([]);

  // Refs
  const agoraClientRef = useRef<AgoraInterviewClient | null>(null);
  const isSubmittingTurn = useRef<boolean>(false);

  // 1. Initialize Interview Session and Agora Audio Engine
  useEffect(() => {
    let timerInterval: any = null;

    async function initSession() {
      setState("CONNECTING");

      // Initialize API session
      try {
        const res = await fetch("/api/interview/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateProfile: candidate, jobId: job.id }),
        });
        const data = await res.json();
        if (data.session) {
          setSessionId(data.session.id);
          setTurns(data.session.turns || []);
        }
      } catch (err) {
        console.warn("Using local session state:", err);
      }

      // Initialize Agora Client & Web Audio Coordinator
      const agoraClient = new AgoraInterviewClient({
        onCandidateSpeaking: (vol) => {
          setCandidateVolume(vol);
        },
        onAgentSpeaking: (vol) => {
          setAgentVolume(vol);
        },
        onTranscriptPartial: (text) => {
          setPartialCandidateText(text);
          if (state !== "LISTENING" && state !== "INTERRUPTED") {
            setState("LISTENING");
          }
        },
        onTranscriptFinal: (text) => {
          setPartialCandidateText("");
          handleCandidateSpeechFinished(text);
        },
        onInterruption: () => {
          setState("INTERRUPTED");
          recordEvent("candidate_interruption", { text: "Candidate spoke during agent response" });
          setTimeout(() => setState("LISTENING"), 1200);
        },
      });

      agoraClientRef.current = agoraClient;

      // Connect RTC
      const channelName = `panelai_${Date.now()}`;
      const uid = Math.floor(1000 + Math.random() * 9000);

      try {
        const tokenRes = await fetch("/api/agora/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName, uid }),
        });
        const tokenData = await tokenRes.json();

        const connectResult = await agoraClient.connect({
          appId: tokenData.appId || "demo_app_id",
          channelName,
          token: tokenData.token || "demo_token",
          uid,
        });

        setIsRealAgora(connectResult.isRealAgora);
      } catch (e) {
        // Fallback smooth connection
        await agoraClient.connect({
          appId: "demo_app_id",
          channelName,
          token: "demo_token",
          uid,
        });
      }

      // Speak Opening Question from Marcus Vance
      const initialQuestion = `Welcome ${candidate.name}. I'm Dr. Marcus Vance, leading technical evaluation today alongside our product and engineering panel. To get started, could you walk me through a distributed architecture or system you've designed that had complex scalability constraints?`;

      setState("SPEAKING");
      await agoraClient.speakInterviewerQuestion(initialQuestion, "technical");
      setState("LISTENING");

      // Start interview timer
      timerInterval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    initSession();

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      agoraClientRef.current?.disconnect();
    };
  }, []);

  // Helper to record structured events
  const recordEvent = (type: any, data: Record<string, unknown> = {}) => {
    const newEvent: TypedEvent = {
      id: `ev_${Date.now()}`,
      sessionId,
      type,
      timestamp: new Date().toTimeString().split(" ")[0],
      data,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  // 2. Candidate Finishes Speaking -> Trigger Moderator Multi-Agent Orchestration
  const handleCandidateSpeechFinished = async (candidateText: string) => {
    if (!candidateText || isSubmittingTurn.current) return;
    isSubmittingTurn.current = true;

    setState("THINKING");
    recordEvent("QUESTION_GENERATED", { text: candidateText });

    try {
      const res = await fetch(`/api/interview/${sessionId}/moderator-turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateAnswer: candidateText,
          secondsOffset: elapsedSeconds,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update turns
        setTurns((prev) => [...prev, data.candidateTurn, data.interviewerTurn]);

        // Update evidence
        if (data.decision.evidence?.length > 0) {
          const newEv: EvidenceItem = {
            id: `ev_${Date.now()}`,
            interviewId: sessionId,
            competency: data.decision.recommended_interviewer === "technical" ? "Technical Depth" : "Product Thinking",
            claim: data.decision.claims[0] || "Architecture claim",
            evidence: data.decision.evidence[0] || candidateText.slice(0, 100),
            score: 85,
            transcriptStart: Math.max(0, elapsedSeconds - 30),
            transcriptEnd: elapsedSeconds,
            confidence: data.decision.confidence,
            vaguenessScore: data.decision.vagueness,
            isContradiction: data.decision.contradictions?.length > 0,
          };
          setEvidenceList((prev) => [...prev, newEv]);
        }

        // Update moderator state
        setLatestDecision(data.decision);
        setCurrentDifficulty(data.currentDifficulty);

        const nextRole = data.decision.recommended_interviewer as InterviewerRole;

        // Transition animation & switch interviewer
        if (nextRole !== activeRole) {
          setState("SWITCHING_INTERVIEWER");
          setCompletedRoles((prev) => (prev.includes(activeRole) ? prev : [...prev, activeRole]));
          setActiveRole(nextRole);
          agoraClientRef.current?.setActivePersona(nextRole);
          recordEvent("INTERVIEWER_SWITCHING", { from: activeRole, to: nextRole });
          await new Promise((r) => setTimeout(r, 600));
        }

        // Speak the new question in the selected interviewer's voice
        setState("SPEAKING");
        await agoraClientRef.current?.speakInterviewerQuestion(data.interviewerTurn.text, nextRole);
        setState("LISTENING");
      }
    } catch (err) {
      console.error("Error processing candidate turn:", err);
      setState("LISTENING");
    } finally {
      isSubmittingTurn.current = false;
    }
  };

  // Manual text submission (Fallback & quick testing)
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    const textToSend = manualText.trim();
    setManualText("");
    handleCandidateSpeechFinished(textToSend);
  };

  // Quick Preset Answers for Hackathon Judges
  const handleSelectPresetAnswer = (type: "high_quality" | "vague" | "contradiction") => {
    let preset = "";
    if (type === "high_quality") {
      preset =
        "At HighScale, I re-architected our transaction settlement pipeline using a distributed Redis cluster with CDC invalidation from PostgreSQL over Kafka. This reduced p99 latency from 140ms to under 28ms and sustained 35,000 transactions per second without single points of failure.";
    } else if (type === "vague") {
      preset =
        "We basically made the backend super fast and scalable by adding some cloud databases and optimizing stuff with caching. It worked pretty well and everyone on the team was happy.";
    } else if (type === "contradiction") {
      preset =
        "Actually, that entire multi-tier caching pipeline was built entirely by our DevOps lead; I only managed the frontend dashboard tickets.";
    }
    setManualText(preset);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (agoraClientRef.current) {
      const muted = agoraClientRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  // Manual Interruption
  const handleInterrupt = () => {
    agoraClientRef.current?.handleCandidateInterruption();
    setState("INTERRUPTED");
    setTimeout(() => setState("LISTENING"), 1000);
  };

  // End Interview & View Assessment
  const handleEndInterview = async () => {
    agoraClientRef.current?.disconnect();
    try {
      await fetch(`/api/interview/${sessionId}/assessment/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds: elapsedSeconds }),
      });
    } catch (err) {
      console.warn("Local assessment fallback:", err);
    }
    onFinishInterview(sessionId);
  };

  // Format Elapsed Time
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Top Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Coordinated Panel Session
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 pl-4 border-l border-zinc-800">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-mono text-zinc-200 font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-zinc-800 text-xs">
            <span className="text-zinc-400">Dynamic Difficulty:</span>
            <span className="rounded bg-blue-500/10 px-2 py-0.5 text-blue-400 font-bold font-mono border border-blue-500/20">
              Level {currentDifficulty} / 5
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDebug}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-mono text-zinc-300 hover:bg-zinc-800 cursor-pointer"
          >
            <Radio className="h-3.5 w-3.5 text-blue-400" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          <button
            onClick={handleEndInterview}
            className="flex items-center gap-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span>End Interview &amp; Generate Report</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        {/* Left Column: Interviewer Panel & Evidence Card (3 cols) */}
        <div className="lg:col-span-3 space-y-4 order-2 lg:order-1">
          <InterviewerPanel
            activeRole={activeRole}
            isAgentSpeaking={state === "SPEAKING"}
            completedRoles={completedRoles}
          />

          <EvidenceGraphCard
            evidenceList={evidenceList}
            latestVagueness={latestDecision?.vagueness || 0.15}
            hasContradiction={(latestDecision?.contradictions?.length || 0) > 0}
          />
        </div>

        {/* Center Column: Voice Orb & Audio Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-6 backdrop-blur-md min-h-[480px] order-1 lg:order-2">
          {/* Active Interviewer Header */}
          <div className="text-center">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
              Active Questioner
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {INTERVIEWER_PERSONAS[activeRole].name}
            </h2>
            <p className="text-xs text-zinc-400">
              {INTERVIEWER_PERSONAS[activeRole].title} &bull; Focus: {INTERVIEWER_PERSONAS[activeRole].focusAreas[0]}
            </p>
          </div>

          {/* Central Animated Voice Orb */}
          <div className="my-auto py-4">
            <VoiceOrb
              state={state}
              activeRole={activeRole}
              agentVolume={agentVolume}
              candidateVolume={candidateVolume}
              isMuted={isMuted}
              onInterrupt={handleInterrupt}
            />
          </div>

          {/* Audio Controls & Interruption Buttons */}
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleToggleMute}
                className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                  isMuted
                    ? "bg-rose-600 text-white"
                    : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-emerald-400" />}
                <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
              </button>

              {state === "SPEAKING" && (
                <button
                  onClick={handleInterrupt}
                  className="flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Interrupt Interviewer</span>
                </button>
              )}
            </div>

            {/* Quick Demo Preset Answers for Hackathon Judges */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                <span className="font-semibold text-zinc-300">Judge Demonstration Presets:</span>
                <span className="text-[10px] text-blue-400">Click to autofill answer</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSelectPresetAnswer("high_quality")}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 p-2 text-[10px] font-semibold text-zinc-200 text-left transition border border-zinc-700/60 cursor-pointer"
                  title="Simulates technical latency answer -> Triggers Product follow-up from Elena!"
                >
                  1. Deep Tech Answer
                </button>
                <button
                  onClick={() => handleSelectPresetAnswer("vague")}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 p-2 text-[10px] font-semibold text-amber-300 text-left transition border border-zinc-700/60 cursor-pointer"
                  title="Simulates vague answer -> Triggers Marcus to probe for metrics!"
                >
                  2. Vague Answer
                </button>
                <button
                  onClick={() => handleSelectPresetAnswer("contradiction")}
                  className="rounded-lg bg-zinc-800 hover:bg-zinc-700 p-2 text-[10px] font-semibold text-rose-300 text-left transition border border-zinc-700/60 cursor-pointer"
                  title="Simulates contradiction -> Triggers Devon to probe ownership!"
                >
                  3. Contradiction
                </button>
              </div>
            </div>

            {/* Text Input Fallback (for quiet environments or direct input) */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Or type candidate response here..."
                disabled={state === "THINKING"}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!manualText.trim() || state === "THINKING"}
                className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-40 transition cursor-pointer"
              >
                {state === "THINKING" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Transcript (4 cols) */}
        <div className="lg:col-span-4 h-full min-h-[480px] order-3">
          <LiveTranscript
            turns={turns}
            partialCandidateText={partialCandidateText}
            isCandidateSpeaking={candidateVolume > 15}
            isAgentSpeaking={state === "SPEAKING"}
          />
        </div>
      </div>

      {/* Floating Observability Debug Drawer */}
      <DebugPanel
        isOpen={isDebugOpen}
        onClose={onToggleDebug}
        state={state}
        activeRole={activeRole}
        isRealAgora={isRealAgora}
        channelName={`panelai_session`}
        candidateUid={1001}
        events={events}
        latestDecision={latestDecision}
      />
    </div>
  );
};
