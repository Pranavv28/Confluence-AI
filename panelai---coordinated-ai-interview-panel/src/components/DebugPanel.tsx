import React from "react";
import { InterviewState, InterviewerRole, TypedEvent, ModeratorDecision, CandidateProfile } from "../types/interview";
import { X, Activity, Radio, Cpu, Terminal, User } from "lucide-react";

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
  candidateProfile?: CandidateProfile;
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
  candidateProfile,
}) => {
  if (!isOpen) return null;

  return (
    <aside aria-label="Live Telemetry Panel" className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-300 bg-white p-4 shadow-xl text-xs font-mono text-stone-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-stone-700" />
          <span className="font-bold tracking-tight text-stone-900">Telemetry & Engine Status</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Candidate Profile Context (P2 #7) */}
      {candidateProfile && (
        <div className="mb-3 rounded-xl bg-stone-50 border border-stone-200 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-semibold flex items-center gap-1">
              <User className="h-3 w-3" /> Candidate Context:
            </span>
            <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-700 font-bold text-[10px]">
              Active
            </span>
          </div>
          <p className="text-stone-900 font-semibold truncate">{candidateProfile.name}</p>
          <p className="text-stone-500 text-[10px] truncate">{candidateProfile.targetRole} ({candidateProfile.yearsOfExperience} yrs exp)</p>
          <p className="text-stone-500 text-[10px] truncate">Skills: {candidateProfile.skills.slice(0, 5).join(", ")}</p>
        </div>
      )}

      {/* Network & Engine Status */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Audio Transport:</span>
          <span className={`flex items-center gap-1 font-semibold ${isRealAgora ? "text-emerald-700" : "text-stone-800"}`}>
            <Radio className="h-3 w-3 text-stone-500" />
            {isRealAgora ? "Live WebRTC" : "Web Speech Engine"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-500">Session Channel:</span>
          <span className="text-stone-800 truncate max-w-[170px]">{channelName || "panelai_session"}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-500">State Machine:</span>
          <span className="rounded bg-stone-100 px-2 py-0.5 font-bold text-stone-800 border border-stone-200">{state}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-stone-500">Current Questioner:</span>
          <span className="text-stone-900 font-bold uppercase">{activeRole}</span>
        </div>
      </div>

      {/* Latest Moderator Decision */}
      {latestDecision && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 mb-3">
          <div className="flex items-center gap-1.5 text-stone-800 font-semibold mb-1">
            <Cpu className="h-3.5 w-3.5 text-stone-600" />
            <span>Moderator Orchestration</span>
          </div>
          <p className="text-stone-900 mb-1">
            Action: <span className="font-bold text-blue-800">{latestDecision.recommended_action}</span> &rarr;{" "}
            <span className="font-bold text-stone-900">{latestDecision.recommended_interviewer}</span>
          </p>
          <p className="text-[11px] text-stone-600">
            Category: <span className="text-stone-800">{latestDecision.reasoningCategory}</span>
          </p>
          <p className="text-[11px] text-stone-600 mt-1">
            Vagueness: <span className="text-stone-800 font-semibold">{(latestDecision.vagueness * 100).toFixed(0)}%</span> | Confidence:{" "}
            <span className="text-stone-800 font-semibold">{(latestDecision.confidence * 100).toFixed(0)}%</span>
          </p>
        </div>
      )}

      {/* Real-Time Event Stream */}
      <div className="border-t border-stone-200 pt-2">
        <div className="flex items-center gap-1.5 text-stone-500 mb-1.5">
          <Terminal className="h-3.5 w-3.5 text-stone-400" />
          <span>Event Stream ({events.length})</span>
        </div>
        <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-stone-500 pr-1">
          {events.length === 0 ? (
            <p className="text-stone-400 italic">Listening for turn transitions...</p>
          ) : (
            events.slice(-4).map((ev, i) => (
              <div key={i} className="flex items-center justify-between truncate">
                <span className="text-stone-800 font-medium">{ev.type}</span>
                <span className="text-stone-400">{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
