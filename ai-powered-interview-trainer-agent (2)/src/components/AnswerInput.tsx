import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Sparkles, CornerDownLeft, Trash2, Wand2 } from 'lucide-react';

interface AnswerInputProps {
  onSubmitAnswer: (answer: string) => void;
  isLoading: boolean;
  questionCategory?: string;
  disabled?: boolean;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmitAnswer,
  isLoading,
  questionCategory = 'Technical',
  disabled = false,
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setAnswer((prev) => {
            const cleanPrev = prev.trim();
            return cleanPrev ? `${cleanPrev} ${currentTranscript}` : currentTranscript;
          });
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const handleFormSubmit = () => {
    if (!answer.trim() || isLoading || disabled) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    onSubmitAnswer(answer.trim());
    setAnswer('');
  };

  const insertSTARPrompt = () => {
    const starTemplate = `Situation: \nTask: \nAction: \nResult: `;
    setAnswer((prev) => (prev ? `${prev}\n\n${starTemplate}` : starTemplate));
    textareaRef.current?.focus();
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
      {/* Top Helper Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Your Response:</span>
          {questionCategory === 'Behavioral' && (
            <button
              type="button"
              onClick={insertSTARPrompt}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer font-medium"
            >
              <Wand2 className="w-3 h-3" />
              <span>Insert STAR Template</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className={wordCount > 30 ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
            {wordCount} words
          </span>
          {answer && (
            <button
              onClick={() => setAnswer('')}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              title="Clear answer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="candidate-answer-input"
          disabled={disabled || isLoading}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          placeholder={
            questionCategory === 'Behavioral'
              ? 'Type your answer using the STAR method (Situation, Task, Action, Result) or click the microphone to speak...'
              : 'Type your technical answer here, explaining core concepts, code logic, or trade-offs...'
          }
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none text-slate-800 placeholder:text-slate-400"
        />

        {isRecording && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Listening...
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {speechSupported && (
            <button
              id="voice-mic-btn"
              type="button"
              onClick={toggleRecording}
              disabled={disabled || isLoading}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 text-white border-red-600 shadow-sm animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title={isRecording ? 'Stop voice recording' : 'Speak your answer using microphone'}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-blue-600" />}
              <span>{isRecording ? 'Stop Mic' : 'Voice Input'}</span>
            </button>
          )}

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px]">Enter</kbd> to submit
          </span>
        </div>

        <button
          id="submit-answer-btn"
          type="button"
          onClick={handleFormSubmit}
          disabled={!answer.trim() || isLoading || disabled}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Evaluating with RAG...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Evaluation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
