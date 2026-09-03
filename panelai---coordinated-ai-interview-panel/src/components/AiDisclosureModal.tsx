import React, { useState } from "react";
import { ShieldCheck, Info, Sparkles, Check } from "lucide-react";

interface AiDisclosureModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export const AiDisclosureModal: React.FC<AiDisclosureModalProps> = ({
  isOpen,
  onAccept,
  onCancel,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Interview Disclosure</h3>
            <p className="text-xs text-zinc-400">Ethical & Transparent Hiring Assessment</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-zinc-300 leading-relaxed rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <p>
            This interview is conducted by multiple AI interviewers powered by{" "}
            <strong className="text-white">Agora Conversational AI</strong> and coordinated multi-agent orchestration.
          </p>

          <p>
            Your spoken responses will be transcribed in real time, analyzed for technical and behavioral competency, and evaluated against objective hiring rubrics to produce decision support for human hiring managers.
          </p>

          <div className="flex items-start gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Final employment decisions are always made by human committees. PanelAI provides objective, evidence-linked evaluations with verbatim transcript citations.
            </span>
          </div>
        </div>

        {/* Mandatory checkbox */}
        <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
          />
          <span className="text-xs text-zinc-300">
            I acknowledge that I am speaking with an AI interview panel and consent to real-time audio transcription and competency evaluation.
          </span>
        </label>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!acknowledged}
            onClick={onAccept}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Accept & Enter Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
