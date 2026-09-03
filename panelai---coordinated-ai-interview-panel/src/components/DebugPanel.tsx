import React from "react";
import { InterviewState, InterviewerRole, TypedEvent, ModeratorDecision } from "../types/interview";
import { X, Activity, Radio, Cpu, Clock, Terminal } from "lucide-react";

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
  state: InterviewState;
  activeRole: InterviewerRole;
  isRealAgora: boolean;
  channelName: string;
  candidateUid: number;
  events: TypedEvent[];
  latestDecision?: ModeratorDecision | null;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  isOpen,
  onClose,
  state,
  activeRole,
  isRealAgora,
  channelName,
  candidateUid,
  events,
  latestDecision,
}) => {
  if (!isOpen) return null;

  return (
    <aside aria-label="Live Telemetry Panel" className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-700 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-zinc-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-400" />
          <span className="font-bold tracking-tight text-white">Live Telemetry & Observability</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Network & Engine Status */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Agora RTC Connection:</span>
          <span className={`flex items-center gap-1 font-semibold ${isRealAgora ? "text-emerald-400" : "text-blue-400"}`}>
            <Radio className="h-3 w-3 animate-pulse" />
            {isRealAgora ? "Connected (Live RTC)" : "Audio Channel Active"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Channel / Candidate UID:</span>
          <span className="text-zinc-200 truncate max-w-[170px]">{channelName || "panelai_session"} / {candidateUid}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Active State Machine:</span>
          <span className="rounded bg-zinc-800 px-2 py-0.5 font-bold text-amber-300">{state}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Active Interviewer Role:</span>
          <span className="text-blue-300 font-bold uppercase">{activeRole}</span>
        </div>
      </div>

      {/* Latest Moderator Decision (Requirement #42 - Structured decision, category, reason) */}
      {latestDecision && (
        <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-2.5 mb-3">
          <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
            <Cpu className="h-3.5 w-3.5" />
            <span>Moderator Decision</span>
          </div>
          <p className="text-zinc-200 mb-1">
            Action: <span className="text-purple-300 font-bold">{latestDecision.recommended_action}</span> &rarr;{" "}
            <span className="text-blue-300 font-bold">{latestDecision.recommended_interviewer}</span>
          </p>
          <p className="text-[11px] text-zinc-400">
            Category: <span className="text-zinc-300">{latestDecision.reasoningCategory}</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Vagueness: <span className="text-amber-400">{(latestDecision.vagueness * 100).toFixed(0)}%</span> | Conf:{" "}
            <span className="text-emerald-400">{(latestDecision.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>
      )}

      {/* Real-Time Event Stream */}
      <div className="border-t border-zinc-800 pt-2">
        <div className="flex items-center gap-1.5 text-zinc-400 mb-1.5">
          <Terminal className="h-3.5 w-3.5" />
          <span>Real-Time Event Log ({events.length})</span>
        </div>
        <div className="max-h-28 overflow-y-auto space-y-1 text-[10px] text-zinc-400 pr-1">
          {events.length === 0 ? (
            <p className="text-zinc-400 italic">Listening for Agora and Moderator events...</p>
          ) : (
            events.slice(-5).map((ev, i) => (
              <div key={i} className="flex items-center justify-between truncate">
                <span className="text-zinc-300 font-semibold">{ev.type}</span>
                <span className="text-zinc-400">{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
