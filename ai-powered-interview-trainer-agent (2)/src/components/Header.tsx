import React from 'react';
import { Bot, BookOpen, RotateCcw, Award, Sparkles } from 'lucide-react';
import { InterviewSession } from '../types';

interface HeaderProps {
  session: InterviewSession | null;
  onNewSession: () => void;
  onOpenCorpus: () => void;
  onOpenSummary?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  onNewSession,
  onOpenCorpus,
  onOpenSummary,
}) => {
  const answeredCount = session?.questions.filter((q) => !!q.evaluation).length || 0;
  const totalQuestions = session?.questions.length || 5;
  const avgScore =
    session && answeredCount > 0
      ? (session.questions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0) / answeredCount).toFixed(1)
      : null;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                AI Interview Trainer Agent
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3 text-blue-600" />
                RAG Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              IBM SkillsBuild × AICTE 2026 • Real-time Evaluation & STAR Model Answers
            </p>
          </div>
        </div>

        {/* Center: Active Session Stats */}
        {session && (
          <div className="hidden md:flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">{session.role}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{session.experience}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{session.domain}</span>
            </div>

            <div className="h-3 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Progress:</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-blue-600">{answeredCount}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600">{totalQuestions}</span>
              </div>
            </div>

            {avgScore && (
              <>
                <div className="h-3 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-slate-500">Avg Score:</span>
                  <span className="font-bold text-amber-600">{avgScore}/10</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            id="explore-corpus-btn"
            onClick={onOpenCorpus}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Browse curated RAG Q&A knowledge base"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">RAG Knowledge Base</span>
          </button>

          {session && onOpenSummary && (
            <button
              id="view-summary-btn"
              onClick={onOpenSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scorecard</span>
            </button>
          )}

          <button
            id="new-session-btn"
            onClick={onNewSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};
