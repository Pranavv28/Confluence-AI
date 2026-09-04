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
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold";
      case "Hire":
        return "bg-blue-50 text-blue-800 border-blue-300 font-bold";
      case "Leaning Hire":
        return "bg-amber-50 text-amber-800 border-amber-300 font-bold";
      default:
        return "bg-stone-100 text-stone-700 border-stone-300 font-medium";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Candidate Portal</span>
        </button>

        <div className="flex items-center gap-3">
          {downloadSuccess && (
            <span className="text-xs text-emerald-700 font-medium animate-pulse">
              Report downloaded successfully!
            </span>
          )}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-800 transition cursor-pointer shadow-sm"
          >
            <FileDown className="h-4 w-4 text-[#1E3A5F]" />
            <span>Export Full JSON Report</span>
          </button>
        </div>
      </div>

      {/* Main Executive Summary Header */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
              <Award className="h-3.5 w-3.5 text-[#1E3A5F]" />
              <span>Multi-Agent Hiring Synthesis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Candidate Assessment Report
            </h1>
            <p className="text-sm text-stone-600">
              Candidate: <strong className="text-stone-900">{assessment.candidateName}</strong> &bull; Target Role:{" "}
              <strong className="text-[#1E3A5F]">{assessment.jobTitle}</strong> &bull; {assessment.completedAt}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4 shadow-2xs">
            <div className="text-right">
              <span className="text-xs font-medium text-stone-500">Overall Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold font-mono text-stone-900">{assessment.overallScore}</span>
                <span className="text-xs text-stone-500 font-mono">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-px bg-stone-200" />
            <div>
              <span className="text-xs font-medium text-stone-500">Recommendation</span>
              <div
                className={`mt-1 rounded-lg px-3 py-1 text-xs border uppercase tracking-wider ${getRecommendationBadge(
                  assessment.recommendation
                )}`}
              >
                {assessment.recommendation}
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Statement */}
        <div className="mt-6 pt-6 border-t border-stone-200">
          <p className="text-sm text-stone-700 leading-relaxed max-w-4xl">
            {assessment.transcriptSummary}
          </p>
        </div>
      </div>

      {/* Radar Chart & Competency Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900">Competency Radar Map</h3>
            <span className="text-[11px] font-mono text-stone-500">5 Dimensions</span>
          </div>
          <RadarChart data={radarData} size={320} />
        </div>

        {/* Competency Scoring Bars & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold text-stone-900 mb-3">Objective Competency Breakdown</h3>

          <div className="space-y-4">
            {assessment.competencyScores.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-900">{comp.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500 text-[11px]">Benchmark: {comp.benchmark}%</span>
                    <span className="font-mono font-bold text-[#1E3A5F] text-sm">{comp.score}%</span>
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${comp.score}%`,
                      backgroundColor:
                        comp.score >= 85 ? "#1E3A5F" : comp.score >= 75 ? "#475569" : "#D97706",
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
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-bold mb-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>Key Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
            {assessment.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-2xs">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-bold mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Growth &amp; Follow-up Areas</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-stone-700">
            {assessment.weaknesses.map((gro, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                <span>{gro}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Multi-Perspective Interviewer Syntheses */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#1E3A5F]" />
          <h2 className="text-lg font-bold text-stone-900">Multi-Interviewer Panel Perspectives</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assessment.interviewerPerspectives.map((note) => {
            const persona = INTERVIEWER_PERSONAS[note.role];
            return (
              <div
                key={note.role}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={persona?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={note.interviewerName}
                      className="h-11 w-11 rounded-xl object-cover border border-stone-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{note.interviewerName}</h4>
                      <p className="text-xs text-stone-500">{note.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed italic border-l-2 border-slate-300 pl-3">
                    "{note.perspective}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 font-medium">{note.verdict}</span>
                  <span className="font-mono font-bold text-[#1E3A5F]">{note.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verbatim Evidence-Linked Citations */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-[#1E3A5F]" />
            <h3 className="text-base font-bold text-stone-900">
              Evidence-Linked Citations &amp; Verbatim Transcript Timestamps
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-500">
            {assessment.evidenceList.length} Cited Quotes
          </span>
        </div>

        <p className="text-xs text-stone-500">
          Every competency rating is grounded directly in verified candidate assertions and transcript audio intervals.
        </p>

        <div className="space-y-3 mt-4">
          {assessment.evidenceList.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 text-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#1E3A5F]">{ev.competency}</span>
                <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] text-stone-600 border border-stone-200">
                  Audio Offset: {ev.transcriptStart}s &ndash; {ev.transcriptEnd}s
                </span>
              </div>

              <div className="rounded-lg bg-white p-3 border border-stone-200 text-stone-700 italic">
                "{ev.evidence}"
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span>Verified Claim: <strong className="text-stone-800">{ev.claim}</strong></span>
                <span className="text-emerald-700 font-mono font-medium">Confidence: {Math.round(ev.confidence * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
