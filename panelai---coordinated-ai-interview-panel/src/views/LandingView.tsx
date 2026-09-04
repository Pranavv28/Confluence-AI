import React from "react";
import {
  ArrowRight,
  Mic,
  FileText,
  CheckCircle2,
  Cpu,
  Layers,
  Users,
  ShieldCheck,
  BarChart3,
  MessageSquare,
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
    <div className="flex flex-col gap-20 pb-20 bg-[#FAFAF9] text-stone-900">
      {/* Hero Section */}
      <section className="relative pt-14 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Coordinated AI Interview Panel
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight tracking-tight">
              Practice interviews with a{" "}
              <span className="text-[#1E3A5F]">real hiring panel</span>, not a
              chatbot.
            </h1>

            <p className="mt-5 text-base text-stone-600 leading-relaxed max-w-xl">
              Five coordinated AI interviewers — technical, product, behavioral,
              and executive — probe your answers simultaneously, adapt to what
              you say, and flag vague claims in real time.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onStartDemo}
                id="hero-start-interview"
                className="flex items-center gap-2.5 rounded-xl bg-[#1E3A5F] hover:bg-[#16304f] px-6 py-3 text-sm font-semibold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Start Live Interview</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate("candidate-resume")}
                className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-5 py-3 text-sm font-medium text-stone-700 transition cursor-pointer"
              >
                <FileText className="h-4 w-4 text-stone-400" />
                Upload Your Resume
              </button>
            </div>

            <div className="mt-8 flex items-center gap-5 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>AI-guided simulation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-emerald-600" />
                <span>Real voice interaction</span>
              </div>
            </div>
          </div>

          {/* Right: Architecture Flow Card */}
          <div className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                How PanelAI Works
              </span>
              <span className="text-xs text-stone-400 font-mono">
                4-step process
              </span>
            </div>

            <div className="space-y-4">
              {[
                {
                  num: "01",
                  icon: <FileText className="h-4 w-4 text-slate-500" />,
                  title: "Resume Upload & Parse",
                  desc: "Gemini extracts your real projects, skills, and experience — no placeholders.",
                },
                {
                  num: "02",
                  icon: <Mic className="h-4 w-4 text-slate-500" />,
                  title: "Live Voice Interview",
                  desc: "Panel interviewers ask you questions by voice and listen to your responses.",
                },
                {
                  num: "03",
                  icon: <Cpu className="h-4 w-4 text-amber-600" />,
                  title: "Adaptive Turn Routing",
                  desc: "Moderator AI coordinates handoffs — technical, product, behavioral, executive.",
                  accent: true,
                },
                {
                  num: "04",
                  icon: <BarChart3 className="h-4 w-4 text-slate-500" />,
                  title: "Evidence-Based Report",
                  desc: "Multi-dimensional scoring with verbatim evidence and vagueness flags.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className={`flex items-start gap-4 p-3.5 rounded-xl border transition ${
                    step.accent
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-stone-50 border-stone-100"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold ${
                      step.accent
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {step.icon}
                      <span className="text-xs font-semibold text-stone-900">
                        {step.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why PanelAI Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A5F] mb-2">
            Why it matters
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            One AI interviewer can't replicate a real hiring panel
          </h2>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed">
            Real engineering hiring loops challenge the same answer from multiple
            angles. PanelAI does the same.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Single bot */}
          <div className="rounded-2xl border border-stone-200 bg-white p-7">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                Typical Chatbot
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-700 mb-4">
              Single-prompt, scripted flow
            </h3>
            <div className="space-y-3">
              {[
                "Moves to the next question regardless of your answer",
                "Accepts \"I made it scalable\" without probing for metrics",
                "Cannot evaluate technical depth and product instinct simultaneously",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-stone-600">
                  <div className="mt-1 h-4 w-4 shrink-0 rounded-full bg-stone-100 flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-stone-400" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PanelAI */}
          <div className="rounded-2xl border border-[#1E3A5F]/20 bg-[#1E3A5F]/5 p-7 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-5">
              <span className="rounded-md bg-[#1E3A5F] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                PanelAI
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-4">
              Coordinated multi-interviewer panel
            </h3>
            <div className="space-y-3">
              {[
                "Adaptive follow-up — Elena (Product) pivots on what Marcus just asked",
                "Vagueness detection flags claims missing metrics or scope boundaries",
                "Shared evidence graph across all 5 interviewers with difficulty scaling",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interviewer Roster */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E3A5F] mb-2">
            Meet your panel
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            Five interviewers. One unified session.
          </h2>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed">
            Each interviewer carries distinct objectives, voice cadence, and
            evaluation rubrics — just like real hiring panels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.values(INTERVIEWER_PERSONAS).map((persona, idx) => (
            <div
              key={persona.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 flex flex-col gap-3 hover:border-slate-300 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={persona.avatar}
                  alt={persona.name}
                  className="h-10 w-10 rounded-full object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-sm font-semibold text-stone-900 leading-tight">
                    {persona.name}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    {persona.title}
                  </p>
                </div>
              </div>

              <span className="self-start rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-600">
                {persona.role.replace("_", " ")}
              </span>

              <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-3 flex-1">
                {persona.objective}
              </p>

              <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                Focus: {persona.focusAreas.slice(0, 2).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resume Grounding */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1E3A5F] mb-4">
                <FileText className="h-4 w-4" />
                <span>Resume Grounding</span>
              </div>
              <h3 className="text-2xl font-bold text-stone-900 leading-tight">
                Questions rooted in your actual background
              </h3>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                Upload your resume as a PDF. Gemini reads the entire document and
                extracts your real projects, technologies, and accomplishments —
                so interviewers ask about what{" "}
                <em>you</em> actually built, not generic scenarios.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-stone-700">
                {[
                  "Cross-examines specific architectures listed on your resume",
                  "Separates team achievements from your personal deliverables",
                  "Adaptive difficulty based on the technical depth you demonstrate",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <button
                  onClick={() => onNavigate("candidate-resume")}
                  id="landing-upload-resume"
                  className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#16304f] px-5 py-2.5 text-sm font-semibold text-white transition cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Upload & Parse Resume
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sample parsed profile display */}
            <div className="rounded-xl border border-stone-200 bg-[#F5F5F4] p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-700">
                    Extracted Candidate Context
                  </span>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  Live
                </span>
              </div>
              <div className="space-y-3 font-mono text-[11px] text-stone-600">
                <div>
                  <span className="text-stone-400">name</span>{" "}
                  <span className="text-stone-900 font-semibold">
                    → Your Real Name
                  </span>
                </div>
                <div>
                  <span className="text-stone-400">targetRole</span>{" "}
                  <span className="text-stone-900 font-semibold">
                    → Extracted from resume
                  </span>
                </div>
                <div>
                  <span className="text-stone-400">technologies</span>{" "}
                  <span className="text-stone-900">
                    → [ your actual stack ]
                  </span>
                </div>
                <div>
                  <span className="text-stone-400">verifiedProjects</span>
                  <div className="ml-4 mt-1 space-y-0.5 text-stone-700">
                    <div>→ your real project names</div>
                    <div>→ your actual impact metrics</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-200 text-stone-400 text-[10px]">
                  Parsed by Gemini 2.5 Flash · PDF native understanding
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="rounded-2xl bg-[#1E3A5F] px-8 py-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Ready to walk into your next interview with confidence?
          </h2>
          <p className="text-sm text-white/70 mt-3 max-w-xl mx-auto leading-relaxed">
            Start a live session now — no signup, no setup. Just your voice and a
            panel of interviewers grounded in your real experience.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onStartDemo}
              id="cta-start-interview"
              className="flex items-center gap-2.5 rounded-xl bg-white hover:bg-stone-50 px-6 py-3 text-sm font-semibold text-[#1E3A5F] shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              Start Interview Now
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("jobs")}
              className="flex items-center gap-2 rounded-xl border border-white/30 bg-transparent hover:bg-white/10 px-5 py-3 text-sm font-medium text-white/80 transition cursor-pointer"
            >
              <Users className="h-4 w-4" />
              Configure Panel Roles
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-400">
        <div className="flex items-center gap-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1E3A5F] text-white font-bold text-xs">
            P
          </div>
          <span className="font-semibold text-stone-700">PanelAI</span>
          <span className="text-stone-300">·</span>
          <span>AI-guided interview simulation</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>AI Disclosure: You are practising with a simulated panel</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
