import React from "react";
import {
  Activity,
  Play,
  Briefcase,
  User,
  LayoutDashboard,
  ShieldCheck,
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
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("landing")}
            className="flex items-center gap-3 text-left transition hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-sm tracking-tight shadow-2xs">
              <span>P</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-stone-900">PanelAI</span>
                <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
                  Interview Studio
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Coordinated AI Panel</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-stone-200">
            <button
              onClick={() => onNavigate("landing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                currentView === "landing"
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onNavigate("candidate-dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentView.startsWith("candidate")
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Candidate Hub
            </button>
            <button
              onClick={() => onNavigate("admin-dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentView.startsWith("admin")
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Evaluator Dashboard
            </button>
            <button
              onClick={() => onNavigate("jobs")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                currentView === "jobs"
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              Job Roles
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* AI Disclosure pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-600 border border-stone-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>AI Guided Simulation</span>
          </div>

          {/* Observability / Debug Toggle */}
          <button
            onClick={onToggleDebug}
            title="Toggle Live Observability Panel"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition border cursor-pointer ${
              isDebugOpen
                ? "bg-blue-50 border-blue-200 text-blue-800"
                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-stone-500" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>

          {/* Live Panel CTA */}
          <button
            onClick={onStartDemo}
            className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-98 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Start Interview</span>
          </button>
        </div>
      </div>
    </header>
  );
};
