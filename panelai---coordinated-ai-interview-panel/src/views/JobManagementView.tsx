import React, { useState } from "react";
import { JobConfig } from "../types/interview";
import { DEMO_JOBS } from "../lib/demoData";
import { INTERVIEWER_PERSONAS } from "../lib/personas";
import {
  Briefcase,
  Plus,
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
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 border border-slate-200 mb-2">
            <Briefcase className="h-3.5 w-3.5 text-[#1E3A5F]" />
            <span>Job Panel Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">Interview Panels &amp; Rubrics</h1>
          <p className="text-sm text-stone-600 mt-1">
            Customize which AI interviewers evaluate each role and set weighting percentages.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#162A45] transition cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? "Cancel" : "Create New Job Panel"}</span>
        </button>
      </div>

      {/* New Job Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateJob}
          className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        >
          <h2 className="text-lg font-bold text-stone-900">Configure New Job &amp; Panel Composition</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Job Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Staff Distributed Systems Architect"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Department</label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="AI / Research">AI / Research</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Difficulty Level ({newDifficulty} / 5)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(Number(e.target.value))}
                className="w-full mt-2 accent-[#1E3A5F]"
              />
            </div>
          </div>

          {/* Panel Weights Configuration */}
          <div>
            <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">
              Interviewer Panel Weights (Must Total 100%)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                <span className="text-xs font-bold text-slate-800">Marcus (Technical)</span>
                <input
                  type="number"
                  value={techWeight}
                  onChange={(e) => setTechWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white p-1.5 text-xs text-stone-900"
                />
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                <span className="text-xs font-bold text-slate-800">Elena (Product)</span>
                <input
                  type="number"
                  value={prodWeight}
                  onChange={(e) => setProdWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white p-1.5 text-xs text-stone-900"
                />
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                <span className="text-xs font-bold text-slate-800">Devon (Behavioral)</span>
                <input
                  type="number"
                  value={behavWeight}
                  onChange={(e) => setBehavWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white p-1.5 text-xs text-stone-900"
                />
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                <span className="text-xs font-bold text-slate-800">Sarah (Hiring Mgr)</span>
                <input
                  type="number"
                  value={hmWeight}
                  onChange={(e) => setHmWeight(Number(e.target.value))}
                  className="mt-2 w-full rounded-lg border border-stone-300 bg-white p-1.5 text-xs text-stone-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#1E3A5F] hover:bg-[#162A45] px-5 py-2 text-xs font-semibold text-white transition shadow-sm"
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
          <h2 className="text-sm font-bold text-stone-900 mb-2">Available Job Profiles</h2>
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`rounded-2xl border p-4 transition cursor-pointer ${
                selectedJob.id === job.id
                  ? "border-[#1E3A5F] bg-slate-50/80 shadow-sm ring-1 ring-[#1E3A5F]"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900">{job.title}</span>
                <span className="rounded bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700 font-mono border border-stone-200">
                  Level {job.difficulty}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">{job.department} &bull; {job.durationMinutes} mins</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {job.requiredSkills.slice(0, 3).map((s, idx) => (
                  <span key={idx} className="rounded bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] text-stone-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Selected Job Panel Details */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-stone-900">{selectedJob.title}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 border border-slate-200">
                  {selectedJob.experienceLevel}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">{selectedJob.description}</p>
            </div>

            <button
              onClick={() => onStartInterviewWithJob(selectedJob)}
              className="flex items-center gap-2 rounded-xl bg-[#1E3A5F] hover:bg-[#162A45] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <span>Test This Panel</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Configured Panel Composition */}
          <div>
            <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-3">
              Assigned Interviewers &amp; Focus Weights
            </h4>
            <div className="space-y-3">
              {selectedJob.panelConfig.map((item) => {
                const persona = INTERVIEWER_PERSONAS[item.role];
                return (
                  <div
                    key={item.role}
                    className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/60"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="h-10 w-10 rounded-lg object-cover border border-stone-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900">{persona.name}</p>
                        <p className="text-[11px] text-stone-500">{persona.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-500 hidden sm:inline">{persona.focusAreas[0]}</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-xs shadow-2xs">
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
            <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Evaluated Competencies
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedJob.competencies.map((comp, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-stone-100 border border-stone-200 px-3 py-1 text-xs text-stone-700 font-medium"
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
