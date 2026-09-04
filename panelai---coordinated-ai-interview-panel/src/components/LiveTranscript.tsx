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
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 bg-stone-50/80">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            Interview Transcript
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono">
          <Clock className="h-3 w-3 text-stone-400" />
          <span>Real-time Log</span>
        </div>
      </div>

      {/* Transcript Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[380px] sm:max-h-[480px]">
        {turns.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center text-center text-stone-400">
            <p className="text-sm font-medium text-stone-600">Session initialized.</p>
            <p className="text-xs text-stone-400 mt-1">Interviewer questions and candidate responses appear here.</p>
          </div>
        )}

        {turns.map((turn) => {
          const isCandidate = turn.speaker === "candidate";
          const persona = turn.role ? INTERVIEWER_PERSONAS[turn.role] : null;
          const isHighlighted = highlightTurnId === turn.id;

          return (
            <div
              key={turn.id}
              className={`flex flex-col gap-1.5 transition-all p-3.5 rounded-xl border ${
                isHighlighted
                  ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-300/40"
                  : isCandidate
                  ? "bg-stone-50 border-stone-200 ml-4 sm:ml-8"
                  : "bg-white border-stone-200 shadow-2xs mr-4 sm:mr-8"
              }`}
            >
              {/* Speaker Metadata Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isCandidate ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-200 text-stone-700">
                      <User className="h-3 w-3" />
                    </div>
                  ) : (
                    <img
                      src={persona?.avatar}
                      alt={persona?.name || "Interviewer"}
                      className="h-5 w-5 rounded-full object-cover border border-stone-200"
                    />
                  )}

                  <span className="text-xs font-semibold text-stone-900">
                    {isCandidate ? "You (Candidate)" : persona ? `${persona.name} (${persona.title})` : "Interviewer"}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-stone-400">{turn.timestamp}</span>
              </div>

              {/* Text content */}
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-7">
                {turn.text}
              </p>
            </div>
          );
        })}

        {/* Live Partial Speech from candidate if speaking right now */}
        {partialCandidateText && (
          <div className="flex flex-col gap-1.5 p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 ml-4 sm:ml-8">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800">
                <User className="h-3 w-3" />
              </div>
              <span className="text-xs font-semibold text-emerald-800">You (Speaking...)</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed pl-7 italic">
              {partialCandidateText}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer Status */}
      <div className="border-t border-stone-200 bg-stone-50 px-4 py-2 flex items-center justify-between text-[11px] text-stone-500">
        <span>{turns.length} turns recorded</span>
        {isAgentSpeaking ? (
          <span className="flex items-center gap-1.5 text-blue-700 font-medium">
            <Volume2 className="h-3.5 w-3.5 text-blue-600" />
            Interviewer speaking
          </span>
        ) : isCandidateSpeaking ? (
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            Listening to your microphone
          </span>
        ) : (
          <span className="text-stone-500">Ready for response</span>
        )}
      </div>
    </div>
  );
};
