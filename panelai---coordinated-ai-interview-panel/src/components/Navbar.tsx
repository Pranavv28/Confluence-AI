import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Terminal,
  Play,
  Briefcase,
  User,
  LayoutDashboard,
} from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onStartDemo: () => void;
  isDebugOpen: boolean;
  onToggleDebug: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onStartDemo,
  isDebugOpen,
  onToggleDebug,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0D0D0D]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo - Constructivist Architectural Style */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3.5 text-left transition hover:opacity-90 cursor-pointer group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1A1A] border border-white/15 text-white font-bold font-mono text-sm tracking-tighter group-hover:border-[#FF4D00] transition">
              <span>P.</span>
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#FF4D00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white uppercase">PanelAI</span>
                <span className="rounded bg-[#FF4D00]/15 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-[#FF4D00] border border-[#FF4D00]/30 uppercase">
                  Agora RTC
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">Coordinated AI Studio</p>
            </div>
          </button>

          {/* Navigation Links - Editorial Tracking */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
            <button
              onClick={() => onNavigate("landing")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                currentView === "landing"
                  ? "bg-[#1A1A1A] text-white border-l-2 border-[#FF4D00]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate("candidate-dashboard")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                currentView.startsWith("candidate")
                  ? "bg-[#1A1A1A] text-white border-l-2 border-[#FF4D00]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Candidate
            </button>
            <button
              onClick={() => onNavigate("admin-dashboard")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                currentView.startsWith("admin")
                  ? "bg-[#1A1A1A] text-white border-l-2 border-[#FF4D00]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              HR Admin
            </button>
            <button
              onClick={() => onNavigate("jobs")}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                currentView === "jobs"
                  ? "bg-[#1A1A1A] text-white border-l-2 border-[#FF4D00]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Job Panels
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* AI Disclosure pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[10px] font-mono tracking-wider text-white/70 border border-white/10 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D00] animate-pulse" />
            <span>AI Disclosure Active</span>
          </div>

          {/* Observability / Debug Toggle */}
          <button
            onClick={onToggleDebug}
            title="Toggle Live Observability Panel"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border cursor-pointer ${
              isDebugOpen
                ? "bg-[#FF4D00]/15 border-[#FF4D00]/50 text-[#FF4D00]"
                : "bg-[#141414] border-white/10 text-white/50 hover:text-white hover:border-white/20"
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden sm:inline uppercase text-[10px] tracking-wider">Telemetry</span>
          </button>

          {/* Quick Judge Demo Flow CTA */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-2 rounded-lg bg-[#FF4D00] hover:bg-[#ff5d1a] px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase text-white shadow-lg shadow-[#FF4D00]/20 transition active:scale-95 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Live Panel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
