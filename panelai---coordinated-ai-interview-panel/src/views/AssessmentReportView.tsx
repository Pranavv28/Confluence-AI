import React, { useState } from "react";
import { AssessmentReport, CandidateProfile } from "../types/interview";
import { RadarChart } from "../components/RadarChart";
import { DEMO_PRECOMPLETED_ASSESSMENT, DEMO_CANDIDATE } from "../lib/demoData";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  ArrowLeft,
  Quote,
  Sparkles,
} from "lucide-react";

interface AssessmentReportViewProps {
  assessment?: AssessmentReport;
  candidate?: CandidateProfile;
  onBackToDashboard: () => void;
}

export const AssessmentReportView: React.FC<AssessmentReportViewProps> = ({
  assessment = DEMO_PRECOMPLETED_ASSESSMENT,
  candidate = DEMO_CANDIDATE,
  onBackToDashboard,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const radarData = assessment.competencyScores.map((c) => ({
    name: c.name,
    score: c.score,
    benchmark: c.benchmark || 75,
  }));

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(assessment, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PanelAI_Assessment_${assessment.candidateName.replace(/\s+/g, "_")}.json`;
    a.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "Strong Hire":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Hire":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Leaning Hire":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Candidate Portal</span>
        </button>

        <div className="flex items-center gap-3">
          {downloadSuccess && (
            <span className="text-xs text-emerald-400 font-medium animate-pulse">
              Report downloaded successfully!
            </span>
          )}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition cursor-pointer"
          >
            <FileDown className="h-4 w-4 text-blue-400" />
            <span>Export Full JSON Report</span>
          </button>
        </div>
      </div>

      {/* Main Executive Summary Header */}
      <div className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-blue-950/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
              <Award className="h-3.5 w-3.5" />
              <span>Multi-Agent Hiring Synthesis</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Candidate Assessment Report
            </h1>
            <p className="text-sm text-zinc-400">
              Candidate: <strong className="text-white">{assessment.candidateName}</strong> &bull; Target Role:{" "}
              <strong className="text-blue-400">{assessment.jobTitle}</strong> &bull; {assessment.completedAt}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl">
            <div className="text-right">
              <span className="text-xs font-medium text-zinc-400">Overall Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-white">{assessment.overallScore}</span>
                <span className="text-sm text-zinc-400 font-mono">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-zinc-800" />
            <div>
              <span className="text-xs font-medium text-zinc-400">Recommendation</span>
              <div
                className={`mt-1 rounded-lg px-3 py-1 text-xs font-bold border uppercase tracking-wider ${getRecommendationBadge(
                  assessment.recommendation
                )}`}
              >
                {assessment.recommendation}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Statement */}
        <div className="mt-6 pt-6 border-t border-zinc-800/80">
          <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
            {assessment.transcriptSummary}
          </p>
        </div>
      </div>

      {/* Radar Chart & Competency Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Competency Radar Map</h3>
            <span className="text-[11px] font-mono text-zinc-400">5 Dimensions</span>
          </div>
          <RadarChart data={radarData} size={320} />
        </div>

        {/* Competency Scoring Bars & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white mb-3">Objective Competency Breakdown</h3>

          <div className="space-y-4">
            {assessment.competencyScores.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">{comp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-400 text-[11px]">Benchmark: {comp.benchmark}%</span>
                    <span className="font-mono font-bold text-blue-400 text-sm">{comp.score}%</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${comp.score}%`,
                      backgroundColor:
                        comp.score >= 85 ? "#3B82F6" : comp.score >= 75 ? "#8B5CF6" : "#F59E0B",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-4">
            <CheckCircle2 className="h-5 w-5" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
            {assessment.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-amber-500/30 bg-amber-950/10 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 text-sm font-bold mb-4">
            <AlertTriangle className="h-5 w-5" />
            <span>Growth &amp; Follow-up Areas</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
            {assessment.weaknesses.map((gro, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <span>{gro}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Multi-Perspective Interviewer Syntheses (Requirement #13) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h2 className="text-lg font-bold text-white">Multi-Interviewer Panel Perspectives</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessment.interviewerPerspectives.map((note) => {
            const persona = INTERVIEWER_PERSONAS[note.role];
            return (
              <div
                key={note.role}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={persona?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={note.interviewerName}
                      className="h-11 w-11 rounded-xl object-cover border border-zinc-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{note.interviewerName}</h4>
                      <p className="text-xs text-zinc-400">{note.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed italic border-l-2 border-blue-500/40 pl-3">
                    "{note.perspective}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-medium">{note.verdict}</span>
                  <span className="font-mono font-bold text-blue-400">{note.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verbatim Evidence-Linked Citations (Requirement #14) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Evidence-Linked Citations &amp; Verbatim Transcript Timestamps
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {assessment.evidenceList.length} Cited Quotes
          </span>
        </div>

        <p className="text-xs text-zinc-400">
          Every competency rating is grounded directly in verified candidate assertions and transcript audio intervals.
        </p>

        <div className="space-y-3 mt-4">
          {assessment.evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-blue-400">{ev.competency}</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
                  Audio Offset: {ev.transcriptStart}s &ndash; {ev.transcriptEnd}s
                </span>
              </div>

              <div className="rounded-xl bg-zinc-950/60 p-3 border border-zinc-800 text-zinc-300 italic">
                "{ev.evidence}"
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                <span>Verified Claim: <strong className="text-zinc-300">{ev.claim}</strong></span>
                <span className="text-emerald-400 font-mono">Confidence: {Math.round(ev.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
