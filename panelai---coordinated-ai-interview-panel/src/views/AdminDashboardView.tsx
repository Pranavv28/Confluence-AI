import React from "react";
import { CandidateProfile, JobConfig, AssessmentReport } from "../types/interview";
import { DEMO_JOBS, DEMO_PRECOMPLETED_ASSESSMENT } from "../lib/demoData";
import {
  LayoutDashboard,
  Users,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight,
  Filter,
} from "lucide-react";

interface AdminDashboardViewProps {
  onViewAssessment: (report: AssessmentReport) => void;
  onNavigate: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onViewAssessment,
  onNavigate,
}) => {
  const candidateRows = [
    {
      id: "cand_1",
      name: "Alex Chen",
      role: "Senior Distributed Systems Engineer",
      date: "Today, 10:45 AM",
      score: 82,
      recommendation: "Strong Hire",
      status: "COMPLETED",
      duration: "24 mins",
      vagueness: "12%",
      report: DEMO_PRECOMPLETED_ASSESSMENT,
    },
    {
      id: "cand_2",
      name: "Priya Sharma",
      role: "Full-Stack Engineer (TypeScript)",
      date: "Yesterday, 3:15 PM",
      score: 76,
      recommendation: "Hire",
      status: "COMPLETED",
      duration: "28 mins",
      vagueness: "22%",
      report: {
        ...DEMO_PRECOMPLETED_ASSESSMENT,
        id: "rep_priya",
        candidateName: "Priya Sharma",
        targetRole: "Full-Stack Engineer",
        overallScore: 76,
        hireRecommendation: "Hire",
      },
    },
    {
      id: "cand_3",
      name: "Marcus Brody",
      role: "Staff Infrastructure Architect",
      date: "Aug 29, 2026",
      score: 64,
      recommendation: "Lean Hire",
      status: "COMPLETED",
      duration: "30 mins",
      vagueness: "41%",
      report: {
        ...DEMO_PRECOMPLETED_ASSESSMENT,
        id: "rep_marcus",
        candidateName: "Marcus Brody",
        targetRole: "Staff Infrastructure Architect",
        overallScore: 64,
        hireRecommendation: "Lean Hire",
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Talent Acquisition &amp; Hiring Panel Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">HR Admin &amp; Hiring Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Review objective, multi-perspective interview syntheses with verbatim candidate citations.
          </p>
        </div>

        <button
          onClick={() => onNavigate("jobs")}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
        >
          <Briefcase className="h-4 w-4" />
          <span>Manage Job Panels</span>
        </button>
      </div>

      {/* Aggregate Metrics (Requirement #17) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Completed Interviews</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">28</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>+14% vs previous cohort</span>
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Average Panel Score</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">77.4%</p>
          <p className="text-[11px] text-zinc-400 mt-1">Benchmark calibrated to Level 3</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Hire Recommendation Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">64.2%</p>
          <p className="text-[11px] text-zinc-400 mt-1">Objective committee consensus</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Avg. Turn-around Time</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">&lt; 1 min</p>
          <p className="text-[11px] text-zinc-400 mt-1">Instant post-session synthesis</p>
        </div>
      </div>

      {/* Candidate Assessment Table (Requirement #16) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Candidate Assessment Pipeline</h2>
            <p className="text-xs text-zinc-400">Click any candidate to open full multi-persona evaluation</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/60 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Target Role</th>
                <th className="px-6 py-3.5">Interview Date</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Overall Score</th>
                <th className="px-6 py-3.5">Recommendation</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {candidateRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onViewAssessment(row.report)}
                  className="hover:bg-zinc-900/40 transition cursor-pointer"
                >
                  <td className="px-6 py-4 font-semibold text-zinc-100 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      {row.name.charAt(0)}
                    </div>
                    <span>{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{row.role}</td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">{row.date}</td>
                  <td className="px-6 py-4 text-zinc-400">{row.duration}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-400 text-sm">{row.score}%</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        row.recommendation.includes("Strong")
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : row.recommendation === "Hire"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {row.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-400 hover:text-white flex items-center gap-1 ml-auto">
                      <span>View Report</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
