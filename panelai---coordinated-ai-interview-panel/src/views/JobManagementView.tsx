import React, { useState } from "react";
import { JobConfig, InterviewerRole } from "../types/interview";
import { DEMO_JOBS } from "../lib/demoData";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import {
  Briefcase,
  Plus,
  Sliders,
  Check,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface JobManagementViewProps {
  onStartInterviewWithJob: (job: JobConfig) => void;
  onNavigate: (view: string) => void;
}

export const JobManagementView: React.FC<JobManagementViewProps> = ({
  onStartInterviewWithJob,
  onNavigate,
}) => {
  const [jobs, setJobs] = useState<JobConfig[]>(DEMO_JOBS);
  const [selectedJob, setSelectedJob] = useState<JobConfig>(DEMO_JOBS[0]);
  const [isCreating, setIsCreating] = useState(false);

  // New Job Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDepartment, setNewDepartment] = useState("Engineering");
  const [newDifficulty, setNewDifficulty] = useState(3);
  const [techWeight, setTechWeight] = useState(40);
  const [prodWeight, setProdWeight] = useState(25);
  const [behavWeight, setBehavWeight] = useState(20);
  const [hmWeight, setHmWeight] = useState(15);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const created: JobConfig = {
      id: `job_${Date.now()}`,
      title: newTitle,
      department: newDepartment,
      description: `Targeted hiring evaluation for ${newTitle}.`,
      requiredSkills: ["System Design", "Communication", "Problem Solving"],
      preferredSkills: ["Distributed Systems", "Cloud Infrastructure"],
      experienceLevel: newDifficulty >= 4 ? "Principal" : newDifficulty === 3 ? "Senior" : "Mid-Level",
      durationMinutes: 30,
      difficulty: newDifficulty,
      competencies: [
        "Technical Depth",
        "System Design",
        "Product Thinking",
        "Communication",
        "Leadership",
      ],
      panelConfig: [
        { role: "technical", weight: techWeight, enabled: true, order: 1 },
        { role: "product", weight: prodWeight, enabled: true, order: 2 },
        { role: "behavioral", weight: behavWeight, enabled: true, order: 3 },
        { role: "hiring_manager", weight: hmWeight, enabled: true, order: 4 },
      ],
    };

    setJobs((prev) => [created, ...prev]);
    setSelectedJob(created);
    setIsCreating(false);
    setNewTitle("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20 mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Job Panel Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview Panels &amp; Rubrics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Customize which AI interviewers evaluate each role and set weighting percentages.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? "Cancel" : "Create New Job Panel"}</span>
        </button>
      </div>

      {/* New Job Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateJob}
          className="rounded-3xl border border-blue-500/40 bg-zinc-950 p-6 sm:p-8 backdrop-blur-md space-y-6 ring-1 ring-blue-500/20"
        >
          <h2 className="text-lg font-bold text-white">Configure New Job &amp; Panel Composition</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Staff Distributed Systems Architect"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="AI / Research">AI / Research</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Difficulty Level ({newDifficulty} / 5)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>
          </div>

          {/* Panel Weights Configuration */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Interviewer Panel Weights (Must Total 100%)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-xs font-bold text-blue-400">Marcus (Technical)</span>
                <input
                  type="number"
                  value={techWeight}
                  onChange={(e) => setTechWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-200"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-xs font-bold text-purple-400">Elena (Product)</span>
                <input
                  type="number"
                  value={prodWeight}
                  onChange={(e) => setProdWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-200"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-xs font-bold text-emerald-400">Devon (Behavioral)</span>
                <input
                  type="number"
                  value={behavWeight}
                  onChange={(e) => setBehavWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-200"
                />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <span className="text-xs font-bold text-amber-400">Sarah (Hiring Mgr)</span>
                <input
                  type="number"
                  value={hmWeight}
                  onChange={(e) => setHmWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-1.5 text-xs text-zinc-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white transition"
            >
              Save Job Panel
            </button>
          </div>
        </form>
      )}

      {/* Existing Jobs List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Job List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-bold text-white mb-2">Available Job Profiles</h2>
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`rounded-2xl border p-4 transition cursor-pointer ${
                selectedJob.id === job.id
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                  : "border-zinc-800 bg-zinc-950/80 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-100">{job.title}</span>
                <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-blue-400 font-mono">
                  Level {job.difficulty}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{job.department} &bull; {job.durationMinutes} mins</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.requiredSkills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Job Panel Details & Direct Launch CTA (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{selectedJob.title}</h3>
                <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
                  {selectedJob.experienceLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{selectedJob.description}</p>
            </div>

            <button
              onClick={() => onStartInterviewWithJob(selectedJob)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <span>Test This Panel</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Configured Panel Composition */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Assigned Interviewers &amp; Focus Weights
            </h4>
            <div className="space-y-3">
              {selectedJob.panelConfig.map((item) => {
                const persona = INTERVIEWER_PERSONAS[item.role];
                return (
                  <div
                    key={item.role}
                    className="flex items-center justify-between p-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="h-10 w-10 rounded-xl object-cover border border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{persona.name}</p>
                        <p className="text-[11px] text-zinc-400">{persona.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400 hidden sm:inline">{persona.focusAreas[0]}</span>
                      <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 text-xs">
                        {item.weight}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Target Competencies */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Evaluated Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedJob.competencies.map((comp, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-300"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
