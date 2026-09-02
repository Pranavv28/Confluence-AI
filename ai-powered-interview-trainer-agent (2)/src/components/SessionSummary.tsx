import React from 'react';
import { Award, Download, Copy, RotateCcw, CheckCircle2, AlertTriangle, Sparkles, Share2, Check } from 'lucide-react';
import { InterviewSession } from '../types';

interface SessionSummaryProps {
  session: InterviewSession;
  onRestart: () => void;
  onClose?: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ session, onRestart, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const answeredQuestions = session.questions.filter((q) => !!q.evaluation);
  const totalScore = answeredQuestions.reduce((acc, q) => acc + (q.evaluation?.score || 0), 0);
  const avgScore = answeredQuestions.length > 0 ? (totalScore / answeredQuestions.length).toFixed(1) : '0';
  const percentage = answeredQuestions.length > 0 ? Math.round((totalScore / (answeredQuestions.length * 10)) * 100) : 0;

  const getGrade = (pct: number) => {
    if (pct >= 85) return { grade: 'A', label: 'Interview Ready (Exemplary)', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' };
    if (pct >= 70) return { grade: 'B', label: 'Solid Competence (Ready with minor polish)', color: 'text-blue-600 bg-blue-50 border-blue-300' };
    if (pct >= 50) return { grade: 'C', label: 'Developing (Review foundational concepts)', color: 'text-amber-600 bg-amber-50 border-amber-300' };
    return { grade: 'Needs Prep', label: 'Needs Additional Practice', color: 'text-rose-600 bg-rose-50 border-rose-300' };
  };

  const gradeInfo = getGrade(percentage);

  const handleDownloadJSON = () => {
    const dataToExport = {
      session_id: session.id,
      timestamp: session.createdAt,
      role: session.role,
      experience: session.experience,
      domain: session.domain,
      summary: {
        total_questions: session.questions.length,
        answered_questions: answeredQuestions.length,
        average_score: Number(avgScore),
        readiness_percentage: percentage,
      },
      questions: session.questions.map((q) => ({
        number: q.number,
        category: q.category,
        question: q.question,
        interviewer_criteria: q.interviewerCriteria,
        candidate_answer: q.userAnswer,
        score: q.evaluation?.score,
        strengths: q.evaluation?.strengths,
        missing_gaps: q.evaluation?.missingGaps,
        improved_answer: q.evaluation?.improvedAnswer,
      })),
      turns: session.turns,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_session_${session.role.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `🎯 Interview Scorecard: ${session.role} (${session.experience} - ${session.domain})\nAverage Score: ${avgScore}/10 (${percentage}%)\n\n` +
      session.questions
        .filter((q) => q.evaluation)
        .map(
          (q) =>
            `Q${q.number} [${q.category}]: ${q.question}\nScore: ${q.evaluation?.score}/10\nStrengths: ${q.evaluation?.strengths?.join(', ')}\n`
        )
        .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Mock Interview Scorecard
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Performance Summary & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {session.role} • {session.experience} Level • {session.domain} Domain
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Download full session JSON transcript"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Session</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Average Score */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
            Overall Average Score
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black text-blue-900">{avgScore}</span>
            <span className="text-sm font-semibold text-blue-600">/ 10</span>
          </div>
          <span className="text-xs text-blue-700">
            Across {answeredQuestions.length} evaluated questions
          </span>
        </div>

        {/* Metric 2: Readiness Percentage */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Hiring Readiness Rating
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black text-emerald-900">{percentage}%</span>
          </div>
          <span className="text-xs text-emerald-700 font-medium">{gradeInfo.label}</span>
        </div>

        {/* Metric 3: Question Completion */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/80 flex flex-col justify-between">
          <span className="text-xs font-semibold text-purple-800 uppercase tracking-wider">
            Completed Rounds
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black text-purple-900">{answeredQuestions.length}</span>
            <span className="text-sm font-semibold text-purple-600">/ {session.questions.length}</span>
          </div>
          <span className="text-xs text-purple-700">Technical & Behavioral coverage</span>
        </div>
      </div>

      {/* Question Breakdown List */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Question-by-Question Detailed Breakdown
        </h3>

        <div className="space-y-3">
          {session.questions.map((q) => {
            const hasEval = !!q.evaluation;
            return (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 text-white text-[11px] font-bold">
                      {q.number}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">[{q.category}]</span>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{q.question}</h4>
                  </div>

                  {hasEval ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Score: {q.evaluation?.score}/10
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs text-slate-400 bg-slate-100">
                      Skipped / Not Answered
                    </span>
                  )}
                </div>

                {hasEval && (
                  <div className="space-y-2 text-xs pt-1 pl-7">
                    {/* User Answer snippet */}
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                      <span className="font-semibold text-slate-900">Your Answer:</span> "{q.userAnswer}"
                    </div>

                    {/* Key Strengths & Gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="text-emerald-800">
                        <span className="font-semibold">Strengths:</span>{' '}
                        {q.evaluation?.strengths?.join('; ')}
                      </div>
                      <div className="text-amber-800">
                        <span className="font-semibold">Missing Gaps:</span>{' '}
                        {q.evaluation?.missingGaps?.join('; ')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
