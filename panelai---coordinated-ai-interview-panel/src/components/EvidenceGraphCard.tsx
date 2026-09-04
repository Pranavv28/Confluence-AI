import React from "react";
import { EvidenceItem, CandidateProfile } from "../types/interview";
import { CheckCircle, AlertTriangle, Layers, User } from "lucide-react";

interface EvidenceGraphCardProps {
  evidenceList: EvidenceItem[];
  latestVagueness?: number;
  hasContradiction?: boolean;
  candidateProfile?: CandidateProfile;
}

export const EvidenceGraphCard: React.FC<EvidenceGraphCardProps> = ({
  evidenceList,
  latestVagueness = 0.2,
  hasContradiction = false,
  candidateProfile,
}) => {
  const vaguenessPercent = Math.round(latestVagueness * 100);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-stone-600" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-700">
            Evidence Verification
          </h3>
        </div>
        <span className="text-[11px] font-medium text-stone-500">
          {evidenceList.length} Verified Claims
        </span>
      </div>

      {/* Candidate Profile Context Badge (P1 #2) */}
      {candidateProfile && (
        <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 px-3 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-3.5 w-3.5 text-stone-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-stone-900">{candidateProfile.name}</span>
              <span className="text-stone-400 mx-1.5">&bull;</span>
              <span className="text-stone-600 truncate">{candidateProfile.targetRole}</span>
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-medium text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
            Real Context
          </span>
        </div>
      )}

      {/* Vagueness Meter & Consistency Status */}
      <div className="grid grid-cols-2 gap-2">
        {/* Vagueness */}
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-stone-600 font-medium">Vagueness</span>
            <span
              className={`font-semibold ${
                vaguenessPercent > 60
                  ? "text-rose-600"
                  : vaguenessPercent > 35
                  ? "text-amber-600"
                  : "text-emerald-700"
              }`}
            >
              {vaguenessPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                vaguenessPercent > 60
                  ? "bg-rose-500"
                  : vaguenessPercent > 35
                  ? "bg-amber-500"
                  : "bg-emerald-600"
              }`}
              style={{ width: `${Math.max(5, vaguenessPercent)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-stone-500">
            {vaguenessPercent > 60
              ? "Needs concrete metrics"
              : vaguenessPercent > 35
              ? "Partially qualitative"
              : "High metric specificity"}
          </p>
        </div>

        {/* Consistency Check */}
        <div
          className={`rounded-xl border p-2.5 transition ${
            hasContradiction
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-stone-50 border-stone-200 text-stone-700"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {hasContradiction ? (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            )}
            <span>Consistency</span>
          </div>
          <p className="mt-1 text-[10px] text-stone-500 line-clamp-2">
            {hasContradiction
              ? "Scope discrepancy noted"
              : "Assertions aligned with resume"}
          </p>
        </div>
      </div>

      {/* Extracted Evidence Items */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-0.5">
        {evidenceList.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-center text-xs text-stone-400">
            Candidate assertions and metrics will appear here in real time.
          </div>
        ) : (
          evidenceList.slice(-3).map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-2.5 text-xs transition ${
                item.isContradiction
                  ? "border-amber-300 bg-amber-50/50"
                  : "border-stone-200 bg-stone-50/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-stone-800 truncate">{item.competency}</span>
                <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 border border-stone-200">
                  {item.score}/100
                </span>
              </div>
              <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">{item.evidence}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
