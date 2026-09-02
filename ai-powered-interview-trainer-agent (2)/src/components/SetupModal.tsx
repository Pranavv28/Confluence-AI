import React, { useState } from 'react';
import { Sparkles, Briefcase, GraduationCap, Layers, Building2, BookCheck, ArrowRight } from 'lucide-react';
import { CandidateProfile, ExperienceLevel, InterviewDomain } from '../types';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (profile: CandidateProfile) => void;
  isLoading: boolean;
}

const ROLE_PRESETS = [
  'Python Developer',
  'Software Development Engineer (SDE)',
  'Data Analyst',
  'Frontend React Engineer',
  'Backend Engineer (Node/Python)',
  'AI / Machine Learning Engineer',
  'Fullstack Developer',
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];

const DOMAINS: InterviewDomain[] = [
  'Backend',
  'Frontend',
  'Fullstack',
  'Data / Analytics',
  'AI / Machine Learning',
  'DevOps / Cloud',
  'Mobile',
];

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  isLoading,
}) => {
  const [role, setRole] = useState('Python Developer');
  const [experience, setExperience] = useState<ExperienceLevel>('Fresher');
  const [domain, setDomain] = useState<InterviewDomain>('Backend');
  const [targetCompany, setTargetCompany] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    onStartSession({
      role: role.trim(),
      experience,
      domain,
      targetCompany: targetCompany.trim() || undefined,
      customNotes: customNotes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs">
              AI Interview Trainer Setup
            </span>
          </div>
          <h2 className="text-xl font-bold">Configure Your Mock Interview</h2>
          <p className="text-blue-100 text-xs mt-1">
            Grounded in RAG interview corpus • Custom questions for your role, level & domain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Role */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              Target Job Role <span className="text-red-500">*</span>
            </label>
            <input
              id="role-input"
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Python Developer, Data Analyst, SDE..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {/* Quick role tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {ROLE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setRole(preset);
                    if (preset.includes('Data')) setDomain('Data / Analytics');
                    else if (preset.includes('Frontend')) setDomain('Frontend');
                    else if (preset.includes('AI') || preset.includes('Machine Learning')) setDomain('AI / Machine Learning');
                    else if (preset.includes('Fullstack')) setDomain('Fullstack');
                    else setDomain('Backend');
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    role === preset
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-medium'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level & Domain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Experience Level */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                Experience Level
              </label>
              <select
                id="experience-select"
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
              >
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Technical Domain
              </label>
              <select
                id="domain-select"
                value={domain}
                onChange={(e) => setDomain(e.target.value as InterviewDomain)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
              >
                {DOMAINS.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: Target Company */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Target Company / Industry (Optional)
            </label>
            <input
              id="company-input"
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. IBM, Google, Fintech, Startup, Healthcare"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Optional: Focus Areas */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <BookCheck className="w-3.5 h-3.5 text-slate-500" />
              Focus Areas / Specific Skills (Optional)
            </label>
            <input
              id="focus-notes-input"
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Django, OOP pillars, SQL joins, Docker, STAR stories"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="start-interview-submit-btn"
              type="submit"
              disabled={isLoading || !role.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Interview Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
