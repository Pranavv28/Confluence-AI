import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Target,
  Users,
  Briefcase,
  Layers,
  Activity,
  Mic,
  FileText,
  CheckCircle2,
  Cpu,
  Radio,
} from "lucide-react";
import { INTERVIEWER_PERSONAS } from "../lib/personas";

interface LandingViewProps {
  onStartDemo: () => void;
  onNavigate: (view: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartDemo,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden bg-[#0D0D0D] text-[#E5E5E5]">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Subtle Constructivist Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#FF4D00]/5 blur-[120px] -z-10 pointer-events-none" />

        {/* Top Eyebrow - Artistic Flair Design System */}
        <div className="flex flex-col items-center justify-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#FF4D00] font-semibold font-mono">
            Autonomous Coordinated Studio &mdash; Real-Time Voice
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-mono text-white/70 backdrop-blur-md mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00] animate-ping" />
            <Radio className="h-3 w-3 text-[#FF4D00]" />
            <span className="tracking-wider uppercase">Powered by Agora Conversational AI</span>
          </div>
        </div>

        {/* Monumental Hero Headline (Artistic Flair Constructivist Typography) */}
        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black uppercase tracking-tighter text-white max-w-4xl mx-auto leading-[0.9]">
          Meet Your AI<br />
          <span className="font-editorial italic font-normal lowercase tracking-normal text-[#FF4D00] ml-2">
            interview
          </span>{" "}
          Panel.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-sans">
          One unified room. Multiple synchronized perspectives. Real-time voice questioning that adapts dynamically to what you actually claim.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onStartDemo}
            className="flex items-center gap-3 rounded-lg bg-[#FF4D00] hover:bg-[#ff5d1a] px-8 py-3.5 text-xs font-mono font-bold tracking-widest uppercase text-white shadow-xl shadow-[#FF4D00]/25 transition active:scale-95 cursor-pointer"
          >
            <span>Start Live Session</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => onNavigate("jobs")}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-transparent hover:border-[#FF4D00] hover:text-white px-7 py-3.5 text-xs font-mono tracking-widest uppercase text-white/70 transition cursor-pointer"
          >
            <span>Configure Panel</span>
          </button>
        </div>

        {/* Coordinated Architecture Flow: 4 Monolithic Constructivist Cards */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-[#141414] p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF4D00]">
              01 &mdash; Coordinated Multi-Agent Architecture
            </div>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Bi-Directional RTC Flow
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Step 1 */}
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5 flex flex-col justify-between hover:border-white/20 transition">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-[#FF4D00]">01/04</span>
                  <Mic className="h-4 w-4 text-white/40" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white">1. Candidate Stream</h4>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  Real-time Agora RTC voice stream with zero-latency interruption detection.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5 flex flex-col justify-between hover:border-white/20 transition">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-[#FF4D00]">02/04</span>
                  <Layers className="h-4 w-4 text-white/40" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white">2. Evidence Engine</h4>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  Live extraction of claims, vagueness scoring, contradictions, and system metrics.
                </p>
              </div>
            </div>

            {/* Step 3 - Prominent Vermilion Accent Block */}
            <div className="rounded-xl border-l-4 border-[#FF4D00] border-t border-r border-b border-white/10 bg-[#1A1A1A] p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-[#FF4D00]">03/04</span>
                  <Cpu className="h-4 w-4 text-[#FF4D00]" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white">3. Turn Routing</h4>
                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                  Moderator dynamically assigns the floor to Technical, Product, or Behavioral persona.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-white/10 bg-[#1A1A1A] p-5 flex flex-col justify-between hover:border-white/20 transition">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-[#FF4D00]">04/04</span>
                  <CheckCircle2 className="h-4 w-4 text-white/40" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-tight text-white">4. Synthesis Report</h4>
                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                  Verbatim audio timestamps, multi-perspective scoring, and evidence-grounded verdicts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Innovation: Traditional Bot vs PanelAI Monolith */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF4D00] font-mono mb-2">Contrastive Study</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Why One AI Interviewer Isn't Enough
          </h2>
          <p className="text-sm text-white/50 mt-2">
            Real engineering hiring loops don't ask a rigid list of questions. They challenge different dimensions of the same answer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Legacy generic bot (Dark monolithic card) */}
          <div className="md:col-span-6 rounded-2xl border border-white/10 bg-[#141414] p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Legacy Architecture</span>
                <span className="text-[10px] font-mono text-white/40">01 / SCRIPTED</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-white/70">Single-Prompt Chatbot</h3>
              <div className="w-12 h-px bg-white/20 my-4" />

              <div className="space-y-4 text-xs text-white/50 leading-relaxed">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="font-semibold text-white/70 uppercase text-[11px] tracking-wide">Question 1 &rarr; Answer &rarr; Question 2</p>
                  <p className="mt-1">Moves down a hardcoded list regardless of what the candidate actually said.</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="font-semibold text-white/70 uppercase text-[11px] tracking-wide">Blindly Accepts Vague Answers</p>
                  <p className="mt-1">Candidate says "I made it scalable" and the bot replies "Great! Next question."</p>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <p className="font-semibold text-white/70 uppercase text-[11px] tracking-wide">Single Dimension Only</p>
                  <p className="mt-1">Cannot probe product trade-offs, architecture scale, and behavioral culture simultaneously.</p>
                </div>
              </div>
            </div>
          </div>

          {/* PanelAI (Constructivist High-Contrast Inverted Block from Artistic Flair theme) */}
          <div className="md:col-span-6 rounded-2xl bg-[#E5E5E5] text-[#0D0D0D] p-8 flex flex-col justify-between relative shadow-2xl overflow-hidden">
            <div className="absolute -top-10 -right-6 text-[110px] font-black opacity-5 leading-none pointer-events-none select-none font-mono">
              PANEL
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF4D00] font-bold">PanelAI Construct</span>
                <span className="text-[10px] font-mono text-black/50 font-bold">02 / COORDINATED</span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#0D0D0D]">Multi-Interviewer Panel</h3>
              <div className="w-12 h-px bg-black my-4" />

              <div className="space-y-4 text-xs font-medium leading-relaxed text-black/80">
                <div className="p-3 rounded-lg bg-white/70 border border-black/10">
                  <p className="font-bold text-[#FF4D00] uppercase text-[11px] tracking-wide">Adaptive Turn-Taking &amp; Follow-Ups</p>
                  <p className="mt-1">When candidate explains caching, Elena (Product) pivots to ask how that improved customer conversion rates.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/70 border border-black/10">
                  <p className="font-bold text-[#FF4D00] uppercase text-[11px] tracking-wide">Vagueness &amp; Contradiction Detection</p>
                  <p className="mt-1">Pinpoints unsupported claims and immediately prompts for concrete metrics, team boundaries, and tradeoffs.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/70 border border-black/10">
                  <p className="font-bold text-[#FF4D00] uppercase text-[11px] tracking-wide">Shared Candidate Evidence Graph</p>
                  <p className="mt-1">All 5 interviewers share state, dynamically scaling difficulty (Levels 1 to 5) across the interview.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Interviewer Persona Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#FF4D00] font-mono mb-2">Panel Personas</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            The Interview Panel
          </h2>
          <p className="text-sm text-white/50 mt-2">
            Each interviewer carries distinct evaluation objectives, tone calibration, voice cadence, and specialized rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.values(INTERVIEWER_PERSONAS).map((persona, idx) => (
            <div
              key={persona.id}
              className="rounded-xl border border-white/10 bg-[#141414] p-5 backdrop-blur-md flex flex-col justify-between hover:border-[#FF4D00]/50 transition group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] font-mono text-white/40">0{idx + 1}</span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#FF4D00] border border-[#FF4D00]/30 px-1.5 py-0.5 rounded bg-[#FF4D00]/10">
                    {persona.role}
                  </span>
                </div>

                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="h-14 w-14 rounded-lg object-cover mb-3 border border-white/10 group-hover:border-[#FF4D00] transition"
                  referrerPolicy="no-referrer"
                />
                <h4 className="text-sm font-bold text-white tracking-tight">{persona.name}</h4>
                <p className="text-[11px] text-white/40 font-mono mt-0.5">{persona.title}</p>
                <p className="text-xs text-white/60 mt-3 leading-relaxed line-clamp-3">{persona.objective}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                <span className="text-[#FF4D00]">Focus: </span>
                {persona.focusAreas.slice(0, 2).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resume Context Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-2xl border-l-4 border-[#FF4D00] border-t border-r border-b border-white/10 bg-[#141414] p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#FF4D00] mb-3">
                <FileText className="h-3.5 w-3.5" />
                <span>Resume Grounding</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                Contextualized Questions Rooted in Verified Work
              </h3>
              <p className="mt-4 text-sm text-white/60 leading-relaxed font-sans">
                Upload your candidate resume. PanelAI extracts a structured graph—skills, production architectures, system metrics, and past ownership boundaries.
              </p>
              <ul className="mt-6 space-y-2.5 text-xs text-white/70 font-mono">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00]" />
                  <span>Cross-examines specific architectures listed on resume</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00]" />
                  <span>Separates team achievements from personal technical deliverables</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00]" />
                  <span>Real-time adaptive difficulty scaling based on technical depth</span>
                </li>
              </ul>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => onNavigate("candidate-resume")}
                  className="rounded-lg bg-[#FF4D00] hover:bg-[#ff5d1a] px-6 py-3 text-xs font-mono font-bold tracking-widest uppercase text-white shadow-lg shadow-[#FF4D00]/20 transition cursor-pointer"
                >
                  Upload &amp; Preview Resume
                </button>
              </div>
            </div>

            {/* Simulated Candidate Context Box (Monolithic Noir Code Box) */}
            <div className="rounded-xl border border-white/10 bg-black/80 p-5 font-mono text-xs text-white/70">
              <div className="text-white/40 mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#FF4D00]">// Candidate Evidence Graph</span>
                <span className="text-[10px] text-white/40">Verified State</span>
              </div>
              <pre className="text-white/80 overflow-x-auto text-[11px] leading-relaxed">
{`{
  "name": "Alex Chen",
  "targetRole": "Senior Distributed Systems Engineer",
  "technologies": ["Go", "Kafka", "Redis", "K8s"],
  "verifiedClaims": [
    "Re-architected settlement pipeline to 35k tx/sec",
    "CDC invalidation layer reducing p99 latency by 45%"
  ],
  "competencyScores": {
    "Technical Depth": 88,
    "Product Impact": 71,
    "Communication": 84
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Artistic Flair Editorial Footer with Coordinates & Status */}
      <footer className="mt-auto pt-8 border-t border-white/10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-white/40">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[9px] uppercase tracking-widest opacity-40 block">Coordinates</span>
            <span className="text-xs text-white/70">48.8566 N, 2.3522 E</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-[9px] uppercase tracking-widest opacity-40 block">Audio Engine</span>
            <span className="text-xs text-[#FF4D00]">Agora RTC Sub-400ms</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">PanelAI Studio</span>
          <div className="h-px w-20 bg-white/20 relative">
            <div className="absolute top-0 left-0 h-px w-8 bg-[#FF4D00]" />
          </div>
        </div>
      </footer>
    </div>
  );
};
