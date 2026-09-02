import React, { useEffect, useRef } from 'react';
import { Bot, User, Sparkles, Award } from 'lucide-react';
import { ConversationTurn } from '../types';
import { EvaluationCard } from './EvaluationCard';

interface ChatTimelineProps {
  turns: ConversationTurn[];
  isEvaluating: boolean;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({ turns, isEvaluating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isEvaluating]);

  return (
    <div className="space-y-5">
      {turns.map((turn, index) => {
        const isAssistant = turn.role === 'assistant';

        return (
          <div
            key={turn.id || index}
            className={`flex gap-3 sm:gap-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
          >
            {/* Assistant Avatar */}
            {isAssistant && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            {/* Message Bubble or Card */}
            <div className={`max-w-2xl sm:max-w-3xl space-y-3 ${isAssistant ? 'w-full' : ''}`}>
              {turn.evaluation ? (
                // Evaluation Card when evaluation is present
                <EvaluationCard
                  evaluation={turn.evaluation}
                  questionNumber={turn.questionNumber || index}
                />
              ) : (
                <div
                  className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    isAssistant
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs ml-auto'
                  }`}
                >
                  <p className="whitespace-pre-line">{turn.content}</p>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-[10px] text-slate-400 px-1 ${
                  isAssistant ? 'text-left' : 'text-right'
                }`}
              >
                {new Date(turn.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            {/* Candidate Avatar */}
            {!isAssistant && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Evaluating state indicator */}
      {isEvaluating && (
        <div className="flex items-center gap-3 text-slate-500 text-xs py-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="font-medium text-slate-600">Evaluating response with RAG knowledge grounding...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
