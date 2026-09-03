import React, { useRef, useEffect } from "react";
import { InterviewTurn } from "../types/interview";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import { User, Volume2, Clock } from "lucide-react";

interface LiveTranscriptProps {
  turns: InterviewTurn[];
  partialCandidateText?: string;
  isCandidateSpeaking?: boolean;
  isAgentSpeaking?: boolean;
  highlightTurnId?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  turns,
  partialCandidateText,
  isCandidateSpeaking,
  isAgentSpeaking,
  highlightTurnId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, partialCandidateText]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Live Synchronized Transcript
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
          <Clock className="h-3 w-3" />
          <span>Real-Time Voice Stream</span>
        </div>
      </div>

      {/* Transcript Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[380px] sm:max-h-[460px]">
        {turns.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center text-center text-zinc-400">
            <p className="text-sm font-medium">Session initialized.</p>
            <p className="text-xs text-zinc-400 mt-1">Interviewer audio will stream here as the conversation unfolds.</p>
          </div>
        )}

        {turns.map((turn) => {
          const isCandidate = turn.speaker === "candidate";
          const persona = turn.role ? INTERVIEWER_PERSONAS[turn.role] : null;
          const isHighlighted = highlightTurnId === turn.id;

          return (
            <div
              key={turn.id}
              className={`flex flex-col gap-1.5 transition-all p-3 rounded-xl border ${
                isHighlighted
                  ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/30"
                  : isCandidate
                  ? "bg-zinc-900/60 border-zinc-800/80 ml-4 sm:ml-8"
                  : "bg-zinc-900/30 border-zinc-800/40 mr-4 sm:mr-8"
              }`}
            >
              {/* Speaker Metadata Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCandidate ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md border text-xs font-semibold"
                      style={{
                        backgroundColor: `${persona?.accentColor || "#3B82F6"}20`,
                        borderColor: `${persona?.accentColor || "#3B82F6"}40`,
                        color: persona?.accentColor || "#93C5FD",
                      }}
                    >
                      {persona?.name.charAt(0) || "AI"}
                    </div>
                  )}

                  <span className="text-xs font-semibold text-zinc-200">
                    {isCandidate ? "You (Candidate)" : persona ? `${persona.name} (${persona.title})` : "Interviewer"}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-zinc-400">{turn.timestamp}</span>
              </div>

              {/* Text content */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-8">
                {turn.text}
              </p>
            </div>
          );
        })}

        {/* Live Partial Speech from candidate if speaking right now */}
        {partialCandidateText && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 ml-4 sm:ml-8 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-emerald-400">You (Speaking...)</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed pl-8 italic">
              {partialCandidateText}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer Status */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 px-4 py-2 flex items-center justify-between text-[11px] text-zinc-400">
        <span>{turns.length} conversational turns recorded</span>
        {isAgentSpeaking ? (
          <span className="flex items-center gap-1.5 text-blue-400">
            <Volume2 className="h-3.5 w-3.5 animate-pulse" />
            Interviewer speaking
          </span>
        ) : isCandidateSpeaking ? (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Listening to your microphone
          </span>
        ) : (
          <span>Candidate turn to respond</span>
        )}
      </div>
    </div>
  );
};
