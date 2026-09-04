import React, { useState } from "react";
import { ShieldCheck, Info, Check } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#1E3A5F] border border-slate-200">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">AI Interview Disclosure</h3>
            <p className="text-xs text-stone-500">Ethical &amp; Transparent Hiring Assessment</p>
          </div>
        </div>

        <div className="space-y-3.5 text-sm text-stone-700 leading-relaxed rounded-xl border border-stone-200 bg-stone-50/70 p-4">
          <p>
            This interview is conducted by multiple AI interviewers powered by{" "}
            <strong className="text-stone-900 font-semibold">Agora Conversational AI</strong> and coordinated multi-agent orchestration.
          </p>

          <p>
            Your spoken responses will be transcribed in real time, analyzed for technical and behavioral competency, and evaluated against objective hiring rubrics to produce decision support for human hiring managers.
          </p>

          <div className="flex items-start gap-2 text-xs text-stone-500 pt-2 border-t border-stone-200">
            <Info className="h-4 w-4 text-[#1E3A5F] shrink-0 mt-0.5" />
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
            className="mt-1 h-4 w-4 rounded border-stone-300 text-[#1E3A5F] focus:ring-[#1E3A5F]"
          />
          <span className="text-xs text-stone-700">
            I acknowledge that I am speaking with an AI interview panel and consent to real-time audio transcription and competency evaluation.
          </span>
        </label>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!acknowledged}
            onClick={onAccept}
            className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#162A45] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Accept &amp; Enter Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
