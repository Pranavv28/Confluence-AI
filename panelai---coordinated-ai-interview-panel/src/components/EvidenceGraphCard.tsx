import React from "react";
import { EvidenceItem } from "../types/interview";
import { ShieldAlert, CheckCircle, AlertTriangle, HelpCircle, Layers } from "lucide-react";

interface EvidenceGraphCardProps {
  evidenceList: EvidenceItem[];
  latestVagueness?: number;
  hasContradiction?: boolean;
}

export const EvidenceGraphCard: React.FC<EvidenceGraphCardProps> = ({
  evidenceList,
  latestVagueness = 0.2,
  hasContradiction = false,
}) => {
  const vaguenessPercent = Math.round(latestVagueness * 100);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-sm">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
            Live Evidence Extraction Engine
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          {evidenceList.length} Claims Verified
        </span>
      </div>

      {/* Vagueness Meter & Contradiction Flag */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Vagueness */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-zinc-400 font-medium">Answer Vagueness</span>
            <span
              className={`font-mono font-bold ${
                vaguenessPercent > 60
                  ? "text-rose-400"
                  : vaguenessPercent > 35
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {vaguenessPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                vaguenessPercent > 60
                  ? "bg-rose-500"
                  : vaguenessPercent > 35
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(5, vaguenessPercent)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-zinc-400">
            {vaguenessPercent > 60
              ? "Missing metrics or mechanisms"
              : vaguenessPercent > 35
              ? "Partially qualitative"
              : "High specificity & metrics"}
          </p>
        </div>

        {/* Contradiction Status */}
        <div
          className={`rounded-xl border p-2.5 transition ${
            hasContradiction
              ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
              : "bg-zinc-900/60 border-zinc-800 text-zinc-400"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            {hasContradiction ? (
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>Consistency Check</span>
          </div>
          <p className="mt-1 text-[10px] line-clamp-2">
            {hasContradiction
              ? "Ownership discrepancy identified"
              : "No conflicting assertions detected"}
          </p>
        </div>
      </div>

      {/* Extracted Evidence Items */}
      <div className="space-y-2 mt-1 max-h-[180px] overflow-y-auto pr-1">
        {evidenceList.length === 0 ? (
          <div className="flex items-center justify-center p-4 text-center text-xs text-zinc-400">
            Awaiting initial candidate assertions to extract structured evidence...
          </div>
        ) : (
          evidenceList.slice(-3).map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-2.5 text-xs transition ${
                item.isContradiction
                  ? "border-amber-500/40 bg-amber-950/20"
                  : "border-zinc-800 bg-zinc-900/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-zinc-200 truncate">{item.competency}</span>
                <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-500/20">
                  Score: {item.score}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2">{item.evidence}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
