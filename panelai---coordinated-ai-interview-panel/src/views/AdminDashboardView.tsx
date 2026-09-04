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

  const metrics = [
    {
      label: "Completed Interviews",
      value: "28",
      sub: "+14% vs previous cohort",
      icon: <Users className="h-4 w-4 text-slate-400" />,
      subColor: "text-emerald-600",
    },
    {
      label: "Average Panel Score",
      value: "77.4%",
      sub: "Benchmark calibrated to Level 3",
      icon: <Award className="h-4 w-4 text-slate-400" />,
      subColor: "text-stone-500",
    },
    {
      label: "Hire Recommendation Rate",
      value: "64.2%",
      sub: "Objective committee consensus",
      icon: <CheckCircle2 className="h-4 w-4 text-slate-400" />,
      subColor: "text-stone-500",
    },
    {
      label: "Avg. Turn-around Time",
      value: "< 1 min",
      sub: "Instant post-session synthesis",
      icon: <Clock className="h-4 w-4 text-slate-400" />,
      subColor: "text-stone-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600 mb-2">
            <LayoutDashboard className="h-3.5 w-3.5 text-stone-400" />
            <span>Talent Acquisition &amp; Hiring Panel Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            HR Admin &amp; Hiring Analytics
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Review objective, multi-perspective interview syntheses with verbatim
            candidate citations.
          </p>
        </div>

        <button
          onClick={() => onNavigate("jobs")}
          className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#16304f] px-4 py-2.5 text-xs font-semibold text-white transition cursor-pointer"
        >
          <Briefcase className="h-4 w-4" />
          <span>Manage Job Panels</span>
        </button>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
              <span>{m.label}</span>
              {m.icon}
            </div>
            <p className="text-2xl font-bold font-mono text-stone-900">
              {m.value}
            </p>
            <p className={`text-[11px] mt-1 flex items-center gap-1 ${m.subColor}`}>
              {m.label === "Completed Interviews" && (
                <TrendingUp className="h-3 w-3" />
              )}
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Candidate Assessment Table */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Candidate Assessment Pipeline
            </h2>
            <p className="text-xs text-stone-500">
              Click any candidate to open their full multi-persona evaluation
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
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
            <tbody className="divide-y divide-stone-100">
              {candidateRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onViewAssessment(row.report as AssessmentReport)}
                  className="hover:bg-stone-50 transition cursor-pointer"
                >
                  <td className="px-6 py-4 font-semibold text-stone-900">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-[#1E3A5F]/10 border border-[#1E3A5F]/20 text-[#1E3A5F] flex items-center justify-center font-bold text-sm">
                        {row.name.charAt(0)}
                      </div>
                      <span>{row.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-500">{row.role}</td>
                  <td className="px-6 py-4 text-stone-500 font-mono">
                    {row.date}
                  </td>
                  <td className="px-6 py-4 text-stone-500">{row.duration}</td>
                  <td className="px-6 py-4 font-mono font-bold text-[#1E3A5F] text-sm">
                    {row.score}%
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        row.recommendation.includes("Strong")
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : row.recommendation === "Hire"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {row.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-stone-400 hover:text-stone-800 flex items-center gap-1 ml-auto transition">
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
