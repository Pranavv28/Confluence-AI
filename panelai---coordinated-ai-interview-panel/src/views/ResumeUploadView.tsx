import React, { useState } from "react";
import { CandidateProfile } from "../types/interview";
import { parseResumeText } from "../lib/resumeParser";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Code,
  Briefcase,
  GraduationCap,
  Layers,
  RefreshCw,
} from "lucide-react";

interface ResumeUploadViewProps {
  candidate: CandidateProfile;
  onUpdateCandidate: (profile: CandidateProfile) => void;
  onNavigate: (view: string) => void;
}

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  candidate,
  onUpdateCandidate,
  onNavigate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(true);
  const [activeProfile, setActiveProfile] = useState<CandidateProfile>(candidate);

  const handleSimulatedUpload = async (fileName = "Alex_Chen_Staff_Systems_Resume.pdf") => {
    setIsProcessing(true);
    setUploadSuccess(false);

    // Simulate realistic parsing pipeline
    setTimeout(async () => {
      const parsed = await parseResumeText(
        `Alex Chen - Senior Distributed Systems Engineer. Experienced in Go, Kafka, Redis Cluster, distributed caching, partition tolerance, and Kubernetes microservices. Re-architected settlement pipelines to 35,000 tx/sec with p99 < 28ms.`,
        "Alex Chen"
      );
      setActiveProfile(parsed);
      onUpdateCandidate(parsed);
      setIsProcessing(false);
      setUploadSuccess(true);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
          <FileText className="h-3.5 w-3.5" />
          <span>Resume Normalization Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Upload & Extract Candidate Context</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Our parser extracts structured context so the AI panel can contextualize follow-ups to your real accomplishments.
        </p>
      </div>

      {/* Drag & Drop Area (Requirement #9) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          handleSimulatedUpload(file ? file.name : "Resume.pdf");
        }}
        onClick={() => handleSimulatedUpload()}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-zinc-700 bg-zinc-950/60 hover:border-zinc-500 hover:bg-zinc-900/50"
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>
        <h3 className="text-base font-bold text-white">
          Drop your resume here (PDF or DOCX)
        </h3>
        <p className="text-xs text-zinc-400 mt-1">or click to browse from your computer</p>

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-400 animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Processing Resume & Extracting Context...</span>
          </div>
        )}

        {uploadSuccess && !isProcessing && (
          <div className="mt-4 flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
            <span>Resume processed successfully &middot; Structured Context Ready</span>
          </div>
        )}
      </div>

      {/* Extracted Structured Profile View (Requirement #9) */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-white">Extracted Candidate Profile</h2>
            <p className="text-xs text-zinc-400">Available to all panel interviewers during turn orchestration</p>
          </div>
          <button
            onClick={() => onNavigate("candidate-setup")}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
          >
            <span>Proceed to Interview Prep</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Education */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Candidate Name</span>
              <p className="text-sm font-bold text-zinc-100 mt-0.5">{activeProfile.name}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Role</span>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{activeProfile.targetRole}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Experience Level</span>
              <p className="text-sm text-zinc-200 mt-0.5">{activeProfile.yearsOfExperience} Years</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Education</span>
              {activeProfile.education.map((edu, i) => (
                <div key={i} className="mt-1 text-xs text-zinc-300">
                  <p className="font-semibold">{edu.degree}</p>
                  <p className="text-zinc-400">{edu.institution} ({edu.year})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Technologies */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Extracted Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeProfile.skills.map((skill, i) => (
                  <span key={i} className="rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Core Domains</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activeProfile.domains.map((dom, i) => (
                  <span key={i} className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                    {dom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Highlights & Projects */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Key Systems & Projects</span>
              <div className="space-y-2 mt-2">
                {activeProfile.projects.map((proj, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
                    <p className="font-bold text-zinc-200">{proj.name}</p>
                    <p className="text-zinc-400 mt-1">{proj.description}</p>
                    <p className="text-blue-300 font-mono mt-1 text-[11px]">Impact: {proj.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
