import React, { useState, useEffect } from "react";
import { CandidateProfile, JobConfig } from "../types/interview";
import { DEMO_JOBS } from "../lib/demoData";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import {
  Mic,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Settings,
  AlertCircle,
} from "lucide-react";

interface InterviewSetupViewProps {
  candidate: CandidateProfile;
  selectedJob: JobConfig;
  onSelectJob: (job: JobConfig) => void;
  onProceedToInterview: () => void;
  onNavigate: (view: string) => void;
}

export const InterviewSetupView: React.FC<InterviewSetupViewProps> = ({
  candidate,
  selectedJob,
  onSelectJob,
  onProceedToInterview,
  onNavigate,
}) => {
  const [micTested, setMicTested] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [disclosureAccepted, setDisclosureAccepted] = useState(true);

  // Test microphone using Web Audio API
  const handleTestMic = async () => {
    try {
      setIsTestingMic(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let ticks = 0;
      const interval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);

        ticks++;
        if (ticks > 40) {
          clearInterval(interval);
          stream.getTracks().forEach((t) => t.stop());
          audioCtx.close();
          setIsTestingMic(false);
          setMicTested(true);
        }
      }, 100);
    } catch (err) {
      console.warn("Could not test mic:", err);
      setIsTestingMic(false);
      setMicTested(true); // Allow proceeding in sandboxes
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
          <Settings className="h-3.5 w-3.5" />
          <span>Interview Preparation & Hardware Readiness</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview System Check</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Verify your audio connection and review your panel configuration before starting the live session.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Setup Steps */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Microphone Test */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">1. Microphone & Audio Check</h3>
                  <p className="text-xs text-zinc-400">Ensures clear speech input for Agora STT</p>
                </div>
              </div>
              {micTested && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Ready</span>
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Input Audio Level</span>
                <span className="font-mono text-zinc-200">{micVolume}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${Math.max(5, micVolume)}%` }}
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleTestMic}
                  disabled={isTestingMic}
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{isTestingMic ? "Testing... Speak now" : micTested ? "Test Microphone Again" : "Test Microphone"}</span>
                </button>
                <p className="text-[11px] text-zinc-400">Speak into your mic to verify volume</p>
              </div>
            </div>
          </div>

          {/* Step 2: Target Position Selection */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-white mb-1">2. Target Position</h3>
            <p className="text-xs text-zinc-400 mb-4">Choose which role rubric to be evaluated against</p>

            <div className="space-y-3">
              {DEMO_JOBS.map((job) => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    selectedJob.id === job.id
                      ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-100">{job.title}</span>
                      <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                        Level {job.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{job.department} &bull; {job.durationMinutes} mins</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedJob.id === job.id
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-zinc-700 bg-transparent"
                    }`}
                  >
                    {selectedJob.id === job.id && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: AI Disclosure Acknowledgment (Requirement #15 & #24) */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs text-zinc-300">
                <h4 className="font-bold text-white text-sm">3. Transparent AI Disclosure</h4>
                <p>
                  This interview is conducted by multiple AI interviewers powered by Agora Conversational AI. Your responses will be analyzed in real time to generate an evidence-linked assessment report for human review.
                </p>
                <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={disclosureAccepted}
                    onChange={(e) => setDisclosureAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-zinc-200 font-medium">
                    I understand and accept the AI interview disclosure
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Coordinated Panel Preview */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white mb-3">Interview Panel for this Session</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Your panel will collaboratively evaluate your responses across multiple dimensions.
            </p>

            <div className="space-y-3">
              {selectedJob.panelConfig
                .filter((p) => p.enabled)
                .map((item) => {
                  const persona = INTERVIEWER_PERSONAS[item.role];
                  return (
                    <div
                      key={item.role}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/50"
                    >
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-200 truncate">{persona.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{persona.title}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {item.weight}%
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Launch Button */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <button
                disabled={!disclosureAccepted}
                onClick={onProceedToInterview}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/25 hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <span>Enter Live Interview Room</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
