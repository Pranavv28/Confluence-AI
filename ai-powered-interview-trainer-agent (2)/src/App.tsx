import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SetupModal } from './components/SetupModal';
import { QuestionCard } from './components/QuestionCard';
import { AnswerInput } from './components/AnswerInput';
import { ChatTimeline } from './components/ChatTimeline';
import { SessionSummary } from './components/SessionSummary';
import { CorpusExplorerModal } from './components/CorpusExplorerModal';
import { CandidateProfile, InterviewSession, InterviewQuestion } from './types';
import { Bot, Sparkles, Award, BookOpen, CheckCircle2, ChevronRight, Play, ArrowRight } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isCorpusOpen, setIsCorpusOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'interview' | 'summary'>('interview');
  const [isStarting, setIsStarting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Auto-prompt setup if no session on initial load
  useEffect(() => {
    const saved = localStorage.getItem('interview_session_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSession(parsed);
      } catch (e) {
        setIsSetupOpen(true);
      }
    } else {
      setIsSetupOpen(true);
    }
  }, []);

  // Cache session state changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('interview_session_cache', JSON.stringify(session));
    }
  }, [session]);

  const handleStartSession = async (profile: CandidateProfile) => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error('Failed to start interview session');
      }

      const data = await res.json();
      setSession(data.session);
      setActiveTab('interview');
      setIsSetupOpen(false);
    } catch (err: any) {
      console.error(err);
      alert('Error initializing interview: ' + (err.message || 'Please try again.'));
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async (userAnswer: string) => {
    if (!session) return;
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          userAnswer,
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation request failed');
      }

      const data = await res.json();
      setSession(data.session);

      if (data.isCompleted) {
        setActiveTab('summary');
      }
    } catch (err: any) {
      console.error(err);
      alert('Failed to evaluate answer: ' + (err.message || 'Please try again.'));
    } finally {
      setIsEvaluating(false);
    }
  };

  const activeQuestion: InterviewQuestion | undefined =
    session?.questions[session.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Sticky Header */}
      <Header
        session={session}
        onNewSession={() => setIsSetupOpen(true)}
        onOpenCorpus={() => setIsCorpusOpen(true)}
        onOpenSummary={session?.status === 'completed' ? () => setActiveTab('summary') : undefined}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {!session ? (
          // Welcome / Empty State
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                AI Interview Trainer Agent
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Practice tailored technical and behavioral interviews with real-time scoring, STAR model answers, and RAG knowledge base grounding.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-blue-600">01. Tailored Questions</span>
                <p className="text-[11px] text-slate-500">
                  3 Technical + 2 Behavioral/HR questions customized to your role.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-indigo-600">02. Real-time RAG</span>
                <p className="text-[11px] text-slate-500">
                  Evaluates answers instantly against curated knowledge corpus.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-600">03. STAR Model Answers</span>
                <p className="text-[11px] text-slate-500">
                  Scores out of 10 with actionable strengths, gaps, and improvements.
                </p>
              </div>
            </div>

            <button
              id="start-first-session-btn"
              onClick={() => setIsSetupOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configure Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          // Active Session Screen
          <div className="flex-1 flex flex-col gap-6">
            {/* Navigation Tabs when completed */}
            {session.status === 'completed' && (
              <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('interview')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'interview'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interview Transcript
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'summary'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Scorecard & Performance Summary
                </button>
              </div>
            )}

            {activeTab === 'summary' ? (
              <SessionSummary
                session={session}
                onRestart={() => setIsSetupOpen(true)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Questions List & Roadmap */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Session Roadmap</h3>
                        <p className="text-xs text-slate-500">
                          {session.role} ({session.experience})
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {session.domain}
                      </span>
                    </div>

                    {/* Question Step items */}
                    <div className="space-y-2">
                      {session.questions.map((q, idx) => {
                        const isCurrent = idx === session.currentQuestionIndex && session.status !== 'completed';
                        const isAnswered = !!q.evaluation;

                        return (
                          <div
                            key={q.id}
                            className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                              isCurrent
                                ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
                                : isAnswered
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span
                              className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${
                                isAnswered
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {isAnswered ? <CheckCircle2 className="w-3.5 h-3.5" /> : q.number}
                            </span>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-semibold text-slate-800">
                                  [{q.category}]
                                </span>
                                {q.evaluation && (
                                  <span className="font-bold text-emerald-700">
                                    {q.evaluation.score}/10
                                  </span>
                                )}
                              </div>
                              <p className="line-clamp-2 text-[11px] text-slate-600">{q.question}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Knowledge base helper */}
                    <div className="pt-2">
                      <button
                        onClick={() => setIsCorpusOpen(true)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>View RAG Knowledge Base</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Active Question + Answer Area + Chat Timeline */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Current Active Question Card (if in progress) */}
                  {session.status !== 'completed' && activeQuestion && (
                    <QuestionCard
                      question={activeQuestion}
                      totalQuestions={session.questions.length}
                      currentIndex={session.currentQuestionIndex}
                    />
                  )}

                  {/* Answer Input Box (if in progress) */}
                  {session.status !== 'completed' && activeQuestion && (
                    <AnswerInput
                      onSubmitAnswer={handleSubmitAnswer}
                      isLoading={isEvaluating}
                      questionCategory={activeQuestion.category}
                    />
                  )}

                  {/* Full conversation transcript with feedback cards */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Interview Transcript & Feedback Log
                      </h3>
                      <span className="text-xs text-slate-400">
                        {session.turns.length} interaction turns
                      </span>
                    </div>

                    <ChatTimeline turns={session.turns} isEvaluating={isEvaluating} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Setup Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartSession={handleStartSession}
        isLoading={isStarting}
      />

      {/* RAG Knowledge Base Modal */}
      <CorpusExplorerModal
        isOpen={isCorpusOpen}
        onClose={() => setIsCorpusOpen(false)}
      />
    </div>
  );
}
