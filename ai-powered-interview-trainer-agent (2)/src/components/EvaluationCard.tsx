import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, Copy, Check, ArrowRight, HelpCircle } from 'lucide-react';
import { EvaluationResult } from '../types';

interface EvaluationCardProps {
  evaluation: EvaluationResult;
  questionNumber: number;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ evaluation, questionNumber }) => {
  const [copied, setCopied] = useState(false);

  const getScoreStyle = (score: number) => {
    if (score >= 8) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', fill: 'bg-emerald-500', label: 'Strong Answer' };
    if (score >= 6) return { bg: 'bg-amber-50 text-amber-700 border-amber-300', fill: 'bg-amber-500', label: 'Good Attempt' };
    return { bg: 'bg-rose-50 text-rose-700 border-rose-300', fill: 'bg-rose-500', label: 'Needs Polish' };
  };

  const scoreStyle = getScoreStyle(evaluation.score);

  const handleCopyImproved = () => {
    navigator.clipboard.writeText(evaluation.improvedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Header bar */}
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <h4 className="text-sm font-bold text-slate-800">
            Evaluation & Feedback • Question {questionNumber}
          </h4>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{scoreStyle.label}</span>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${scoreStyle.bg}`}>
            <span>Score:</span>
            <span className="text-sm font-black">{evaluation.score}</span>
            <span className="text-xs opacity-70">/ 10</span>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Score Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Response Quality Rating</span>
            <span>{evaluation.score * 10}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scoreStyle.fill}`}
              style={{ width: `${evaluation.score * 10}%` }}
            />
          </div>
        </div>

        {/* Grid: Strengths & Missing Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Strengths Identified</span>
            </div>
            <ul className="space-y-1.5 text-xs text-emerald-950">
              {evaluation.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Gaps */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Gaps & Areas to Improve</span>
            </div>
            <ul className="space-y-1.5 text-xs text-amber-950">
              {evaluation.missingGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold mt-0.5">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improved Model Answer */}
        <div className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Improved Answer (STAR / Model Standard)</span>
            </div>
            <button
              onClick={handleCopyImproved}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
            {evaluation.improvedAnswer}
          </p>
        </div>

        {/* Suggested Follow-up Probe */}
        {evaluation.suggestedFollowUp && (
          <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Follow-up Opportunity:</span>{' '}
              {evaluation.suggestedFollowUp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
