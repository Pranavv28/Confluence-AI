import React, { useState } from 'react';
import { HelpCircle, Volume2, VolumeX, Lightbulb, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { InterviewQuestion } from '../types';

interface QuestionCardProps {
  question: InterviewQuestion;
  totalQuestions: number;
  currentIndex: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  totalQuestions,
  currentIndex,
}) => {
  const [showCriteria, setShowCriteria] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `Question ${question.number}. ${question.question}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(question.question);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Technical':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Behavioral':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Situational':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'HR':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
            {question.number}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            Question {question.number} of {totalQuestions}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(
              question.category
            )}`}
          >
            {question.category}
          </span>
        </div>

        {/* Audio & Copy Buttons */}
        <div className="flex items-center gap-1.5">
          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeak}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-slate-500 hover:text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title={isSpeaking ? 'Stop listening' : 'Read question aloud'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Copy question text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="p-6">
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-relaxed">
          {question.question}
        </h3>

        {/* What the interviewer wants expandable tip */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowCriteria(!showCriteria)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>{showCriteria ? 'Hide' : 'Show'} interviewer expectations / hints</span>
            {showCriteria ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {showCriteria && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed animate-in fade-in duration-150">
              <span className="font-semibold text-amber-800">💡 What the interviewer evaluates:</span>{' '}
              {question.interviewerCriteria}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
