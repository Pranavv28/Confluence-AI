import React from "react";
import { InterviewState, InterviewerRole } from "../types/interview";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import { Mic, Volume2, AlertCircle, RefreshCw } from "lucide-react";

interface VoiceOrbProps {
  state: InterviewState;
  activeRole: InterviewerRole;
  agentVolume: number;
  candidateVolume: number;
  isMuted: boolean;
  onInterrupt?: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  state,
  activeRole,
  agentVolume,
  candidateVolume,
  isMuted,
  onInterrupt,
}) => {
  const persona = INTERVIEWER_PERSONAS[activeRole];

  const isAgentSpeaking = state === "SPEAKING";
  const isCandidateSpeaking = state === "LISTENING" && candidateVolume > 15;
  const isThinking = state === "THINKING";
  const isInterrupted = state === "INTERRUPTED";

  // Dynamic bar heights for subtle waveform (7 bars)
  const vol = isAgentSpeaking ? agentVolume : isCandidateSpeaking ? candidateVolume : 0;
  const normalizedVol = Math.min(100, Math.max(8, vol));

  const stateConfig: Record<InterviewState, { label: string; dotColor: string; badgeBg: string; textColor: string }> = {
    PREPARING: { label: "Preparing Panel", dotColor: "bg-stone-400", badgeBg: "bg-stone-100 border-stone-300", textColor: "text-stone-600" },
    CONNECTING: { label: "Connecting Audio", dotColor: "bg-amber-500", badgeBg: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
    LISTENING: { label: "Listening to Candidate", dotColor: "bg-emerald-500", badgeBg: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-700" },
    THINKING: { label: "Moderator Coordinating Turn", dotColor: "bg-slate-600", badgeBg: "bg-slate-100 border-slate-300", textColor: "text-slate-700" },
    SPEAKING: { label: `${persona.name} Speaking`, dotColor: "bg-blue-600", badgeBg: "bg-blue-50 border-blue-200", textColor: "text-blue-800" },
    INTERRUPTED: { label: "Candidate Interrupted", dotColor: "bg-rose-500", badgeBg: "bg-rose-50 border-rose-200", textColor: "text-rose-700" },
    SWITCHING_INTERVIEWER: { label: "Floor Hand-Off", dotColor: "bg-blue-600", badgeBg: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
    FOLLOW_UP: { label: "Targeted Probe", dotColor: "bg-blue-600", badgeBg: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
    ROLEPLAY: { label: "Scenario Simulation", dotColor: "bg-purple-600", badgeBg: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
    PAUSED: { label: "Session Paused", dotColor: "bg-stone-400", badgeBg: "bg-stone-100 border-stone-200", textColor: "text-stone-600" },
    COMPLETED: { label: "Interview Complete", dotColor: "bg-emerald-600", badgeBg: "bg-emerald-50 border-emerald-200", textColor: "text-emerald-800" },
    ERROR: { label: "Signal Notice", dotColor: "bg-rose-500", badgeBg: "bg-rose-50 border-rose-200", textColor: "text-rose-700" },
  };

  const currentStatus = stateConfig[state] || stateConfig.LISTENING;

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full">
      {/* Calm Waveform Card */}
      <div className="relative flex flex-col items-center justify-center h-36 w-full max-w-sm rounded-2xl bg-white border border-stone-200 shadow-sm p-6 transition-all">
        {/* Subtle Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-14 w-full">
          {[0.4, 0.7, 1.0, 1.2, 1.0, 0.7, 0.4].map((multiplier, idx) => {
            const barHeight = isAgentSpeaking || isCandidateSpeaking
              ? Math.max(10, Math.min(52, Math.round(normalizedVol * 0.45 * multiplier)))
              : 8;

            return (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-150 ${
                  isAgentSpeaking
                    ? "bg-slate-800"
                    : isCandidateSpeaking
                    ? "bg-emerald-600"
                    : isThinking
                    ? "bg-stone-300 animate-pulse"
                    : "bg-stone-200"
                }`}
                style={{ height: `${barHeight}px` }}
              />
            );
          })}
        </div>

        {/* Audio Role Subtitle */}
        <div className="mt-2 text-xs text-stone-500 font-medium flex items-center gap-1.5">
          {isAgentSpeaking ? (
            <span className="flex items-center gap-1 text-slate-900 font-semibold">
              <Volume2 className="h-3.5 w-3.5 text-blue-600" />
              {persona.name} is speaking
            </span>
          ) : isCandidateSpeaking ? (
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <Mic className="h-3.5 w-3.5 text-emerald-600" />
              Candidate speaking ({candidateVolume}%)
            </span>
          ) : isThinking ? (
            <span className="flex items-center gap-1 text-stone-600">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-stone-400" />
              Analyzing candidate response...
            </span>
          ) : (
            <span className="text-stone-400 flex items-center gap-1">
              <Mic className={`h-3.5 w-3.5 ${isMuted ? "text-rose-500" : "text-stone-400"}`} />
              {isMuted ? "Microphone Muted" : "Ready for response"}
            </span>
          )}
        </div>
      </div>

      {/* State Status Pill */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <div
          className={`flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-medium border shadow-xs ${currentStatus.badgeBg} ${currentStatus.textColor}`}
        >
          <span className={`h-2 w-2 rounded-full ${currentStatus.dotColor} ${isAgentSpeaking || isCandidateSpeaking ? "animate-pulse" : ""}`} />
          <span>{currentStatus.label}</span>
        </div>

        {isAgentSpeaking && onInterrupt && (
          <button
            onClick={onInterrupt}
            className="text-[11px] text-stone-500 hover:text-stone-800 transition cursor-pointer underline underline-offset-2"
          >
            Click or speak to interrupt
          </button>
        )}
      </div>
    </div>
  );
};
