import React from "react";
import { CandidateProfile, JobConfig } from "../types/interview";
import { DEMO_JOBS } from "../lib/demoData";
import {
  ArrowRight,
  FileText,
  Award,
  CheckCircle2,
  Mic,
  User,
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
  const competencies = [
    { label: "Technical Depth", score: 82, color: "bg-[#1E3A5F]" },
    { label: "Product Thinking", score: 74, color: "bg-slate-500" },
    { label: "Communication", score: 88, color: "bg-emerald-600" },
    { label: "Leadership & Ownership", score: 69, color: "bg-amber-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600">
              <User className="h-3.5 w-3.5 text-stone-400" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
              Welcome back, {candidate.name}
            </h1>
            <p className="text-sm text-stone-600 max-w-xl">
              Your profile is matched for{" "}
              <strong className="text-stone-900">{candidate.targetRole}</strong>.
              Enter a live interview session with the coordinated AI panel.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate("candidate-resume")}
              className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-4 py-2.5 text-xs font-semibold text-stone-700 transition flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Update Resume</span>
            </button>
            <button
              onClick={() => onStartInterview(DEMO_JOBS[0])}
              id="candidate-dashboard-start"
              className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#16304f] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              <span>Start Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Competency Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {competencies.map((comp) => (
          <div
            key={comp.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
              <span className="font-semibold text-stone-700">{comp.label}</span>
              <span className="font-mono font-bold text-stone-900 text-sm">
                {comp.score}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full ${comp.color} rounded-full transition-all`}
                style={{ width: `${comp.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Available Interviews & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Open Interviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Available Positions
            </h2>
            <span className="text-xs text-stone-500">
              {DEMO_JOBS.length} positions ready
            </span>
          </div>

          <div className="space-y-3">
            {DEMO_JOBS.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-300 hover:shadow-sm transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-stone-900">
                        {job.title}
                      </h3>
                      <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {job.experienceLevel}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {job.department} · {job.durationMinutes} mins ·
                      Difficulty {job.difficulty}/5
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requiredSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-stone-50 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartInterview(job)}
                    className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#16304f] px-4 py-2 text-xs font-semibold text-white transition shrink-0 cursor-pointer"
                  >
                    <span>Interview Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Status & Recent Assessment */}
        <div className="space-y-6">
          {/* Profile completeness card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-sm font-bold text-stone-900 mb-3">
              Profile Completeness
            </h3>
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span>Verified Context</span>
              <span className="font-mono text-emerald-600 font-bold">95%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: "95%" }}
              />
            </div>
            <ul className="mt-4 space-y-2 text-xs text-stone-600">
              {[
                "Resume parsed & normalized",
                "Systems & projects indexed",
                "Microphone audio permissions verified",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Assessment Link */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-stone-900">
                Recent Assessment
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Completed 24m interview for Senior Distributed Systems Engineer.
            </p>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 p-3">
              <div>
                <span className="text-xs font-semibold text-stone-800">
                  Overall Score
                </span>
                <p className="text-[10px] text-stone-500">
                  Recommendation: Hire
                </p>
              </div>
              <span className="text-lg font-bold font-mono text-[#1E3A5F]">
                82 / 100
              </span>
            </div>
            <button
              onClick={() => onNavigate("assessment-report")}
              className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 py-2 text-xs font-semibold text-stone-700 transition text-center cursor-pointer"
            >
              View Full Assessment Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
