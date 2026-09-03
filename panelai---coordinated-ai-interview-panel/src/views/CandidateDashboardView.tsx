import React from "react";
import { CandidateProfile, JobConfig } from "../types/interview";
import { DEMO_JOBS } from "../lib/demoData";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Award,
  Clock,
  CheckCircle2,
  TrendingUp,
  User,
  Mic,
} from "lucide-react";

interface CandidateDashboardViewProps {
  candidate: CandidateProfile;
  onStartInterview: (job: JobConfig) => void;
  onNavigate: (view: string) => void;
}

export const CandidateDashboardView: React.FC<CandidateDashboardViewProps> = ({
  candidate,
  onStartInterview,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-blue-950/30 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Welcome back, {candidate.name}
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl">
              Your profile is matched for <strong className="text-zinc-200">{candidate.targetRole}</strong>. Enter a live interview session with the coordinated AI panel.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("candidate-resume")}
              className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Update Resume</span>
            </button>
            <button
              onClick={() => onStartInterview(DEMO_JOBS[0])}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:brightness-110 transition active:scale-95 cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              <span>Start Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Competency Overview (Requirement #8: Technical 82%, Product 74%, Communication 88%, Leadership 69%) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-300">Technical Depth</span>
            <span className="font-mono font-bold text-blue-400 text-sm">82%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "82%" }} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">High architectural & system reasoning</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-300">Product Thinking</span>
            <span className="font-mono font-bold text-purple-400 text-sm">74%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: "74%" }} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Growing customer outcome attribution</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-300">Communication</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">88%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Concise, composed & articulate</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-300">Leadership & Ownership</span>
            <span className="font-mono font-bold text-amber-400 text-sm">69%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: "69%" }} />
          </div>
          <p className="mt-2 text-[11px] text-zinc-400">Active ownership clarification needed</p>
        </div>
      </div>

      {/* Available Interviews & Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Open Interviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Upcoming / Available Positions</h2>
            <span className="text-xs text-zinc-400">{DEMO_JOBS.length} positions ready</span>
          </div>

          <div className="space-y-3">
            {DEMO_JOBS.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm hover:border-zinc-700 transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-zinc-100">{job.title}</h3>
                      <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                        {job.experienceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{job.department} &bull; {job.durationMinutes} mins &bull; Difficulty Level {job.difficulty}/5</p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requiredSkills.map((s, idx) => (
                        <span key={idx} className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartInterview(job)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition shrink-0 cursor-pointer"
                  >
                    <span>Interview Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Status & Recent Assessment summary */}
        <div className="space-y-6">
          {/* Profile completeness card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-3">Profile Completeness</h3>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span>Verified Context</span>
              <span className="font-mono text-emerald-400 font-bold">95%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "95%" }} />
            </div>
            <ul className="mt-4 space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Resume parsed & normalized</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Systems & projects indexed</span>
              </li>
              <li className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Microphone audio permissions verified</span>
              </li>
            </ul>
          </div>

          {/* Recent Assessment Link */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-white mb-2">Recent Assessment</h3>
            <p className="text-xs text-zinc-400">Completed 24m interview for Senior Distributed Systems Engineer.</p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-zinc-900/60 p-3 border border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-zinc-200">Overall Score</span>
                <p className="text-[10px] text-zinc-400">Recommendation: Hire</p>
              </div>
              <span className="text-lg font-bold font-mono text-blue-400">82 / 100</span>
            </div>
            <button
              onClick={() => onNavigate("assessment-report")}
              className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 py-2 text-xs font-semibold text-zinc-300 transition text-center cursor-pointer"
            >
              View Full Assessment Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
