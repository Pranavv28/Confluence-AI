import React, { useState } from "react";
import { CandidateProfile } from "../types/interview";
import { parseResumeText } from "../lib/resumeParser";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Edit3,
  AlertCircle,
  FileCode,
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<CandidateProfile>(candidate);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [pastedText, setPastedText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Process text through server or client parser
  const processResumeContent = async (text: string, fileName = "") => {
    if (!text || text.trim().length < 20) {
      setErrorMessage("The provided resume content is too short. Please provide a detailed resume.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Attempt server-side parsing (which leverages Gemini if configured)
      let parsed: CandidateProfile | null = null;
      try {
        const res = await fetch("/api/resume/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, fileName }),
        });
        const data = await res.json();
        if (data.success && data.profile) {
          parsed = data.profile;
        }
      } catch (err) {
        console.warn("Server parsing notice:", err);
      }

      // 2. Fall back to direct local parser if server route unavailable
      if (!parsed) {
        parsed = await parseResumeText(text, fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
      }

      setActiveProfile(parsed);
      onUpdateCandidate(parsed);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse resume content. Please verify or paste the text directly.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file input
  // PDFs are sent as raw binary to /api/resume/upload (Gemini native PDF understanding)
  // Text files (txt, md) go through the text extraction path
  const handleFileChange = async (file: File) => {
    if (!file) return;

    const allowedExtensions = [".pdf", ".txt", ".md"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      setErrorMessage("Please upload a PDF, TXT, or Markdown file. For DOCX files, please use the \"Paste Text\" tab instead.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      if (fileExt === ".pdf") {
        // Send raw PDF bytes to Gemini-native PDF parser
        const arrayBuffer = await file.arrayBuffer();
        const res = await fetch("/api/resume/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
            "x-file-name": file.name,
          },
          body: arrayBuffer,
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.profile) {
          throw new Error(data.error || "PDF parsing failed. Please try pasting your resume text instead.");
        }
        setActiveProfile(data.profile);
        onUpdateCandidate(data.profile);
      } else {
        // Text files: read as string through existing text path
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result;
          if (typeof content === "string") {
            await processResumeContent(content, file.name);
          }
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setErrorMessage("Could not read the file. Please try pasting the text directly.");
          setIsProcessing(false);
        };
        reader.readAsText(file);
        return; // early return — reader.onload handles setIsProcessing(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse the file. Please try the Paste Text option.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 border border-stone-200 mb-2">
          <FileText className="h-3.5 w-3.5 text-stone-500" />
          <span>Candidate Background Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
          Upload & Ground Your Resume
        </h1>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          The AI interview panel grounds its technical depth, product challenges, and behavioral questions directly in your real projects and accomplishments.
        </p>
      </div>

      {/* Tabs for Upload vs Paste */}
      <div className="flex border-b border-stone-200 gap-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab("upload")}
          className={`pb-2.5 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "upload"
              ? "border-b-2 border-slate-900 text-stone-900 font-semibold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
        <button
          onClick={() => setActiveTab("paste")}
          className={`pb-2.5 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "paste"
              ? "border-b-2 border-slate-900 text-stone-900 font-semibold"
              : "text-stone-500 hover:text-stone-800"
          }`}
        >
          <FileCode className="h-4 w-4" />
          <span>Paste Text Directly</span>
        </button>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab 1: Drag & Drop Area */}
      {activeTab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition bg-white ${
            isDragging
              ? "border-blue-500 bg-blue-50/50"
              : "border-stone-300 hover:border-stone-400"
          }`}
        >
          <input
            type="file"
            id="resume-file-input"
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
            }}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-stone-700 mb-3 border border-stone-200">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">
            Drag and drop your resume here
          </h3>
          <p className="text-xs text-stone-500 mt-1">Supports PDF, DOCX, TXT, or Markdown</p>

          <label
            htmlFor="resume-file-input"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
          >
            Select from Computer
          </label>

          {isProcessing && (
            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-stone-600 animate-pulse">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-stone-500" />
              <span>Analyzing resume structure & extracting competency context...</span>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Paste Direct Text */}
      {activeTab === "paste" && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-xs">
          <label className="text-xs font-semibold text-stone-700 block">
            Paste your resume or experience summary:
          </label>
          <textarea
            rows={7}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw text including your roles, technologies, accomplishments, and projects..."
            className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400 font-mono"
          />
          <div className="flex justify-end">
            <button
              onClick={() => processResumeContent(pastedText)}
              disabled={isProcessing || pastedText.trim().length < 20}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 transition cursor-pointer"
            >
              {isProcessing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              <span>Extract Structured Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Extracted Structured Profile Review Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">Extracted Candidate Profile</h2>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Ready for Panel
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Review your extracted details before proceeding to the interview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700 transition cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-stone-500" />
              <span>{isEditing ? "Save View" : "Edit Profile"}</span>
            </button>

            <button
              onClick={() => onNavigate("candidate-setup")}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer shadow-xs"
            >
              <span>Continue to Interview</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Identity Column */}
          <div className="space-y-3.5">
            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Candidate Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={activeProfile.name}
                  onChange={(e) => {
                    const updated = { ...activeProfile, name: e.target.value };
                    setActiveProfile(updated);
                    onUpdateCandidate(updated);
                  }}
                  className="mt-1 w-full rounded border border-stone-300 p-1.5 text-xs"
                />
              ) : (
                <p className="font-bold text-stone-900 text-sm mt-0.5">{activeProfile.name}</p>
              )}
            </div>

            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Target Role</span>
              {isEditing ? (
                <input
                  type="text"
                  value={activeProfile.targetRole}
                  onChange={(e) => {
                    const updated = { ...activeProfile, targetRole: e.target.value };
                    setActiveProfile(updated);
                    onUpdateCandidate(updated);
                  }}
                  className="mt-1 w-full rounded border border-stone-300 p-1.5 text-xs"
                />
              ) : (
                <p className="font-semibold text-slate-800 text-xs mt-0.5">{activeProfile.targetRole}</p>
              )}
            </div>

            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Experience Level</span>
              <p className="text-stone-700 mt-0.5">{activeProfile.yearsOfExperience} Years of Professional Experience</p>
            </div>

            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Contact Email</span>
              <p className="text-stone-600 mt-0.5">{activeProfile.email}</p>
            </div>
          </div>

          {/* Core Skills & Domains */}
          <div className="space-y-3.5">
            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Extracted Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeProfile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700 border border-stone-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Industry Domains</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {activeProfile.domains.map((dom, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 border border-blue-100"
                  >
                    {dom}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience Highlights */}
          <div className="space-y-3">
            <span className="font-semibold text-stone-500 uppercase tracking-wider text-[10px]">Recent Experience Highlights</span>
            <div className="space-y-2">
              {activeProfile.experience.map((exp, idx) => (
                <div key={idx} className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
                  <p className="font-semibold text-stone-900">{exp.role}</p>
                  <p className="text-stone-500 text-[11px]">{exp.company} &bull; {exp.period}</p>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="mt-1.5 list-disc list-inside text-[11px] text-stone-600 space-y-0.5">
                      {exp.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="line-clamp-2">{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
