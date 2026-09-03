import React from "react";
import { InterviewState, InterviewerRole } from "../types/interview";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import { Mic, Volume2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

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

  // Derive dynamic scale and glow based on volume and state
  const isAgentSpeaking = state === "SPEAKING";
  const isCandidateSpeaking = state === "LISTENING" && candidateVolume > 15;
  const isInterrupted = state === "INTERRUPTED";
  const isSwitching = state === "SWITCHING_INTERVIEWER";
  const isThinking = state === "THINKING";

  const orbScale = isAgentSpeaking
    ? 1 + Math.min(0.25, (agentVolume / 100) * 0.3)
    : isCandidateSpeaking
    ? 1 + Math.min(0.2, (candidateVolume / 100) * 0.25)
    : 1;

  const stateConfig: Record<InterviewState, { label: string; color: string; bg: string; icon: any }> = {
    PREPARING: { label: "Preparing Panel", color: "text-white/60", bg: "bg-[#141414] border-white/10 font-mono text-[11px]", icon: Sparkles },
    CONNECTING: { label: "Connecting Agora RTC", color: "text-[#FF4D00]", bg: "bg-[#FF4D00]/10 border-[#FF4D00]/30 font-mono text-[11px]", icon: RefreshCw },
    LISTENING: { label: "Listening to Candidate", color: "text-white", bg: "bg-white/10 border-white/20 font-mono text-[11px]", icon: Mic },
    THINKING: { label: "Moderator Analyzing Turn", color: "text-[#FF4D00]", bg: "bg-[#FF4D00]/15 border-[#FF4D00]/40 font-mono text-[11px]", icon: RefreshCw },
    SPEAKING: { label: `${persona.name} Speaking`, color: "text-white", bg: "bg-[#FF4D00] border-[#FF4D00] text-black font-mono text-[11px]", icon: Volume2 },
    INTERRUPTED: { label: "Candidate Interrupted", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30 font-mono text-[11px]", icon: AlertCircle },
    SWITCHING_INTERVIEWER: { label: "Floor Hand-Off", color: "text-[#FF4D00]", bg: "bg-[#141414] border-[#FF4D00]/40 font-mono text-[11px]", icon: Sparkles },
    FOLLOW_UP: { label: "Targeted Follow-Up", color: "text-[#FF4D00]", bg: "bg-[#141414] border-[#FF4D00]/30 font-mono text-[11px]", icon: Volume2 },
    ROLEPLAY: { label: "Scenario Simulation", color: "text-white/80", bg: "bg-[#141414] border-white/10 font-mono text-[11px]", icon: Volume2 },
    PAUSED: { label: "Session Paused", color: "text-white/50", bg: "bg-[#141414] border-white/10 font-mono text-[11px]", icon: Sparkles },
    COMPLETED: { label: "Assessment Generated", color: "text-[#FF4D00]", bg: "bg-[#FF4D00]/15 border-[#FF4D00]/30 font-mono text-[11px]", icon: Sparkles },
    ERROR: { label: "Signal Interruption", color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/30 font-mono text-[11px]", icon: AlertCircle },
  };

  const currentStatus = stateConfig[state] || stateConfig.LISTENING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      {/* Outer Pulse Rings - Constructivist Geometry */}
      <div className="relative flex items-center justify-center">
        {/* Ring 3 */}
        <div
          className="absolute h-60 w-60 rounded-full border border-white/10 transition-all duration-700"
          style={{
            transform: `scale(${orbScale * 1.15})`,
            borderColor: isAgentSpeaking ? "rgba(255, 77, 0, 0.4)" : "rgba(255, 255, 255, 0.08)",
            opacity: isAgentSpeaking ? 0.8 : isCandidateSpeaking ? 0.4 : 0.15,
          }}
        />

        {/* Ring 2 */}
        <div
          className="absolute h-48 w-48 rounded-full border border-white/15 transition-all duration-500"
          style={{
            transform: `scale(${orbScale * 1.08})`,
            borderColor: isAgentSpeaking ? "rgba(255, 77, 0, 0.6)" : "rgba(255, 255, 255, 0.15)",
            opacity: isAgentSpeaking ? 0.9 : 0.25,
          }}
        />

        {/* Core Sphere / Glowing Orb */}
        <div
          className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-2xl transition-transform duration-200"
          style={{
            transform: `scale(${orbScale})`,
            background: isAgentSpeaking
              ? `radial-gradient(circle at 35% 35%, #FFA07A, #FF4D00, #8A2400, #0D0D0D)`
              : isCandidateSpeaking
              ? `radial-gradient(circle at 35% 35%, #FFFFFF, #B0B0B0, #333333, #0D0D0D)`
              : isThinking
              ? `radial-gradient(circle at 35% 35%, #FF7A33, #D94000, #4A1200, #0D0D0D)`
              : isInterrupted
              ? `radial-gradient(circle at 35% 35%, #F87171, #DC2626, #450A0A, #0D0D0D)`
              : `radial-gradient(circle at 35% 35%, #E5E5E5, #555555, #1F1F1F, #0D0D0D)`,
            boxShadow: isAgentSpeaking
              ? `0 0 50px rgba(255, 77, 0, 0.5), inset 0 0 25px rgba(255,255,255,0.5)`
              : isCandidateSpeaking
              ? `0 0 45px rgba(255, 255, 255, 0.35), inset 0 0 20px rgba(255,255,255,0.4)`
              : `0 0 30px rgba(255, 77, 0, 0.2)`,
          }}
        >
          {/* Internal reflective sheen */}
          <div className="absolute top-2 left-6 h-8 w-16 rounded-full bg-white/30 blur-sm transform -rotate-25" />

          {/* Center visual icon / waveform */}
          <div className="relative z-10 flex flex-col items-center justify-center text-white">
            {isAgentSpeaking ? (
              <div className="flex items-center gap-1">
                <span className="h-4 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-7 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-10 w-1 bg-white rounded-full animate-bounce" />
                <span className="h-7 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-4 w-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            ) : isCandidateSpeaking ? (
              <div className="flex items-center gap-1 text-white">
                <Mic className="h-8 w-8 animate-pulse text-white" />
              </div>
            ) : isThinking ? (
              <RefreshCw className="h-8 w-8 animate-spin text-white" />
            ) : (
              <Mic className={`h-8 w-8 ${isMuted ? "text-red-400" : "text-white/60"}`} />
            )}
          </div>
        </div>
      </div>

      {/* State Badge & Quick Interruption CTA */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono uppercase tracking-wider border shadow-sm transition-all ${currentStatus.bg}`}
        >
          <StatusIcon className={`h-3.5 w-3.5 ${currentStatus.color} ${isThinking ? "animate-spin" : ""}`} />
          <span className={currentStatus.color}>{currentStatus.label}</span>
        </div>

        {/* Live Interruption button when agent is speaking */}
        {isAgentSpeaking && onInterrupt && (
          <button
            onClick={onInterrupt}
            className="text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-[#FF4D00] underline underline-offset-4 transition cursor-pointer"
          >
            Click or speak to interrupt
          </button>
        )}
      </div>
    </div>
  );
};
